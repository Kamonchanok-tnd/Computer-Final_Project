import { useEffect, useState } from "react";
import type { IMonthlySummary } from "../../../../interfaces/IMonthlySummary";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import type {
  Formatter,
  Payload as TooltipPayload,
} from "recharts/types/component/DefaultTooltipContent";

type Props = { rows: IMonthlySummary[]; loading: boolean };
type ChartDatum = { name: string; value: number };

const COLORS = [
  "#A5BFF0", // ฟ้าอ่อนพาสเทล
  "#A8E6CF", // เขียวมิ้นต์พาสเทล
  "#FFD3B6", // ส้มอ่อนพาสเทล
  "#FFAAA5", // ชมพูพาสเทล
  "#DAB6FC", // ม่วงอ่อนพาสเทล
  "#FFF5BA", // เหลืองอ่อนพาสเทล
];

/** hook เช็คมือถือ (type-safe) */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    // รองรับทั้ง API ใหม่/เก่า
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);
  return isMobile;
}

export default function MonthlyReportChart({ rows, loading }: Props) {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="h-60 grid place-items-center rounded-2xl ring-1 ring-white/60 bg-white/60">
        กำลังโหลดข้อมูล…
      </div>
    );
  }

  const total: number = rows.reduce((sum, r) => sum + (r.count ?? 0), 0);
  const data: ChartDatum[] = rows
    .filter((r) => (r.count ?? 0) > 0)
    .map((r) => ({ name: r.mood ?? "ไม่ระบุ", value: r.count ?? 0 }));

  if (data.length === 0) {
    return (
      <div className="h-60 grid place-items-center rounded-2xl ring-1 ring-white/60 bg-white/60 text-slate-500 italic">
        — ไม่มีข้อมูลเดือนนี้ —
      </div>
    );
  }

  // ใช้บนเดสก์ท็อปเท่านั้น
  const renderLabel = ({ name, percent }: PieLabelRenderProps): string =>
    `${name ?? ""} (${Math.round(((percent ?? 0) as number) * 100)}%)`;

  // ✅ แก้ชนิดให้ตรงกับ Recharts: value เป็น number, name เป็น string
  const tooltipFormatter: Formatter<number, string> = (
    value: number,
    _name: string,
    item: TooltipPayload<number, string>
  ) => {
    const datum = item?.payload as ChartDatum | undefined;
    return [`${value} ครั้ง`, datum?.name ?? ""];
  };

  return (
    <div className="mt-4 rounded-2xl ring-1 ring-white/60 bg-white/50 backdrop-blur-md p-3 sm:p-4">
      <div className={isMobile ? "h-[280px]" : "h-[360px]"}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={{
              top: isMobile ? 8 : 12,
              right: isMobile ? 8 : 16,
              bottom: 0,
              left: isMobile ? 8 : 16,
            }}
          >
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? "68%" : "80%"}
              label={!isMobile ? renderLabel : false}
              labelLine={!isMobile}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={String(i)} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* มือถือ: legend ใต้กราฟเพื่อไม่ให้ label ตกขอบ */}
      {isMobile && (
        <ul className="mt-3 grid grid-cols-1 gap-y-1 text-sm">
          {data.map((d, i) => {
            const pct: number = total ? Math.round((d.value / total) * 100) : 0;
            return (
              <li key={d.name} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="tabular-nums">{pct}%</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="text-center text-sm text-slate-600 mt-2">
        รวมทั้งหมด {total} ครั้ง
      </div>
    </div>
  );
}
