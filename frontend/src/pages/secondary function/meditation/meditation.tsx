import React, { useEffect, useState } from "react";
import "./meditation.css";
import { getMeditationSounds } from "../../../services/https/meditation";

const MeditationPage: React.FC = () => {
  const [sounds, setSounds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึง YouTube Video ID จากลิงก์
  const extractYouTubeID = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const data = await getMeditationSounds();
        setSounds(data.sounds);
      } catch (err) {
        setError("Unable to fetch meditation sounds");
      }
    };

    fetchSounds();
  }, []);

  return (
    <div className="meditation-page">
      <h1>นั่งสมาธิ</h1>
      <div className="meditation-session">
        {error && <p>{error}</p>}

        {sounds.length > 0 ? (
          sounds.map((sound) => (
            <div key={sound.ID} className="session-card">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeID(sound.Sound)}`}
                title={sound.Name}
                className="session-video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <div className="session-description">
                <div className="clip-title">{sound.Name}</div>
                {/* <div className="clip-duration">Duration: {sound.Lyric}</div> */}
              </div>
            </div>
          ))
        ) : (
          <p>No meditation sounds available</p>
        )}
      </div>
    </div>
  );
};

export default MeditationPage;
