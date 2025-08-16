// import React, { useState, useEffect } from "react";
// import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
// import smile1 from "../../../assets/กอดตัวเองเสื้อสีเเดง.png";
// import smile2 from "../../../assets/รูปกอดตัวเอง.png";
// import smile3 from "../../../assets/รูปกอดตัวเองสีชมพู.png.png";
// import logo from "../../../assets/user.png"; // โลโก้สุขภาพจิตของคุณ

// export default function SignInPages() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [staySignedIn, setStaySignedIn] = useState(true);

//   const images = [smile1, smile2, smile3];
//   const [currentImage, setCurrentImage] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImage((prev) => (prev + 1) % images.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleLogin = () => {
//     console.log({ email, password, staySignedIn });
//   };

//   return (
//     <div className="min-h-screen flex bg-blue-100">
//       {/* ฝั่งซ้าย - carousel */}
//       <div className="flex-1 hidden md:flex items-center justify-center bg-blue-50 p-10">
//         <div className="text-center">
//           <img
//             src={images[currentImage]}
//             alt="ภาพประกอบ"
//             className="mx-auto mb-6 w-130 transition-all duration-500"
//           />

//           {/* indicators */}
//           <div className="flex justify-center gap-2 mb-4">
//             {images.map((_, index) => (
//               <span
//                 key={index}
//                 className={`block w-30 h-1 rounded-full transition-all duration-300 ${
//                   index === currentImage ? "bg-blue-200" : "bg-blue-100"
//                 }`}
//               ></span>
//             ))}
//           </div>

//           <h2 className="text-2xl font-bold mb-2 text-blue-300">
//             ยินดีต้อนรับสู่ SUT SUKJAI! 👋
//           </h2>
//           <p className="text-gray-500 max-w-md mx-auto">
//             เราให้บริการด้านสุขภาพจิตอย่างครบวงจร ทั้งการสนับสนุนด้านอารมณ์
//             การจัดการความเครียด และกิจกรรมส่งเสริมสุขภาพจิต
//             เพื่อช่วยให้คุณมีความสุขและสมดุลในชีวิตประจำวัน
//           </p>
//         </div>
//       </div>

//       {/* ฝั่งขวา - ฟอร์มล็อกอิน */}
//       <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
//         {/* โลโก้และชื่ออยู่นอกการ์ด */}
//         <div className="absolute top-10 right-10 flex items-center gap-3">
//           <img src={logo} alt="SUT SUKJAI" className="w-12 h-12" />
//           <span className="text-2xl font-bold text-blue-300">SUT SUKJAI</span>
//         </div>

//         {/* การ์ดเข้าสู่ระบบ */}
//         <div className="bg-gradient-to-t from-blue-200 to-white p-12 rounded-2xl shadow-2xl w-full max-w-lg mt-16 h-[600px]">
//           {/* ข้อความต้อนรับ */}
//           <p className="text-center text-gray-700 mb-2 text-lg">
//             <span className="text-4xl font-bold mb-4 text-center text-blue-300">
//               SUT SUKJAI
//             </span>
//           </p>

//           <p className="text-center text-gray-500 mb-6">
//             ล็อกอินเพื่อเข้าถึงพื้นที่ของคุณ <br /> และกิจกรรมที่ช่วยให้คุณผ่อนคลาย
//           </p>

//           {/* SVG หน้าอารมณ์ */}
//           <div className="flex justify-center gap-6 mb-8">
//             {/* ยิ้ม สีฟ้า */}
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="48"
//               height="48"
//               viewBox="0 0 24 24"
//               fill="none"
//               className="animate-bounce"
//               style={{ animationDuration: "2s" }}
//             >
//               <circle cx="12" cy="12" r="10" fill="#BBDEFB" />
//               <path
//                 d="M8 15 C10 17, 14 17, 16 15"
//                 stroke="#1976D2"
//                 strokeWidth="2"
//                 fill="none"
//               />
//               <circle cx="9" cy="10" r="1" fill="#1976D2" />
//               <circle cx="15" cy="10" r="1" fill="#1976D2" />
//             </svg>

//             {/* เศร้า สีชมพู */}
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="48"
//               height="48"
//               viewBox="0 0 24 24"
//               fill="none"
//               className="animate-bounce"
//               style={{ animationDuration: "2.5s" }}
//             >
//               <circle cx="12" cy="12" r="10" fill="#F8BBD0" />
//               <path
//                 d="M8 17 C10 15, 14 15, 16 17"
//                 stroke="#C2185B"
//                 strokeWidth="2"
//                 fill="none"
//               />
//               <circle cx="9" cy="10" r="1" fill="#C2185B" />
//               <circle cx="15" cy="10" r="1" fill="#C2185B" />
//             </svg>

