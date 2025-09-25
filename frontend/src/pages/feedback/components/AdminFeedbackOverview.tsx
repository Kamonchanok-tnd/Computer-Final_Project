// path: src/pages/feedback/components/AdminFeedbackOverview.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAdminFeedbackOverview } from "../../../services/https/feedback/feedback";

// --------- raw response type from service ----------
type OverviewResp = Awaited<ReturnType<typeof getAdminFeedbackOverview>>;

// --------- safe view models (we control these) ----------
type OptionVM = { id: number | string; label: string; count: number; pct?: number };
type RatingVM = { id: number | string; label: string; responses: number; avg_rating: number };
type ChoiceVM = { id: number | string; label: string; responses: number; options: OptionVM[] };
type TextVM   = { id: number | string; label: string; responses: number; samples: string[] };

// --------- constants ----------
const BRAND = "#99EDFF";
const STAR  = "#FACC15";

// --------- tiny runtime helpers (no `any`) ----------
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function asNumber(x: unknown, fallback = 0): number {
  return typeof x === "number" ? x : Number.isFinite(Number(x)) ? Number(x) : fallback;
}
function asString(x: unknown, fallback = ""): string {
  return typeof x === "string" ? x : fallback;
}
function asArray<T = unknown>(x: unknown): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}
// id helper → number | string
function asId(x: unknown): number | string {
  return typeof x === "number" && Number.isFinite(x) ? x : asString(x);
}

// normalize raw questions -> VMs
function toRatingVM(q: unknown): RatingVM | null {
  if (!isRecord(q)) return null;
  if (asString(q["type"]) !== "rating") return null;
  return {
    id: asId(q["id"]),
    label: asString(q["label"]),
    responses: asNumber(q["responses"]),
    avg_rating: asNumber(q["avg_rating"]),
  };
}
function toOptionVM(o: unknown): OptionVM | null {
  if (!isRecord(o)) return null;
  const id = asId(o["id"]);
  const label = asString(o["label"]);
  if (!label) return null;
  return {
    id,
    label,
    count: asNumber(o["count"]),
    pct: typeof o["pct"] === "number" ? o["pct"] : undefined,
  };
}
function toChoiceVM(q: unknown, expectType: "choice_single" | "choice_multi"): ChoiceVM | null {
  if (!isRecord(q)) return null;
  if (asString(q["type"]) !== expectType) return null;
  const opts = asArray(q["options"]).map(toOptionVM).filter((v): v is OptionVM => v !== null);
  return {
    id: asId(q["id"]),
    label: asString(q["label"]),
    responses: asNumber(q["responses"]),
    options: opts,
  };
}
function toTextVM(q: unknown): TextVM | null {
  if (!isRecord(q)) return null;
  if (asString(q["type"]) !== "text") return null;
  const samples = asArray(q["samples"]).map((s) => asString(s)).filter(Boolean);
  return {
    id: asId(q["id"]),
    label: asString(q["label"]),
    responses: asNumber(q["responses"]),
    samples,
  };
}

