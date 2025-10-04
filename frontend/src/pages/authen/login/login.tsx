
import { useState, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

import { GetUsersById, SignIn } from "../../../services/https/login";
import { SignInInterface } from "../../../interfaces/SignIn";

import smile1 from "../../../assets/transparent-Photoroom-Photoroom.png";
import smile2 from "../../../assets/4-Photoroom.png";
import smile3 from "../../../assets/5-Photoroom.png";
import logo from "../../../assets/logo/header1.png";

import "./login.css"; // ใส่ไฟล์ CSS แยก
import { useUser } from "../../../layout/HeaderLayout/UserContext";
import { useDarkMode } from "../../../components/Darkmode/toggleDarkmode";
const PROFILE_BASE_URL = import.meta.env.VITE_PF_URL;
export default function SignInPages() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { setAvatarUrl, setUsername } = useUser();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const images = [smile1, smile2, smile3];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    const values: SignInInterface = { email, password };
    const res = await SignIn(values);

    if (res.status === 200) {
      messageApi.success("เข้าสู่ระบบสำเร็จ");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);
      localStorage.setItem("theme", "light");
      if (isDarkMode) {
        toggleDarkMode(); // สลับกลับเป็น light ถ้าอยู่ dark
      }
      if (res.data.id) {
        GetUsersById(res.data.id).then(res => {
          if (res.status === 200) {
            // avatar
            if (res.data.ProfileAvatar) {
              const url = `${PROFILE_BASE_URL}${res.data.ProfileAvatar.avatar}`;
              setAvatarUrl(url);
              localStorage.setItem("avatarUrl", url);
            }
            // username
            if (res.data.username) {
              setUsername(res.data.username);
              localStorage.setItem("username", res.data.username);
            }
          }
        });
      }
      

      let redirectPath = "/";
      switch (res.data.role) {
        case "superadmin":
          redirectPath = "/superadmin";
          break;
        case "admin":
          redirectPath = "/admin";
          break;
        case "user":
          redirectPath = "/user";
          break;
        default:
          redirectPath = "/";
      }

      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  return (
    <div className=" min-h-screen flex flex-col lg:flex-row bg-blue-100">
      {contextHolder}

      {/* ฝั่งซ้าย - carousel */}
      <div className="flex-1 hidden md:flex lg:flex items-center justify-center bg-blue-50 p-6 lg:p-10 order-2 lg:order-1">
        <div className="text-center h-auto lg:h-[600px] flex flex-col justify-center">
          <img
            src={images[currentImage]}
            alt="ภาพประกอบ"
            className="mx-auto w-[60%] md:w-[50%] lg:w-96 h-[400px] lg:h-[600px] object-cover transition-all duration-500 rounded-xl blur-border"

          />

          {/* indicators */}
          <div className="flex justify-center gap-2 mb-4">
            {images.map((_, index) => (
              <span
                key={index}
                className={`block w-15 h-1 rounded-full transition-all duration-300 ${
                  index === currentImage ? "bg-blue-300" : "bg-blue-100"
                }`}
              ></span>
            ))}
          </div>

          <h2 className="font-ibmthai text-xl md:text-2xl font-bold mb-2 text-blue-300">
            ยินดีต้อนรับสู่ SUT HEAL JAI! 👋
          </h2>
          <p className="font-ibmthai text-gray-500 max-w-md mx-auto text-sm md:text-base">
            เราดูแลสุขภาพจิตของคุณผ่านแชทบอทเพื่อนคู่ใจ การปรึกษาผู้เชี่ยวชาญ และคอนเทนต์ผ่อนคลาย เพื่อให้คุณรู้สึกสบายใจในทุกวัน
          </p>
        </div>
      </div>

      {/* ฝั่งขวา - ฟอร์มล็อกอิน */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative order-1 lg:order-2">
        {/* โลโก้และชื่ออยู่นอกการ์ด */}
        <div className="absolute top-6 right-6 flex items-center gap-2 md:gap-3">
          <img src={logo} alt="SUT HEAL JAI" className="w-10 h-10 md:w-12 md:h-12" />
          <span className="font-ibmthai text-xl md:text-2xl font-bold text-blue-300">
            SUT HEAL JAI
          </span>
        </div>

        {/* การ์ดเข้าสู่ระบบ */}
        <div className="bg-gradient-to-t from-blue-200 to-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg mt-20 h-auto md:h-[600px]">
          <p className="text-center text-gray-700 mb-2 text-lg">
            <span className="font-ibmthai text-3xl md:text-4xl font-bold mb-4 text-center text-blue-300">
              SUT HEAL JAI
            </span>
          </p>

          <p className="font-ibmthai text-center text-gray-500 mb-6 text-sm md:text-base">
            ล็อกอินเพื่อเข้าถึงพื้นที่ของคุณ <br /> และกิจกรรมที่ช่วยให้คุณผ่อนคลาย
          </p>
          {/* SVG หน้าอารมณ์ */}
          <div className="flex justify-center gap-6 mb-8">
            {/* ยิ้ม สีฟ้า */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              <circle cx="12" cy="12" r="10" fill="#BBDEFB" />
              <path
                d="M8 15 C10 17, 14 17, 16 15"
                stroke="#1976D2"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="9" cy="10" r="1" fill="#1976D2" />
              <circle cx="15" cy="10" r="1" fill="#1976D2" />
            </svg>

            {/* เศร้า สีชมพู */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              style={{ animationDuration: "2.5s" }}
            >
              <circle cx="12" cy="12" r="10" fill="#F8BBD0" />
              <path
                d="M8 17 C10 15, 14 15, 16 17"
                stroke="#C2185B"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="9" cy="10" r="1" fill="#C2185B" />
              <circle cx="15" cy="10" r="1" fill="#C2185B" />
            </svg>

            {/* โกรธ สีส้ม */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              style={{ animationDuration: "1.5s" }}
            >
              <circle cx="12" cy="12" r="10" fill="#FFCC80" />
              <path
                d="M8 15 C10 17, 14 17, 16 15"
                stroke="#F57C00"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="9" cy="10" r="1" fill="#F57C00" />
              <circle cx="15" cy="10" r="1" fill="#F57C00" />
            </svg>
          </div>


          
<form
  onSubmit={(e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    handleLogin();
  }}
  className="flex flex-col gap-5"
>
  <div className="relative bg-white rounded-md shadow-sm">
    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-ibmthai " />
    <input
      type="email"
      placeholder="อีเมล"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="border border-gray-300 rounded-md p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      required
    />
  </div>

  <div className="relative bg-white rounded-md shadow-sm">
    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-ibmthai" />
    <input
      type={showPassword ? "text" : "password"}
      placeholder="รหัสผ่าน"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border border-gray-300 rounded-md p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      required
    />
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <FiEye /> : <FiEyeOff />}
    </button>
  </div>

  <div className="flex justify-end items-center text-xs md:text-sm text-gray-500 font-ibmthai">
  <button
    type="button"
    className="text-blue-900 hover:underline"
    onClick={() => navigate("/forgot-password")}
  >
    ลืมรหัสผ่าน?
  </button>
</div>


  <button
    type="submit"
    className="bg-blue-600 font-ibmthai text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
    disabled={!email || !password}
  >
    เข้าสู่ระบบ
  </button>
</form>

          <p className="text-center font-ibmthai text-gray-500 mt-6 text-sm md:text-base">
            ยังไม่มีบัญชี?{" "}
            <button
              className="text-blue-900 hover:underline"
              onClick={() => navigate("/signup")}
            >
              สมัครสมาชิก
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
