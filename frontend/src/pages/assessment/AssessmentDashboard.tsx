import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  BarChart3,
  Activity,
  Award,
  FileText,
  MessageSquare,
} from "lucide-react";
import { getMyTransactions, getAvailableGroupsAndNext } from "../../services/https/assessment";
import type { ITransaction } from "../../interfaces/ITransaction";

/** ---------- Utils & constants ---------- */
const PASTEL_COLORS = [
  "#a5b4fc",
  "#f9a8d4",
  "#6ee7b7",
  "#fde68a",
  "#fca5a5",
  "#93c5fd",
  "#c4b5fd",
  "#fdba74",
];

type RangeKey = "7d" | "1m" | "3m" | "6m" | "1y" | "all";
type ViewMode = "single" | "combined";

const RANGE_OPTIONS: { key: RangeKey; label: string; days?: number }[] = [
  { key: "7d", label: "7 วันล่าสุด", days: 7 },
  { key: "1m", label: "1 เดือนล่าสุด", days: 30 },
  { key: "3m", label: "3 เดือนล่าสุด", days: 90 },
  { key: "6m", label: "6 เดือนล่าสุด", days: 180 },
  { key: "1y", label: "1 ปีล่าสุด", days: 365 },
  { key: "all", label: "ทั้งหมด" },
];

const PALETTE = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#e11d48",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#0284c7",
  "#16a34a",
];

const RED = "#ef4444";
const GREEN = "#22c55e";

const formatDateTH = (iso: string) => {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear() + 543;
  return `${dd}/${mm}/${yyyy}`;
};

type GroupOut = {
  id: number;
  name: string;
  description?: string;
  frequency_days: number | null;
  trigger_type?: string | null;
};

function addDaysISO(iso: string, days: number): Date {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDateTimeTH(d: Date): string {
  const ddmmyyyyth = formatDateTH(d.toISOString());
  return `${ddmmyyyyth}`;
}

/** ---------- Shapes ---------- */
type TxView = {
  key: string;
  dateISO: string;
  dateLabel: string;
  group: string;
  description: string;
  score: number;
  max?: number;
  result?: string; // ข้อความแปลผลจาก transaction
  testType?: "positive" | "negative";
};

/** ---------- Color utils (red<->green) ---------- */
// ไล่สีระหว่างสองสี a->b ตาม t ∈ [0,1]
function lerpColor(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ra = (pa >> 16) & 0xff, ga = (pa >> 8) & 0xff, ba = pa & 0xff;
  const rb = (pb >> 16) & 0xff, gb = (pb >> 8) & 0xff, bb = pb & 0xff;
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const b2 = Math.round(ba + (bb - ba) * t);
  return `#${(r << 16 | g << 8 | b2).toString(16).padStart(6, "0")}`;
}

// ให้สีตามคะแนน (ใช้กับ dot) — positive: มาก→เขียว, น้อย→แดง / negative: กลับกัน
function colorByScore(
  score: number,
  min: number,
  max: number,
  testType: "positive" | "negative"
) {
  if (max === min) return testType === "positive" ? GREEN : RED;
  const t = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const tt = testType === "positive" ? t : 1 - t;
  return lerpColor(RED, GREEN, tt);
}

/** ---------- normalize tx (รองรับหลายชื่อ field) ---------- */
const normalize = (t: any): TxView & { quId?: number } => {
  const id = t.ID ?? t.id ?? t.Id;
  const createdAt = t.CreatedAt ?? t.created_at ?? t.createdAt;
  const group = t.questionnaire_group ?? t.group ?? "";
  const desc = t.description ?? "";
  const score = Number(t.total_score ?? t.totalScore ?? 0);
  const max = t.max_score ?? t.maxScore;

  const result =
    t.result ??
    t.Result ??
    t.result_text ??
    t.resultText ??
    t.interpretation ??
    t.remark ??
    t.Remark ??
    undefined;

  const quIdRaw =
    t.QuID ??
    t.quid ??
    t.qu_id ??
    t.QUID ??
    t.Quid ??
    t.QuestionnaireID ??
    t.QuestionnaireId ??
    t.questionnaire_id ??
    t.qid;
  const quId = typeof quIdRaw === "string" ? Number(quIdRaw) : quIdRaw;

  // test type
  const testTypeRaw = (t.test_type ?? t.testType ?? t.type ?? "positive") as string;
  const testType: "positive" | "negative" =
    String(testTypeRaw).toLowerCase() === "negative" ? "negative" : "positive";

  return {
    key: String(id ?? `${desc}-${createdAt}`),
    dateISO: createdAt,
    dateLabel: createdAt ? formatDateTH(createdAt) : "",
    group,
    description: desc,
    score,
    max: typeof max === "number" ? max : undefined,
    quId: typeof quId === "number" && !Number.isNaN(quId) ? quId : undefined,
    result,
    testType,
  };
};

/** ---------- hooks ---------- */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const updateSize = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
        setHeight(ref.current.offsetHeight);
      }
    };
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(ref.current);
    updateSize();
    return () => ro.disconnect();
  }, []);

  return { ref, width, height };
}

