import React, { useEffect, useState } from "react";
import "./meditation.css";
import meditationImage1 from "../../../assets/prey.jpg"; // นำเข้ารูปภาพ


import { getMeditationSounds } from "../../../services/https/meditation";
const MeditationPage: React.FC = () => {
  const [sounds, setSounds] = useState<any[]>([]);  // สถานะเก็บข้อมูลเสียงที่ดึงจาก API
  const [error, setError] = useState<string | null>(null);  // สถานะเก็บข้อผิดพลาด

  // ฟังก์ชันเพื่อเปิดลิงก์ YouTube
  const openYouTubeLink = (url: string) => {
    window.open(url, "_blank"); // เปิดในแท็บใหม่
  };

  // ฟังก์ชันดึงข้อมูลเสียง
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const data = await getMeditationSounds();  // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลเสียงจาก API
        setSounds(data.sounds);  // เก็บข้อมูลเสียงใน state
      } catch (err) {
        setError("Unable to fetch meditation sounds");  // ถ้ามีข้อผิดพลาดในการดึงข้อมูล
      }
    };

    fetchSounds();  // เรียกใช้งานเมื่อ component ถูกโหลด
  }, []);

  return (
    <div className="meditation-page">
      <h1>นั่งสมาธิ</h1>
      <div className="meditation-session">
        {error && <p>{error}</p>}  {/* แสดงข้อความผิดพลาดถ้ามี */}
        
        {sounds.length > 0 ? (
          sounds.map((sound) => (
            <div key={sound.ID} className="session-card">
              <img
                src={meditationImage1}
                alt={`Meditation ${sound.Name}`}
                className="session-image"
              />
              <div className="session-description">
                <div className="clip-title">{sound.Name}</div>
                <div className="clip-duration">Duration: {sound.Lyric}</div> {/* Assuming Lyric holds duration */}
                <button
                  className="play-button"
                  onClick={() => openYouTubeLink(sound.Sound)}  
                >
                  ►
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No meditation sounds available</p>  // ถ้าไม่มีเสียง
        )}
      </div>
    </div>
  );
};

export default MeditationPage;
