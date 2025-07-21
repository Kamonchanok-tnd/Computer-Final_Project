// AutoLogoutProvider.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 ชั่วโมง
const WARNING_DURATION = 5 * 60 * 1000;  // 5 นาที ก่อน logout

const AutoLogoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const resetTimer = () => {
    // ล้าง timeout เดิม
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setShowWarning(false); // ปิด popup ถ้ามี

    // ตั้งเวลา logout
    timeoutRef.current = setTimeout(() => {
      console.log("🕒 ไม่มีการเคลื่อนไหวนาน -> logout");
      localStorage.clear();
      localStorage.removeItem("isLogin");
      localStorage.removeItem("role");
      navigate("/");
    }, TIMEOUT_DURATION);

    // ตั้งเวลาแสดง popup เตือนก่อน logout
    warningRef.current = setTimeout(() => {
      console.log("⚠️ เตือนก่อน logout อีก 5 นาที");
      setShowWarning(true);
    }, TIMEOUT_DURATION - WARNING_DURATION);
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "mousedown", "keypress", "scroll", "click"];
    const handleActivity = () => {
      resetTimer(); // รีเซ็ตทุกครั้งที่มี event
    };

    resetTimer(); // เริ่มนับทันที
    activityEvents.forEach(event =>
      window.addEventListener(event, handleActivity)
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      activityEvents.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, []);

  return (
    <>
      {showWarning && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>⚠️ ไม่พบการใช้งาน</h2>
            <p>คุณจะถูกออกจากระบบภายใน 5 นาทีหากไม่มีการเคลื่อนไหว</p>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default AutoLogoutProvider;

// 👉 สไตล์ popup แบบง่าย
const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    textAlign: "center" as const,
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  }
};
