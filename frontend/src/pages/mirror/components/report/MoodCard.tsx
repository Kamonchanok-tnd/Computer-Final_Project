import EmojiScatter from "./EmojiScatter";
import { buildImageSrc } from "./utils";

type Props = {
  title: string;
  count: number;
  picture: string;
  seed: string;
};

export default function MoodCard({ title, count, picture, seed }: Props) {
  const src = buildImageSrc(picture);
  // เดิม: h-48 sm:h-56 md:h-60 lg:h-64 → ลดลงเล็กน้อยให้พอดีหน้าจอ
  const CANVAS_H = "h-40 sm:h-48 md:h-52 lg:h-56";

  return (
    <div className="h-full p-3 sm:p-4 bg-white/60 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-800">{title}</h3>
        <span className="px-2.5 py-1 rounded-full text-xs sm:text-sm bg-sky-50 text-sky-700 ring-1 ring-sky-200">
          {count} ครั้ง
        </span>
      </div>

      <div className="mt-2 border-t border-slate-200/60" />

      {count === 0 ? (
        <div className={`relative ${CANVAS_H} grid place-items-center text-slate-400 text-sm italic`}>
          — ไม่มีข้อมูลเดือนนี้ —
        </div>
      ) : (
        <EmojiScatter count={count} src={src} seed={seed} className={CANVAS_H} />
      )}
    </div>
  );
}
