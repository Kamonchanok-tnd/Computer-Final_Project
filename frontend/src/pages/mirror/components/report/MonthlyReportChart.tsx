import { useEffect, useMemo, useState } from "react";
import type { IMonthlySummary } from "../../../../interfaces/IMonthlySummary";
import {
  ResponsiveContainer,
  Tooltip,
  PieChart, Pie, Cell, type PieLabelRenderProps,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import type { Formatter, Payload as TooltipPayload } from "recharts/types/component/DefaultTooltipContent";

type Props = { rows: IMonthlySummary[]; loading: boolean };
type ChartDatum = { name: string; value: number };
type ChartDatumEx = ChartDatum & { pct: number; labelTop: string };

/* ===== สีตรึงตามอารมณ์ (4 แบบในระบบ) ===== */
type Mood4 = "มีความสุข" | "เฉย ๆ" | "เศร้า" | "โกรธ";
// พาสเทลแต่เข้มขึ้น (อ่านชัดขึ้น)
const MOOD_COLOR: Readonly<Record<Mood4, string>> = {
  "มีความสุข": "#4ADE80", // เขียวพาสเทลเข้ม (green-400)
  "เฉย ๆ":     "#94A3B8", // เทาพาสเทลเข้ม (slate-400)
  "เศร้า":     "#60A5FA", // ฟ้าพาสเทลเข้ม (blue-400)
  "โกรธ":      "#F87171", // แดงพาสเทลเข้ม (red-400)
};


/** normalize ชื่อแล้วคืนสี; ถ้าไม่ตรง 4 แบบ ใช้ฟ้าอ่อน */
function getMoodColor(name: string): string {
  const key = name.replace(/\s+/g, " ").trim().replace("เฉยๆ", "เฉย ๆ");
  return (MOOD_COLOR as Record<string, string>)[key] ?? "#5BA6F6";
}

const SLICE_STROKE = "rgba(255,255,255,0.9)";

/** hook เช็คมือถือ */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
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
  const [mode, setMode] = useState<"pie" | "bar">("bar");

  // ===== เตรียมข้อมูลแบบเดียว ใช้ทั้งสองกราฟ =====
  const total: number = rows.reduce((sum, r) => sum + (r.count ?? 0), 0);

  const dataEx: ChartDatumEx[] = useMemo(() => {
    const base: ChartDatum[] = rows
      .filter((r) => (r.count ?? 0) > 0)
      .map((r) => ({ name: r.mood ?? "ไม่ระบุ", value: r.count ?? 0 }));

    const sum = base.reduce((s, d) => s + d.value, 0);
    if (sum === 0) return [];

    return base.map((d) => {
      const pct = Math.round((d.value / sum) * 100);
      return { ...d, pct, labelTop: `${d.value} (${pct}%)` };
    });
  }, [rows]);

  // ใช้ก้อนที่ sort แล้วสำหรับ Bar ทั้ง data และ map สี
  const dataSorted: ChartDatumEx[] = useMemo(
    () => [...dataEx].sort((a, b) => b.value - a.value),
    [dataEx]
  );

  const tooltipFormatter: Formatter<number, string> = (
    value: number,
    _name: string,
    item: TooltipPayload<number, string>
  ) => {
    const payload = item?.payload as ChartDatumEx | undefined;
    return [`${value} ครั้ง (${payload?.pct ?? 0}%)`, payload?.name ?? ""];
  };

  const renderPieLabel = ({ name, percent }: PieLabelRenderProps): string => {
    const p: number = typeof percent === "number" ? Math.round(percent * 100) : 0;
    return `${name ?? ""} (${p}%)`;
  };

  // ===== states เตรียมเสร็จแล้วค่อยตัดสินใจ render =====
  if (loading) {
    return (
      <div className="h-60 grid place-items-center rounded-2xl ring-1 ring-white/60 bg-white/60">
        กำลังโหลดข้อมูล…
      </div>
    );
  }
  if (dataEx.length === 0) {
    return (
      <div className="h-60 grid place-items-center rounded-2xl ring-1 ring-white/60 bg-white/60 text-slate-500 italic">
        — ไม่มีข้อมูลเดือนนี้ —
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl ring-1 ring-white/60 bg-white/50 backdrop-blur-md p-3 sm:p-4">
      {/* พื้นที่กราฟ */}
      <div className={isMobile ? "h-[300px]" : "h-[380px]"}>
        <ResponsiveContainer width="100%" height="100%">
          {mode === "pie" ? (
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
                data={dataEx}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? "44%" : "50%"}
                outerRadius={isMobile ? "72%" : "82%"}
                label={!isMobile ? renderPieLabel : false}
                labelLine={!isMobile}
                isAnimationActive={false}
              >
                {dataEx.map((d, i) => (
                  <Cell
                    key={`p-${i}`}
                    fill={getMoodColor(d.name)}
                    stroke={SLICE_STROKE}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={tooltipFormatter}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  padding: "8px 10px",
                }}
                wrapperStyle={{ outline: "none" }}
              />
            </PieChart>
          ) : (
            <BarChart
              data={dataSorted}
              margin={{ top: 28, right: 12, left: 12, bottom: 6 }} // headroom ให้ label
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, "dataMax + 1"]} allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  padding: "8px 10px",
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey="value" isAnimationActive={false}>
                {dataSorted.map((d, i) => (
                  <Cell key={`b-${i}`} fill={getMoodColor(d.name)} />
                ))}
                <LabelList dataKey="labelTop" position="top" offset={8} style={{ fontSize: 12 }} />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* สวิตช์ชนิดกราฟ — ด้านล่าง */}
      <div className="mt-3 flex justify-center">
        <div className="inline-flex rounded-xl ring-1 ring-slate-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("pie")}
            className={`px-3 py-1.5 text-sm ${mode === "pie" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            โดนัท
          </button>
          <button
            type="button"
            onClick={() => setMode("bar")}
            className={`px-3 py-1.5 text-sm ${mode === "bar" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            แท่ง
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-slate-700 mt-2">รวมทั้งหมด {total} ครั้ง</div>
    </div>
  );
}
