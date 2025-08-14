// src/pages/mirror/MirrorPage.tsx
import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import DatePicker from "./components/DatePicker";
import MirrorFrame from "./components/MirrorFrame";
import MoodSelector from "./components/MoodSelector";
import { Emotion } from "../../interfaces/IEmotion";
import { IMirror } from "../../interfaces/IMirror";
import {
  createMirror,
  getMirrorByDate,
  updateMirrorById,
  // deleteMirrorById, // ถ้าต้องใช้ภายหลังค่อยเปิด
} from "../../services/https/mirror";

const EMOTIONS: Emotion[] = [
  { id: 1, mood: "happy", emoji: "😊" },
  { id: 2, mood: "sad", emoji: "😞" },
  { id: 3, mood: "angry", emoji: "😡" },
  { id: 4, mood: "shock", emoji: "😲" },
];

export default function MirrorPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [message, setMessage] = useState<string>("");
  const [eid, setEid] = useState<number | null>(null);
  const [mirrorId, setMirrorId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // โหลด mirror ของวันนั้น
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const data = await getMirrorByDate(date); // Promise<IMirror>
        if (!cancelled) {
          setMirrorId(typeof data.ID === "number" ? data.ID : null);
          setMessage(typeof data.message === "string" ? data.message : "");
          // eid อนุญาต null ได้
          setEid(typeof data.eid === "number" ? data.eid : null);
        }
      } catch {
        // กรณี 404 หรือ error อื่น ๆ → เคลียร์ state
        if (!cancelled) {
          setMirrorId(null);
          setMessage("");
          setEid(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [date]);

  // debounce save — ไม่มี ID ⇒ createMirror, มี ID ⇒ updateMirrorById
  const debouncedSave = useMemo(() => {
    let t: number | undefined;
    return (next: { message?: string; eid?: number | null }) => {
      // อัปเดต state ก่อน
      if (typeof next.message === "string") setMessage(next.message);
      if (typeof next.eid !== "undefined") setEid(next.eid ?? null);

      window.clearTimeout(t);
      t = window.setTimeout(async () => {
        setSaving(true);
        try {
          if (mirrorId) {
            // UPDATE ต้องส่ง IMirror ให้ครบเท่าที่ type กำหนด
            const body: IMirror = {
              ID: mirrorId,
              date,
              message: next.message ?? message,
              eid: typeof next.eid === "number" ? next.eid : eid ?? null,
            };
            await updateMirrorById(mirrorId, body);
          } else {
            // CREATE
            const body: IMirror = {
              date,
              message: next.message ?? message,
              eid: typeof next.eid === "number" ? next.eid : eid ?? null,
            };
            await createMirror(body);

            // ดึงใหม่เพื่อเก็บ ID ไว้ใช้สำหรับอัปเดตครั้งถัดไป
            const latest = await getMirrorByDate(date);
            setMirrorId(typeof latest.ID === "number" ? latest.ID : null);
          }
        } finally {
          setSaving(false);
        }
      }, 500);
    };
  }, [mirrorId, date, message, eid]);

  const handleMessageChange = (val: string) => {
    debouncedSave({ message: val });
  };

  const handleEmotionSelect = (id: number) => {
    debouncedSave({ eid: id });
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-100 to-white">
      <Header />
      <main className="mx-auto w-full max-w-screen-md px-4 sm:px-6 md:px-8 pb-24">
        <DatePicker value={date} onChange={setDate} loading={loading} saving={saving} />
        <MirrorFrame value={message} onChange={handleMessageChange} />
        <MoodSelector emotions={EMOTIONS} selectedId={eid} onSelect={handleEmotionSelect} />
      </main>
    </div>
  );
}
