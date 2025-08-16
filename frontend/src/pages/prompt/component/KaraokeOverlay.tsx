import { useEffect, useMemo, useState } from "react";
import { CloseOutlined, PauseOutlined, CaretRightOutlined } from "@ant-design/icons";

export default function KaraokeOverlay({
  open,
  text,
  onClose,
}: {
  open: boolean;
  text: string;
  onClose: () => void;
}) {
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setPlaying(true);
  }, [open, text]);

  useEffect(() => {
    if (!open || !playing || words.length === 0) return;
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, words.length - 1)), 120);
    return () => clearInterval(t);
  }, [open, playing, words.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="ปิด"
        >
          <CloseOutlined />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
          >
            {playing ? <PauseOutlined /> : <CaretRightOutlined />}
            <span className="ml-2">{playing ? "หยุด" : "เล่น"}</span>
          </button>
        </div>

        <div className="text-lg md:text-2xl leading-8 md:leading-10 whitespace-pre-wrap">
          {words.map((w, i) => (
            <span key={i} className={i <= idx ? "text-blue-600" : "text-gray-800"}>
              {w + (i < words.length - 1 ? " " : "")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
