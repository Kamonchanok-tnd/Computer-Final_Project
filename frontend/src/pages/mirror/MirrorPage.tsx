// src/pages/mirror/MirrorPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import DatePicker from "./components/DatePicker";
import MirrorFrame from "./components/MirrorFrame";
import MoodSelector from "./components/MoodSelector";
import { IEmotion } from "../../interfaces/IEmotion";
import { IMirror } from "../../interfaces/IMirror";
import {
  createMirror,
  getMirrorByDate,
  updateMirrorById,
} from "../../services/https/mirror";
import { getEmotions } from "../../services/https/emotion";

// แปลง YYYY-MM-DD -> 00:00:00Z (UTC)
function toStartOfDayUTCISO(dateYMD: string) {
  const [y, m, d] = dateYMD.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)).toISOString();
}

export default function MirrorPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState<string>("");
  const [eid, setEid] = useState<number | null>(null);
  const [mirrorId, setMirrorId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [emotions, setEmotions] = useState<IEmotion[]>([]);
  const saveTimer = useRef<number | null>(null);

  // โหลดรายการอารมณ์
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getEmotions();
        if (!cancelled) setEmotions(items ?? []);
      } catch {
        if (!cancelled) setEmotions([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // โหลด mirror ของวันที่เลือก
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMirrorByDate(date);
        if (!cancelled) {
          setMirrorId(typeof data.ID === "number" ? data.ID : null);
          setMessage(typeof data.message === "string" ? data.message : "");
          setEid(typeof data.eid === "number" ? data.eid : null);
        }
      } catch {
        if (!cancelled) {
          setMirrorId(null);
          setMessage("");
          setEid(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [date]);

  const buildTitle = (text: string) => {
    const firstLine = (text ?? "").split(/\r?\n/)[0]?.trim() ?? "";
    return firstLine.length ? firstLine.slice(0, 60) : "บันทึกประจำวัน";
  };

  // สร้าง/อัปเดต (ถูกเรียกโดย autosave)
  const doSave = async (next?: { message?: string; eid?: number | null }) => {
    const msg = (typeof next?.message === "string" ? next!.message : message) ?? "";
    const emotion = typeof next?.eid === "number" ? next!.eid : (eid ?? null);

    setSaving(true);
    try {
      if (mirrorId) {
        const body: IMirror = {
          ID: mirrorId,
          date: toStartOfDayUTCISO(date),
          title: buildTitle(msg),
          message: msg,
          eid: emotion,
        };
        await updateMirrorById(mirrorId, body);
      } else {
        const body: Omit<IMirror, "ID"> = {
          date: toStartOfDayUTCISO(date),
          title: buildTitle(msg),
          message: msg,
          eid: emotion,
        };
        await createMirror(body);
        const latest = await getMirrorByDate(date);
        setMirrorId(typeof latest.ID === "number" ? latest.ID : null);
      }
    } finally {
      setSaving(false);
    }
  };

  // autosave (500ms) เมื่อพิมพ์/เลือกอารมณ์
  const debouncedSave = useMemo(() => {
    return (next: { message?: string; eid?: number | null }) => {
      if (typeof next.message === "string") setMessage(next.message);
      if (typeof next.eid !== "undefined") setEid(next.eid ?? null);

      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        doSave(next);
      }, 500) as unknown as number;
    };
  }, [mirrorId, date, message, eid]);

  const handleMessageChange = (val: string) => debouncedSave({ message: val });
  const handleEmotionSelect = (id: number) => debouncedSave({ eid: id });
return (
  <div className="min-h-dvh bg-gradient-to-b from-sky-200 to-white">
    {/* Header สำหรับมือถือ (อยู่นอกกรอบเหมือนเดิม) */}
    <div className="md:hidden">
      <Header />
    </div>

    {/* กลางแนวตั้งบน md+ และไม่ให้สกรอลล์ */}
    <div
      className="
        mx-auto w-full px-4 sm:px-6 md:px-8 pb-16 md:pb-0
        md:min-h-dvh md:flex md:flex-col md:items-center md:justify-center
        md:overflow-hidden
      "
    >
      {/* wrapper เดิม แต่ “ลบกรอบ” ออกบน md+ */}
      <div
        className="
          w-full
          md:max-w-none md:ring-0 md:bg-transparent md:backdrop-blur-0
          md:shadow-none md:rounded-none
          lg:max-w-[960px] xl:max-w-[1100px]
        "
      >
        {/* Header สำหรับ md+ */}
        <div className="hidden md:block md:pt-3 md:px-0">
          <Header />
        </div>

        <main className="mx-auto w-full max-w-screen-md px-4 sm:px-6 md:px-8 py-6 md:py-0">
          <DatePicker value={date} onChange={setDate} loading={loading} saving={saving} />
          <MirrorFrame value={message} onChange={handleMessageChange} />
          <MoodSelector emotions={emotions} selectedID={eid} onSelect={handleEmotionSelect} />
        </main>
      </div>
    </div>
  </div>
);


}