/** ---------- legend ---------- */
const CustomLegend: React.FC<any> = ({
  payload,
  compact,
  maxItemWidth,
}: {
  payload: any;
  compact?: boolean;
  maxItemWidth?: number;
}) => (
  <div
    className="w-full"
    style={{ fontSize: compact ? 11 : 13, lineHeight: compact ? "14px" : "16px" }}
  >
    <div className={`flex ${compact ? "flex-col gap-1" : "flex-wrap gap-x-4 gap-y-1"}`}>
      {payload?.map((it: any) => (
        <div key={it.value} className="flex items-center gap-1 whitespace-nowrap">
          <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: it.color }} />
          <span
            className="text-slate-600 truncate"
            style={{ maxWidth: maxItemWidth ?? (compact ? 180 : undefined) }}
            title={it.value}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/** ---------- rotated x ticks ---------- */
type TickProps = {
  x: number;
  y: number;
  payload: any;
  data: any[];
  small?: boolean;
  colorOfGroup: (g: string) => string;
};
const RotXTick: React.FC<TickProps> = ({ x, y, payload, data, small, colorOfGroup }) => {
  const item = data?.find((d: any) => d._key === payload.value);
  const date = item?.dateLabel ?? "";
  const group = (item?.group ?? "") as string;
  const fs = small ? 9 : 11;
  const fill = colorOfGroup(group || "");
  return (
    <g transform={`translate(${x},${y})`}>
      <text transform="rotate(-45)" textAnchor="end" dy={4} fontSize={fs} fill={fill}>
        {date}
      </text>
    </g>
  );
};

/** ---------- combine nearby timestamps ---------- */
const NEAR_MINUTES = 15;
function aggregateCombined(rows: TxView[], windowMin: number) {
  const clusters = new Map<string, any>();
  const win = Math.max(1, windowMin);

  for (const t of rows) {
    const d = new Date(t.dateISO);
    const minutes = d.getHours() * 60 + d.getMinutes();
    const bin = Math.floor(minutes / win);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const key = `${dayKey}|${t.group}|${bin}`;
    const sortTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, bin * win).getTime();

    let cluster = clusters.get(key);
    if (!cluster) {
      cluster = { _key: key, dateLabel: t.dateLabel, group: t.group, __sort: sortTs };
      clusters.set(key, cluster);
    }
    if (!cluster.__last) cluster.__last = {};
    const last = cluster.__last[t.description] ?? -Infinity;
    const ts = d.getTime();
    if (ts >= last) {
      cluster[t.description] = t.score;
      cluster.__last[t.description] = ts;
    }
  }

  return Array.from(clusters.values())
    .sort((a, b) => a.__sort - b.__sort)
    .map((c) => {
      delete c.__sort;
      delete c.__last;
      return c;
    });
}

/** ---------- Custom Tooltips (wrap & mobile friendly) ---------- */
const boxStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "8px 10px",
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.35,
  color: "#334155",
  boxShadow: "0 4px 14px rgba(0,0,0,.08)",
  maxWidth: 260, // จะถูก override ด้วย prop
};

