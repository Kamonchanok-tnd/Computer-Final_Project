package exportexcel

import (
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sukjai_project/config"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

type ExportRow struct {
	UserID             uint
	Username           string
	AssessmentResultID uint
	AssessmentDate     string
	QuestionnaireID    uint
	QuestionnaireName  string
	QuestionID         uint
	QuestionText       string
	AnswerText         string
	AnswerScore        int
}

// sanitizeSheetName ทำความสะอาดชื่อ sheet ให้เป็นไปตามกฎของ Excel
func sanitizeSheetName(name string) string {
	// ลบตัวอักษรที่ Excel ไม่อนุญาต
	invalid := []string{"\\", "/", "?", "*", "[", "]", ":"}
	for _, char := range invalid {
		name = strings.ReplaceAll(name, char, "_")
	}
	
	// ลบช่องว่างที่อยู่หน้าและหลัง
	name = strings.TrimSpace(name)
	
	// ถ้าชื่อว่าง ให้ใส่ชื่อ default
	if name == "" {
		name = "Unknown"
	}
	
	// จำกัดความยาวไม่เกิน 31 ตัวอักษร
	if len(name) > 31 {
		name = name[:31]
	}
	
	return name
}

// generateUniqueSheetName สร้างชื่อ sheet ที่ไม่ซ้ำ
func generateUniqueSheetName(baseName string, usedNames map[string]int) string {
	// วิธีใหม่: ใช้ชื่อสั้นๆ แทน
	shortNames := map[string]string{
		"แบบวัดระดับความสุข คะแนน 0-10":                "ความสุข 0-10",
		"แบบวัดระดับสติ (State Mindfulness)":        "วัดระดับสติ",
		"แบบวัดระดับความเครียด (ST-5)":               "ความเครียด",
		"แบบคัดกรองโรคซึมเศร้า 2Q":                   "ซึมเศร้า2Q",
		"แบบคัดกรองโรคซึมเศร้า 9Q":                   "ซึมเศร้า9Q",
	}
	
	// ถ้ามีชื่อสั้นใน mapping ให้ใช้
	if shortName, exists := shortNames[baseName]; exists {
		baseName = shortName
		log.Printf("Using short name: %s -> %s", baseName, shortName)
	}
	
	cleanName := sanitizeSheetName(baseName)
	
	if count, exists := usedNames[cleanName]; exists {
		usedNames[cleanName] = count + 1
		// สร้างชื่อใหม่โดยเพิ่มหมายเลข
		cleanName = fmt.Sprintf("%s_%d", cleanName, count+1)
	} else {
		usedNames[cleanName] = 0
	}
	
	return cleanName
}

func ExportExcel(c *gin.Context) {
	// 1. Connect DB
	db := config.DB()
	if db == nil {
		log.Printf("Database connection failed")
		c.String(http.StatusInternalServerError, "Database connection error")
		return
	}

	// 2. Query ข้อมูลแบบ Long Format
	var rows []ExportRow
	result := db.Raw(`
		SELECT
		
			u.username          AS username,
		
			ar.date             AS assessment_date,
			
			qn.name_questionnaire AS questionnaire_name,
		
			q.name_question     AS question_text,
			
			ao.description      AS answer_text,
			aa.point            AS answer_score
		FROM assessment_answers aa
		JOIN assessment_results ar   ON aa.ar_id = ar.id
		JOIN users u                 ON ar.uid = u.id
		JOIN questionnaires qn       ON ar.qu_id = qn.id
		JOIN questions q             ON aa.q_id = q.id
		LEFT JOIN answer_options ao  ON aa.ao_id = ao.id
		ORDER BY u.id, ar.id, q.priority;
	`).Scan(&rows)

	if result.Error != nil {
		log.Printf("Database query error: %v", result.Error)
		c.String(http.StatusInternalServerError, "Database query error")
		return
	}

	if len(rows) == 0 {
		log.Printf("No data found")
		c.String(http.StatusNotFound, "No data found to export")
		return
	}

	log.Printf("Total rows retrieved: %d", len(rows))

	// 3. สร้าง Excel
	f := excelize.NewFile()
	if f == nil {
		log.Printf("Failed to create Excel file")
		c.String(http.StatusInternalServerError, "Failed to create Excel file")
		return
	}

	// Group ข้อมูลตาม questionnaire
	sheets := make(map[string][]ExportRow)
	for _, row := range rows {
		questionnaireName := row.QuestionnaireName
		if questionnaireName == "" {
			questionnaireName = "Unknown Questionnaire"
		}
		sheets[questionnaireName] = append(sheets[questionnaireName], row)
	}

	log.Printf("Total questionnaires to export: %d", len(sheets))

	// เก็บชื่อ sheet ที่ใช้แล้วเพื่อป้องกันการซ้ำ
	usedNames := make(map[string]int)
	firstSheet := true
	successCount := 0

	for qName, data := range sheets {
		log.Printf("Processing questionnaire: %s with %d rows", qName, len(data))
		
		// สร้างชื่อ sheet ที่ unique
		sheetName := generateUniqueSheetName(qName, usedNames)
		log.Printf("Generated sheet name: %s", sheetName)

		var err error
		if firstSheet {
			// เปลี่ยนชื่อ Sheet1 default
			err = f.SetSheetName("Sheet1", sheetName)
			if err != nil {
				log.Printf("Error renaming default sheet to %s: %v", sheetName, err)
				continue
			}
			firstSheet = false
		} else {
			// สร้าง sheet ใหม่
			_, err = f.NewSheet(sheetName)
			if err != nil {
				log.Printf("Error creating sheet %s: %v", sheetName, err)
				continue
			}
		}

		// ตั้งค่า active sheet
		sheetIndex, err := f.GetSheetIndex(sheetName)
		if err != nil {
			log.Printf("Error getting sheet index for %s: %v", sheetName, err)
		} else {
			f.SetActiveSheet(sheetIndex)
		}

		// Header
        headers := []string{
			 "ชื่อผู้ใช้", "วันที่ประเมิน",
			 "คำถาม", "คำตอบ", "คะแนน",
		}
		
		// เขียน header
		for i, header := range headers {
			col := string(rune('A' + i))
			cellRef := fmt.Sprintf("%s1", col)
			err = f.SetCellValue(sheetName, cellRef, header)
			if err != nil {
				log.Printf("Error setting header %s in cell %s: %v", header, cellRef, err)
			}
		}

		// เขียนข้อมูล
		for i, row := range data {
			rowIndex := i + 2
			
			// ใช้ array เพื่อให้ code สั้นลง
			values := []interface{}{
			
				row.Username,
				row.AssessmentDate,
				row.QuestionText,
				row.AnswerText,
				row.AnswerScore,
			}
			
			for j, value := range values {
				col := string(rune('A' + j))
				cellRef := fmt.Sprintf("%s%d", col, rowIndex)
				err = f.SetCellValue(sheetName, cellRef, value)
				if err != nil {
					log.Printf("Error setting value in cell %s: %v", cellRef, err)
				}
			}
		}

		// Auto-fit columns (optional)
		for i := 0; i < len(headers); i++ {
			col := string(rune('A' + i))
			err = f.SetColWidth(sheetName, col, col, 15)
			if err != nil {
				log.Printf("Error setting column width for %s: %v", col, err)
			}
		}

		successCount++
		log.Printf("Successfully created sheet: %s", sheetName)
	}

	log.Printf("Successfully created %d out of %d sheets", successCount, len(sheets))

	if successCount == 0 {
		log.Printf("No sheets were created successfully")
		c.String(http.StatusInternalServerError, "Failed to create any sheets")
		return
	}

	// 4. ส่งไฟล์ Excel ให้ user download
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", `attachment; filename="assessment_export.xlsx"`)
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Cache-Control", "no-cache")

	// เขียนไฟล์ไปยัง response
	err := f.Write(c.Writer)
	if err != nil {
		log.Printf("Error writing Excel file to response: %v", err)
		c.String(http.StatusInternalServerError, "Cannot write excel file: %v", err.Error())
		return
	}

	// ปิดไฟล์เพื่อปล่อย memory
	err = f.Close()
	if err != nil {
		log.Printf("Error closing Excel file: %v", err)
	}

	log.Printf("Excel file sent successfully with %d sheets", successCount)
}


func ExportCSV(c *gin.Context) {
	// 1. Connect DB
	db := config.DB()
	if db == nil {
		log.Printf("Database connection failed")
		c.String(http.StatusInternalServerError, "Database connection error")
		return
	}

	// 2. Query ข้อมูลแบบ Long Format
	var rows []ExportRow
	result := db.Raw(`
		SELECT
			u.id                AS user_id,
			u.username          AS username,
			ar.id               AS assessment_result_id,
			ar.date             AS assessment_date,
			qn.id               AS questionnaire_id,
			qn.name_questionnaire AS questionnaire_name,
			q.id                AS question_id,
			q.name_question     AS question_text,
			aa.id               AS assessment_answer_id,
			ao.id               AS answer_option_id,
			ao.description      AS answer_text,
			aa.point            AS answer_score
		FROM assessment_answers aa
		JOIN assessment_results ar   ON aa.ar_id = ar.id
		JOIN users u                 ON ar.uid = u.id
		JOIN questionnaires qn       ON ar.qu_id = qn.id
		JOIN questions q             ON aa.q_id = q.id
		LEFT JOIN answer_options ao  ON aa.ao_id = ao.id
		ORDER BY u.id, ar.id, q.priority;
	`).Scan(&rows)

	if result.Error != nil {
		log.Printf("Database query error: %v", result.Error)
		c.String(http.StatusInternalServerError, "Database query error")
		return
	}

	if len(rows) == 0 {
		log.Printf("No data found")
		c.String(http.StatusNotFound, "No data found to export")
		return
	}

	log.Printf("Total rows retrieved: %d", len(rows))

	// 3. ตั้งค่า HTTP headers สำหรับ CSV
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", `attachment; filename="assessment_export.csv"`)
	c.Header("Cache-Control", "no-cache")
	
	// เพิ่ม BOM (Byte Order Mark) สำหรับ UTF-8 เพื่อให้ Excel เปิดภาษาไทยได้ถูกต้อง
	c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})

	// 4. สร้าง CSV writer
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// 5. เขียน header
    headers := []string{
		"รหัสผู้ใช้",
		"ชื่อผู้ใช้", 
		"รหัสผลการประเมิน",
		"วันที่ประเมิน",
		"รหัสแบบสอบถาม",
		"ชื่อแบบสอบถาม",
		"รหัสคำถาม",
		"คำถาม",
		"คำตอบ",
		"คะแนน",
	}

	err := writer.Write(headers)
	if err != nil {
		log.Printf("Error writing CSV header: %v", err)
		return
	}

	// 6. เขียนข้อมูล
	successCount := 0
	for _, row := range rows {
		record := []string{
			strconv.Itoa(int(row.UserID)),
			row.Username,
			strconv.Itoa(int(row.AssessmentResultID)),
			row.AssessmentDate,
			strconv.Itoa(int(row.QuestionnaireID)),
			row.QuestionnaireName,
			strconv.Itoa(int(row.QuestionID)),
			row.QuestionText,
			row.AnswerText,
			strconv.Itoa(row.AnswerScore),
		}

		err := writer.Write(record)
		if err != nil {
			log.Printf("Error writing CSV record: %v", err)
			continue
		}
		successCount++
	}

	// Force flush ก่อนจบ
	writer.Flush()
	
	if err := writer.Error(); err != nil {
		log.Printf("CSV writer error: %v", err)
		return
	}

	log.Printf("CSV export completed successfully. %d rows written", successCount)
}

// ExportCSVByQuestionnaire - แยกไฟล์ตาม questionnaire (ส่งเป็น ZIP)
func ExportCSVByQuestionnaire(c *gin.Context) {
	// สำหรับกรณีที่ต้องการแยกไฟล์ CSV ตาม questionnaire
	// จะต้องใช้ ZIP เพื่อส่งหลายไฟล์
	// (Implementation นี้ซับซ้อนกว่า ถ้าต้องการจะทำให้ดู)
	
	c.String(http.StatusNotImplemented, "CSV by questionnaire export not implemented yet")
}