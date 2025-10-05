// import { useState, useEffect, useRef } from "react";
// import { Volume2, VolumeX, Music, Music2 } from "lucide-react"; // ✅ ใช้ Speaker + Music
// import { useLocation, useNavigate } from "react-router-dom";
// import owlImage from "../../../assets/maditaion.jpg";
// import BubbleBackground from "./BubbleBackground";
// import alertSoundFile from "../../../assets/new-notification.mp3"; // ✅ ใส่ไฟล์เสียงแจ้งเตือน

// function BreathingExercise() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const customTime = location.state?.customTime; // HH:MM:SS
//   const selectedTime = location.state?.time;     // นาที (เก่า)
//   const videoUrl = location.state?.videoUrl || "";
//   const alertAudio = useRef<HTMLAudioElement | null>(null);


//   // ✅ ฟังก์ชันแปลง HH:MM:SS -> วินาที
//   const parseTimeToSeconds = (timeStr: string) => {
//     const [h, m, s] = timeStr.split(":").map((v) => parseInt(v || "0", 10));
//     return h * 3600 + m * 60 + s;
//   };

//   // ✅ ใช้ customTime ถ้ามี ถ้าไม่มีใช้ selectedTime
//   const totalSeconds = customTime
//     ? parseTimeToSeconds(customTime)
//     : (selectedTime || 0) * 60;

//   const [seconds, setSeconds] = useState(totalSeconds);
//   const [phase, setPhase] = useState<"in" | "out">("in");
//   const [progress, setProgress] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isVoiceOn, setIsVoiceOn] = useState(false); // ✅ voice guide
//   const [showPopup, setShowPopup] = useState(false);

//   const iframeRef = useRef<HTMLIFrameElement | null>(null);

//   const radius = 100;
//   const circumference = 2 * Math.PI * radius;

//   const extractYouTubeId = (url: string) => {
//     const regExp =
//       /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//     const match = url.match(regExp);
//     return match ? match[1] : "";
//   };
//   const videoId = extractYouTubeId(videoUrl);

//   const postMessageToPlayer = (command: string) => {
//     if (iframeRef.current && iframeRef.current.contentWindow) {
//       iframeRef.current.contentWindow.postMessage(
//         JSON.stringify({ event: "command", func: command, args: [] }),
//         "*"
//       );
//     }
//   };

//   const toggleAudio = () => {
//     if (!iframeRef.current) return;
//     if (isPlaying) {
//       postMessageToPlayer("pauseVideo");
//       setIsPlaying(false);
//     } else {
//       postMessageToPlayer("playVideo");
//       postMessageToPlayer("unMute");
//       setIsPlaying(true);
//     }
//   };

//   const speak = (text: string, rate: number = 0.8, pitch: number = 1.2) => {
//   if ("speechSynthesis" in window) {
//     const voices = window.speechSynthesis.getVoices();

//     // เลือกเสียงผู้หญิงภาษาไทย ถ้าไม่มี fallback เป็นเสียงตัวแรก
//     const femaleVoice = voices.find(
//       (v) => v.lang === "th-TH" && v.name.toLowerCase().includes("female")
//     ) || voices.find((v) => v.lang === "th-TH") || voices[0];

//     const utter = new SpeechSynthesisUtterance(text);
//     utter.lang = "th-TH";
//     utter.voice = femaleVoice;
//     utter.rate = rate;   // ช้าลง = 0.8
//     utter.pitch = pitch; // เพิ่มความนุ่ม = 1.2
//     window.speechSynthesis.speak(utter);
//   }
// };


//   useEffect(() => {
//     if (!isVoiceOn) return;
//     speak(phase === "in" ? "หายใจเข้า" : "หายใจออก", 0.9);
//   }, [phase, isVoiceOn]);

//   useEffect(() => {
//     if (seconds === 0) {
//       postMessageToPlayer("pauseVideo");
//       setIsPlaying(false);
//       setIsVoiceOn(false);
//       setShowPopup(true);
//     }
//   }, [seconds]);

//   const inDuration = 3;   // หายใจเข้า 3 วินาที
//   const outDuration = 4;  // หายใจออก 4 วินาที

//   useEffect(() => {
//     let frame: number;
//     let startTime: number | null = null;
//     const currentDuration = phase === "in" ? inDuration : outDuration;

