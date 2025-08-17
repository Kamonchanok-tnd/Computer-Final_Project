// BubbleBackground.tsx
import { useEffect, useState } from "react";
import "./globals.css";

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
}

export default function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const size = Math.random() * 20 + 10; // ขนาดฟอง
      const left = Math.random() * 100;     // ตำแหน่งซ้าย (%)
      const duration = Math.random() * 5 + 5; // ความเร็วลอย
      setBubbles((prev) => [...prev, { id, size, left, duration }]);

      // ลบฟองเก่าหลัง animation จบ
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
      }, duration * 1000);
    }, 500); // ทุกครึ่งวินาทีสร้างฟองใหม่

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute bottom-0 rounded-full bg-white/90 animate-bubble"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
