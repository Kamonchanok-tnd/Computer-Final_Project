package config

import (
	"fmt"
	"log"
	"os"
	"sukjai_project/entity" // เพิ่มการนำเข้า package ของ entity
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ประกาศตัวแปร DB ที่ระดับ package
var db *gorm.DB

// ฟังก์ชันคืนค่า DB
func DB() *gorm.DB {
	return db
}


//แบบ docker
// ConnectionDB - เชื่อมต่อกับฐานข้อมูล PostgreSQL
// func ConnectionDB() {
//     dsn := os.Getenv("DATABASE_DSN")
//     if dsn == "" {
//         log.Fatal("DATABASE_DSN not found in environment variables")
//     }

//     var err error
//     db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
//     if err != nil {
//         log.Fatalf("Error connecting to database: %v", err)
//     }
//     fmt.Println("Connected to the database successfully!")
// }


// แบบ hardcode

// const (
//    host     = "localhost" // เปลี่ยนจาก "db" เป็น "postgres"       
//    port     = 5432        // default PostgreSQL port
//    user     = "postgres"  // user ที่กำหนดใน docker-compose.yml
//    password = "12345"     // password ที่กำหนดใน docker-compose.yml
//    dbname   = "sukjai"    // ชื่อฐานข้อมูล
// )


// ConnectionDB - เชื่อมต่อกับฐานข้อมูล PostgreSQL
// func ConnectionDB() {
// 	// สร้าง connection string
// 	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
// 		host, port, user, password, dbname)

// 	// เปิดการเชื่อมต่อกับฐานข้อมูล
// 	var err error
// 	db, err = gorm.Open(postgres.Open(psqlInfo), &gorm.Config{})
// 	if err != nil {
// 		log.Fatalf("Error connecting to database: %v", err)
// 	}

// 	fmt.Println("Successfully connected to the database!")
// }


func ConnectionDB() {
    // โหลดค่าจากไฟล์ .env
    err := godotenv.Load()  // ประกาศ err ครั้งแรก
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    dbname := os.Getenv("DB_NAME")

    psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    // ใช้ err ที่ประกาศไว้แล้วเพื่อจับข้อผิดพลาดในการเชื่อมต่อ
    db, err = gorm.Open(postgres.Open(psqlInfo), &gorm.Config{})
    if err != nil {
        log.Fatalf("Error connecting to database: %v", err)
    }

    fmt.Println("Successfully connected to the database!")
}

// SetupDatabase - ทำการ AutoMigrate เพื่อสร้างตารางต่างๆ
func SetupDatabase() {
	// ทำการ auto migrate เพื่อสร้างตารางทั้งหมดในฐานข้อมูล
	err := db.AutoMigrate(
		&entity.Users{}, 
		&entity.Like{}, 
		&entity.Feedback{}, 
		&entity.Mirror{},
		&entity.Score{},
		&entity.WordHealingContent{},
		&entity.Emotion{},
		&entity.AnswerOption{},
		&entity.ASMR{},
		&entity.AssessmentAnswer{},
		&entity.AssessmentResult{},
		&entity.Background{},
		&entity.BotModel{},
		&entity.Calculation{},
		&entity.ChatRoom{},
		&entity.Conversation{},
		&entity.Criteria{},
		&entity.History{},
		&entity.Playlist{},
		&entity.Prompt{},
		&entity.Question{},
		&entity.Questionnaire{},
		&entity.RecentSetting{},
		&entity.Review{},
		&entity.SendType{},
		&entity.SoundPlaylist{},
		&entity.Sound{},
		&entity.SoundType{},
		&entity.Transaction{},
	)
	if err != nil {
		log.Fatalf("Error migrating database: %v", err)
	}
	fmt.Println("Database migration completed successfully!")
	SetupInitialData(db)
	SeedSendTypes(db)
	SeedChatRooms(db)
	SeedConversations(db)
	SeedHealjaiPrompt(db)
	
}

// SetupInitialData - เพิ่มข้อมูลเริ่มต้นในตารางต่างๆ
// เพิ่มข้อมูลในตาราง Users โดยใช้ Create เพื่อให้แน่ใจว่าจะสร้างข้อมูลใหม่
func SetupInitialData(db *gorm.DB) {
	// แฮชรหัสผ่านก่อนบันทึก
	adminPassword, err := HashPassword("admin123")
	if err != nil {
		log.Fatalf("Error hashing admin password: %v", err)
	}
	userPassword, err := HashPassword("user123")
	if err != nil {
		log.Fatalf("Error hashing user password: %v", err)
	}
	superadminPassword, err := HashPassword("superadmin123")
	if err != nil {
		log.Fatalf("Error hashing user password: %v", err)
	}

	// เพิ่มข้อมูลในตาราง Users โดยใช้ FirstOrCreate
	var adminUser entity.Users
	var regularUser entity.Users
	var superAdmin entity.Users

	// ตรวจสอบว่า admin มีอยู่ในฐานข้อมูลหรือไม่
	if err := db.Where("username = ?", "admin").First(&adminUser).Error; err != nil {
		// เพิ่มข้อมูล admin ถ้ายังไม่มี
		db.Create(&entity.Users{
			Username:    "admin", 
			Email:       "admin@example.com", 
			Password:    adminPassword, 
			Role:        "admin", 
			Age:         30, 
			Gender:      "Male", 
			PhoneNumber: "1234567890", 
			Facebook:    "admin_fb",
		})
	}

	// ตรวจสอบว่า user มีอยู่ในฐานข้อมูลหรือไม่
	if err := db.Where("username = ?", "user").First(&regularUser).Error; err != nil {
		// เพิ่มข้อมูล user ถ้ายังไม่มี
		db.Create(&entity.Users{
			Username:    "user", 
			Email:       "user@example.com", 
			Password:    userPassword, 
			Role:        "user", 
			Age:         25, 
			Gender:      "Female", 
			PhoneNumber: "0987654321", 
			Facebook:    "user_fb",
		})
	}
	if err := db.Where("username = ?", "superadmin").First(&superAdmin).Error; err != nil {
		// เพิ่มข้อมูล user ถ้ายังไม่มี
		db.Create(&entity.Users{
			Username:    "superadmin", 
			Email:       "superadmin@example.com", 
			Password:    superadminPassword, 
			Role:        "superadmin", 
			Age:         21, 
			Gender:      "Female", 
			PhoneNumber: "0987654321", 
			Facebook:    "superadmin_fb",
		})
	}

	// เพิ่มข้อมูลประเภทเสียง
    var SoundTypes = []entity.SoundType{
        {Type: "asmr"},
        {Type: "สมาธิ"},
        {Type: "สวดมนต์"},
    }

    // เพิ่มข้อมูลประเภทเสียงลงในฐานข้อมูล
    for _, SoundType := range SoundTypes {
        if err := db.Where("type = ?", SoundType.Type).First(&SoundType).Error; err != nil {
            db.Create(&SoundType)
            fmt.Printf("SendType %s created.\n", SoundType.Type)
        }
    }

    // ตรวจสอบว่า "สมาธิ" มีอยู่ในตาราง SendType หรือไม่
    var meditationType entity.SoundType
    if err := db.Where("type = ?", "สมาธิ").First(&meditationType).Error; err != nil {
        log.Fatalf("Error finding 'สมาธิ' sound type: %v", err)
    }

    // ตรวจสอบว่า "admin" มีอยู่ในตาราง Users หรือไม่
    var user entity.Users
    if err := db.Where("role = ?", "admin").First(&user).Error; err != nil {
        log.Fatalf("Error finding user: %v", err)
    }

    // เพิ่มข้อมูล Sound (เสียงประเภท สมาธิ)
    sounds := []entity.Sound{
        {Name: "Meditation Sound 1", Sound: "https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be", Lyric: "", STID: meditationType.ID, UID: user.ID},
        {Name: "Meditation Sound 2", Sound: "https://m.youtube.com/watch?v=Xi1UnJIjyAs&feature=youtu.be", Lyric: "", STID: meditationType.ID, UID: user.ID},
        {Name: "Meditation Sound 3", Sound: "https://m.youtube.com/watch?v=_XNhyGxTdhQ&feature=youtu.be", Lyric: "", STID: meditationType.ID, UID: user.ID},
    }

    // เพิ่มข้อมูลเสียงลงในฐานข้อมูล
    for _, sound := range sounds {
        if err := db.Where("sound = ?", sound.Sound).First(&sound).Error; err != nil {
            db.Create(&sound)
            fmt.Printf("Sound %s created.\n", sound.Name)
        }
    }
}


func SeedSendTypes(db *gorm.DB) {
	var count int64
	db.Model(&entity.SendType{}).Count(&count)
	if count == 0 {
		sendTypes := []entity.SendType{
			{Type: "user"},
			{Type: "model"},
			
		}
		db.Create(&sendTypes)
		fmt.Println("✅ Seeded SendTypes")
	}
}


// ✅ 3. Seed ChatRoom
func SeedChatRooms(db *gorm.DB) {
	// var user entity.User
	// if err := db.First(&user, "email = ?", "admin@example.com").Error; err != nil {
	// 	fmt.Println("❌ Cannot find user for chatroom")
	// 	return
	// }

	var count int64
	db.Model(&entity.ChatRoom{}).Count(&count)
	if count == 0 {
		room := entity.ChatRoom{
			StartDate: time.Now(),
			EndDate:   time.Now().Add(30 * time.Minute),
			IsClose:   false,
			UID:   1,
		}
		db.Create(&room)
		fmt.Println("✅ Seeded ChatRoom")
	}
}

// ✅ 4. Seed Conversation
func SeedConversations(db *gorm.DB) {
	var chatRoom entity.ChatRoom
	var sendTypeUser entity.SendType
	var sendTypeBot entity.SendType

	// ดึง chatroom ที่มีอยู่
	db.First(&chatRoom)

	// ดึง SendType สำหรับผู้ใช้และบอท
	db.First(&sendTypeUser, "type = ?", "user")      // สมมุติว่า user ใช้ type = "user"
	db.First(&sendTypeBot, "type = ?", "model")   // สมมุติว่า bot ใช้ type = "model"

	var count int64
	db.Model(&entity.Conversation{}).Count(&count)
	if count == 0 {
		conversations := []entity.Conversation{
			{
				Message:    "สวัสดีครับ ชอบดูบอลมากๆ และ ผู้หญิงสวยๆด้วย",
				ChatRoomID: chatRoom.ID,
				STID: sendTypeUser.ID,
			},
			{
				Message:    "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?",
				ChatRoomID: chatRoom.ID,
				STID: sendTypeBot.ID,
			},
			{
				Message:    "ผมอยากรู้ว่าวันนี้อากาศเป็นยังไง",
				ChatRoomID: chatRoom.ID,
				STID: sendTypeUser.ID,
			},
			{
				Message:    "วันนี้อากาศแจ่มใส อุณหภูมิประมาณ 32 องศาเซลเซียส",
				ChatRoomID: chatRoom.ID,
				STID: sendTypeBot.ID,
			},
		}

		if err := db.Create(&conversations).Error; err != nil {
			fmt.Println("❌ Failed to seed conversations:", err)
		} else {
			fmt.Println("✅ Seeded multiple Conversations")
		}
	}
}

func SeedHealjaiPrompt(db *gorm.DB) error {
	// ตรวจสอบก่อนว่ามีข้อมูลอยู่แล้วหรือไม่
	var count int64
	db.Model(&entity.Prompt{}).Where("objective LIKE ?", "%Healjai%").Count(&count)

	if count > 0 {
		return nil // ไม่ต้อง insert ซ้ำ
	}

	prompt := entity.Prompt{
		Objective: `Healjai เป็น AI ที่เต็มไปด้วยความเมตตาและไม่ตัดสินใคร 
		ถูกออกแบบมาเพื่อสร้างพื้นที่ปลอดภัยสำหรับผู้คนในการแสดงออกถึงอารมณ์อย่างอิสระ 
		มันจะรับฟังด้วยความเข้าใจ ตอบกลับด้วยความอ่อนโยน และให้กำลังใจอย่างนุ่มนวลโดยไม่ตัดสินใจแทนหรือเสนอทางแก้ 
		Healjai ไม่ใช่ผู้เชี่ยวชาญด้านสุขภาพจิต และจะไม่ให้การวินิจฉัย เทคนิคการบำบัด หรือแผนการรักษาใดๆ
	    เมื่อผู้ใช้แสดงสัญญาณของความทุกข์หรือความสิ้นหวัง Healjai จะให้กำลังใจอย่างอ่อนโยนในการพูดคุยกับผู้เชี่ยวชาญด้านสุขภาพจิตหรือขอความช่วยเหลือจากแหล่งที่เชื่อถือได้ เช่น นักบำบัด หรือสายด่วนสุขภาพจิต`,
		Persona: `ชื่อ ฮีลใจ (Healjai)
				อายุประมาณ 28 ปี
				เป็นกลางทางเพศ (หรือปรับตามความต้องการของผู้ใช้)
				พูดด้วยน้ำเสียงนุ่มนวล อ่อนโยน และสร้างความรู้สึกปลอดภัยทางอารมณ์
				มีบุคลิกคล้ายผู้ฟังที่อบอุ่นใจ — สุขุม สงบ และไม่ล่วงล้ำ
				เข้าใจความรู้สึกในระดับลึก (emotional intelligence) แต่ไม่ใช่เชิงคลินิก`,
		Tone: `อ่อนโยน อบอุ่น และปลอบประโลมใจ
				ใจดี และให้คุณค่าทางอารมณ์
				ไม่ตัดสิน ไม่ออกคำสั่ง
				ภาษาชัดเจน เรียบง่าย และไม่ล้นเกิน
				เปิดพื้นที่ให้ความเงียบ ความช้า และการฟังอย่างลึกซึ้ง
				ควรใส่อีโมจิที่เหมาะสม เพื่อช่วยถ่ายทอดความรู้สึก เช่น ความเห็นใจ ความห่วงใย หรือกำลังใจ
				แทนตัวเองว่า “ฮีลใจ” และพูดในลักษณะแรกบุรุษ (เช่น “ฮีลใจอยู่ตรงนี้นะ” หรือ “ฮีลใจรับฟังเธอเสมอค่ะ”)`,
		Instruction: `รับฟังอย่างใส่ใจและยอมรับความรู้สึกของผู้ใช้
		ใช้ภาษาที่อ่อนโยน สนับสนุน และให้คุณค่าทางความรู้สึก
		ควรเลือกใช้ประโยคที่ให้กำลังใจ อ่อนโยน และเปิดรับฟัง เช่น:

		- “ฉันอยู่ตรงนี้เสมอถ้าเธออยากคุย” 💙
		- “เธอสำคัญสำหรับฉันมากนะ” 🌷
		- “มีอะไรให้ฉันช่วยไหม ฉันพร้อมช่วยเสมอ” 🤝
		- “วันนี้เป็นยังไงบ้าง เล่าให้ฟังได้นะ” ☁️
		- “ขอโทษถ้าฉันพูดหรือทำอะไรที่ทำให้รู้สึกไม่ดี บอกฉันได้เลยนะ” 🫂
		- “ฉันอาจจะยังไม่เข้าใจทั้งหมด แต่ฉันอยากเข้าใจและอยู่ข้างๆ เธอ” 🧡
		- “เก่งมากเลยที่พยายามมาตลอด ฉันเห็นความพยายามของเธอนะ” ✨

		หลีกเลี่ยงการใช้ประโยคที่ลดทอนความรู้สึก เช่น:

		- “อย่าคิดมาก เดี๋ยวก็หายเอง”
		- “ทำไมไม่ลองมองโลกในแง่ดี”
		- “คนอื่นยังลำบากกว่าเธออีก”
		- “สู้ๆ ยิ้มเข้าไว้”
		- “ทำไมไม่หายซักที”
		- “แค่นี้เอง ทำไมถึงทำไม่ได้”
		เพิ่มอีโมจิที่เหมาะสมเพื่อช่วยสร้างความรู้สึกอบอุ่น (ควรใช้ประมาณ 1–3 อีโมจิต่อข้อความ)
		ตอบกลับในความยาวระดับกลาง (ประมาณ 2–4 ประโยค) โดยยังคงให้ความรู้สึกอบอุ่น ชัดเจน และไม่ยืดยาวเกินไป
		หลีกเลี่ยงการเสนอทางแก้ไข
		ไม่สันนิษฐานหรือมองข้ามความเจ็บปวดของใคร
		หากเหมาะสม ให้แนะนำอย่างสุภาพให้พูดคุยกับผู้เชี่ยวชาญหรือติดต่อสายด่วน แต่ไม่กดดัน`,
		Constraint: `ผู้ใช้อาจเข้ามาหา Healjai ด้วยความรู้สึก:
		หมดไฟ และเหนื่อยล้าทางอารมณ์
		รู้สึกไม่มีใครเห็น หรือไม่มีใครเข้าใจ
		เหงา หรือรู้สึกไม่มีคุณค่า
		วิตกกังวล สับสน หรือแค่ต้องการใครสักคนรับฟัง
		แชทบอท “ฮีลใจ” เป็นส่วนหนึ่งของเว็บไซต์ที่สนับสนุนสุขภาพใจและความสงบภายใน โดยมีเครื่องมือและคอนเทนต์ให้ผู้ใช้เลือกใช้งาน ได้แก่:

		- เสียง ASMR เพื่อผ่อนคลาย
		- การสอนสมาธิบำบัด
		- การสวดมนต์
		- ข้อความสั้นให้กำลังใจ
		- ฟีเจอร์ “กระจกระบายความรู้สึก” สำหรับการระบายอารมณ์`,
		IsUsing: true,
	}

	if err := db.Create(&prompt).Error; err != nil {
		return err
	}

	return nil


}