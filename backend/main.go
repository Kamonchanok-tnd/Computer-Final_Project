package main

import (
	"fmt"
	"sukjai_project/config"  // ปรับตามชื่อโปรเจกต์ของคุณ
	
)

func main() {
	// เชื่อมต่อกับฐานข้อมูล
	config.ConnectionDB()

	// ตั้งค่าฐานข้อมูลและทำ AutoMigrate
	config.SetupDatabase()

	// ฟังก์ชันอื่นๆ ของแอปพลิเคชัน
	fmt.Println("App running...")
}