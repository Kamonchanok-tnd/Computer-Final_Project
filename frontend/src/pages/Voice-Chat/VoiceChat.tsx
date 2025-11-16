import React, { useEffect, useRef, useState } from "react";
import { useRecorder } from "../Voice-Chat/Record/useRecorder";
import { Mic, Square } from "lucide-react";
import AudioVisualizer from "../../components/Voice-visualizer/VolumeVisualizer"; // 👈 นำเข้า visualizer
import { useVolumeVisualizer } from "../../components/Voice-visualizer/useVolumeVisualizer";
import { useParams } from "react-router-dom";
import { useDarkMode } from "../../components/Darkmode/toggleDarkmode";

const VoiceChat: React.FC = () => {
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState("🔌 ไม่มี การเชื่อมต่อ");
  const [_logs, setLogs] = useState<string[]>([]);
  // const [isPlaying, setIsPlaying] = useState(false); 
  const [stream, setStream] = useState<MediaStream | null>(null);
  const params = useParams();
  const RoomID = params.id;
  const [aiStream, setAiStream] = useState<MediaStream | null>(null);
  const combinedStream = isRecording ? stream : aiStream;
  const volume = useVolumeVisualizer(combinedStream);
  const token = localStorage.getItem("token");
  const {isDarkMode} = useDarkMode();


  const addLog = (message: string) => {
    setLogs((prev) => [...prev.slice(-5), message]);
  };

  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost/voice/ws/chat-voice");

    ws.onopen = () => {
      setWsStatus("พร้อมใช้งาน");
      addLog("WebSocket connected");
      // console.log("We send chatRoomID : ", RoomID);
      ws.send(JSON.stringify({ chatRoomID: RoomID ,token: `Bearer ${token}`}));
    };

    ws.onmessage = (event) => {
      addLog("Audio received from AI");
      const audioBlob = new Blob([event.data], { type: "audio/wav" });
    
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
    
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
    
        const destination = audioContext.createMediaStreamDestination();
        source.connect(audioContext.destination);
        source.connect(destination);             
        setAiStream(destination.stream);         
    
        // setIsPlaying(true);
        source.start();
        source.onended = () => {
          // setIsPlaying(false);
          setAiStream(null);
        };
      };
      reader.readAsArrayBuffer(audioBlob);
    };
   
        

    ws.onerror = (err) => {
      setWsStatus("Error");
      addLog("WebSocket error");
      console.error(err);
    };

    ws.onclose = () => {
      setWsStatus("🔌 ไม่มี การเชื่อมต่อ");
      addLog("WebSocket disconnected");
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    connectWebSocket();
    // console.log("chatRoomID:", RoomID);
    return () => {
      wsRef.current?.close();
    };
  }, []);


  const handleStart = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog("WebSocket not ready");
      return;
    }
    addLog(" Start recording");
    startRecording(sendAudio);
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(micStream);
  };

  const handleStop = () => {
    stopRecording();
    addLog("Stop recording");
  };

  const sendAudio = (audioBlob: Blob) => {
    audioBlob.arrayBuffer().then((buffer) => {
      wsRef.current?.send(buffer);
      addLog("Sent audio to server");
    });
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-64px)]  p-4 text-center 
    ${isDarkMode ? "bg-background-dark" : " bg-background-blue "} transition-colors duration-300
   `}>
      {/* box main */}
      <div className={`border w-[100%] h-[90vh] flex justify-between  items-center flex-col p-2 transition-colors duration-300
       ${isDarkMode ? "bg-background-dark border-stoke-dark" : " bg-white/70 border-gray-200  "} drop-shadow-2xl rounded-2xl gap-8 `}>
        <div className="">
          <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-black-word'}`}>AI Voice Chat</h1>
            <p className={`mb-2  ${isDarkMode ? 'text-text-dark' : 'text-black-word'}`}>
               <strong>{wsStatus}</strong>
            </p>
        </div>
      

      {/* Visualizer */}
      <div className="flex justify-center  ">
         <AudioVisualizer isActive={true} volume={volume} />
      </div>
     
      <div className="m-4">
        <button
        className={`p-4 mb-4 text-white font-medium transition-all rounded-full ${
          isRecording ? "bg-gray-500 hover:bg-gray-600" : "bg-[#FF3B2F] hover:#FF3B2F]"
        }`}
        onClick={isRecording ? handleStop : handleStart}
      >
        {isRecording ? <Square size={30} className="fill-white" /> : <Mic size={30} />}
      </button>
      
      </div>
      
      {/* <p>{isRecording ? "Stop Recording" : "Start Recording"}</p> */}


      {/* <div className="w-full max-w-md text-left bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">📜 Logs</h2>
        <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
          {logs.map((log, i) => (
            <li key={i}>• {log}</li>
          ))}
        </ul>
      </div> */}
      </div>
     
    </div>
  );
};

export default VoiceChat;