const CustomTooltipSingle: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const score = p?.value;
  const res = p?.payload?.result;
  const dateLabel = p?.payload?.dateLabel;
  const group = p?.payload?.group;

  return (
    <div style={{ ...boxStyle, maxWidth: p?.payload?.__mw ?? 220 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {dateLabel} ({group || "-"})
      </div>
      <div>
        คะแนน: <b>{score}</b>
      </div>
      {res ? <div style={{ marginTop: 2 }}>{res}</div> : null}
    </div>
  );
};

/** ===================== Component ===================== */
const AssessmentDashboard: React.FC = () => {
  const [raw, setRaw] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextRoundLabel, setNextRoundLabel] = useState<string>("-");

  const [view, setView] = useState<ViewMode>("single");
  const [rangeAll, setRangeAll] = useState<RangeKey>("1m");
  const [rangeOne, setRangeOne] = useState<RangeKey>("1m");
  const [selectedTest, setSelectedTest] = useState<string>("");

  const { ref: chartBoxRef, width: chartW } = useSize<HTMLDivElement>();
  const isNarrow = chartW < 520;
  const isVeryNarrow = chartW < 400;

  const { ref: pieBoxRef, width: pieW } = useSize<HTMLDivElement>();
  const pieHeight = useMemo(() => (!pieW ? 240 : Math.max(200, Math.min(320, Math.round(pieW * 0.55)))), [pieW]);
  const pieRadius = useMemo(() => (!pieW ? 85 : Math.max(70, Math.min(120, Math.round(pieW * 0.26)))), [pieW]);
  const pieCompactLegend = pieW < 520;

  /** โหลดธุรกรรม + คำนวณรอบถัดไป */
  useEffect(() => {
    (async () => {
      try {
        const data: ITransaction[] = await getMyTransactions();
        data.sort(
          (a, b) =>
            new Date(a.CreatedAt ?? (a as any).created_at ?? (a as any).createdAt).getTime() -
            new Date(b.CreatedAt ?? (b as any).created_at ?? (b as any).createdAt).getTime()
        );
        setRaw(data);
        if (data.length) setSelectedTest(data[data.length - 1].description);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const uid = Number(user?.id ?? localStorage.getItem("id"));
        if (!uid || Number.isNaN(uid)) {
          setNextRoundLabel("ยังไม่พบผู้ใช้ (uid)");
          return;
        }

        const groups: GroupOut[] = await getAvailableGroupsAndNext(uid, "");
        const txv = data.map(normalize);
        const now = new Date();

        const onLoginGroupNames = new Set(
          groups.filter((g) => (g.trigger_type || "") === "onLogin").map((g) => g.name)
        );
        const lastOnLoginTx = [...txv].reverse().find((t) => onLoginGroupNames.has(t.group || ""));

        const intervalGroups = groups.filter(
          (g) => (g.trigger_type || "") === "interval" && typeof g.frequency_days === "number"
        );

        let bestLabel = "-";
        let bestTime: Date | null = null;
        for (const g of intervalGroups) {
          const freq = Number(g.frequency_days || 0);
          if (!freq) continue;
          const lastTxInGroup = [...txv].reverse().find((t) => (t.group || "") === g.name);
          const base = lastTxInGroup?.dateISO
            ? new Date(lastTxInGroup.dateISO)
            : lastOnLoginTx?.dateISO
            ? new Date(lastOnLoginTx.dateISO)
            : null;
          if (!base) {
            if (!bestTime) bestLabel = "ต้องทำแบบประเมินกลุ่มเริ่มต้น (onLogin) ก่อน";
            continue;
          }
          const nextAt = addDaysISO(base.toISOString(), freq);
          if (now >= nextAt) {
            bestLabel = `ทำได้แล้ว`;
            bestTime = bestTime ?? now;
            break;
          }
          if (!bestTime || nextAt < bestTime) {
            bestTime = nextAt;
            bestLabel = `${formatDateTimeTH(nextAt)}`;
          }
        }
        setNextRoundLabel(bestLabel);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tx = useMemo(() => raw.map(normalize), [raw]);
  const uniqueTests = useMemo(() => Array.from(new Set(tx.map((t) => t.description))), [tx]);
  const uniqueGroups = useMemo(() => Array.from(new Set(tx.map((t) => t.group || "-"))), [tx]);

  const colorOfGroup = useMemo(() => {
    const map = new Map<string, string>();
    uniqueGroups.forEach((g, idx) => map.set(g, PALETTE[idx % PALETTE.length]));
    return (g: string) => map.get(g || "-") || "#64748b";
  }, [uniqueGroups]);

  const now = new Date();
  const filterByRange = (items: TxView[], key: RangeKey) => {
    if (key === "all") return items;
    const days = RANGE_OPTIONS.find((o) => o.key === key)?.days ?? 30;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return items.filter((t) => new Date(t.dateISO) >= from);
  };

  const totalAttempts = tx.length;
  const latest = tx[tx.length - 1];

  const dataOne = useMemo(() => {
    return filterByRange(tx.filter((t) => t.description === selectedTest), rangeOne).map((t) => ({
      _key: (t as any).key,
      dateLabel: t.dateLabel,
      group: t.group,
      score: t.score,
      result: (t as any).result,
      testType: (t as any).testType as "positive" | "negative",
      __mw:  isVeryNarrow ? 200 : 260, // max width tooltip
    }));
  }, [tx, rangeOne, selectedTest, isVeryNarrow]);

  const dataAll = useMemo(() => aggregateCombined(filterByRange(tx, rangeAll), NEAR_MINUTES), [tx, rangeAll]);

  const seriesNames = useMemo(() => Array.from(new Set(tx.map((t) => t.description))), [tx]);
  const colorFor = (i: number) => PALETTE[i % PALETTE.length];

  const seriesCount = view === "single" ? 1 : seriesNames.length;
  const legendPerRow = isVeryNarrow ? 1 : isNarrow ? 2 : 3;
  const legendRows = view === "combined" ? Math.ceil(seriesCount / legendPerRow) : 0;
  const legendLineHeight = isVeryNarrow ? 16 : isNarrow ? 18 : 20;
  const legendH = legendRows * legendLineHeight + (legendRows > 0 ? 16 : 0);

  const xAxisH = isVeryNarrow ? 64 : isNarrow ? 72 : 80;
  const basePlotH = isVeryNarrow ? 260 : isNarrow ? 300 : 360;

  const chartHeight = Math.max(
    isVeryNarrow ? 320 : 380,
    basePlotH + xAxisH + (view === "combined" ? legendH : 0) + (isVeryNarrow ? 16 : 24)
  );

  const [rangePie, setRangePie] = useState<RangeKey>("1m");
  const pieData = useMemo(() => {
    const filtered = filterByRange(tx, rangePie);
    const counts: Record<string, number> = {};
    filtered.forEach((t) => {
      counts[t.description] = (counts[t.description] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tx, rangePie]);

  // ชนิดแบบคัดกรองของชุดที่เลือก (ใช้รายการล่าสุดเป็นตัวแทน)
  const selectedTestType: "positive" | "negative" = useMemo(() => {
    const rows = tx.filter((t) => t.description === selectedTest);
    const last = rows[rows.length - 1];
    return (last?.testType ?? "positive") as "positive" | "negative";
  }, [tx, selectedTest]);

  // ช่วงคะแนนของกราฟ single (ใช้ทำ dot ไล่สี)
  const [minScoreOne, maxScoreOne] = useMemo(() => {
    if (!dataOne.length) return [0, 1] as const;
    let mn = Infinity, mx = -Infinity;
    for (const r of dataOne) {
      mn = Math.min(mn, r.score);
      mx = Math.max(mx, r.score);
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx)) return [0, 1] as const;
    if (mn === mx) return [mn, mn + 1] as const;
    return [mn, mx] as const;
  }, [dataOne]);

  if (loading) return <div className="p-6 text-slate-600">กำลังโหลดข้อมูล…</div>;

  return (
    <div className="font-ibmthai p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-emerald-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">การเข้าทำแบบคัดกรองสุขภาพจิต</p>
            <p className="text-2xl font-semibold text-emerald-700">
              {totalAttempts} <span className="text-base font-normal">ครั้ง</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-indigo-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">แบบคัดกรองสุขภาพจิตที่เคยทำ</p>
            <p className="text-2xl font-semibold text-indigo-700">
              {uniqueTests.length} <span className="text-base font-normal">แบบคัดกรอง</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-rose-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <Award className="w-6 h-6 text-rose-600" />
          </div>
          <div className="truncate">
            <p className="text-slate-600 text-sm">รายการล่าสุด</p>
            {latest ? (
              <>
                <p className="text-rose-700 font-medium truncate">{latest.description}</p>
                <p className="text-slate-500 text-xs">
                  {latest.dateLabel} • {latest.group || "-"}
                </p>
              </>
            ) : (
              <p className="text-slate-400">-</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-amber-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">แบบคัดกรองสุขภาพจิตรอบถัดไป</p>
            <p className="text-lg md:text-xl font-semibold text-amber-700">{nextRoundLabel}</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: line charts */}
        <div className="rounded-2xl bg-white shadow-sm border border-amber-100 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-amber-300">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800">
                {view === "single" ? "กราฟรายแบบคัดกรอง" : "กราฟรวมหลายแบบคัดกรอง"}
              </h3>
              <p className="text-slate-500 text-sm">แกนตั้งเป็นคะแนน • แกนนอนเป็นวันที่ (สีตามกลุ่ม)</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                {uniqueGroups.map((g) => (
                  <div key={g} className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: colorOfGroup(g) }} />
                    {g}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center bg-orange-200/90 rounded-full p-1 gap-1">
                <button
                  onClick={() => setView("single")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    view === "single" ? "bg-white text-slate-900 shadow" : "text-gray-500 hover:text-orange-900"
                  }`}
                >
                  <FileText size={16} /> รายแบบคัดกรอง
                </button>
                <button
                  onClick={() => setView("combined")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    view === "combined" ? "bg-white text-slate-900 shadow" : "text-gray-500 hover:text-orange-900"
                  }`}
                >
                  <MessageSquare size={16} /> กราฟรวม
                </button>
              </div>
            </div>
          </div>

          {/* top-right toolbar */}
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 pt-3">
            {view === "single" ? (
              <>
                <select
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                >
                  {uniqueTests.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  value={rangeOne}
                  onChange={(e) => setRangeOne(e.target.value as RangeKey)}
                >
                  {RANGE_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">ช่วง:</span>
                <select
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  value={rangeAll}
                  onChange={(e) => setRangeAll(e.target.value as RangeKey)}
                >
                  {RANGE_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* chart */}
          <div ref={chartBoxRef} className="p-4 w-full" style={{ height: chartHeight }}>
            {view === "single" ? (
              dataOne.length === 0 ? (
                <div className="h-full grid place-items-center text-slate-400">ไม่มีข้อมูลในช่วงที่เลือก</div>
              ) : (
                <ResponsiveContainer key={`single-${chartW}`} width="100%" height="100%">
                  <LineChart
                    data={dataOne}
                    margin={{ top: 10, right: isVeryNarrow ? 12 : 20, left: isVeryNarrow ? 6 : 12, bottom: 8 }}
                  >
                    {/* กำหนด gradient สำหรับเส้นตาม testType */}
                    <defs>
                      <linearGradient id={`scoreGrad-${selectedTestType}`} x1="0" y1="0" x2="0" y2="1">
                        {selectedTestType === "positive" ? (
                          <>
                            {/* ค่าสูง = เขียว (ด้านบน) */}
                            <stop offset="0%" stopColor={GREEN} />
                            {/* ค่าต่ำ = แดง (ด้านล่าง) */}
                            <stop offset="100%" stopColor={RED} />
                          </>
                        ) : (
                          <>
                            {/* negative: มาก = แดง */}
                            <stop offset="0%" stopColor={RED} />
                            <stop offset="100%" stopColor={GREEN} />
                          </>
                        )}
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_key"
                      scale="point"
                      interval={0}
                      padding={{ left: 16, right: 16 }}
                      height={xAxisH}
                      tickMargin={4}
                      tick={(p) => <RotXTick {...p} data={dataOne} small={isNarrow} colorOfGroup={colorOfGroup} />}
                    />
                    <YAxis />
                    {/* Tooltip แบบหลายบรรทัด & ไม่ล้นจอ */}
                    <Tooltip content={<CustomTooltipSingle />} />

                    {/* เส้นไล่สี + จุดตามคะแนน */}
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={`url(#scoreGrad-${selectedTestType})`}
                      strokeWidth={2}
                      dot={(p: any) => {
                        const { cx, cy, payload } = p;
                        const c = colorByScore(payload.score, minScoreOne, maxScoreOne, selectedTestType);
                        const r = isVeryNarrow ? 2 : isNarrow ? 2.5 : 3.5;
                        return <circle cx={cx} cy={cy} r={r} fill={c} stroke="#ffffff" strokeWidth={1} />;
                      }}
                      activeDot={(p: any) => {
                        const { cx, cy, payload } = p;
                        const c = colorByScore(payload.score, minScoreOne, maxScoreOne, selectedTestType);
                        const r = isVeryNarrow ? 3 : isNarrow ? 3.5 : 5;
                        return <circle cx={cx} cy={cy} r={r} fill={c} stroke="#0f172a" strokeWidth={1} />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            ) : dataAll.length === 0 ? (
              <div className="h-full grid place-items-center text-slate-400">ไม่มีข้อมูลในช่วงที่เลือก</div>
            ) : (
              <>
                <ResponsiveContainer
                  key={`all-${chartW}-${seriesCount}`}
                  width="100%"
                  height={chartHeight - (legendH + (isVeryNarrow ? 8 : 10))}
                >
                  <LineChart
                    data={dataAll}
                    margin={{ top: 10, right: isVeryNarrow ? 12 : 20, left: isVeryNarrow ? 6 : 12, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_key"
                      scale="point"
                      interval={0}
                      padding={{ left: 16, right: 16 }}
                      height={xAxisH}
                      tickMargin={4}
                      tick={(p) => <RotXTick {...p} data={dataAll} small={isNarrow} colorOfGroup={colorOfGroup} />}
                    />
                    <YAxis />
                    <Tooltip
                      wrapperStyle={{ maxWidth: isVeryNarrow ? 220 : 280, whiteSpace: "normal", wordBreak: "break-word" }}
                    />
                    {seriesNames.map((s, i) => (
                      <Line
                        key={s}
                        type="monotone"
                        dataKey={s}
                        stroke={colorFor(i)}
                        strokeWidth={2}
                        dot={{ r: isVeryNarrow ? 1 : isNarrow ? 1.5 : 2 }}
                        activeDot={{ r: isVeryNarrow ? 2.5 : isNarrow ? 3 : 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                <div className="px-8 pb-9">
                  <CustomLegend
                    payload={seriesNames.map((s, i) => ({ value: s, color: colorFor(i), type: "line" }))}
                    compact={isNarrow}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: pie card */}
        <div
          ref={pieBoxRef}
          className="rounded-2xl bg-sky-200/30 shadow-sm border border-sky-100 p-4 flex flex-col lg:col-span-1"
        >
          <div className="p-5 border-b border-sky-300">
            <h3 className="font-semibold text-slate-800 mb-3">จำนวนครั้งที่ทำแต่ละแบบคัดกรองสุขภาพจิต</h3>
            <p className="text-slate-500 text-sm">
              จำนวนครั้งที่ทำแบบคัดกรองสุขภาพจิตทั้งหมด : {totalAttempts} ครั้ง
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 px-4 pt-10 mb-8">
            <span className="text-sm text-slate-500">ช่วง:</span>
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
              value={rangePie}
              onChange={(e) => setRangePie(e.target.value as RangeKey)}
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {pieData.length === 0 ? (
            <div className="grid place-items-center text-slate-400" style={{ height: pieHeight }}>
              ไม่มีข้อมูลในช่วงที่เลือก
            </div>
          ) : (
            <>
              <div style={{ height: pieHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={pieRadius} label={false}>
                      {pieData.map((p, idx) => (
                        <Cell key={`cell-${p.name}-${idx}`} fill={PASTEL_COLORS[idx % PASTEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [`${v} ครั้ง`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-7 px-4 pt-2">
                <CustomLegend
                  payload={pieData.map((p, i) => ({
                    value: `${p.name}`,
                    color: PASTEL_COLORS[i % PASTEL_COLORS.length],
                    type: "square",
                  }))}
                  compact={pieCompactLegend}
                  maxItemWidth={pieCompactLegend ? 180 : 220}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
