import { useState } from "react";
import {   FeedbackFormResponse,
  SaveFormPayload, } from "../../services/https/feedback/feedback";


// สร้าง key จาก label
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

type RatingRow = { id: string; label: string };

export default function AdminFeedbackRatingsWithSingleComment() {
  const [rows, setRows] = useState<RatingRow[]>([
    { id: crypto.randomUUID(), label: "" },
  ]);

  // คำแนะนำท้ายแบบฟอร์ม (มีได้ 1 ช่อง)
  const [enableFinalComment, setEnableFinalComment] = useState<boolean>(true);
  const [finalCommentLabel, setFinalCommentLabel] = useState<string>("ข้อเสนอแนะเพิ่มเติม");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const valid = rows.every((r) => r.label.trim().length > 0);

  const addRow = () =>
    setRows((r) => [...r, { id: crypto.randomUUID(), label: "" }]);

  const removeRow = (id: string) =>
    setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));

  const updateRow = (id: string, label: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, label } : x)));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || submitting) return;

    setSubmitting(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      // สร้างคำถามแบบ rating ทั้งหมดเรียงลำดับ 0..N-1
      let sort = 0;
      for (const r of rows) {
        const payload: CreateQuestionReq = {
          key: slugify(r.label || `rating_${sort}`),
          label: r.label.trim(),
          type: "rating",
          is_active: true,
          sort: sort++,
        };
        await createQuestion(payload);
      }

      // ต่อท้ายด้วยช่องคำแนะนำ 1 ช่อง (ถ้าเปิด)
      if (enableFinalComment) {
        const textPayload: CreateQuestionReq = {
          key: slugify(finalCommentLabel || "suggestion"),
          label: (finalCommentLabel || "ข้อเสนอแนะเพิ่มเติม").trim(),
          type: "text",
          is_active: true,
          sort,
        };
        await createQuestion(textPayload);
      }

      setOkMsg("บันทึกชุดหัวข้อสำเร็จ");
      // reset ฟอร์ม
      setRows([{ id: crypto.randomUUID(), label: "" }]);
      setEnableFinalComment(true);
      setFinalCommentLabel("ข้อเสนอแนะเพิ่มเติม");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
      setErrMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // พรีวิว
  // (removed unused preview variable)

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* หัวการ์ดฟ้า */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-200 to-sky-300 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
          ตั้งหัวข้อ “ให้ดาว” หลายข้อ + ช่องคำแนะนำท้ายแบบฟอร์ม (ตัวเลือก)
        </h1>
        <p className="text-slate-700/80 text-sm">
          กำหนดหัวข้อให้ผู้ใช้ให้คะแนน (1–5) ได้หลายข้อ และเลือกได้ว่าจะมีช่องคอมเมนต์ท้ายแบบฟอร์มเพียง 1 ช่องหรือไม่
        </p>
      </div>

      {/* Layout 2 คอลัมน์บนจอใหญ่ + content กว้าง */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
        {/* ฟอร์ม */}
        <form onSubmit={onSubmit} className="rounded-2xl bg-white shadow p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">รายการหัวข้อให้คะแนน</h2>
            <button
              type="button"
              onClick={addRow}
              className="px-3 py-2 text-sm rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition"
            >
              + เพิ่มหัวข้อ
            </button>
          </div>

          <div className="space-y-5">
            {rows.map((row, i) => (
              <div key={row.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-700 font-medium">หัวข้อที่ {i + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-sm text-rose-600 hover:underline disabled:opacity-40"
                    disabled={rows.length === 1}
                  >
                    ลบหัวข้อนี้
                  </button>
                </div>

                <label className="block font-medium text-slate-800 mb-2">
                  ข้อความหัวข้อ (แสดงกับผู้ใช้)
                </label>
                <input
                  value={row.label}
                  onChange={(e) => updateRow(row.id, e.target.value)}
                  placeholder="เช่น ความพอใจโดยรวมต่อเว็บ / ความง่ายในการใช้งาน"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm 
                             focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            ))}
          </div>

          {/* ช่องคำแนะนำท้ายฟอร์ม (มีได้ 1 ช่อง) */}
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableFinalComment}
                onChange={(e) => setEnableFinalComment(e.target.checked)}
                className="h-5 w-5 accent-sky-500"
              />
              <span className="text-slate-800 font-medium">
                เพิ่ม “ช่องคำแนะนำ” ท้ายแบบฟอร์ม (มีแค่ช่องเดียว)
              </span>
            </label>

            {enableFinalComment && (
              <div className="mt-3">
                <label className="block font-medium text-slate-800 mb-2">
                  ชื่อช่องคำแนะนำ
                </label>
                <input
                  value={finalCommentLabel}
                  onChange={(e) => setFinalCommentLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm 
                             focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            )}
          </div>

          {/* แจ้งสถานะ */}
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

          {/* ปุ่ม */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={!valid || submitting}
              className={[
                "px-4 py-2 rounded-xl text-white text-sm font-medium transition",
                valid && !submitting ? "bg-sky-600 hover:bg-sky-700" : "bg-sky-300 cursor-not-allowed",
              ].join(" ")}
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRows([{ id: crypto.randomUUID(), label: "" }]);
                setEnableFinalComment(true);
                setFinalCommentLabel("ข้อเสนอแนะเพิ่มเติม");
                setOkMsg(null);
                setErrMsg(null);
              }}
              className="px-4 py-2 rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 text-sm font-medium transition"
            >
              ล้างฟอร์ม
            </button>
          </div>
        </form>

        {/* พรีวิว */}
        <div className="rounded-2xl bg-white shadow p-5 sm:p-6">
          <h2 className="font-semibold text-slate-800 mb-3">พรีวิว (ผู้ใช้จะเห็น)</h2>
          <div className="space-y-5">
            {rows.map((r, idx) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-2">{r.label || `หัวข้อให้คะแนน #${idx + 1}`}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-9 w-9 rounded-full bg-yellow-300/70 border border-yellow-400 grid place-items-center text-sm"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {enableFinalComment && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-700 mb-2">
                  {finalCommentLabel || "ข้อเสนอแนะเพิ่มเติม"}
                </div>
                <div className="h-20 rounded-lg border border-slate-200 bg-slate-50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
