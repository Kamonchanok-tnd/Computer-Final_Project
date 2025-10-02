// path: frontend/src/pages/feedback/UserFeedbackModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, Star } from "lucide-react";
import { createPortal } from "react-dom";

import {
  getUserFeedbackForm,
  submitUserFeedback,
} from "../../../services/https/feedback/feedback";
import {
  FeedbackFormResponse,
  IFeedbackQuestion,
  IFeedbackOption,
  QuestionType,
} from "../../../interfaces/IFeedbackForm";
import { SubmitFeedbackPayload } from "../../../interfaces/IFeedbackUser";

type Props = {
  uid: number;
  open: boolean;
  onClose: () => void;
  periodKey?: string;
};

// เก็บสถานะด้วย "index ของคำถาม" เพื่อกัน q.id ซ้ำข้ามกลุ่ม
type DraftAnswer = {
  questionIndex: number;
  rating?: number;
  text?: string;
  optionIndex?: number;
  optionIndexes?: number[];
};
type DraftAnswerMap = Record<number, DraftAnswer>;

function StarRating({
  value,
  onChange,
  size = 28,
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`ให้ ${n} ดาว`}
          disabled={disabled}
          onClick={() => onChange(n)}
          className="focus:outline-none"
        >
          <Star
            className={`transition ${n <= value ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  );
}

export default function UserFeedbackModal({ uid, open, onClose, periodKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FeedbackFormResponse | null>(null);
  const [answers, setAnswers] = useState<DraftAnswerMap>({});
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // โหลดฟอร์มเมื่อเปิด
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!open) return;
      setOkMsg(null);
      setErrMsg(null);
      setLoading(true);
      try {
        const data = await getUserFeedbackForm();
        if (!alive) return;
        setForm(data);

        // init โดยใช้ questionIndex (ไม่ทับคำตอบเดิม)
        setAnswers((prev) => {
          const next: DraftAnswerMap = { ...prev };
          (data.questions ?? []).forEach((q: IFeedbackQuestion, qi: number) => {
            if (!next[qi]) {
              next[qi] = {
                questionIndex: qi,
                ...(q.type === "choice_multi" ? { optionIndexes: [] } : {}),
              };
            }
          });
          return next;
        });
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "โหลดแบบฟอร์มไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [open]);

  // ตรวจความครบถ้วน
  const canSubmit = useMemo(() => {
    const qs = form?.questions ?? [];
    if (!qs.length) return false;
    return qs.every((q, qi) => {
      const a = answers[qi];
      if (!a) return false;
      switch (q.type as QuestionType) {
        case "rating":
          return typeof a.rating === "number" && a.rating >= 1 && a.rating <= 5;
        case "text":
          return typeof a.text === "string" && a.text.trim().length > 0;
        case "choice_single":
          return typeof a.optionIndex === "number";
        case "choice_multi":
          return Array.isArray(a.optionIndexes) && a.optionIndexes.length > 0;
        default:
          return false;
      }
    });
  }, [answers, form]);

  // อัปเดตแบบ merge เฉพาะข้อที่เปลี่ยน (index-safe)
  function setAnswer(qi: number, patch: Partial<DraftAnswer>) {
    setAnswers((prev) => {
      const current: DraftAnswer = prev[qi] ?? { questionIndex: qi };
      return { ...prev, [qi]: { ...current, ...patch } };
    });
  }

  // ส่งคำตอบ: map questionIndex -> question_id จริง
  async function onSubmit() {
    const qs = form?.questions ?? [];
    if (!qs.length || saving || !canSubmit) return;

    setSaving(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      const payload: SubmitFeedbackPayload = {
        uid,
        period_key: periodKey,
        answers: qs.map((q, qi) => {
          const a = answers[qi];
          const qid = q.id;

          if (q.type === "rating") {
            return { question_id: qid, rating: a?.rating ?? 0 };
          }
          if (q.type === "text") {
            return { question_id: qid, text: (a?.text ?? "").trim() };
          }
          if (q.type === "choice_single") {
            const idx = a?.optionIndex ?? -1;
            const opId = q.options?.[idx]?.id;
            return typeof opId === "number"
              ? { question_id: qid, option_id: opId }
              : { question_id: qid };
          }
          // multi
          const idxs = a?.optionIndexes ?? [];
          const ids = idxs
            .map((i) => q.options?.[i]?.id)
            .filter((v): v is number => typeof v === "number");
          return ids.length ? { question_id: qid, option_ids: ids } : { question_id: qid };
        }),
      };

      await submitUserFeedback(payload);
      setOkMsg("ขอบคุณสำหรับการประเมินของคุณ");
      setTimeout(() => onClose(), 900);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "ส่งแบบประเมินไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const questions = form?.questions ?? [];

  // ===== MODAL CONTENT (wrapped) =====
  const modal = (
    <div className="fixed inset-0 z-[10000]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => (saving ? null : onClose())}
      />
      {/* modal */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center ">
        <div className="w-full sm:max-w-2xl sm:rounded-2xl bg-white shadow-xl sm:m-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">แบบประเมินความพึงพอใจ</h3>
            <button
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              onClick={onClose}
              disabled={saving}
              aria-label="ปิด"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="text-sm text-slate-500">กำลังโหลดแบบฟอร์ม…</div>
            ) : (
              <div className="space-y-5">
                {questions.map((q: IFeedbackQuestion, qi: number) => (
                  <div key={`q-${qi}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-2 font-medium text-slate-900">{q.label}</div>

                    {q.type === "rating" && (
                      <StarRating
                        value={answers[qi]?.rating ?? 0}
                        onChange={(v) => setAnswer(qi, { rating: v })}
                      />
                    )}

                    {q.type === "text" && (
                      <textarea
                        rows={3}
                        value={answers[qi]?.text ?? ""}
                        onChange={(e) => setAnswer(qi, { text: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                        placeholder="พิมพ์ความเห็นของคุณ…"
                      />
                    )}

                    {(q.type === "choice_single" || q.type === "choice_multi") && (
                      <div className="mt-1 grid gap-2">
                        {(q.options ?? []).map((op: IFeedbackOption, oi: number) => {
                          const groupName = `q-${qi}`;
                          const inputId = `q-${qi}-op-${oi}`;

                          if (q.type === "choice_single") {
                            const selected = answers[qi]?.optionIndex === oi;
                            return (
                              <label
                                key={inputId}
                                htmlFor={inputId}
                                className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer"
                              >
                                <input
                                  id={inputId}
                                  type="radio"
                                  name={groupName}
                                  checked={!!selected}
                                  onChange={() => setAnswer(qi, { optionIndex: oi })}
                                  className="h-4 w-4 accent-sky-600"
                                />
                                <span>{op.label}</span>
                              </label>
                            );
                          }

                          // MULTI
                          const current = answers[qi]?.optionIndexes ?? [];
                          const selected = current.includes(oi);

                          return (
                            <label
                              key={inputId}
                              htmlFor={inputId}
                              className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer"
                            >
                              <input
                                id={inputId}
                                type="checkbox"
                                name={groupName}
                                checked={!!selected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const before = answers[qi]?.optionIndexes ?? [];
                                  const next = checked
                                    ? Array.from(new Set([...before, oi]))
                                    : before.filter((x) => x !== oi);
                                  setAnswer(qi, { optionIndexes: next });
                                }}
                                className="h-4 w-4 accent-sky-600"
                              />
                              <span>{op.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errMsg && (
              <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
                {errMsg}
              </div>
            )}
            {okMsg && (
              <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
                {okMsg}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-medium"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit || saving}
              className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${
                canSubmit && !saving ? "bg-sky-600 hover:bg-sky-700" : "bg-sky-300 cursor-not-allowed"
              }`}
            >
              {saving ? "กำลังส่ง..." : "ส่งแบบประเมิน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ส่งออกด้วย Portal (ใช้ #modal-root ถ้ามี ไม่งั้น fallback เป็น body)
  const host = document.getElementById("modal-root") ?? document.body;
  return createPortal(modal, host);
}
