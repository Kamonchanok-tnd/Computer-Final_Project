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
	err := godotenv.Load() // ประกาศ err ครั้งแรก
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
		&entity.EmotionChoice{},
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
		&entity.QuestionnaireGroup{},
		&entity.RecentSetting{},
		&entity.Review{},
		&entity.SendType{},
		&entity.SoundPlaylist{},
		&entity.Sound{},
		&entity.SoundType{},
		&entity.Transaction{},
		&entity.ArticleType{}, 
		&entity.QuestionnaireGroupQuestionnaire{},
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
	CreateDefaultEmotionChoices(db)
	SeedQuestionnaires(db)
	SeedQuestionnaireGroups(db)
	SeedCriteriaAndCalculations(db)
	SeedBackground(db)
	CreateArticleTypes(db)
	SeedEmojis(db)
	SeedMirrorJuly2025(db)
	SeedMirrorAug2025FirstHalf(db)
	
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
			Gender:      "ผู้ชาย",
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
			Gender:      "ผู้หญิง",
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
			Gender:      "ผู้หญิง",
			PhoneNumber: "0987654321",
			Facebook:    "superadmin_fb",
		})
	}

	// เพิ่มข้อมูลประเภทเสียง
	var SoundTypes = []entity.SoundType{
		{Type: "asmr"},
		{Type: "สมาธิ"},
		{Type: "สวดมนต์"},
		{Type: "ฝึกหายใจ"},
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

	var breathingType entity.SoundType
	if err := db.Where("type = ?", "ฝึกหายใจ").First(&breathingType).Error; err != nil {
		log.Fatalf("Error finding 'ฝึกสมาธิ' sound type: %v", err)
	}

	var chantingType entity.SoundType
	if err := db.Where("type = ?", "สวดมนต์").First(&chantingType).Error; err != nil {
		log.Fatalf("Error finding 'สวดมนต์' sound type: %v", err)
	}

	var asmrType entity.SoundType
	if err := db.Where("type = ?", "asmr").First(&asmrType).Error; err != nil {
		log.Fatalf("Error finding 'asmr' sound type: %v", err)
	}

	// ตรวจสอบว่า "admin" มีอยู่ในตาราง Users หรือไม่
	var user entity.Users
	if err := db.Where("role = ?", "admin").First(&user).Error; err != nil {
		log.Fatalf("Error finding user: %v", err)
	}

	// เพิ่มข้อมูล Sound (เสียงประเภท สมาธิ)
	sounds := []entity.Sound{
		{Name: "สมาธิบำบัดแบบ SKT ท่าที่ 1-2", Sound: "https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be", Lyric: "", Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2 สำหรับฝึกสมาธิและผ่อนคลายจิตใจ", Duration: 10, LikeSound: 80, View: 5000, Owner: "SKT Meditation", STID: meditationType.ID, UID: user.ID},
		{Name: "สมาธิบำบัดแบบ SKT ท่าที่ 6-7", Sound: "https://m.youtube.com/watch?v=Xi1UnJIjyAs&feature=youtu.be", Lyric: "", Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 6-7 สำหรับฝึกสมาธิและผ่อนคลายจิตใจ", Duration: 10, LikeSound: 80, View: 4000, Owner: "SKT Meditation", STID: meditationType.ID, UID: user.ID},
		{Name: "สมาธิบำบัดแบบ SKT ท่าที่ 3", Sound: "https://m.youtube.com/watch?v=_XNhyGxTdhQ&feature=youtu.be", Lyric: "", Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 3 สำหรับฝึกสมาธิและผ่อนคลายจิตใจ", Duration: 10, LikeSound: 80, View: 4500, Owner: "SKT Meditation", STID: meditationType.ID, UID: user.ID},

		// เสียงฝึกหายใจใหม่
		{Name: "Seed of growth", Sound: "https://m.youtube.com/watch?v=NSKxvLWqyOY", Lyric: "", Description: "เพลงผ่อนคลายสำหรับฝึกหายใจ แนว Ambient เหมาะกับการทำสมาธิ, สร้างสมาธิและฝึกหายใจ", Duration: 60, LikeSound: 90, View: 12000, Owner: "Relaxing Music Channel", STID: breathingType.ID, UID: user.ID},
		{Name: "Alpha waves", Sound: "https://youtu.be/t83vSN1yZzM?si=t_D19j9FeWXo_1Xa", Lyric: "", Description: "คลื่นสมอง Alpha สำหรับการผ่อนคลาย ลดความเครียด และทำสมาธิ", Duration: 120, LikeSound: 95, View: 30000, Owner: "Brainwave Music", STID: breathingType.ID, UID: user.ID},
		{Name: "Relaxing music", Sound: "https://youtu.be/-c7GHrC8HTY?si=7dqAHDMZoRhL5Uj9", Lyric: "", Description: "เพลงสปาแนวบรรเลงผสมเสียงธรรมชาติ เหมาะสำหรับนวด, ผ่อนคลาย, ทำสมาธิ และสร้างบรรยากาศสงบ", Duration: 300, LikeSound: 100, View: 2000000, Owner: "Spa Music, Relaxing music", STID: breathingType.ID, UID: user.ID},
		{Name: "Sunny Mornings", Sound: "https://youtu.be/hlWiI4xVXKY?si=56vNV_ddESYwTnkH", Lyric: "", Description: "เป็น เพลงคลายเครียดแนวบรรเลง พาโน, กีตาร์ พร้อมเสียงนกร้อง สร้างบรรยากาศสงบ และเหมาะสำหรับผ่อนคลายหรือทำสมาธิ", Duration: 183, LikeSound: 100, View: 20, Owner: "Peder B. Helland", STID: breathingType.ID, UID: user.ID},

		{
			Name: "บทเมตตาหลวง ทำนองสรภัญญะ", Sound: "https://youtu.be/6i1YyT3fzPs?si=--nqYHK_wzKNtHtb", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		},
		{
			Name: "บทกราบพระ 5 ครั้ง", Sound: "https://youtu.be/1TzRW28rhZ4?si=VVMVrd8mKxRGbreb", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		},
		{
			Name: "คาถามหาจักรพรรดิ มีคำแปล (ไม่มีโฆษณาคั่นกลาง)", Sound: "https://youtu.be/YgnFJiobS58?si=zEI6yZKEw-eTHr4v", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		}, {
			Name: "บทสวด อิติปิโส", Sound: "https://youtu.be/Jkz_iQ8rjz4?si=VSqQDQjE8ripYvMW", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		}, {
			Name: "บทสรภัญญะ องค์ใดพระสัมพุทธ", Sound: "https://youtu.be/ftkK-Po2So4?si=eJsOhqRRIvZdIrcu", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		},
		{
			Name: "บทสวดสรภัญญะ ปางเมื่อพระองค์ ปะระมะพุธ", Sound: "https://youtu.be/uOtbIwDMz6w?si=8S_xKsVmoYHpD7U9", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		},
		{
			Name: "คาถาชินบัญชร พระคาถาชินบัญชร สมเด็จพระพุฒาจารย์ (โต พรหมรังสี) เสถียรพงษ์ วรรณปก", Sound: "https://youtu.be/sqOeFloH6tU?si=VEyGbfdeuytxawPC", Lyric: "", STID: chantingType.ID, UID: user.ID, Description: "", Duration: 135, LikeSound: 100, View: 20, Owner: "ChadolChannel",
		},

		// ASMR
		{Name: "Swans, Ducks & Other Water Birds by a Summer River in Ukraine", Sound: "https://www.youtube.com/watch?v=zB1tL1wwqak", Lyric: "", Description: "#Nature", Duration: 287, LikeSound: 90, View: 12000, Owner: "4K Relaxation Channel", STID: asmrType.ID, UID: user.ID},
		{Name: "May Valley Trail Issaquah, Washington", Sound: "https://www.youtube.com/watch?v=HGOYvgb2SJY", Lyric: "", Description: "#Nature", Duration: 175, LikeSound: 95, View: 30000, Owner: "4K Relaxation Channel", STID: asmrType.ID, UID: user.ID},
		{Name: "Central Park, NYC", Sound: "https://www.youtube.com/watch?v=YmCJKmbprnE", Lyric: "", Description: "#Nature #Winter", Duration: 55, LikeSound: 100, View: 2000000, Owner: "4K Relaxation Channel", STID: asmrType.ID, UID: user.ID},
		{Name: "Skagit River in Late Fall, North Cascades Area, WA", Sound: "https://www.youtube.com/watch?v=JA1mxsfb4ak", Lyric: "", Description: "#Nature", Duration: 185, LikeSound: 100, View: 20, Owner: "4K Relaxation Channel", STID: asmrType.ID, UID: user.ID},
		{Name: "Coffee Shop", Sound: "https://www.youtube.com/watch?v=uU_RxnJOdMQ&t=13753s", Lyric: "", Description: "#Cafe", Duration: 420, LikeSound: 100, View: 200, Owner: "Fox Mooder AMBIENCE WORLDS", STID: asmrType.ID, UID: user.ID},
		{Name: "Cockpit View Airplane", Sound: "https://www.youtube.com/watch?v=Q139Juah-NQ&t=40s", Lyric: "", Description: "#Window", Duration: 420, LikeSound: 99, View: 200, Owner: "Fox Mooder AMBIENCE WORLDS", STID: asmrType.ID, UID: user.ID},
		{Name: "Rain Thunder Night Window View", Sound: "https://www.youtube.com/watch?v=TuBxM-qBmp8&t=1612s", Lyric: "", Description: "#Window", Duration: 420, LikeSound: 98, View: 200, Owner: "Fox Mooder AMBIENCE WORLDS", STID: asmrType.ID, UID: user.ID},
		{Name: "Paris at Night", Sound: "https://www.youtube.com/watch?v=1B8fDmR72sY", Lyric: "", Description: "#City", Duration: 420, LikeSound: 97, View: 200, Owner: "Fox Mooder AMBIENCE WORLDS", STID: asmrType.ID, UID: user.ID},
		{Name: "Walt Disney World Magic Kingdom Street", Sound: "https://www.youtube.com/watch?v=oDCf5bjrWOU&list=PLdpAPXvvaMVsOGFEfbgS9L4CavY9j7KN1", Lyric: "", Description: "#City", Duration: 420, LikeSound: 101, View: 200, Owner: "Fox Mooder AMBIENCE WORLDS", STID: asmrType.ID, UID: user.ID},
		{Name: "Coffee Shop at christmas", Sound: "https://www.youtube.com/watch?v=u88fH7HLszo&list=PLdpAPXvvaMVsOGFEfbgS9L4CavY9j7KN1&index=5", Lyric: "", Description: "#Cafe", Duration: 420, LikeSound: 102, View: 200, Owner: "Fox Mooder AMBIENCE WORLDS", STID: asmrType.ID, UID: user.ID},
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
			UID:       1,
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
	db.First(&sendTypeUser, "type = ?", "user") // สมมุติว่า user ใช้ type = "user"
	db.First(&sendTypeBot, "type = ?", "model") // สมมุติว่า bot ใช้ type = "model"

	var count int64
	db.Model(&entity.Conversation{}).Count(&count)
	if count == 0 {
		conversations := []entity.Conversation{
			{
				Message:    "สวัสดีครับ ชอบดูบอลมากๆ และ ผู้หญิงสวยๆด้วย",
				ChatRoomID: chatRoom.ID,
				STID:       sendTypeUser.ID,
			},
			{
				Message:    "สวัสดีครับ มีอะไรให้ช่วยไหมครับ?",
				ChatRoomID: chatRoom.ID,
				STID:       sendTypeBot.ID,
			},
			{
				Message:    "ผมอยากรู้ว่าวันนี้อากาศเป็นยังไง",
				ChatRoomID: chatRoom.ID,
				STID:       sendTypeUser.ID,
			},
			{
				Message:    "วันนี้อากาศแจ่มใส อุณหภูมิประมาณ 32 องศาเซลเซียส",
				ChatRoomID: chatRoom.ID,
				STID:       sendTypeBot.ID,
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

func SeedQuestionnaires(db *gorm.DB) {
	// หาผู้ใช้ admin
	var admin entity.Users
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		log.Fatalf("ไม่พบผู้ใช้ admin: %v", err)
	}

	// == 1. แบบประเมิน 2Q ==
	questions2Q := []string{
		"ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ ท่านรู้สึก หดหู่ เศร้า หรือท้อแท้สิ้นหวัง หรือไม่",
		"ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ ท่านรู้สึก เบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือไม่",
	}
	options2Q := []entity.AnswerOption{
		{Description: "มี", Point: 1,EmotionChoiceID: 12}, // สมมุติว่า 1 คือ ID ของอารมณ์ "เศร้า"
		{Description: "ไม่มี", Point: 0,EmotionChoiceID: 10},
	}
	testTypeNegative := "negative"
	testTypePositive := "positive"
	insertQuestionnaireWithQuestionsAndOptions(db, "แบบคัดกรองโรคซึมเศร้า 2Q", "ใช้คัดกรองเบื้องต้น", 2, admin.ID, questions2Q, options2Q, nil, nil,nil,&testTypeNegative)

	// == 2. แบบประเมิน 9Q ==
	questions9Q := []string{
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการเบื่อ ไม่สนใจอยากทำอะไร",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการไม่สบายใจ ซึมเศร้า ท้อแท้",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการหลับยาก หรือหลับ ๆ ตื่น ๆ หรือหลับมากไป",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการเหนื่อยง่าย หรือ ไม่ค่อยมีแรง",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการเบื่ออาหาร หรือ กินมากเกินไป",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านรู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้คนอื่นผิดหวัง",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการสมาธิไม่ดีเวลาทำอะไร เช่น ดูทีวี ฟังวิทยุ หรือทำงาน",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีอาการพูดช้า ทำอะไรช้าจนคนอื่นสังเกตเห็น หรือกระสับกระส่าย",
		"ในช่วง 2 สัปดาห์ที่ผ่านมารวมทั้งวันนี้ ท่านมีความคิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปคงจะดี",
	}
	options9Q := []entity.AnswerOption{
		{Description: "ไม่มีเลย", Point: 0,EmotionChoiceID: 10},
		{Description: "เป็นบางวัน (1–7 วัน)", Point: 1,EmotionChoiceID: 7},
		{Description: "เป็นบ่อย (>7 วัน)", Point: 2,EmotionChoiceID: 4},
		{Description: "เป็นทุกวัน", Point: 3,EmotionChoiceID: 1},
	}

	var questionnaire2Q entity.Questionnaire
	if err := db.Where("name_questionnaire = ?", "แบบคัดกรองโรคซึมเศร้า 2Q").First(&questionnaire2Q).Error; err != nil {
		log.Fatalf("หาแบบสอบถาม 2Q ไม่เจอ: %v", err)
	}

	scoreThreshold := 1
	greaterThan := "greaterThan"
	insertQuestionnaireWithQuestionsAndOptions(db, "แบบคัดกรองโรคซึมเศร้า 9Q", "ใช้วัดความรุนแรงของอาการ", 9, admin.ID, questions9Q, options9Q, &questionnaire2Q.ID, &scoreThreshold,&greaterThan,&testTypeNegative)

	// == 3. แบบวัดระดับสติ State Mindfulness Scale (ฉบับย่อ) ==
	questionsMindfulness := []string{
		"ฉันรู้สึกว่ามันยากที่จะจดจ่อกับสิ่งที่กำลังเกิดขึ้น",
		"ฉันทำอะไรไปโดยไม่ได้ใส่ใจกับสิ่งนั้น",
		"ฉันหมกมุ่นอยู่กับอนาคตหรืออดีต",
		"ฉันทำอะไรไปแบบอัตโนมัติโดยไม่ได้ตระหนักถึงสิ่งที่ทำ",
		"ฉันรีบทำอะไรบางอย่างโดยไม่ได้ตั้งใจจริงๆ",
	}
	optionsMindfulness := []entity.AnswerOption{
		{Description: "เกือบตลอดเวลา", Point: 1,EmotionChoiceID: 1},
		{Description: "บ่อยมาก", Point: 2,EmotionChoiceID: 4},
		{Description: "ค่อนข้างบ่อย", Point: 3,EmotionChoiceID: 5},
		{Description: "เป็นบางครั้ง", Point: 4,EmotionChoiceID: 7},
		{Description: "แทบไม่เคย", Point: 5,EmotionChoiceID: 9},
		{Description: "ไม่เคย", Point: 6,EmotionChoiceID: 10},
	}

	insertQuestionnaireWithQuestionsAndOptions(db, "แบบวัดระดับสติ (State Mindfulness)", "ประเมินระดับสติในขณะปัจจุบัน", 5, admin.ID, questionsMindfulness, optionsMindfulness, nil, nil, nil,&testTypePositive)

	// == 4. แบบวัดระดับความสุข คะแนน 0-10 ==
	questionsHappinessLevel := []string{
		"ขณะนี้ คุณให้คะแนนความสุขตนเองเท่าไร",
	}

	optionsHappinessLevel := []entity.AnswerOption{
		{Description: "0", Point: 0,EmotionChoiceID: 1},
		{Description: "1", Point: 1,EmotionChoiceID: 2},
		{Description: "2", Point: 2,EmotionChoiceID: 3},
		{Description: "3", Point: 3,EmotionChoiceID: 4},
		{Description: "4", Point: 4,EmotionChoiceID: 5},
		{Description: "5", Point: 5,EmotionChoiceID: 6},
		{Description: "6", Point: 6,EmotionChoiceID: 7},
		{Description: "7", Point: 7,EmotionChoiceID: 8},
		{Description: "8", Point: 8,EmotionChoiceID: 9},
		{Description: "9", Point: 9,EmotionChoiceID: 10},
		{Description: "10", Point: 10,EmotionChoiceID: 11},
	}

	insertQuestionnaireWithQuestionsAndOptions(db, "แบบวัดระดับความสุข คะแนน 0-10", "วัดระดับความสุขในขณะปัจจุบัน", 1, admin.ID, questionsHappinessLevel, optionsHappinessLevel, nil, nil, nil,&testTypePositive)

	fmt.Println("✅ Seeded Questionnaires 2Q, 9Q, Mindfulness, HappinessLevel")
}

func insertQuestionnaireWithQuestionsAndOptions(
	db *gorm.DB,
	name string,
	description string,
	quantity int,
	uid uint,
	questionTexts []string,
	options []entity.AnswerOption,
	ConditionOnID *uint,
	ConditionScore *int,
	ConditionType     *string, // เงื่อนไขที่เลือก: greaterThan, lessThan
	TestType *string, // ประเภทแบบทดสอบ: "positive", "negative"


) {
	questionnaire := entity.Questionnaire{
		NameQuestionnaire: name,
		Description:       description,
		Quantity:          quantity,
		UID:               uid,
		ConditionOnID:     ConditionOnID,
		ConditionScore:    ConditionScore,
		ConditionType:     ConditionType,
		TestType:          TestType,
	}

	if err := db.Create(&questionnaire).Error; err != nil {
		log.Fatalf("ไม่สามารถสร้างแบบประเมิน %s: %v", name, err)
	}

	for _, qText := range questionTexts {
		question := entity.Question{
			NameQuestion: qText,
			QuID:         questionnaire.ID,
		}
		if err := db.Create(&question).Error; err != nil {
			log.Fatalf("ไม่สามารถสร้างคำถาม: %v", err)
		}
		for _, opt := range options {
			opt.QID = question.ID
			if err := db.Create(&opt).Error; err != nil {
				log.Fatalf("ไม่สามารถสร้างตัวเลือก: %v", err)
			}
		}
	}
}

// SeedCriteriaAndCalculations - เพิ่มข้อมูลเริ่มต้นในตาราง Criteria และ Calculation
func SeedCriteriaAndCalculations(db *gorm.DB) {
	// Seed Criteria
	criterias := []entity.Criteria{
		{Description: "ปกติ ไม่เป็นโรคซึมเศร้า", MinCriteriaScore: 0 ,MaxCriteriaScore: 0},
		{Description: "เป็นผู้มีความเสี่ยง หรือ มีแนวโน้มที่จะเป็นโรคซึมเศร้า", MinCriteriaScore: 0 ,MaxCriteriaScore: 1}, // Note: CriteriaScore for range will be handled in logic

		{Description: "ไม่มีอาการของโรคซึมเศร้าหรือมีอาการของโรคซึมเศร้าระดับน้อยมาก", MinCriteriaScore: 0 ,MaxCriteriaScore: 7},
		{Description: "มีอาการของโรคซึมเศร้า ระดับน้อย", MinCriteriaScore: 0 ,MaxCriteriaScore: 12},
		{Description: "มีอาการของโรคซึมเศร้า ระดับปานกลาง", MinCriteriaScore: 0 ,MaxCriteriaScore: 18},
		{Description: "มีอาการของโรคซึมเศร้า ระดับรุนแรง", MinCriteriaScore: 0 ,MaxCriteriaScore: 27},

		{Description: "ขาดสติ ในขณะนั้น", MinCriteriaScore: 0 ,MaxCriteriaScore: 3},
		{Description: "มีสติ อยู่กับปัจจุบัน", MinCriteriaScore: 0 ,MaxCriteriaScore: 6},
		
		{Description: "ไม่มีความสุขเลย", MinCriteriaScore: 0 ,MaxCriteriaScore: 0},
		{Description: "มีความสุขน้อยที่สุด", MinCriteriaScore: 0 ,MaxCriteriaScore: 2},
		{Description: "มีความสุขน้อย", MinCriteriaScore: 0 ,MaxCriteriaScore: 4},
		{Description: "มีความสุขปานกลาง", MinCriteriaScore: 0 ,MaxCriteriaScore: 6},
		{Description: "มีความสุขมาก", MinCriteriaScore: 0 ,MaxCriteriaScore: 8},
		{Description: "มีความสุขมากที่สุด", MinCriteriaScore: 0 ,MaxCriteriaScore: 10},
	}

	for _, c := range criterias {
		var existingCriteria entity.Criteria
		if err := db.Where("description = ?", c.Description).First(&existingCriteria).Error; err != nil {
			// ถ้าไม่มี ให้สร้างใหม่
			if err := db.Create(&c).Error; err != nil {
				log.Fatalf("ไม่สามารถสร้าง Criteria: %v", err)
			}
		}
	}
	fmt.Println("✅ Seeded Criterias")

	// Fetch Questionnaire IDs
	var q2Q entity.Questionnaire
	if err := db.Where("name_questionnaire = ?", "แบบคัดกรองโรคซึมเศร้า 2Q").First(&q2Q).Error; err != nil {
		log.Fatalf("ไม่พบแบบประเมิน 2Q: %v", err)
	}

	var q9Q entity.Questionnaire
	if err := db.Where("name_questionnaire = ?", "แบบคัดกรองโรคซึมเศร้า 9Q").First(&q9Q).Error; err != nil {
		log.Fatalf("ไม่พบแบบประเมิน 9Q: %v", err)
	}

	var qMindfulness entity.Questionnaire
	if err := db.Where("name_questionnaire = ?", "แบบวัดระดับสติ (State Mindfulness)").First(&qMindfulness).Error; err != nil {
		log.Fatalf("ไม่พบแบบประเมิน State Mindfulness: %v", err)
	}

	var qHappinessLevel entity.Questionnaire
	if err := db.Where("name_questionnaire = ?", "แบบวัดระดับความสุข คะแนน 0-10").First(&qHappinessLevel).Error; err != nil {
		log.Fatalf("ไม่พบแบบประเมิน แบบวัดระดับความสุข คะแนน 0-10: %v", err)
	}

	// Fetch Criteria IDs
	var c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14 entity.Criteria
	db.Where("description = ?", "ปกติ ไม่เป็นโรคซึมเศร้า").First(&c1)
	db.Where("description = ?", "เป็นผู้มีความเสี่ยง หรือ มีแนวโน้มที่จะเป็นโรคซึมเศร้า").First(&c2)
	db.Where("description = ?", "ไม่มีอาการของโรคซึมเศร้าหรือมีอาการของโรคซึมเศร้าระดับน้อยมาก").First(&c3)
	db.Where("description = ?", "มีอาการของโรคซึมเศร้า ระดับน้อย").First(&c4)
	db.Where("description = ?", "มีอาการของโรคซึมเศร้า ระดับปานกลาง").First(&c5)
	db.Where("description = ?", "มีอาการของโรคซึมเศร้า ระดับรุนแรง").First(&c6)
	db.Where("description = ?", "ขาดสติ ในขณะนั้น").First(&c7)
	db.Where("description = ?", "มีสติ อยู่กับปัจจุบัน").First(&c8)
	db.Where("description = ?", "ไม่มีความสุขเลย").First(&c9)
	db.Where("description = ?", "มีความสุขน้อยที่สุด").First(&c10)
	db.Where("description = ?", "มีความสุขน้อย").First(&c11)
	db.Where("description = ?", "มีความสุขปานกลาง").First(&c12)
	db.Where("description = ?", "มีความสุขมาก").First(&c13)
	db.Where("description = ?", "มีความสุขมากที่สุด").First(&c14)

	// Seed Calculations
	calculations := []entity.Calculation{
		{CID: c1.ID, QuID: q2Q.ID},
		{CID: c2.ID, QuID: q2Q.ID},
		{CID: c3.ID, QuID: q9Q.ID},
		{CID: c4.ID, QuID: q9Q.ID},
		{CID: c5.ID, QuID: q9Q.ID},
		{CID: c6.ID, QuID: q9Q.ID},
		{CID: c7.ID, QuID: qMindfulness.ID},
		{CID: c8.ID, QuID: qMindfulness.ID},
		{CID: c9.ID, QuID: qHappinessLevel.ID},
		{CID: c10.ID, QuID: qHappinessLevel.ID},
		{CID: c11.ID, QuID: qHappinessLevel.ID},
		{CID: c12.ID, QuID: qHappinessLevel.ID},
		{CID: c13.ID, QuID: qHappinessLevel.ID},
		{CID: c14.ID, QuID: qHappinessLevel.ID},
	}

	for _, calc := range calculations {
		var existingCalc entity.Calculation
		if err := db.Where("cid = ? AND quid = ?", calc.CID, calc.QuID).First(&existingCalc).Error; err != nil {
			// ถ้าไม่มี ให้สร้างใหม่
			if err := db.Create(&calc).Error; err != nil {
				log.Fatalf("ไม่สามารถสร้าง Calculation: %v", err)
			}
		}
	}
	fmt.Println("✅ Seeded Calculations")
}

func SeedBackground(db *gorm.DB) {
	backgrounds := []entity.Background{
		{
			Name:    "ภูเขายามเช้า",
			Picture: "maditation.jpg",
			UID:     1,
		},
		{
			Name:    "ธรรมชาติริมทะเล",
			Picture: "prey.jpg",
			UID:     1,
		},
		{
			Name:    "ป่าไม้ร่มรื่น",
			Picture: "q1.jpg",
			UID:     1,
		},
		{
			Name:    "รูปกอดตัวเอง",
			Picture: "รูปกอดตัวเองสีชมพู.png.png",
			UID:     1,
		},
		{
			Name:    "รูปกอดตัวเองเสื้อสีแดง",
			Picture: "กอดตัวเองเสื้อสีเเดง.png",
			UID:     1,
		},
		{
			Name:    "รูปกอดตัวเองผมชมพู",
			Picture: "รูปกอดตัวเอง.png",
			UID:     1,
		},
	}

	for _, bg := range backgrounds {
		if err := db.Create(&bg).Error; err != nil {
			log.Printf("ไม่สามารถ seed background ได้: %v", err)
		}
	}
}

func SeedQuestionnaireGroups(db *gorm.DB) {
	var questionnaires []entity.Questionnaire
	if err := db.Find(&questionnaires).Error; err != nil {
		log.Fatalf("ไม่สามารถดึงแบบประเมินทั้งหมด: %v", err)
	}

	qMap := make(map[string]entity.Questionnaire)
	for _, q := range questionnaires {
		qMap[q.NameQuestionnaire] = q
	}

	type GroupInput struct {
		Name               string
		Description        string
		QuestionnaireNames []string
		FrequencyDays      *uint
	}

	groups := []GroupInput{
		{
			Name:        "Pre-test",
			Description: "ก่อนใช้แอปพลิเคชัน",
			QuestionnaireNames: []string{
				"แบบวัดระดับความสุข คะแนน 0-10",
				"แบบวัดระดับสติ (State Mindfulness)",
				"แบบคัดกรองโรคซึมเศร้า 2Q",
				"แบบคัดกรองโรคซึมเศร้า 9Q",
			},
			FrequencyDays: nil,
		},
		{
			Name:        "Post-test",
			Description: "หลังใช้แอปพลิเคชันทันที",
			QuestionnaireNames: []string{
				"แบบวัดระดับความสุข คะแนน 0-10",
				"แบบวัดระดับสติ (State Mindfulness)",
			},
			FrequencyDays: nil,
		},
		{
			Name:        "Post-test2weeks",
			Description: "หลังใช้แอปพลิเคชัน 2 สัปดาห์",
			QuestionnaireNames: []string{
				"แบบวัดระดับความสุข คะแนน 0-10",
				"แบบวัดระดับสติ (State Mindfulness)",
				"แบบคัดกรองโรคซึมเศร้า 2Q",
				"แบบคัดกรองโรคซึมเศร้า 9Q",
			},
			FrequencyDays: func() *uint { v := uint(14); return &v }(),
		},
	}

	for _, group := range groups {
		// 1. สร้างกลุ่มเปล่า
		qGroup := entity.QuestionnaireGroup{
			Name:          group.Name,
			Description:   group.Description,
			FrequencyDays: group.FrequencyDays,
		}
		if err := db.Create(&qGroup).Error; err != nil {
			log.Fatalf("ไม่สามารถสร้างกลุ่มแบบสอบถาม: %v", err)
		}

		// 2. เพิ่มความสัมพันธ์แต่ละ Questionnaire พร้อม OrderInGroup
		for order, name := range group.QuestionnaireNames {
			q, ok := qMap[name]
			if !ok {
				log.Fatalf("❌ ไม่พบแบบสอบถามชื่อ: %s", name)
			}

			link := entity.QuestionnaireGroupQuestionnaire{
				QuestionnaireGroupID: qGroup.ID,
				QuestionnaireID:      q.ID,
				OrderInGroup:         uint(order + 1), // เริ่มที่ 1
			}
			if err := db.Create(&link).Error; err != nil {
				log.Fatalf("❌ ไม่สามารถเชื่อมแบบสอบถามเข้ากลุ่ม: %v", err)
			}
		}
	}

	fmt.Println("✅ Seeded Questionnaire Groups พร้อม OrderInGroup แล้ว")
}


// สร้างข้อมูล type ของบทความ
func CreateArticleTypes(db *gorm.DB) {
    // เช็คว่ามีข้อมูลประเภทบทความแล้วหรือไม่
    var count int64
    db.Model(&entity.ArticleType{}).Count(&count)

    // ถ้ายังไม่มีข้อมูลให้สร้างประเภทบทความ
    if count == 0 {
        // สร้างข้อมูลประเภทบทความ
        articleTypes := []entity.ArticleType{
            {Name: "บทความความคิดเห็น", Description: "เน้นมุมมอง ความคิดเห็น และประสบการณ์ส่วนตัว"},
            {Name: "บทความเชิงวิเคราะห์", Description: "วิเคราะห์เหตุการณ์ ประเด็น หรือสถานการณ์"},
            {Name: "บทความเล่าเรื่อง", Description: "เน้นการเล่าเรื่อง ดึงดูดอารมณ์"},
            {Name: "บทความ How-to", Description: "แนะนำวิธีการ ขั้นตอน โดยไม่ต้องอ้างอิงงานวิจัย"},
            {Name: "บทความรีวิว", Description: "แชร์ประสบการณ์ ความรู้สึก เกี่ยวกับสินค้า บริการ"},
            {Name: "บทความไลฟ์สไตล์", Description: "แชร์เรื่องราวเกี่ยวกับไลฟ์สไตล์"},
            {Name: "บทความบันเทิง", Description: "แชร์ข่าวสาร เรื่องราว เกี่ยวกับวงการบันเทิง"},
            {Name: "บทความท่องเที่ยว", Description: "แชร์ประสบการณ์ แนะนำสถานที่ท่องเที่ยว"},
            {Name: "บทความสุขภาพ", Description: "แชร์ความรู้ ข้อมูล เกี่ยวกับสุขภาพ"},
            {Name: "บทความการเงิน", Description: "แชร์ความรู้ ข้อมูล เกี่ยวกับการเงิน"},
            {Name: "บทความ SEO", Description: "ดึงดูดผู้อ่านและติดอันดับบน Google"},
            {Name: "บทความเชิงวิจารณ์", Description: "วิพากษ์วิจารณ์ผลงาน สินค้า บริการ หรือเหตุการณ์"},
            {Name: "บทความเชิงสารคดี", Description: "นำเสนอข้อมูลเชิงลึก เจาะลึกประเด็นหรือเรื่องราว"},
            {Name: "บทความเชิงข่าว", Description: "นำเสนอเหตุการณ์ ข่าวสาร"},
            {Name: "บทความเชิงวิชาการ", Description: "นำเสนอผลงานวิจัย ความรู้ทางวิชาการ"},
            {Name: "บทความเชิงกวี", Description: "เน้นการใช้ภาษา สื่ออารมณ์ ความรู้สึก"},
            {Name: "บทความบันทึกประจำวัน", Description: "แชร์เรื่องราว ประสบการณ์ ความคิดเห็นส่วนตัว"},
            {Name: "บทความเชิงจดหมาย", Description: "แสดงความคิดเห็นหรือเสนอแนะต่อบรรณาธิการ"},
            {Name: "บทความเชิงสัมภาษณ์", Description: "นำเสนอการสัมภาษณ์บุคคลน่าสนใจ"},
            {Name: "บทความเชิงเปิดเผย", Description: "เขียนเกี่ยวกับเรื่องราวส่วนตัว ประสบการณ์ ความรู้สึก"},
            {Name: "บทความเชิงเทคโนโลยี", Description: "นำเสนอข่าวสาร ความรู้ เกี่ยวกับเทคโนโลยี"},
            {Name: "บทความเชิงวิทยาศาสตร์", Description: "นำเสนอความรู้ ข้อมูล เกี่ยวกับวิทยาศาสตร์"},
            {Name: "บทความเชิงปรัชญา", Description: "นำเสนอความคิด แนวคิด เกี่ยวกับปรัชญา"},
            {Name: "บทความเชิงกฎหมาย", Description: "นำเสนอความรู้ ข้อมูล เกี่ยวกับกฎหมาย"},
            {Name: "บทความเชิงธุรกิจ", Description: "นำเสนอความรู้ ข้อมูล เกี่ยวกับธุรกิจ"},
            {Name: "บทความเชิงจิตวิทยา", Description: "นำเสนอความรู้ ข้อมูล เกี่ยวกับจิตวิทยา"},
            {Name: "บทความเชิงศาสนา", Description: "นำเสนอความรู้ ข้อมูล เกี่ยวกับศาสนา"},
            {Name: "บทความแอสเส", Description: "งานเขียนที่มักมอบหมายให้นักเรียน นักศึกษา เขียนเพื่อแสดงความคิด"},
        }

        // สร้างประเภทบทความในฐานข้อมูล
        if err := db.Create(&articleTypes).Error; err != nil {
            log.Fatalf("ไม่สามารถสร้างประเภทบทความ: %v", err)
        }

        fmt.Println("Article types created successfully!")
    } else {
        fmt.Println("Article types already exist in the database.")
    }
}

func SeedEmojis(db *gorm.DB) {
    var count int64
    db.Model(&entity.Emotion{}).Count(&count)
    if count == 0 {
        emojis := []entity.Emotion{
            {Mood: "มีความสุข", Picture: "happy.png"},
            {Mood: "โกรธ", Picture: "grumpy.png"},
            {Mood: "เศร้า", Picture: "sad.png"},
            {Mood: "เฉย ๆ", Picture: "neutral.png"},
        }
        if err := db.Create(&emojis).Error; err != nil {
            log.Fatalf("ไม่สามารถ seed emoji: %v", err)
        }
        fmt.Println("✅ Seeded Emojis")
    }
}

// ===== Seed: Mirror for user #2 in July 2025 (31 days) =====
func SeedMirrorJuly2025(db *gorm.DB) {
	uid := uint(2) // บันทึกให้ผู้ใช้คนที่ 2 เท่านั้น

	// ข้อมูล 31 วัน (message จับคู่กับ eid ให้เรียบร้อย)
	// eid: 1=ยิ้ม, 2=โกรธ, 3=เศร้า, 4=เฉยๆ  (อ้างอิงตามตาราง emotion ที่ seed ไว้)
	type dayData struct {
		Msg string
		EID uint
	}
	days := []dayData{
		{Msg: "วันนี้รู้สึกดีและมีพลัง", EID: 1},
		{Msg: "เรื่อย ๆ ไม่มีอะไรพิเศษ", EID: 4},
		{Msg: "หัวร้อนเพราะรถติดหนัก", EID: 2},
		{Msg: "เหงาและเศร้าเล็กน้อย", EID: 3},
		{Msg: "ได้ข่าวดีจากที่บ้าน ยิ้มทั้งวัน", EID: 1},
		{Msg: "ทำงานยาว ๆ รู้สึกเฉย ๆ", EID: 4},
		{Msg: "โมโหเพราะโดนต่อคิว", EID: 2},
		{Msg: "คิดถึงบ้านเลยรู้สึกเศร้า", EID: 3},
		{Msg: "ออกกำลังเช้า สดใสจัง", EID: 1},
		{Msg: "ปกติ ไม่มีอะไรตื่นเต้น", EID: 4},
		{Msg: "หัวเสียเพราะเน็ตล่ม", EID: 2},
		{Msg: "ดูหนังดราม่าแล้วน้ำตาซึม", EID: 3},
		{Msg: "กินของอร่อย อารมณ์ดีมาก", EID: 1},
		{Msg: "วันสบาย ๆ อยู่บ้านทั้งวัน", EID: 4},
		{Msg: "ไม่พอใจกับผลงานตัวเอง", EID: 2},
		{Msg: "คิดมากเรื่องส่วนตัว เลยเศร้า", EID: 3},
		{Msg: "ได้คุยกับเพื่อนเก่า มีความสุข", EID: 1},
		{Msg: "นิ่ง ๆ เนิบ ๆ ทั้งวัน", EID: 4},
		{Msg: "โกรธเพราะโดนเบี้ยวนัด", EID: 2},
		{Msg: "พลาดเป้าหมายเลยรู้สึกเสียใจ", EID: 3},
		{Msg: "อากาศดี เดินเล่นเพลิน ยิ้มง่าย", EID: 1},
		{Msg: "ชีวิตไหลไปตามปกติ", EID: 4},
		{Msg: "หงุดหงิดเพราะงานไม่คืบ", EID: 2},
		{Msg: "เศร้าเพราะแพ้เกม", EID: 3},
		{Msg: "สำเร็จงานใหญ่ ภูมิใจมาก", EID: 1},
		{Msg: "ไม่มีอะไรใหม่ ๆ วันนี้", EID: 4},
		{Msg: "หัวร้อนเพราะเจอทัศนคติแย่", EID: 2},
		{Msg: "คิดถึงใครบางคน เลยหม่น ๆ", EID: 3},
		{Msg: "ได้ของขวัญไม่คาดคิด ยิ้มทั้งวัน", EID: 1},
		{Msg: "วันธรรมดาที่เรียบง่าย", EID: 4},
		{Msg: "ข่าวร้ายทำให้ใจหาย เศร้า", EID: 3}, // วันสุดท้ายใส่โทนเศร้าให้ต่าง
	}

	// วนครอบ 1..31 ก.ค. 2025
	for day := 1; day <= 31; day++ {
		d := days[day-1]

		// สร้างช่วงเวลา 00:00 - <+1 วัน> เพื่อกันซ้ำในวันเดียวกัน
		start := time.Date(2025, time.July, day, 0, 0, 0, 0, time.UTC)
		end := start.Add(24 * time.Hour)

		// ถ้าวันนี้ของ user #2 มีอยู่แล้ว ให้ข้าม
		var count int64
		if err := db.Model(&entity.Mirror{}).
			Where("uid = ? AND date >= ? AND date < ?", uid, start, end).
			Count(&count).Error; err != nil {
			log.Printf("❌ เช็คข้อมูลวันที่ %s ผิดพลาด: %v", start.Format("2006-01-02"), err)
			continue
		}
		if count > 0 {
			// มีแล้ว ไม่ seed ซ้ำ
			continue
		}

		m := entity.Mirror{
			Date:    start,
			Message: d.Msg,
			EID:     d.EID,
			UID:     uid,
		}
		if err := db.Create(&m).Error; err != nil {
			log.Printf("❌ บันทึก %s ไม่สำเร็จ: %v", start.Format("2006-01-02"), err)
			continue
		}
		fmt.Printf("✅ Seeded mirror for %s (uid=%d, eid=%d)\n", start.Format("2006-01-02"), uid, d.EID)
	}
}

// ===== Seed: Mirror for user #2 in Aug 2025 (day 1–15, mostly happy) =====
func SeedMirrorAug2025FirstHalf(db *gorm.DB) {
	uid := uint(2)

	// eid: 1=ยิ้ม, 2=โกรธ, 3=เศร้า, 4=เฉยๆ
	type dayData struct {
		Msg string
		EID uint
	}

	days := []dayData{
		{Msg: "เริ่มเดือนใหม่ด้วยพลังบวก ยิ้มง่ายทั้งวัน", EID: 1},
		{Msg: "ทำงานลื่นไหล รู้สึกดีมาก", EID: 1},
		{Msg: "ออกกำลังกายเช้า อารมณ์ดี", EID: 1},
		{Msg: "ท้องฟ้าสวย สดใส ทำให้ใจเบิกบาน", EID: 1},
		{Msg: "ชวนครอบครัวทานข้าว อบอุ่นใจ", EID: 1},
		{Msg: "วันสบาย ๆ เรื่อย ๆ ไม่รีบเร่ง", EID: 4},
		{Msg: "ได้คำชมจากเพื่อนร่วมทีม ยิ้มทั้งวัน", EID: 1},
		{Msg: "กาแฟอร่อย งานก็เดิน สนุกดี", EID: 1},
		{Msg: "เดินเล่นยามเย็น อากาศดีมาก", EID: 1},
		{Msg: "เจอเรื่องจุกจิกนิดหน่อย แต่ยังโอเค", EID: 4},
		{Msg: "มีข่าวดีเล็ก ๆ ทำให้กำลังใจเพิ่ม", EID: 1},
		{Msg: "ช่วยคนอื่นได้ รู้สึกมีคุณค่า", EID: 1},
		{Msg: "หัวเราะเยอะมากวันนี้ สนุกสุด ๆ", EID: 1},
		{Msg: "พักผ่อนเต็มที่ ใจสงบ ผ่อนคลาย", EID: 1},
		{Msg: "ปิดงานค้างได้สำเร็จ โล่งใจและมีความสุข", EID: 1},
	}

	for day := 1; day <= 15; day++ {
		d := days[day-1]

		start := time.Date(2025, time.August, day, 0, 0, 0, 0, time.UTC)
		end := start.Add(24 * time.Hour)

		var count int64
		if err := db.Model(&entity.Mirror{}).
			Where("uid = ? AND date >= ? AND date < ?", uid, start, end).
			Count(&count).Error; err != nil {
			log.Printf("❌ เช็คข้อมูลวันที่ %s ผิดพลาด: %v", start.Format("2006-01-02"), err)
			continue
		}
		if count > 0 {
			continue
		}

		m := entity.Mirror{
			Date:    start,
			Message: d.Msg,
			EID:     d.EID,
			UID:     uid,
		}
		if err := db.Create(&m).Error; err != nil {
			log.Printf("❌ บันทึก %s ไม่สำเร็จ: %v", start.Format("2006-01-02"), err)
			continue
		}
		fmt.Printf("✅ Seeded mirror for %s (uid=%d, eid=%d)\n", start.Format("2006-01-02"), uid, d.EID)
	}
}


//สร้าง emotion choices เริ่มต้นในตาราง EmotionChoice
func CreateDefaultEmotionChoices(db *gorm.DB) error {
	// ตรวจสอบว่ามีข้อมูลในตาราง EmotionChoice อยู่แล้วหรือยัง
	var count int64
	if err := db.Model(&entity.EmotionChoice{}).Count(&count).Error; err != nil {
		return fmt.Errorf("error checking emotion choices: %w", err)
	}

	// ถ้ายังไม่มีข้อมูลในตาราง EmotionChoice, เพิ่มข้อมูลเริ่มต้น
	if count == 0 {
		// ข้อมูลตัวอย่าง
		emotionChoices := []entity.EmotionChoice{
			{Name: "Angry", Picture: "0.png"},
			{Name: "Angry", Picture: "1.png"},
			{Name: "Angry", Picture: "2.png"},
			{Name: "Sad", Picture: "3.png"},
			{Name: "Sad", Picture: "4.png"},
			{Name: "Normal", Picture: "5.png"},
			{Name: "Normal", Picture: "6.png"},
			{Name: "Happy", Picture: "7.png"},	
			{Name: "Happy", Picture: "8.png"},
			{Name: "Happy", Picture: "9.png"},
			{Name: "Happyer", Picture: "10.png"},
			{Name: "Cry", Picture: "11.png"},
		}

		// เพิ่มข้อมูลลงในฐานข้อมูล
		if err := db.Create(&emotionChoices).Error; err != nil {
			return fmt.Errorf("error creating default emotion choices: %w", err)
		}
	}

	return nil
}
