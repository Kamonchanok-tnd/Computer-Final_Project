import { Emotion } from "../../../interfaces/IEmotion";

type Props = {
  emotions: Emotion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function MoodSelector({ emotions, selectedId, onSelect }: Props) {
  // สำหรับ 4 ปุ่ม: [ซ้าย, ซ้ายกลาง, ขวากลาง, ขวา]
  const lifts = [
    "-translate-y-[30px] sm:-translate-y-[16px]", // ซ้ายสุด
    "translate-y-[0px]",                          // ซ้ายกลาง
    "translate-y-[0px]",                          // ขวากลาง
    "-translate-y-[30px] sm:-translate-y-[16px]", // ขวาสุด
  ];

  return (
    <div className="mx-auto w-full max-w-[420px] px-4 mt-7 sm:mt-8">
      <ul className="flex items-end justify-between gap-2">
        {emotions.map((emotion, idx) => {
          const isActive = selectedId === emotion.id;
          const liftClass = lifts[idx] ?? "";

          return (
            <li key={emotion.id} className={liftClass}>
              <button
                type="button"
                onClick={() => onSelect(emotion.id)}
                aria-pressed={isActive}
                className={[
                  "transition-transform duration-200",
                  "hover:scale-110",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-4xl sm:text-5xl leading-none",
                    isActive ? "scale-110 drop-shadow-[0_3px_4px_rgba(0,0,0,0.25)]" : "drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]",
                    "transition-transform duration-200",
                  ].join(" ")}
                >
                  {emotion.emoji}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
