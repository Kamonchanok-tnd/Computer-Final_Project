// components/AutoLogoutProvider.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as jwtModule from "jwt-decode"; 

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 ชั่วโมง
const WARNING_DURATION = 5 * 60 * 1000;  // 5 นาที ก่อน logout

const AutoLogoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/"); // 🔥 กลับไปหน้า login
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setShowWarning(false);

    timeoutRef.current = setTimeout(() => {
      // console.log("🕒 ไม่มีการเคลื่อนไหวนาน -> logout");
      logout();
    }, TIMEOUT_DURATION);

    warningRef.current = setTimeout(() => {
      // console.log("⚠️ เตือนก่อน logout 5 นาที");
      setShowWarning(true);
    }, TIMEOUT_DURATION - WARNING_DURATION);
  };

  const checkTokenExpiry = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload: JwtPayload = jwtModule.jwtDecode(token); 
      const exp = payload.exp * 1000;
      if (Date.now() > exp) {
        // console.log("⏳ Token หมดอายุ -> logout");
        logout();
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      logout();
    }
  };

  const handleActivity = () => {
    resetTimer();
    checkTokenExpiry();
  };

  useEffect(() => {
  const activityEvents = ["mousemove", "mousedown", "keypress", "scroll", "click"];

  // 🔥 เช็ค token ตอนเปิดเว็บครั้งแรก
  checkTokenExpiry();

  // 🔥 ตั้ง idle timer
  resetTimer();

  // 🔥 ฟัง event user activity
  activityEvents.forEach(event => window.addEventListener(event, handleActivity));

  // 🔥 เพิ่ม interval มาตรวจ token expiry ทุกๆ 1 นาที
  const interval = setInterval(() => {
    checkTokenExpiry();
  }, 60 * 1000); // 1 นาที

  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
    clearInterval(interval);
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
