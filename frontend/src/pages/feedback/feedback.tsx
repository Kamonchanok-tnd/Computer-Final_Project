// path: src/pages/feedback/AdminFeedbackFormEditor.tsx
import { useEffect, useState } from "react";
import { getFeedbackForm, saveFeedbackForm } from "../../services/https/feedback/feedback";
import {
  FeedbackFormResponse,
  SaveFormPayload,
  QuestionType,
  IFeedbackQuestion,
  IFeedbackOption,
} from "../../interfaces/IFeedbackForm";
import { Star, Trash2, Plus, BarChart3 } from "lucide-react";
import AdminFeedbackOverview from "./components/AdminFeedbackOverview";
import AdminFeedbackUser from "./components/AdminFeedbackUser";

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


type OptionRow = { id: string; label: string };
type QuestionRow = { id: string; label: string; type: QuestionType; options: OptionRow[] };

export default function AdminFeedbackFormEditor() {
  const [rows, setRows] = useState<QuestionRow[]>([
    { id: uuid(), label: "", type: "rating", options: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const isValid =
    rows.length > 0 &&
    rows.every((q) => {
      const hasLabel = q.label.trim().length > 0;
      if (!hasLabel) return false;
      if (q.type === "choice_single" || q.type === "choice_multi") {
        return q.options.length > 0 && q.options.every((o) => o.label.trim().length > 0);
      }
      return true;
    });

  // Load form
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data: FeedbackFormResponse = await getFeedbackForm();
        if (!alive) return;

        const toRows = (qs: IFeedbackQuestion[]): QuestionRow[] =>
          qs
            .sort((a, b) => a.sort - b.sort)
            .map((q) => ({
              id: uuid(),
              label: q.label,
              type: q.type,
              options:
                (q.type === "choice_single" || q.type === "choice_multi") && q.options
                  ? q.options
                      .slice()
                      .sort((a: IFeedbackOption, b: IFeedbackOption) => a.sort - b.sort)
                      .map((op) => ({ id: uuid(), label: op.label }))
                  : [],
            }));

        if (data.questions?.length) setRows(toRows(data.questions));
        else setRows([{ id: uuid(), label: "", type: "rating", options: [] }]);
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "โหลดแบบฟอร์มไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Handlers
  const addQuestion = () =>
    setRows((r) => [...r, { id: uuid(), label: "", type: "rating", options: [] }]);

  const removeQuestion = (id: string) =>
    setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));

  const patchQuestion = (id: string, patch: Partial<Omit<QuestionRow, "id">>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addOption = (qid: string) =>
    setRows((r) =>
      r.map((q) =>
        q.id === qid ? { ...q, options: [...q.options, { id: uuid(), label: "" }] } : q
      )
    );

  const patchOption = (qid: string, oid: string, label: string) =>
    setRows((r) =>
      r.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, label } : o)) }
          : q
      )
    );

  const removeOption = (qid: string, oid: string) =>
    setRows((r) =>
      r.map((q) =>
        q.id === qid ? { ...q, options: q.options.filter((o) => o.id !== oid) } : q
      )
    );

  // Submit
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setOkMsg(null);
    setErrMsg(null);
    try {
      const payload: SaveFormPayload = {
        questions: rows.map((q, idx) => ({
          label: q.label.trim(),
          type: q.type,
          sort: idx,
          options:
            q.type === "choice_single" || q.type === "choice_multi"
              ? q.options.map((op, i) => ({ label: op.label.trim(), sort: i }))
              : undefined,
        })),
      };
      await saveFeedbackForm(payload);
      setOkMsg("บันทึกแบบฟอร์มสำเร็จ");
    } catch (error) {
      setErrMsg(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/80 shadow grid place-items-center">
            <Star className="h-6 w-6 text-sky-700" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 leading-none">
            จัดการแบบประเมินความพึงพอใจ
          </h1>
        </div>

        {/* Grid: Form + Preview */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form */}
          <form onSubmit={onSubmit} className="rounded-2xl bg-white shadow p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">รายการคำถาม</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-2 text-sm rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50"
                disabled={loading}
              >
                <Plus className="inline h-4 w-4 mr-1" /> เพิ่มคำถาม
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">กำลังโหลดแบบฟอร์ม…</div>
            ) : (
              <div className="space-y-5">
                {rows.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-sky-200/70 bg-sky-50/40 p-4 transition-all hover:border-sky-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-slate-800 font-semibold">
                        <span className="inline-block rounded-md bg-sky-600/10 text-sky-700 px-2 py-0.5 text-xs mr-2">
                          คำถามที่ {idx + 1}
                        </span>
                        <span className="align-middle">ตั้งค่าคำถาม</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="text-sm text-rose-600 hover:underline disabled:opacity-40"
                        disabled={rows.length === 1}
                      >
                        ลบคำถามนี้
                      </button>
                    </div>

                    <label className="block font-medium text-slate-800 mb-2">ข้อความคำถาม</label>
                    <input
                      value={q.label}
                      onChange={(e) => patchQuestion(q.id, { label: e.target.value })}
                      placeholder="พิมพ์ข้อความคำถาม…"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-800 mb-2">ชนิดคำถาม</label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            patchQuestion(q.id, {
                              type: e.target.value as QuestionType,
                              options:
                                e.target.value === "choice_single" || e.target.value === "choice_multi"
                                  ? q.options.length
                                    ? q.options
                                    : [{ id: uuid(), label: "" }]
                                  : [],
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        >
                          <option value="rating">ให้ดาว (1–5)</option>
                          <option value="text">กล่องข้อความ</option>
                          <option value="choice_single">ตัวเลือกเดี่ยว (Radio)</option>
                          <option value="choice_multi">หลายตัวเลือก (Checkbox)</option>
                        </select>
                      </div>

                      <div className="hidden sm:block" />
                    </div>

                    {(q.type === "choice_single" || q.type === "choice_multi") && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-slate-800">ตัวเลือก</div>
                          <button
                            type="button"
                            onClick={() => addOption(q.id)}
                            className="text-sm px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100"
                          >
                            <Plus className="inline h-4 w-4 mr-1" />
                            เพิ่มตัวเลือก
                          </button>
                        </div>
                        <div className="space-y-2">
                          {q.options.map((op) => (
                            <div key={op.id} className="flex items-center gap-2">
                              <input
                                value={op.label}
                                onChange={(e) => patchOption(q.id, op.id, e.target.value)}
                                placeholder="พิมพ์ชื่อตัวเลือก…"
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(q.id, op.id)}
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                                aria-label="ลบตัวเลือก"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errMsg && <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{errMsg}</div>}
            {okMsg && <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2">{okMsg}</div>}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={!isValid || submitting || loading}
                className={[
                  "px-4 py-2 rounded-xl text-white text-sm font-medium transition",
                  isValid && !submitting && !loading
                    ? "bg-sky-600 hover:bg-sky-700"
                    : "bg-sky-300 cursor-not-allowed",
                ].join(" ")}
              >
                {submitting ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
              </button>
            </div>
          </form>

          {/* Preview */}
          <div className="rounded-2xl bg-white shadow p-5 sm:p-6">
            <h2 className="font-semibold text-slate-800 mb-3">พรีวิว (ผู้ใช้จะเห็น)</h2>
            {loading ? (
              <div className="text-sm text-slate-500">กำลังโหลดแบบฟอร์ม…</div>
            ) : (
              <div className="space-y-5">
                {rows.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 font-medium text-slate-800">
                      {q.label || `คำถาม #${idx + 1}`}
                    </div>
                    {q.type === "rating" && (
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className="h-7 w-7 text-yellow-400 fill-yellow-400/90"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    )}
                    {q.type === "text" && (
                      <div className="h-20 rounded-lg border border-slate-200 bg-white" />
                    )}
                    {(q.type === "choice_single" || q.type === "choice_multi") && (
                      <ul className="space-y-2">
                        {q.options.length ? (
                          q.options.map((op) => (
                            <li key={op.id} className="flex items-center gap-2 text-sm text-slate-700">
                              <span
                                className={
                                  q.type === "choice_single"
                                    ? "inline-block h-4 w-4 rounded-full border border-slate-400 bg-white"
                                    : "inline-block h-4 w-4 rounded border border-slate-400 bg-white"
                                }
                              />
                              {op.label || "ตัวเลือก"}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-500">ยังไม่มีตัวเลือก</li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-4 text-slate-800">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/80 shadow grid place-items-center">
              <BarChart3 className="h-6 w-6 text-sky-700" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 leading-none">
              ภาพรวมคะแนนเว็บ
            </h2>
          </div>
          <AdminFeedbackOverview hideHeaderTitle />
        </div>

        <div className="mt-10">
          <AdminFeedbackUser />
        </div>
      </div>
    </div>
  );
}
