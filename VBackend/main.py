from gtts import gTTS
from pythaiasr import asr
import io
from fastapi.responses import StreamingResponse
import requests
import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
import uuid
from fastapi import WebSocket, WebSocketDisconnect
url = "http://localhost/api/gemini"


def get_answer_from_go(text: str,chatRoomID: int, token: str):#เอาไว้รับข้อความจาก go
    headers = {
     'Content-Type': 'application/json',
     'Authorization': token
    }
    payload = json.dumps({
        "message": text,
        "chatroom_id": chatRoomID,#เอาจาก param
        "sendTypeID": 1
        })

    response = requests.request("POST", url, headers=headers, data=payload)
    word =str(response.json().get("message"))
    return word


# แปลงข้อความเป็นเสียง (TTS)

def text_to_speech_gtts(text: str) -> bytes:
    tts = gTTS(text=text, lang='th')
    mp3_fp = io.BytesIO()
    tts.write_to_fp(mp3_fp)
    mp3_fp.seek(0)
    return mp3_fp.read()


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"Hello": "World"}
# AudioSegment.converter = r"F:/ffmpeg-2025-07-21-git-8cdb47e47a-essentials_build/ffmpeg-2025-07-21-git-8cdb47e47a-essentials_build/bin/ffmpeg.exe"
# AudioSegment.ffprobe = r"F:/ffmpeg-2025-07-21-git-8cdb47e47a-essentials_build/ffmpeg-2025-07-21-git-8cdb47e47a-essentials_build/bin/ffprobe.exe"

@app.websocket("/ws/chat-voice")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        init_data = await websocket.receive_json()
        chat_room_id = init_data.get("chatRoomID", 1)
        jwt_token = init_data.get("token") 
        print("Chat Room ID:", chat_room_id)
        while True:
            data = await websocket.receive_bytes()
            if not data:
                continue

            webm_filename = f"temp_{uuid.uuid4()}.webm"
            wav_filename = webm_filename.replace(".webm", ".wav")

            with open(webm_filename, "wb") as f:
                f.write(data)

            try:
                sound = AudioSegment.from_file(webm_filename, format="webm")
                sound = sound.set_frame_rate(16000).set_channels(1)
                sound.export(wav_filename, format="wav")
            except Exception as e:
                print("แปลงไฟล์เสียงล้มเหลว:", e)
                await websocket.send_text("แปลงไฟล์เสียงล้มเหลว")
                continue

           
            text = asr(wav_filename)
            print("ได้ข้อความ:", text)

            reply = get_answer_from_go(text,int(chat_room_id),jwt_token)

            audio = text_to_speech_gtts(reply)
            await websocket.send_bytes(audio)

           
            os.remove(webm_filename)
            os.remove(wav_filename)

    except WebSocketDisconnect:
        print("Client disconnected")