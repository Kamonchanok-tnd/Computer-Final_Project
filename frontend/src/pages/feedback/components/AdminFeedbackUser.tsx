import { useMemo, useState } from "react";
import { useAdminUserReport } from "../useAdminFeedback";
export default function AdminFeedbackUser() {
  const [uid, setUid] = useState<number>(2);
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo]     = useState<string | undefined>();
  const { data, loading, err } = useAdminUserReport(uid, from, to);

  const subs = useMemo(() => data?.submissions ?? [], [data]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">ผลรายคน</h2>

      <div className="flex flex-wrap items-center gap-3">
        <input type="number" value={uid} onChange={e => setUid(Number(e.target.value))}
               className="border rounded-lg px-3 py-1 w-28" placeholder="UID" />
        <input type="month" value={from ?? ""} onChange={e => setFrom(e.target.value || undefined)}
               className="border rounded-lg px-3 py-1" />
        <input type="month" value={to ?? ""} onChange={e => setTo(e.target.value || undefined)}
               className="border rounded-lg px-3 py-1" />
      </div>

      {loading && <div className="text-slate-500">กำลังโหลด…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && subs.length === 0 && <div className="text-slate-500">ไม่พบข้อมูล</div>}

      {!loading && subs.map((s) => (
        <div key={s.submission_id} className="border rounded-xl p-4 space-y-2">
          <div className="font-medium">รอบ: {s.period_key}</div>
          <div className="space-y-2">
            {s.answers.map((a, i) => (
              <div key={i} className="border rounded-lg px-3 py-2">
                <div className="text-slate-900">{a.label}</div>
                <div className="text-sm text-slate-700">
                  {a.type === "rating" && <>คะแนน: <b>{a.rating ?? "-"}</b></>}
                  {a.type === "text" && <>{a.text ?? "-"}</>}
                  {a.type === "choice_single" && <>option_id: <b>{a.option_id ?? "-"}</b></>}
                  {a.type === "choice_multi" && <>option_ids: <b>{a.option_ids?.join(", ") || "-"}</b></>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