export default function AdminFeedbackOverview() {
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [data, setData] = useState<OverviewResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const resp = await getAdminFeedbackOverview(period, 50, 0);
        if (alive) setData(resp);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ";
        if (alive) setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [period]);

  // ---- build safe arrays for UI (no `never`) ----
  const questions = data?.questions ?? [];
  const ratingRows = useMemo<RatingVM[]>(
    () => questions.map(toRatingVM).filter((v): v is RatingVM => v !== null),
    [questions]
  );
  const singleRows = useMemo<ChoiceVM[]>(
    () => questions.map((q) => toChoiceVM(q, "choice_single")).filter((v): v is ChoiceVM => v !== null),
    [questions]
  );
  const multiRows = useMemo<ChoiceVM[]>(
    () => questions.map((q) => toChoiceVM(q, "choice_multi")).filter((v): v is ChoiceVM => v !== null),
    [questions]
  );
  const textRows = useMemo<TextVM[]>(
    () => questions.map(toTextVM).filter((v): v is TextVM => v !== null),
    [questions]
  );

  const k = data?.kpis;
  const avg = k?.avg_rating_all ?? 0;
  const respondents = k?.respondents ?? 0;

  return (
    <div className="w-full bg-gradient-to-b from-sky-50/70 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">ภาพรวมคะแนนเว็บ</h1>
          <p className="text-slate-600">
            ช่วงข้อมูล: <span className="font-semibold">{period}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">เลือกเดือน</label>
          <input
            type="month"
            className="rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:border-sky-400 focus:outline-none"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">กำลังโหลดข้อมูล...</div>
      )}
      {err && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">{err}</div>
      )}

      {/* KPI + Overall */}
      {data && (
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">คะแนนความพึงพอใจเฉลี่ยทั้งเว็บ</p>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "rgba(153,237,255,0.12)", border: "1px solid rgba(153,237,255,0.38)" }}
              >
                {data.period}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StarRating value={avg} outOf={5} size={26} />
              <span className="text-sm text-slate-500">ผู้ตอบทั้งหมด {respondents}</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KpiPill label="ส่งแบบประเมิน" value={k?.total_submissions} />
              <KpiPill label="ข้อความข้อเสนอแนะ" value={k?.text_feedback_count} />
              <KpiPill label="คะแนนเฉลี่ย" value={formatNumber(k?.avg_rating_all)} suffix="/ 5" />
            </div>
          </div>
        </section>
      )}

      {/* Rating per question */}
      {ratingRows.length > 0 && (
        <Section title="รายละเอียดคะแนนรายข้อ (Rating)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ratingRows.map((q) => (
              <Card key={q.id}>
                <p className="mb-2 font-medium text-slate-800">{q.label}</p>
                <div className="flex items-center justify-between">
                  <StarRating value={q.avg_rating} outOf={5} size={22} />
                  <span className="text-sm text-slate-500">ผู้ตอบ {q.responses}</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Single choice breakdown */}
      {singleRows.length > 0 && (
        <Section title="ฟีเจอร์ที่ชอบที่สุด (เลือก 1)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {singleRows.map((q) => (
              <Card key={q.id}>
                <p className="mb-3 font-medium text-slate-800">{q.label}</p>
                <OptionList options={q.options} totalRespondents={q.responses} />
                <p className="mt-3 text-sm text-slate-500">ผู้ตอบ {q.responses}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Multi choice breakdown */}
      {multiRows.length > 0 && (
        <Section title="ฟีเจอร์ที่ใช้งาน (เลือกได้หลายข้อ)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {multiRows.map((q) => (
              <Card key={q.id}>
                <p className="mb-3 font-medium text-slate-800">{q.label}</p>
                <OptionList options={q.options} totalRespondents={q.responses} />
                <p className="mt-3 text-sm text-slate-500">ผู้ตอบ {q.responses}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Text feedback */}
      {textRows.length > 0 && (
        <Section title="ข้อเสนอแนะ (ข้อความ)">
          <div className="grid grid-cols-1 gap-4">
            {textRows.map((q) => (
              <Card key={q.id}>
                <p className="mb-3 font-medium text-slate-800">{q.label}</p>
                {q.samples.length > 0 ? (
                  <ul className="space-y-2">
                    {q.samples.map((s, idx) => (
                      <li key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-700">
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">— ไม่มีตัวอย่างข้อความ —</p>
                )}
                <p className="mt-3 text-sm text-slate-500">จำนวนข้อความ {q.responses}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Empty */}
      {!loading && !err && (!data || (data.questions ?? []).length === 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          ยังไม่มีข้อมูลในช่วงเดือนนี้
        </div>
      )}
    </div>
  );
}

/* ===================== UI Helpers ===================== */
function KpiPill({ label, value, suffix }: { label: string; value: number | string | null | undefined; suffix?: string }) {
  const show = typeof value === "number" ? value : (value ?? "-");
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-base font-semibold text-slate-800">
        {show}{suffix ? ` ${suffix}` : ""}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2
        className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-slate-700"
        style={{ background: "rgba(153,237,255,0.12)", border: "1px solid rgba(153,237,255,0.38)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {children}
    </div>
  );
}

function StarRating({ value = 0, outOf = 5, size = 20 }: { value?: number | null; outOf?: number; size?: number }) {
  const vNum = typeof value === "number" ? value : Number(value ?? 0);
  const v = Math.max(0, Math.min(outOf, vNum));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = outOf - full - (half ? 1 : 0);
  const stars: Array<"full" | "half" | "empty"> = [
    ...Array(full).fill("full"),
    ...(half ? ["half"] : []),
    ...Array(empty).fill("empty"),
  ];
  return (
    <div className="flex items-center gap-1">
      {stars.map((t, i) => (
        <StarIcon key={i} type={t} size={size} />
      ))}
      <span className="ml-2 text-sm text-slate-600">
        {v.toFixed(1)} / {outOf}
      </span>
    </div>
  );
}

function StarIcon({ type, size = 20 }: { type: "full" | "half" | "empty"; size?: number }) {
  if (type === "full") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
        <path fill={STAR} d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
      </svg>
    );
  }
  if (type === "half") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
        <defs>
          <linearGradient id="halfGrad" x1="0%" x2="100%">
            <stop offset="50%" stopColor={STAR} />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path fill="url(#halfGrad)" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
      <path fill="#e5e7eb" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
    </svg>
  );
}

/* ---------- Options UI ---------- */
function OptionList({
  options,
  totalRespondents,
}: {
  options: OptionVM[];
  totalRespondents: number;
}) {
  const total = Math.max(1, totalRespondents); // กันหารศูนย์
  const rows = [...options]
    .sort((a, b) => b.count - a.count)
    .map((opt) => {
      const pct = typeof opt.pct === "number" ? opt.pct : Math.round((opt.count / total) * 100);
      return { ...opt, pct };
    });

  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className="rounded-xl border border-slate-100 p-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{r.label}</span>
            <span className="tabular-nums text-slate-500">{r.count} คน • {r.pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, Math.max(0, r.pct ?? 0))}%`,
                background: `linear-gradient(90deg, ${BRAND}, #7dd3fc)`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatNumber(n: number | null | undefined): string {
  if (typeof n !== "number") return "-";
  return n.toFixed(2).replace(/\.00$/, "");
}
