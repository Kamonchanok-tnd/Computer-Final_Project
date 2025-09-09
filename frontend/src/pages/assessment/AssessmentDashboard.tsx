import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  BarChart3,
  Activity,
  Award,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  getMyTransactions,
  getAvailableGroupsAndNext,
} from "../../services/https/assessment";
import type { ITransaction } from "../../interfaces/ITransaction";

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

const formatDateTH = (iso: string) => {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear() + 543;
  return `${dd}/${mm}/${yyyy}`;
};

/* ================== Helpers for next-round calculation (HOISTED) ================== */
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
/* ================================================================================ */

// ---------- Shape & normalize ----------
type TxView = {
  key: string;
  dateISO: string;
  dateLabel: string;
  group: string;
  description: string;
  score: number;
  max?: number;
};

const normalize = (t: any): TxView => {
  const id = t.ID ?? t.id ?? t.Id;
  const createdAt = t.CreatedAt ?? t.created_at ?? t.createdAt;
  const group = t.questionnaire_group ?? t.group ?? "";
  const desc = t.description ?? "";
  const score = Number(t.total_score ?? t.totalScore ?? 0);
  const max = t.max_score ?? t.maxScore;

  return {
    key: String(id ?? `${desc}-${createdAt}`),
    dateISO: createdAt,
    dateLabel: createdAt ? formatDateTH(createdAt) : "",
    group,
    description: desc,
    score,
    max: typeof max === "number" ? max : undefined,
  };
};

// ---------- hooks ----------
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