//     const animate = (timestamp: number) => {
//       if (!startTime) startTime = timestamp;
//       const elapsed = (timestamp - startTime) / 1000;
//       let pct = Math.min(elapsed / currentDuration, 1);
//       if (phase === "out") pct = 1 - pct;
//       setProgress(pct * circumference);

//       if (elapsed < currentDuration) {
//         frame = requestAnimationFrame(animate);
//       } else {
//         setPhase((prev) => (prev === "in" ? "out" : "in"));
//         startTime = null;
//         frame = requestAnimationFrame(animate);
//       }
//     };

//     frame = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(frame);
//   }, [phase]);

//   useEffect(() => {
//     if (seconds <= 0) return;
//     const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
//     return () => clearInterval(interval);
//   }, [seconds]);

//   const formatTime = (sec: number) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
//     return `${h.toString().padStart(2, "0")} : ${m
//       .toString()
//       .padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
//   };

//   const handlePopupClose = () => {
//     setShowPopup(false);
//     navigate("/audiohome/meditation");
//   };

//   // สร้าง audio object เมื่อ component mount
// useEffect(() => {
//   alertAudio.current = new Audio(alertSoundFile);
// }, []);

// // เพิ่มการเล่นเสียงใน useEffect ที่เช็ค seconds
// useEffect(() => {
//   if (seconds === 0) {
//     postMessageToPlayer("pauseVideo");
//     setIsPlaying(false);
//     setIsVoiceOn(false);

//     // ✅ เล่นเสียงแจ้งเตือน
//     alertAudio.current?.play().catch((err) => console.log(err));

//     setShowPopup(true);
//   }
// }, [seconds]);

//   return (
//     <div
//       className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-700 font-ibmthai
//         ${phase === "out"
//           ? "bg-gradient-to-b from-[#A1CAE2] to-white"
//           : "bg-gradient-to-b from-white to-[#b3e5fc]"
//         }`}
//     >
//       <BubbleBackground />
//       {videoId && (
//         <iframe
//           ref={iframeRef}
//           title="YouTube Audio Player"
//           width="0"
//           height="0"
//           src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=0&mute=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0`}
//           frameBorder="0"
//           allow="autoplay"
//           style={{ display: "none" }}
//         />
//       )}

//       <div className="text-center mb-10">
//         <h1
//           className={`text-3xl font-extrabold tracking-widest drop-shadow-lg
//             ${phase === "in" ? "text-[#a2d4ff]" : "text-white"}`}
//         >
//           {phase === "in" ? "หายใจเข้า" : "หายใจออก"}
//         </h1>
//         <p
//           className={`text-lg font-extrabold tracking-widest drop-shadow-lg
//             ${phase === "in" ? "text-[#a2d4ff]" : "text-white"} mt-1`}
//         >
//           {customTime ? `เวลา: ${customTime}` : `FOR ${selectedTime || 0} MIN`}
//         </p>
//       </div>

//       <div className="relative w-56 h-56 flex items-center justify-center">
//         <svg className="absolute w-full h-full rotate-[-90deg]">
//           <circle cx="112" cy="112" r={radius} stroke="#ffffff33" strokeWidth="8" fill="none" />
//           <circle
//             cx="112"
//             cy="112"
//             r={radius}
//             stroke="#ffffff"
//             strokeWidth="8"
//             fill="none"
//             strokeDasharray={circumference}
//             strokeDashoffset={circumference - progress}
//             strokeLinecap="round"
//           />
//         </svg>

//         <img
//           src={owlImage}
//           alt="owl"
//           className="z-10 rounded-full object-cover"
//           style={{
//             width: "200px",
//             height: "200px",
//             padding: "6px",
//             boxSizing: "border-box",
//           }}
//         />
//       </div>

//       {/* Container */}
// <div className="mt-10 w-full flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-32">
//   {/* Voice Guide */}
//   <button
//     type="button"
//     aria-label="Toggle voice guide"
//     title="Toggle voice guide"
//     onClick={() => setIsVoiceOn((prev) => !prev)}
//     className={`${isVoiceOn ? "bg-green-500" : "bg-gray-500"} 
//       hover:bg-[#1e40af] text-white rounded-full p-4 shadow-lg transition
//       order-2 sm:order-1`}
//   >
//     {isVoiceOn ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
//   </button>