//             {/* โกรธ สีส้ม */}
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="48"
//               height="48"
//               viewBox="0 0 24 24"
//               fill="none"
//               className="animate-bounce"
//               style={{ animationDuration: "1.5s" }}
//             >
//               <circle cx="12" cy="12" r="10" fill="#FFCC80" />
//               <path
//                 d="M8 17 C10 15, 14 15, 16 17"
//                 stroke="#F57C00"
//                 strokeWidth="2"
//                 fill="none"
//               />
//               <circle cx="9" cy="10" r="1" fill="#F57C00" />
//               <circle cx="15" cy="10" r="1" fill="#F57C00" />
//             </svg>
//           </div>

//           {/* ฟอร์มล็อกอิน */}
//           <div className="flex flex-col gap-5 ">
//             <div className="relative bg-white rounded-md shadow-sm">
//               <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 " />
//               <input
//                 type="email"
//                 placeholder="อีเมล"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="border border-gray-300 rounded-md p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>

//             <div className="relative bg-white rounded-md shadow-sm">
//               <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="รหัสผ่าน"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="border border-gray-300 rounded-md p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FiEyeOff /> : <FiEye />}
//               </button>
//             </div>

//             <div className="flex justify-between items-center text-sm text-gray-500">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={staySignedIn}
//                   onChange={() => setStaySignedIn(!staySignedIn)}
//                 />
//                 จำฉันไว้ในระบบ
//               </label>
//               <button className="text-blue-900 hover:underline">
//                 ลืมรหัสผ่าน?
//               </button>
//             </div>

//             <button
//               onClick={handleLogin}
//               className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
//               disabled={!email || !password}
//             >
//               เข้าสู่ระบบ
//             </button>
//           </div>

//           <p className="text-center text-gray-500 mt-6">
//             ยังไม่มีบัญชี?{" "}
//             <button className="text-blue-900 hover:underline">
//               สมัครสมาชิก
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

import { SignIn } from "../../../services/https/login";
import { SignInInterface } from "../../../interfaces/SignIn";

import smile1 from "../../../assets/กอดตัวเองเสื้อสีเเดง.png";
import smile2 from "../../../assets/รูปกอดตัวเอง.png";
import smile3 from "../../../assets/รูปกอดตัวเองสีชมพู.png.png";
import logo from "../../../assets/user.png";

export default function SignInPages() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

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
    let res = await SignIn(values);

    if (res.status === 200) {
      messageApi.success("เข้าสู่ระบบ สำเร็จ!");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);

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
    <div className="min-h-screen flex bg-blue-100">
      {contextHolder}

      {/* ฝั่งซ้าย - carousel */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-blue-50 p-10">
        <div className="text-center">
          <img
            src={images[currentImage]}
            alt="ภาพประกอบ"
            className="mx-auto mb-6 w-130 transition-all duration-500"
          />

          {/* indicators */}
          <div className="flex justify-center gap-2 mb-4">
            {images.map((_, index) => (
              <span
                key={index}
                className={`block w-30 h-1 rounded-full transition-all duration-300 ${
                  index === currentImage ? "bg-blue-200" : "bg-blue-100"
                }`}
              ></span>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-2 text-blue-300">
            ยินดีต้อนรับสู่ SUT SUKJAI! 👋
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            เราให้บริการด้านสุขภาพจิตอย่างครบวงจร ทั้งการสนับสนุนด้านอารมณ์
            การจัดการความเครียด และกิจกรรมส่งเสริมสุขภาพจิต
            เพื่อช่วยให้คุณมีความสุขและสมดุลในชีวิตประจำวัน
          </p>
        </div>
      </div>

      {/* ฝั่งขวา - ฟอร์มล็อกอิน */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
        {/* โลโก้และชื่ออยู่นอกการ์ด */}
        <div className="absolute top-10 right-10 flex items-center gap-3">
          <img src={logo} alt="SUT SUKJAI" className="w-12 h-12" />
          <span className="text-2xl font-bold text-blue-300">SUT SUKJAI</span>
        </div>

        {/* การ์ดเข้าสู่ระบบ */}
        <div className="bg-gradient-to-t from-blue-200 to-white p-12 rounded-2xl shadow-2xl w-full max-w-lg mt-16 h-[600px]">
          <p className="text-center text-gray-700 mb-2 text-lg">
            <span className="text-4xl font-bold mb-4 text-center text-blue-300">
              SUT SUKJAI
            </span>
          </p>

          <p className="text-center text-gray-500 mb-6">
            ล็อกอินเพื่อเข้าถึงพื้นที่ของคุณ <br /> และกิจกรรมที่ช่วยให้คุณผ่อนคลาย
          </p>

          {/* ฟอร์มล็อกอิน */}
          <div className="flex flex-col gap-5 ">
            <div className="relative bg-white rounded-md shadow-sm">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 " />
              <input
                type="email"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="relative bg-white rounded-md shadow-sm">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={() => setStaySignedIn(!staySignedIn)}
                />
                จำฉันไว้ในระบบ
              </label>
              <button
                className="text-blue-900 hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={!email || !password}
            >
              เข้าสู่ระบบ
            </button>
          </div>

          <p className="text-center text-gray-500 mt-6">
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
