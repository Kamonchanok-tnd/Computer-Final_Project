// src/pages/mirror/components/MoodSelector.tsx
import { IEmotion } from "../../../interfaces/IEmotion";

const apiUrl = import.meta.env.VITE_API_URL as string;

type Props = {
  emotions: IEmotion[];
  selectedID: number | null;
  onSelect: (ID: number) => void;
};

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

// สร้าง src จากค่าที่เก็บใน DB:
// - "happy.png" -> {apiUrl}/images/emoji/happy.png
// - "images/emoji/happy.png" หรือ "/images/emoji/happy.png" -> {apiUrl}/images/emoji/happy.png
// - "http://..." หรือ "https://..." -> ใช้ตามนั้นเลย
const buildImageSrc = (picture: string): string => {
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emoji\//i.test(picture)) {
    return joinUrl(apiUrl, picture);
  }
  return joinUrl(apiUrl, `images/emoji/${picture}`);
};

export default function MoodSelector({ emotions, selectedID, onSelect }: Props) {
  const lifts = [
    "-translate-y-[40px] sm:-translate-y-[16px]",
    "translate-y-[0px]",
    "translate-y-[0px]",
    "-translate-y-[40px] sm:-translate-y-[16px]",
  ];

  const safeEmotions = Array.isArray(emotions) ? emotions : []; // ✅ ป้องกัน map error

  return (
    <div className="mx-auto w-full max-w-[420px] px-4 mt-7 sm:mt-8">
      <ul className="flex items-end justify-center gap-x-5 sm:gap-x-7 md:gap-x-9 lg:gap-x-10">
        {safeEmotions.map((emotion, idx) => {
          const isActive = selectedID === emotion.ID;
          const liftClass = lifts[idx] ?? "";
          const src = buildImageSrc(emotion.picture);

          return (
            <li key={`${emotion.ID}-${idx}`} className={`${liftClass} flex-none`}>
              <button
                type="button"
                onClick={() => onSelect(emotion.ID)}
                aria-pressed={isActive}
                title={emotion.mood}
                className={[
                  "transition-all duration-200 rounded-full p-1 outline-none",
                  "hover:scale-110 focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white",
                  isActive
                    ? "scale-110 ring-2 ring-sky-400 ring-offset-2 ring-offset-white bg-white drop-shadow-lg"
                    : "ring-1 ring-transparent drop-shadow-md",
                ].join(" ")}
              >
                <img
                  src={src}
                  alt={emotion.mood || "emotion"}
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain select-none"
                  draggable={false}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