//   {/* Timer */}
//   <div className="text-white text-3xl sm:text-2xl font-semibold drop-shadow text-center order-1 sm:order-2">
//     {formatTime(seconds)}
//   </div>

//   {/* Music */}
//   <button
//     type="button"
//     aria-label="Toggle background sound"
//     title="Toggle background sound"
//     onClick={toggleAudio}
//     className={`${isPlaying ? "bg-red-500" : "bg-[#2563eb]"}
//       hover:bg-[#1e40af] text-white rounded-full p-4 shadow-lg transition
//       order-3 sm:order-3`}
//   >
//     {isPlaying ? <Music2 className="w-7 h-7" /> : <Music className="w-7 h-7" />}
//   </button>
// </div>


//       {showPopup && (
//         <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//           <div className="bg-[#b3e5fc] rounded-2xl p-8 shadow-2xl text-center animate-fadeIn scale-95 max-w-sm w-full mx-4">
//             <h2 className="text-2xl font-bold text-[#0288d1] mb-4">🎉 ฝึกสมาธิครบแล้ว!</h2>
//             <p className="text-[#01579b] mb-6">คุณทำได้เยี่ยมมาก</p>
//             <button
//               onClick={handlePopupClose}
//               className="bg-[#03a9f4] hover:bg-[#039be5] text-white px-6 py-2 rounded-xl shadow-lg transition"
//             >
//               กลับไปหน้า Meditation
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default BreathingExercise;



import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music2, Pause } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import owlImage from "../../../assets/maditaion.jpg";
import BubbleBackground from "./BubbleBackground";
import alertSoundFile from "../../../assets/new-notification.mp3";

// ✅ เพิ่มไฟล์เสียงหายใจเข้า/ออก
import inhaleAudioFile from "../../../assets/หายใจเข้า.wav";
import exhaleAudioFile from "../../../assets/หายใจออก.wav";