// ---------- Legend ----------
const CustomLegend: React.FC<any> = ({ payload, compact }) => (
  <div
    className="w-full"
    style={{
      fontSize: compact ? 11 : 13,
      lineHeight: compact ? "14px" : "16px",
    }}
  >
    <div
      className={`flex ${
        compact ? "flex-col gap-1" : "flex-wrap gap-x-4 gap-y-1"
      }`}
    >
      {payload?.map((it: any) => (
        <div
          key={it.value}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: it.color }}
          />
          <span
            className="text-slate-600 truncate"
            style={{ maxWidth: compact ? "180px" : "none" }}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ---------- Rotated X ticks, colored by group ----------
type TickProps = {
  x: number;
  y: number;
  payload: any;
  data: any[];
  small?: boolean;
  colorOfGroup: (g: string) => string;
};
const RotXTick: React.FC<TickProps> = ({
  x,
  y,
  payload,
  data,
  small,
  colorOfGroup,
}) => {
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

// ---------- Combine nearby timestamps ----------
const NEAR_MINUTES = 15;
function aggregateCombined(rows: TxView[], windowMin: number) {
  const clusters = new Map<string, any>();
  const win = Math.max(1, windowMin);

  for (const t of rows) {
    const d = new Date(t.dateISO);
    const minutes = d.getHours() * 60 + d.getMinutes();
    const bin = Math.floor(minutes / win);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    const key = `${dayKey}|${t.group}|${bin}`;
    const sortTs = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      bin * win
    ).getTime();

    let cluster = clusters.get(key);
    if (!cluster) {
      cluster = {
        _key: key,
        dateLabel: t.dateLabel,
        group: t.group,
        __sort: sortTs,
      };
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

// ====================== Component ======================
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

  useEffect(() => {
    (async () => {
      try {
        const data: ITransaction[] = await getMyTransactions();
        data.sort(
          (a, b) =>
            new Date(
              a.CreatedAt ?? (a as any).created_at ?? (a as any).createdAt
            ).getTime() -
            new Date(
              b.CreatedAt ?? (b as any).created_at ?? (b as any).createdAt
            ).getTime()
        );
        setRaw(data);
        if (data.length) setSelectedTest(data[data.length - 1].description);

        // ---- คำนวณ "รอบถัดไป" สำหรับกลุ่ม interval ----
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const uid = Number(user?.id ?? localStorage.getItem("id"));
        if (!uid || Number.isNaN(uid)) {
          setNextRoundLabel("ยังไม่พบผู้ใช้ (uid)");
          return;
        }

        // ขอทุกกลุ่ม: มีทั้ง onLogin & interval
        const groups: GroupOut[] = await getAvailableGroupsAndNext(uid, "");

        const txv = data.map(normalize);
        const now = new Date();

        // baseline: onLogin ล่าสุด
        const onLoginGroupNames = new Set(
          groups
            .filter((g) => (g.trigger_type || "") === "onLogin")
            .map((g) => g.name)
        );
        const lastOnLoginTx = [...txv]
          .reverse()
          .find((t) => onLoginGroupNames.has(t.group || ""));

        // เฉพาะ interval ที่มี frequency_days
        const intervalGroups = groups.filter(
          (g) =>
            (g.trigger_type || "") === "interval" &&
            typeof g.frequency_days === "number"
        );

        let bestLabel = "-";
        let bestTime: Date | null = null;

        for (const g of intervalGroups) {
          const freq = Number(g.frequency_days || 0);
          if (!freq) continue;

          const lastTxInGroup = [...txv]
            .reverse()
            .find((t) => (t.group || "") === g.name);

          const base = lastTxInGroup?.dateISO
            ? new Date(lastTxInGroup.dateISO)
            : lastOnLoginTx?.dateISO
            ? new Date(lastOnLoginTx.dateISO)
            : null;

          if (!base) {
            if (!bestTime)
              bestLabel = "ต้องทำแบบประเมินกลุ่มเริ่มต้น (onLogin) ก่อน";
            continue;
          }

          const nextAt = addDaysISO(base.toISOString(), freq);

          if (now >= nextAt) {
            bestLabel = `ทำได้แล้ว`;
            bestTime = bestTime ?? now;
            break; // พร้อมทำแล้ว ไม่ต้องหาอันอื่น
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
  const uniqueTests = useMemo(
    () => Array.from(new Set(tx.map((t) => t.description))),
    [tx]
  );
  const uniqueGroups = useMemo(
    () => Array.from(new Set(tx.map((t) => t.group || "-"))),
    [tx]
  );

  // map สีสำหรับ group
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

  // summary
  const totalAttempts = tx.length;
  const latest = tx[tx.length - 1];

  // single chart
  const dataOne = useMemo(() => {
    return filterByRange(
      tx.filter((t) => t.description === selectedTest),
      rangeOne
    ).map((t) => ({
      _key: t.key,
      dateLabel: t.dateLabel,
      group: t.group,
      score: t.score,
    }));
  }, [tx, rangeOne, selectedTest]);

  // combined chart
  const dataAll = useMemo(
    () => aggregateCombined(filterByRange(tx, rangeAll), NEAR_MINUTES),
    [tx, rangeAll]
  );

  const seriesNames = useMemo(
    () => Array.from(new Set(tx.map((t) => t.description))),
    [tx]
  );
  const colorFor = (i: number) => PALETTE[i % PALETTE.length];

  // ==== Responsive height (explicit number) ====
  const seriesCount = view === "single" ? 1 : seriesNames.length;
  const legendPerRow = isVeryNarrow ? 1 : isNarrow ? 2 : 3;
  const legendRows =
    view === "combined" ? Math.ceil(seriesCount / legendPerRow) : 0;
  const legendLineHeight = isVeryNarrow ? 16 : isNarrow ? 18 : 20;
  const legendH = legendRows * legendLineHeight + (legendRows > 0 ? 16 : 0);

  // เพิ่มพื้นที่ด้านล่างให้พอสำหรับ label เอียง
  const xAxisH = isVeryNarrow ? 64 : isNarrow ? 72 : 80;
  const basePlotH = isVeryNarrow ? 200 : isNarrow ? 240 : 280;

  const chartHeight = Math.max(
    isVeryNarrow ? 320 : 360,
    basePlotH +
      xAxisH +
      (view === "combined" ? legendH : 0) +
      (isVeryNarrow ? 16 : 24)
  );

  if (loading)
    return <div className="p-6 text-slate-600">กำลังโหลดข้อมูล…</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-green-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">การเข้าทำแบบทดสอบ</p>
            <p className="text-2xl font-semibold text-emerald-700">
              {totalAttempts}{" "}
              <span className="text-base font-normal">ครั้ง</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-violet-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <BarChart3 className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">แบบทดสอบที่เคยทำ</p>
            <p className="text-2xl font-semibold text-violet-700">
              {uniqueTests.length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-cyan-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <Award className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="truncate">
            <p className="text-slate-600 text-sm">รายการล่าสุด</p>
            {latest ? (
              <>
                <p className="text-cyan-700 font-medium truncate">
                  {latest.description}
                </p>
                <p className="text-slate-500 text-xs">
                  {latest.dateLabel} • {latest.group || "-"}
                </p>
              </>
            ) : (
              <p className="text-slate-400">-</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-sky-100/70 flex items-center gap-4">
          <div className="rounded-full bg-white/70 p-3 shadow">
            <Calendar className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">แบบทดสอบรอบถัดไป</p>
            <p className="text-lg md:text-xl font-semibold text-sky-700">
              {nextRoundLabel}
            </p>
          </div>
        </div>
      </div>

      {/* ==== Single/Combined in one card ==== */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100">
        {/* header + toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-800">
              {view === "single" ? "กราฟรายแบบทดสอบ" : "กราฟรวมหลายแบบทดสอบ"}
            </h3>
            <p className="text-slate-500 text-sm">
              แกนตั้งเป็นคะแนน • แกนนอนเป็นวันที่ (สีตามกลุ่ม)
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center bg-cyan-400/90 rounded-full p-1 gap-1">
              <button
                onClick={() => setView("single")}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                  view === "single"
                    ? "bg-white text-slate-900 shadow"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <FileText size={16} /> รายแบบทดสอบ
              </button>
              <button
                onClick={() => setView("combined")}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                  view === "combined"
                    ? "bg-white text-slate-900 shadow"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <MessageSquare size={16} /> กราฟรวม
              </button>
            </div>
          </div>
        </div>

        {/* right toolbar */}
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

        {/* chart box */}
        <div
          ref={chartBoxRef}
          className="p-4 w-full"
          style={{ height: chartHeight }}
        >
          {view === "single" ? (
            dataOne.length === 0 ? (
              <div className="h-full grid place-items-center text-slate-400">
                ไม่มีข้อมูลในช่วงที่เลือก
              </div>
            ) : (
              <ResponsiveContainer
                key={`single-${chartW}`}
                width="100%"
                height="100%"
              >
                <LineChart
                  data={dataOne}
                  margin={{
                    top: 10,
                    right: isVeryNarrow ? 12 : 20,
                    left: isVeryNarrow ? 6 : 12,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="_key"
                    scale="point"
                    interval={0}
                    padding={{ left: 16, right: 16 }}
                    height={xAxisH}
                    tickMargin={4}
                    tick={(p) => (
                      <RotXTick
                        {...p}
                        data={dataOne}
                        small={isNarrow}
                        colorOfGroup={colorOfGroup}
                      />
                    )}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(v: any, name) =>
                      name === "score" ? [`${v}`, "คะแนน"] : v
                    }
                    labelFormatter={(key) => {
                      const item = dataOne.find((d) => d._key === key);
                      return item
                        ? `${item.dateLabel} (${item.group || "-"})`
                        : "";
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: isVeryNarrow ? 1 : isNarrow ? 1.5 : 3 }}
                    activeDot={{ r: isVeryNarrow ? 2.5 : isNarrow ? 3 : 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          ) : dataAll.length === 0 ? (
            <div className="h-full grid place-items-center text-slate-400">
              ไม่มีข้อมูลในช่วงที่เลือก
            </div>
          ) : (
            <>
              <ResponsiveContainer
                key={`all-${chartW}-${seriesCount}`}
                width="100%"
                height={chartHeight - (legendH + (isVeryNarrow ? 8 : 10))}
              >
                <LineChart
                  data={dataAll}
                  margin={{
                    top: 10,
                    right: isVeryNarrow ? 12 : 20,
                    left: isVeryNarrow ? 6 : 12,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="_key"
                    scale="point"
                    interval={0}
                    padding={{ left: 16, right: 16 }}
                    height={xAxisH}
                    tickMargin={4}
                    tick={(p) => (
                      <RotXTick
                        {...p}
                        data={dataAll}
                        small={isNarrow}
                        colorOfGroup={colorOfGroup}
                      />
                    )}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(key) => {
                      const item = dataAll.find((d) => d._key === key);
                      return item
                        ? `${item.dateLabel} (${item.group || "-"})`
                        : "";
                    }}
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
                  payload={seriesNames.map((s, i) => ({
                    value: s,
                    color: colorFor(i),
                    type: "line",
                  }))}
                  compact={isNarrow}
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
