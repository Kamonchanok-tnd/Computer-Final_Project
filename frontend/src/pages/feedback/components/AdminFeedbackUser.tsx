// path: src/pages/feedback/components/AdminFeedbackUser.tsx
import { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import {
  getAdminFeedbackUserReport,
  getAdminFeedbackUsers,
} from "../../../services/https/feedback/feedback";
import type {
  IUserReportResponse,
  IUserSubmission,
  IUserAnswer,
} from "../../../interfaces/IAdminFeedback";

export type UserLite = {
  uid: string | number;
  name: string;
  avatarUrl?: string | null;
};

export default function AdminFeedbackUser({
  users: usersProp = [],
  title = "ผลประเมินความพึงพอใจรายบุคคล",
}: {
  users?: UserLite[];
  title?: string;
}) {
  /* ----------------- Users (left) ----------------- */
  const [users, setUsers] = useState<UserLite[]>(usersProp);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersErr, setUsersErr] = useState<string | null>(null);
// --- แทนที่บล็อก useEffect สองอันบนสุดใน AdminFeedbackUser.tsx ---

// sync จาก props เมื่อมีคนส่ง users เข้ามา (ดูแค่ความยาวเพื่อให้ dependency เสถียร)
useEffect(() => {
  if (usersProp && usersProp.length > 0) {
    setUsers(usersProp);
  }
  // ใช้ความยาวแทนทั้งอาเรย์ เพื่อกัน identity เปลี่ยนทุกเรนเดอร์
}, [usersProp, usersProp.length]);

// ถ้า "ไม่ได้" ส่ง users ทาง props → ค่อยโหลดจาก API หนึ่งครั้งเท่านั้น
useEffect(() => {
  const hasUsersProp = (usersProp?.length ?? 0) > 0;
  if (hasUsersProp) return;

  let alive = true;
  setUsersLoading(true);
  setUsersErr(null);

  (async () => {
    try {
      const list = await getAdminFeedbackUsers(); // เรียก /admin/feedback/users
      if (!alive) return;
      setUsers(list);
    } catch (e) {
      if (!alive) return;
      setUsersErr(e instanceof Error ? e.message : "โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    } finally {
      if (alive) setUsersLoading(false);
    }
  })();

  return () => { alive = false; };
  // ผูกกับบูลีนที่เสถียร ไม่ผูกกับอาเรย์ [] ที่เปลี่ยน identity
}, [usersProp?.length]);


  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => u.name.toLowerCase().includes(q)) : users;
  }, [users, query]);

  /* ----------------- Report (right) ----------------- */
  const [activeUid, setActiveUid] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<IUserReportResponse | null>(null);

  useEffect(() => {
    if (activeUid == null) { setReport(null); setErr(null); return; }
    let alive = true;
    setLoading(true); setErr(null); setReport(null);
    (async () => {
      try {
        const data = await getAdminFeedbackUserReport(activeUid);
        if (!alive) return;
        setReport(data as unknown as IUserReportResponse);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "โหลดผลประเมินไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [activeUid]);

  // สร้าง period key ที่เชื่อถือได้เสมอ
  const stablePeriod = (s: IUserSubmission): string => {
    const pk = (s.period_key ?? "").trim();
    if (/^\d{4}-\d{2}$/.test(pk)) return pk;
    if (s.submitted_at) {
      const d = new Date(s.submitted_at);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
      }
    }
    return `ID#${s.submission_id}`;
  };

  // รายชื่อเดือน (unique) เรียงใหม่ → เก่า
  const periodKeysDesc: string[] = useMemo(() => {
    const all = (report?.submissions ?? []).map(stablePeriod);
    const uniq = Array.from(new Set(all)); // unique โดยลำดับแรกพบ
    // เรียงใหม่ → เก่า โดยเทียบสตริง YYYY-MM ก็เพียงพอ
    return uniq.sort((a, b) => (a < b ? 1 : -1));
  }, [report]);

  // เลือก submission ปัจจุบัน
  const [activeSubmissionId, setActiveSubmissionId] = useState<number | null>(null);

  // ตั้งค่าเริ่มต้นหลังโหลดรายงาน: เดือนล่าสุดตัวแรก
  useEffect(() => {
    if (!report || periodKeysDesc.length === 0) { setActiveSubmissionId(null); return; }
    const latestPeriod = periodKeysDesc[0];
    // submission ล่าสุดของเดือนนี้ (เผื่ออนาคตมีหลายครั้ง/เดือน)
    const subs = (report.submissions ?? [])
      .filter(s => stablePeriod(s) === latestPeriod)
      .sort((a, b) => (a.submission_id < b.submission_id ? 1 : -1));
    setActiveSubmissionId(subs[0]?.submission_id ?? null);
  }, [report, periodKeysDesc]);

  const activeSubmission: IUserSubmission | null = useMemo(() => {
    if (!report || activeSubmissionId == null) return null;
    return report.submissions.find(s => s.submission_id === activeSubmissionId) ?? null;
  }, [report, activeSubmissionId]);

  const activeUser = useMemo(
    () => (activeUid == null ? undefined : users.find(u => String(u.uid) === String(activeUid))),
    [activeUid, users]
  );

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-grid place-items-center rounded-2xl bg-white/90 shadow h-12 w-12 ring-1 ring-slate-200">
            <ClipboardCheck className="h-6 w-6 text-sky-700" />
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 leading-none">{title}</h1>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT */}
          <div className="rounded-2xl bg-white shadow p-4 sm:p-5">
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้…"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {usersLoading ? (
              <div className="text-sm text-slate-500">กำลังโหลดรายชื่อผู้ใช้…</div>
            ) : usersErr ? (
              <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2">{usersErr}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-sm text-slate-500">ไม่พบผู้ใช้ที่ตรงคำค้น</div>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-[70vh] overflow-auto pr-1">
                {filteredUsers.map((u) => {
                  const active = String(activeUid) === String(u.uid);
                  return (
                    <li key={String(u.uid)}>
                      <button
                        type="button"
                        onClick={() => setActiveUid(u.uid)}
                        className={[
                          "w-full flex items-center gap-3 px-2 py-2.5 text-left transition rounded-lg",
                          active ? "bg-sky-50/70" : "hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <Avatar url={u.avatarUrl} name={u.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-500">UID: {String(u.uid)}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* RIGHT */}
          <div className="rounded-2xl bg-white shadow p-5 sm:p-6">
            {activeUid == null && <div className="text-slate-500">กดที่รายชื่อผู้ใช้ทางซ้ายเพื่อดูผลประเมิน</div>}
            {activeUid != null && loading && <div className="text-slate-500">กำลังโหลดผลประเมิน…</div>}
            {activeUid != null && err && (
              <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2">{err}</div>
            )}

            {activeUid != null && !loading && !err && report && (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <Avatar url={activeUser?.avatarUrl} name={activeUser?.name ?? "ผู้ใช้"} size={40} />
                  <div>
                    <div className="font-semibold text-slate-800">{activeUser?.name ?? "ผู้ใช้"}</div>
                    <div className="text-xs text-slate-500">
                      ทั้งหมด {report.submissions.length} การส่งแบบประเมิน
                    </div>
                  </div>
                </div>

                {report.submissions.length === 0 ? (
                  <div className="text-sm text-slate-500">ยังไม่มีการส่งแบบประเมินของผู้ใช้นี้</div>
                ) : (
                  <>
                    {/* ปุ่มเลือกเดือนทั้งหมด */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {periodKeysDesc.map((period) => {
                        const subsOfThisPeriod = (report.submissions ?? [])
                          .filter(s => stablePeriod(s) === period)
                          .sort((a, b) => (a.submission_id < b.submission_id ? 1 : -1));
                        const firstId = subsOfThisPeriod[0]?.submission_id;
                        const active = firstId != null && firstId === activeSubmissionId;
                        return (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setActiveSubmissionId(firstId ?? null)}
                            className={[
                              "px-3 py-1.5 rounded-lg text-sm ring-1",
                              active
                                ? "bg-sky-600 text-white ring-sky-600"
                                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                            ].join(" ")}
                            title={subsOfThisPeriod.length > 1 ? `${period} · ${subsOfThisPeriod.length} submissions` : period}
                          >
                            {period}
                            {subsOfThisPeriod.length > 1 && (
                              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-100 px-1 text-[11px] font-semibold text-sky-700">
                                {subsOfThisPeriod.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {activeSubmission && (
                      <div className="space-y-4">
                        {activeSubmission.answers.map((a) => (
                          <AnswerCard key={`${a.type}-${a.question_id}`} answer={a} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function Avatar({ url, name, size = 36 }: { url?: string | null; name?: string; size?: number }) {
  const initials =
    (name || "?").split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "?";
  return url ? (
    <img src={url} alt={name} width={size} height={size} className="rounded-full object-cover border border-slate-200" />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full grid place-items-center bg-sky-100 text-sky-700 border border-slate-200 text-sm font-semibold"
      aria-hidden
    >
      {initials}
    </div>
  );
}

function AnswerCard({ answer }: { answer: IUserAnswer }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 font-medium text-slate-800">{answer.label}</div>
      {answer.type === "rating" && <StarRating value={answer.rating ?? 0} outOf={5} size={22} />}
      {answer.type === "choice_single" && (
        <span className="inline-flex items-center rounded-lg bg-sky-50 text-sky-700 px-3 py-1 text-sm ring-1 ring-sky-200">
          {answer.option_label ?? "—"}
        </span>
      )}
      {answer.type === "choice_multi" && (
        <div className="flex flex-wrap gap-2">
          {(answer.option_labels ?? []).map((lbl, i) => (
            <span key={i} className="inline-flex items-center rounded-lg bg-sky-50 text-sky-700 px-3 py-1 text-sm ring-1 ring-sky-200">
              {lbl}
            </span>
          ))}
        </div>
      )}
      {answer.type === "text" && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700">
          {answer.text || "—"}
        </div>
      )}
    </div>
  );
}

function StarRating({ value = 0, outOf = 5, size = 20 }: { value?: number | null; outOf?: number; size?: number }) {
  const v = Math.max(0, Math.min(outOf, Number(value ?? 0)));
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
      {stars.map((t, i) => <StarIcon key={i} type={t} size={size} />)}
      <span className="ml-2 text-sm text-slate-600">{v.toFixed(1)} / {outOf}</span>
    </div>
  );
}
function StarIcon({ type, size = 20 }: { type: "full" | "half" | "empty"; size?: number }) {
  if (type === "full") return <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#FACC15" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>;
  if (type === "half") return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs><linearGradient id="halfGrad" x1="0%" x2="100%"><stop offset="50%" stopColor="#FACC15"/><stop offset="50%" stopColor="#e5e7eb"/></linearGradient></defs>
      <path fill="url(#halfGrad)" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/>
    </svg>
  );
  return <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#e5e7eb" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>;
}