function BreathingExercise() {
  const location = useLocation();
  const navigate = useNavigate();

  const customTime = location.state?.customTime;
  const selectedTime = location.state?.time;
  const videoUrl = location.state?.videoUrl || "";

  const alertAudio = useRef<HTMLAudioElement | null>(null);
  const inhaleAudio = useRef<HTMLAudioElement | null>(null);
  const exhaleAudio = useRef<HTMLAudioElement | null>(null);

  const parseTimeToSeconds = (timeStr: string) => {
    const [h, m, s] = timeStr.split(":").map((v) => parseInt(v || "0", 10));
    return h * 3600 + m * 60 + s;
  };

  const totalSeconds = customTime
    ? parseTimeToSeconds(customTime)
    : (selectedTime || 0) * 60;

  const [seconds, setSeconds] = useState(totalSeconds);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  const extractYouTubeId = (url: string) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  };
  const videoId = extractYouTubeId(videoUrl);

  const postMessageToPlayer = (command: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    }
  };

  const toggleAudio = () => {
    if (!iframeRef.current) return;
    if (isPlaying) {
      postMessageToPlayer("pauseVideo");
      setIsPlaying(false);
    } else {
      postMessageToPlayer("playVideo");
      postMessageToPlayer("unMute");
      setIsPlaying(true);
    }
  };

  const inDuration = 3;
  const outDuration = 4;

  // ✅ สร้าง Audio object สำหรับเสียงแจ้งเตือนและเสียงหายใจ
  useEffect(() => {
    alertAudio.current = new Audio(alertSoundFile);
    inhaleAudio.current = new Audio(inhaleAudioFile);
    exhaleAudio.current = new Audio(exhaleAudioFile);
  }, []);

  // ✅ เล่นเสียงหายใจตาม phase
  useEffect(() => {
    if (!isVoiceOn) return;

    // หยุดเสียงเดิมก่อน
    inhaleAudio.current?.pause();
    inhaleAudio.current!.currentTime = 0;
    exhaleAudio.current?.pause();
    exhaleAudio.current!.currentTime = 0;

    if (phase === "in") {
      inhaleAudio.current?.play().catch((err) => console.log("Audio error:", err));
    } else {
      exhaleAudio.current?.play().catch((err) => console.log("Audio error:", err));
    }
  }, [phase, isVoiceOn]);

  // ✅ เช็คเวลาหมด
  useEffect(() => {
    if (seconds === 0) {
      postMessageToPlayer("pauseVideo");
      setIsPlaying(false);
      setIsVoiceOn(false);

      // เล่นเสียงแจ้งเตือน
      alertAudio.current?.play().catch((err) => console.log(err));

      setShowPopup(true);
    }
  }, [seconds]);

  // Animation วงกลมหายใจ
  useEffect(() => {
    let frame: number;
    let startTime: number | null = null;
    const currentDuration = phase === "in" ? inDuration : outDuration;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      let pct = Math.min(elapsed / currentDuration, 1);
      if (phase === "out") pct = 1 - pct;
      setProgress(pct * circumference);

      if (elapsed < currentDuration) {
        frame = requestAnimationFrame(animate);
      } else {
        setPhase((prev) => (prev === "in" ? "out" : "in"));
        startTime = null;
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // นับถอยหลังวินาที
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")} : ${m
      .toString()
      .padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/audiohome/meditation");
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-700 font-ibmthai
        ${phase === "out"
          ? "bg-gradient-to-b from-[#A1CAE2] to-white"
          : "bg-gradient-to-b from-white to-[#b3e5fc]"
        }`}
    >
      <BubbleBackground />
      {videoId && (
        <iframe
          ref={iframeRef}
          title="YouTube Audio Player"
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=0&mute=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0`}
          frameBorder="0"
          allow="autoplay"
          style={{ display: "none" }}
        />
      )}

      <div className="text-center mb-10">
        <h1
          className={`text-3xl font-extrabold tracking-widest drop-shadow-lg
            ${phase === "in" ? "text-[#a2d4ff]" : "text-white"}`}
        >
          {phase === "in" ? "หายใจเข้า" : "หายใจออก"}
        </h1>
        <p
          className={`text-lg font-extrabold tracking-widest drop-shadow-lg
            ${phase === "in" ? "text-[#a2d4ff]" : "text-white"} mt-1`}
        >
          {customTime ? `เวลา: ${customTime}` : `FOR ${selectedTime || 0} MIN`}
        </p>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="absolute w-full h-full rotate-[-90deg]">
          <circle cx="112" cy="112" r={radius} stroke="#ffffff33" strokeWidth="8" fill="none" />
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#ffffff"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>

        <img
          src={owlImage}
          alt="owl"
          className="z-10 rounded-full object-cover"
          style={{
            width: "200px",
            height: "200px",
            padding: "6px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div className="mt-10 w-full flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-32">
        <button
          type="button"
          aria-label="Toggle voice guide"
          title="Toggle voice guide"
          onClick={() => setIsVoiceOn((prev) => !prev)}
          className={`${isVoiceOn ? "bg-blue-300" : "bg-gray-500"} 
            hover:bg-[#1e40af] text-white rounded-full p-4 shadow-lg transition
            order-2 sm:order-1`}
        >
          {isVoiceOn ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
        </button>

        <div className="text-white text-3xl sm:text-2xl font-semibold drop-shadow text-center order-1 sm:order-2">
          {formatTime(seconds)}
        </div>

        <button
          type="button"
          aria-label="Toggle background sound"
          title="Toggle background sound"
          onClick={toggleAudio}
          className={`${isPlaying ? "bg-red-200" : "bg-[#2563eb]"}
            hover:bg-[#1e40af] text-white rounded-full p-4 shadow-lg transition
            order-3 sm:order-3`}
        >
          {isPlaying ? <Music2 className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[#b3e5fc] rounded-2xl p-8 shadow-2xl text-center animate-fadeIn scale-95 max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-[#0288d1] mb-4">🎉 ฝึกสมาธิครบแล้ว!</h2>
            <p className="text-[#01579b] mb-6">คุณทำได้เยี่ยมมาก</p>
            <button
              onClick={handlePopupClose}
              className="bg-[#03a9f4] hover:bg-[#039be5] text-white px-6 py-2 rounded-xl shadow-lg transition"
            >
              กลับไปหน้า Meditation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BreathingExercise;
