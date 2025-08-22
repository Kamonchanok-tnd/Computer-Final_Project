import { useEffect, useState } from "react";
import "./heartbackgound.css"; // ใช้ไฟล์ CSS ที่กำหนด @keyframes และ .animate-heart

interface Heart {
  id: number;
  size: number;
  left: number;
  duration: number;
}

export default function HeartBackground() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const size = Math.random() * 20 + 10; // ขนาดหัวใจ
      const left = Math.random() * 100;     // ตำแหน่งซ้าย (%)
      const duration = Math.random() * 5 + 5; // ความเร็วลอย
      setHearts((prev) => [...prev, { id, size, left, duration }]);

      // ลบหัวใจเก่าหลัง animation จบ
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, duration * 1000);
    }, 500); // ทุกครึ่งวินาทีสร้างหัวใจใหม่

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"> {/* ใส่ z-index */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute bottom-0 animate-heart"
          style={{
            left: `${h.left}%`,
            animationDuration: `${h.duration}s`,
            width: h.size,
            height: h.size,
            fontSize: h.size, // ปรับขนาดไอคอนให้เหมาะสม
            color: `hsl(${Math.random() * 360}, 60%, 80%)`, // สีหัวใจเป็นพาสเทลอ่อน
            opacity: 0.8, // ความโปร่งใสของหัวใจ
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width={h.size}
            height={h.size}
            className="heart-icon"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
