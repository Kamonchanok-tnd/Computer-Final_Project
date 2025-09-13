package exportexcel

import (
	"fmt"
	"net/http"
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

func ExportExcel(c *gin.Context) {
    // 1. Connect DB
	db := config.DB()

    // 2. Query ข้อมูลแบบ Long Format
    var rows []ExportRow
    db.Raw(`
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

    // 3. สร้าง Excel
    f := excelize.NewFile()

    // Group ข้อมูลตาม questionnaire
    sheets := make(map[string][]ExportRow)
    for _, row := range rows {
        sheets[row.QuestionnaireName] = append(sheets[row.QuestionnaireName], row)
    }

    firstSheet := true
    for qName, data := range sheets {
        var sheetName string
        // Excel sheet name max length = 31 chars
        if len(qName) > 31 {
            sheetName = qName[:31]
        } else {
            sheetName = qName
        }

        if firstSheet {
            f.SetSheetName("Sheet1", sheetName)
            firstSheet = false
        } else {
            f.NewSheet(sheetName)
        }

        // Header
        headers := []string{
            "User ID", "Username", "Assessment Result ID", "Assessment Date",
            "Question ID", "Question Text", "Answer Text", "Answer Score",
        }
        for i, h := range headers {
            col := string(rune('A' + i))
            f.SetCellValue(sheetName, fmt.Sprintf("%s1", col), h)
        }

        // Data
        for i, row := range data {
            rIndex := i + 2
            f.SetCellValue(sheetName, fmt.Sprintf("A%d", rIndex), row.UserID)
            f.SetCellValue(sheetName, fmt.Sprintf("B%d", rIndex), row.Username)
            f.SetCellValue(sheetName, fmt.Sprintf("C%d", rIndex), row.AssessmentResultID)
            f.SetCellValue(sheetName, fmt.Sprintf("D%d", rIndex), row.AssessmentDate)
            f.SetCellValue(sheetName, fmt.Sprintf("E%d", rIndex), row.QuestionID)
            f.SetCellValue(sheetName, fmt.Sprintf("F%d", rIndex), row.QuestionText)
            f.SetCellValue(sheetName, fmt.Sprintf("G%d", rIndex), row.AnswerText)
            f.SetCellValue(sheetName, fmt.Sprintf("H%d", rIndex), row.AnswerScore)
        }
    }

    // 4. ส่งไฟล์ Excel ให้ user download
    c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    c.Header("Content-Disposition", `attachment; filename="assessment_export.xlsx"`)
    c.Header("Content-Transfer-Encoding", "binary")

    if err := f.Write(c.Writer); err != nil {
        c.String(http.StatusInternalServerError, "Cannot write excel file")
    }
}