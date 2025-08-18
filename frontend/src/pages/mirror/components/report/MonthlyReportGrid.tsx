import type { IMonthlySummary } from "../../../../interfaces/IMonthlySummary";
import EmojiScatter from "./EmojiScatter"; // ⬅️ เพิ่มบรรทัดนี้ (ปรับ path ให้ตรงของจริง)

type Props = { rows: IMonthlySummary[]; loading: boolean };

export default function MonthlyReportGrid({ rows, loading }: Props) {
  if (loading) {
    return (
      <section className="mt-4 rounded-2xl ring-1 ring-white/60 bg-white/60 p-4 grid place-items-center h-[46vh]">
        กำลังโหลดข้อมูล…
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl ring-1 ring-white/60 bg-white/50 backdrop-blur-md p-3 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {rows.map((r, i) => (
          <MoodCard key={`card-${r.eid ?? r.mood ?? i}`} row={r} />
        ))}
      </div>
    </section>
  );
}

/* ====== การ์ดอารมณ์ ====== */
function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}
const apiUrl = import.meta.env.VITE_API_URL as string;
function buildImageSrc(picture: string): string {
  if (!picture) return "";
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emoji\//i.test(picture)) return joinUrl(apiUrl, picture);
  return joinUrl(apiUrl, `images/emoji/${picture}`);
}

function MoodCard({ row }: { row: IMonthlySummary }) {
  const count = row.count ?? 0;
  const src = buildImageSrc(row.picture);

  return (
    <div className="rounded-xl ring-1 ring-slate-200/70 bg-white/60 p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-ibmthai font-semibold text-slate-800">
          {row.mood || "อารมณ์"}
        </h3>
        <span className="px-2.5 py-1 rounded-full text-xs sm:text-sm bg-sky-50 text-sky-700 ring-1 ring-sky-200">
          {count} ครั้ง
        </span>
      </div>

      <div className="my-2 border-t border-slate-200/60" />

      {count === 0 ? (
        <div className="h-[clamp(96px,18vh,140px)] grid place-items-center text-slate-400 text-sm italic">
          — ไม่มีข้อมูลเดือนนี้ —
        </div>
      ) : (
        // ⬇️ ใช้ EmojiScatter จัดวางจาก "กึ่งกลาง → ขยายออก" และคุมแถวสูงสุด 6
        <EmojiScatter
          count={count}
          src={src}
          maxPerRow={6}
          className="h-[clamp(120px,22vh,180px)] md:h-[clamp(120px,20vh,180px)]"
        />
      )}
    </div>
  );
}
