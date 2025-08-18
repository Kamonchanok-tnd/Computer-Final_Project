import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RequestPasswordReset } from "../../../services/https/login";
import { validateApi, resetPassword } from "../../../services/https/resetpassword";
import { message } from "antd";
import Stepper from "./stepper";
const ForgotPasswordStepPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [uuid, setUuid] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(5 * 60);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  if (step === 1 && timer > 0) {
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  } else if (step === 1 && timer === 0) {
    message.error("เวลาหมด กรุณาส่งรหัสยืนยันใหม่");
  }
}, [step, timer]);


  const formatTimer = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ---- Logic ----
const handleEmailSubmit = async () => {
  if (!email) return message.warning("กรุณากรอกอีเมลของคุณ");
  setLoading(true);
  try {
    const res = await RequestPasswordReset(email);
    if (res.status === 200) {
      message.success("ส่งรหัสยืนยันไปที่อีเมลของคุณแล้ว");
      setStep(1);
      setTimer(5 * 60);
    } else {
      message.error(res.data.error || "ไม่สามารถส่งรหัสยืนยันได้");
    }
  } finally {
    setLoading(false);
  }
};

  const handleUuidSubmit = async () => {
  const uuidString = uuid.join("");
  if (uuidString.length < 6) return message.warning("กรุณากรอกรหัสให้ครบ 6 หลัก");

  setLoading(true);
  try {
    const res = await validateApi({ token: uuidString });
    if (res.status === 200) {
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("jwt", res.data.jwt);
      message.success("รหัสยืนยันถูกต้อง กรุณาตั้งรหัสผ่านใหม่");
      setStep(2);
    } else {
      message.error(res.data.error || "รหัสยืนยันไม่ถูกต้อง");
    }
  } finally {
    setLoading(false);
  }
};

const handlePasswordReset = async () => {
  if (newPassword !== confirmPassword) return message.warning("รหัสผ่านไม่ตรงกัน");

  const userId = localStorage.getItem("userId");
  const jwt = localStorage.getItem("jwt");
  if (!userId || !jwt) return message.error("ไม่พบข้อมูลผู้ใช้หรือ token");

  setLoading(true);
  try {
    const res = await resetPassword(Number(userId), newPassword, jwt);
    if (res.status === 200) {
      message.success("ตั้งรหัสผ่านใหม่สำเร็จ");
      localStorage.clear();
      navigate("/");
    } else {
      message.error(res.data.error || "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
    }
  } finally {
    setLoading(false);
  }
};
const steps = ["กรอกอีเมล", "ตรวจสอบรหัส", "ตั้งรหัสผ่านใหม่"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-t from-cyan-100 to-white">
      {/* Stepper */}
     
<Stepper step={step} steps={steps} />



      {/* Card */}
<div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10 space-y-6 mt-25">

        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">🔐 ลืมรหัสผ่าน</h2>
            <p className="text-center text-gray-600">
              กรุณากรอกอีเมล ระบบจะส่งรหัสยืนยันไปให้คุณ
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full bg-blue-300 text-white py-3 rounded-lg hover:bg-blue-400 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "กำลังส่ง..." : "ส่งรหัสยืนยัน"}
            </button>
            <p className="text-center text-sm text-gray-500">
              <span>หรือ </span>
              <span
                className="text-blue-500 cursor-pointer "
                onClick={() => navigate("/")}
              >
                กลับสู่หน้าล็อกอิน
              </span>
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">กรอกรหัสยืนยัน</h2>
            <div className="flex justify-center space-x-3">
              {uuid.map((v, i) => (
                <input
                  key={i}
                  maxLength={1}
                  value={v}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9a-zA-Z]?$/.test(val)) {
                      const newUuid = [...uuid];
                      newUuid[i] = val;
                      setUuid(newUuid);
                    }
                  }}
                  placeholder="รหัสยืนยัน"
                  className="w-14 h-14 border rounded-lg text-center text-xl focus:ring-2 focus:ring-cyan-400 outline-none"
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-gray-600 text-sm">
              <span>เวลาที่เหลือ: <b>{formatTimer()}</b></span>
              <button
                disabled={timer > 0}
                onClick={handleEmailSubmit}
                className="text-cyan-500 disabled:opacity-50"
              >
                ส่งรหัสใหม่
              </button>
            </div>
            <button
              onClick={handleUuidSubmit}
              disabled={loading}
              className="w-full bg-blue-300text-white py-3 rounded-lg hover:bg-blue-400 disabled:opacity-50"
            >
              {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">ตั้งรหัสผ่านใหม่</h2>
            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full bg-blue-300 text-white py-3 rounded-lg hover:bg-blue-400 disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordStepPage;
