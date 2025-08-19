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
import SideOrnaments from "./components/SideOrnaments";

// YYYY-MM-DD -> 00:00:00Z (UTC)
function toStartOfDayUTCISO(dateYMD: string) {
  const [y, m, d] = dateYMD.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)).toISOString();
}

export default function MirrorPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
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
    return () => {
      cancelled = true;
    };
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
    return () => {
      cancelled = true;
    };
  }, [date]);

  const buildTitle = (text: string) => {
    const firstLine = (text ?? "").split(/\r?\n/)[0]?.trim() ?? "";
    return firstLine.length ? firstLine.slice(0, 60) : "บันทึกประจำวัน";
  };

  // สร้าง/อัปเดต (autosave)
  const doSave = async (next?: { message?: string; eid?: number | null }) => {
    const msg =
      (typeof next?.message === "string" ? next!.message : message) ?? "";
    const emotion = typeof next?.eid === "number" ? next!.eid : eid ?? null;

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

  // autosave 500ms
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
  <div className="relative h-dvh bg-gradient-to-b from-sky-200 to-white">
    {/* ของตกแต่ง (fixed เต็มจอ) */}
    <SideOrnaments />

    {/* คอนเทนต์ทั้งหมด: ยก z-index ให้สูงกว่า ornaments */}
    <div className="relative z-[2] h-dvh overflow-y-auto [scrollbar-gutter:stable_both-edges] flex flex-col">
      {/* Header มือถือ */}
      <div className="md:hidden">
        <Header />
      </div>

      {/* Header เดสก์ท็อป */}
      <div className="hidden md:block">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 pt-3 pb-3">
            <Header />
          </div>
        </div>
      </div>

      {/* DatePicker */}
      <div className="mx-auto w-full px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8">
          <div className="pt-0 pb-1">
            <DatePicker value={date} onChange={setDate} loading={loading} saving={saving} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 h-full">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 h-full">
            <main className="min-h-[100svh] grid grid-rows-[auto_1fr_auto] gap-3 md:gap-3 pt-2 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-8 md:pb-8 overflow-y-auto">
              {/* กระจก */}
              <div className="min-h-0 grid place-items-center">
                <div
                  className={[
                    "[&>section>div]:w-[min(88vw,calc((100dvh-210px)*0.6))]",
                    "sm:[&>section>div]:w-[min(80vw,calc((100dvh-220px)*0.6))]",
                    "md:[&>section>div]:w-[min(72vw,calc((100dvh-260px)*0.6))]",
                    "lg:[&>section>div]:w-[min(64vw,calc((100dvh-290px)*0.6))]",
                    "xl:[&>section>div]:w-[min(56vw,calc((100dvh-310px)*0.6))]",
                  ].join(" ")}
                >
                  <MirrorFrame value={message} onChange={handleMessageChange} />
                </div>
              </div>

              {/* อิโมจิ */}
              <div className="mx-auto md:-mt-8 lg:-mt-8 xl:-mt-10">
                <MoodSelector emotions={emotions} selectedID={eid} onSelect={handleEmotionSelect} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
