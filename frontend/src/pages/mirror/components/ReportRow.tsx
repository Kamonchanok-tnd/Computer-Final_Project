import EmojiScatter from "./StickerBoard";
import type { IMonthlySummary } from "../../../interfaces/IMonthlySummary";

/* path builder สำหรับ emoji */
const apiUrl = import.meta.env.VITE_API_URL as string;
const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
function buildImageSrc(picture: string): string {
  if (!picture) return "";
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emoji\//i.test(picture)) return joinUrl(apiUrl, picture);
  return joinUrl(apiUrl, `images/emoji/${picture}`);
}

type Props = {
  row: IMonthlySummary;
  index: number;
};

export default function ReportRow({ row, index }: Props) {
  const count = row.count ?? 0;
  const src = buildImageSrc(row.picture);
  const seed = Number(row.eid ?? index);

  return (
    <div className="py-4 first:pt-1 last:pb-1">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-ibmthai font-semibold text-slate-800">
          {row.mood || "อารมณ์"}
        </h3>
        <span className="px-2.5 py-1 rounded-full text-xs sm:text-sm bg-sky-50 text-sky-700 ring-1 ring-sky-200 whitespace-nowrap">
          {count} ครั้ง
        </span>
      </div>

      {count === 0 ? (
        <div className="mt-3 grid place-items-center text-slate-400 text-sm italic">
          — ไม่มีข้อมูลเดือนนี้ —
        </div>
      ) : (
        <div className="mt-3">
          {/* พื้นที่ “sticker board” กระจายเป็นก้อนวงกลม */}
          <EmojiScatter src={src} count={count} seed={seed} />
        </div>
      )}
    </div>
  );
}
