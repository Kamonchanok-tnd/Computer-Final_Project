import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, Modal, Tag, Collapse, Upload, Select, message, Spin } from "antd";
import { MenuOutlined, MinusSquareOutlined, PlusSquareOutlined, UploadOutlined, SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../../../interfaces/IEmotionChoices";
import { createQuestions, getAllEmotionChoices } from "../../../../services/https/questionnaire";
import questionIcon from "../../../../assets/question-mark.png";
import manageQuestionAndAnswerIcon from "../../../../assets/manageQuestionAndAnswer.png";

const { Panel } = Collapse;

// โครงสร้างข้อมูลคำถามเเละคำตอบ
interface QuestionWithAnswers {
  question: Question & { priority: number };
  answers: AnswerOption[];
}

// สีพื้นหลังสลับแต่ละข้อ
const bgClasses = [
  "bg-gradient-to-br from-blue-50 to-blue-100",
  "bg-gradient-to-br from-pink-50 to-pink-100",
  "bg-gradient-to-br from-green-50 to-green-100",
  "bg-gradient-to-br from-amber-50 to-amber-100",
  "bg-gradient-to-br from-violet-50 to-violet-100",
];

// การตกเเต่งปุ่มทรงสี่เหลี่ยม 
const squareBtnCls =
  "!p-0 rounded-lg border border-slate-300 bg-white text-gray-700 " +
  "hover:!border-black hover:!text-black active:scale-[.98] " +
  "!h-8 !w-8 sm:!h-9 sm:!w-9 md:!h-10 md:!w-10";

const noRingCls = "!border-none !shadow-none";
const noRingStyle: React.CSSProperties = { boxShadow: "none", outline: "none" };

const FormStepQuestion: React.FC = () => {
  
  // รับค่าที่ถูกส่งมาจากหน้าก่อน
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();

  // รับ questionnaireId / จำนวนข้อ / ชื่อแบบทดสอบ จาก state
  const questionnaireId = (location.state as any)?.questionnaireId as number | undefined;
  const quantity = (location.state as any)?.quantity ?? 1;
  const name = (location.state as any)?.name ?? "";

  // สถานะหลักของหน้า
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);    // ลิสต์คำถามทั้งหมด
  const [activeKeys, setActiveKeys] = useState<string[]>([]);               
  const [previewImage, setPreviewImage] = useState<string | null>(null);    // รูปพรีวิว (Modal)
  const [previewVisible, setPreviewVisible] = useState(false);              // เปิด/ปิด Modal พรีวิว
  const [submitting, setSubmitting] = useState(false);                   
  const [emotionChoices, setEmotionChoices] = useState<EmotionChoice[]>([]); 
  useMemo(() => quantity, [quantity]); 

  //  ตรวจว่ามี questionnaireId 
  useEffect(() => {
    if (!questionnaireId) {
      msg.warning("ไม่พบข้อมูลแบบทดสอบ");
      navigate("/admin/forminfo", { replace: true });
      return;
    }

    // เตรียมโครงคำถามเริ่มต้น (แต่ละข้อมี 4 ตัวเลือกว่าง)
    const init: QuestionWithAnswers[] = Array.from({ length: quantity }, (_, i) => ({
      question: {
        id: 0,
        nameQuestion: "",
        quID: questionnaireId,
        priority: i + 1,     // ลำดับข้อ
        picture: null,       // base64 รูปที่อัปโหลด
      },
      answers: Array.from({ length: 4 }, (_, aIndex) => ({
        id: aIndex,
        description: "",
        point: 0,            // คะแนน (ไม่บังคับ)
        EmotionChoiceID: 0,  // id อารมณ์ (ต้องเลือกเมื่อมีข้อความคำตอบ)
      })),
    }));
    setQuestions(init);
    setActiveKeys(init.map((_, i) => i.toString())); // เปิดทุกข้อไว้ก่อน

    // โหลดตัวเลือกอารมณ์จาก Backend
    (async () => {
      try {
        const data = await getAllEmotionChoices();
        setEmotionChoices(data || []);
      } catch (e) {
        console.error(e);
        msg.error("โหลดตัวเลือกอารมณ์ไม่สำเร็จ");
      }
    })();
  }, [questionnaireId, quantity]);

  // จัดการเปิด/ปิดแผง เเละ ปุ่มขยาย/ย่อทั้งหมด
  const togglePanel = (key: string) =>
    setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
  const collapseAll = () => setActiveKeys([]);

  // จัดเรียงข้อคำถามด้วย drag & drop เเละ อัปเดต priority ใหม่
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setQuestions(
      reordered.map((q, index) => ({
        ...q,
        question: { ...q.question, priority: index + 1 },
      }))
    );
  };

  // อัปเดตข้อความคำถาม
  const updateQuestionText = (qIndex: number, value: string) =>
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], question: { ...updated[qIndex].question, nameQuestion: value } };
      return updated;
    });

  // อัปเดตค่าในคำตอบ (description/point)
  const updateAnswer = (qIndex: number, aIndex: number, field: "description" | "point", value: string | number) =>
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[qIndex].answers];
      (answers[aIndex] as any)[field] = value as any;
      updated[qIndex] = { ...updated[qIndex], answers };
      return updated;
    });

  // ตั้งค่าอารมณ์ให้คำตอบ
  const setAnswerEmotion = (qIndex: number, aIndex: number, emoId: number) =>
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[qIndex].answers];
      answers[aIndex] = { ...answers[aIndex], EmotionChoiceID: emoId };
      updated[qIndex] = { ...updated[qIndex], answers };
      return updated;
    });

  // เพิ่ม/ลบตัวเลือกคำตอบ
  const addAnswer = (qIndex: number) =>
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].answers.push({ id: updated[qIndex].answers.length, description: "", point: 0, EmotionChoiceID: 0 });
      return updated;
    });
  const removeAnswer = (qIndex: number, aIndex: number) =>
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].answers.splice(aIndex, 1);
      return updated;
    });

  // อัปโหลดรูปคำถาม: ตรวจชนิด/ขนาด  แปลง base64 เเล้ว เก็บใน state
  const handleImageUpload = (file: File, qIndex: number) => {
    if (!file.type?.startsWith("image/")) { msg.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น"); return false; }
    if (file.size / 1024 / 1024 >= 5) { msg.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB"); return false; }
    const reader = new FileReader();
    reader.onloadend = () =>
      setQuestions((prev) => {
        const updated = [...prev];
        updated[qIndex] = { ...updated[qIndex], question: { ...updated[qIndex].question, picture: reader.result as string } };
        return updated;
      });
    reader.readAsDataURL(file);
    return false; // ป้องกัน antd อัปโหลดจริง
  };

  // เปิดปิดพรีวิวรูป + ลบรูป
  const handlePreview = (image: string) => { setPreviewImage(image); setPreviewVisible(true); };
  const handleRemoveImage = (qIndex: number) =>
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], question: { ...updated[qIndex].question, picture: null } };
      return updated;
    });

  
    // การตรวจสอบ Validation ก่อนบันทึก
  const normalizeText = (s: string) => (s ?? "").replace(/\s+/g, " ").trim();
  const validateBeforeSubmit = (): string | null => {
    if (!questions.length) return "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ";

    for (const [qi, item] of questions.entries()) {
      const qNo = qi + 1;

      // ถ้ามีแตะข้อมูลคำตอบแล้ว แต่ไม่มีข้อความคำถาม  ให้เตือน
      const hasAnyAnswerInfo = item.answers.some((a) => {
        const desc = normalizeText(a.description);
        const emo = Number(a.EmotionChoiceID || 0);
        const pointFilled = a.point !== undefined && a.point !== null && Number(a.point) !== 0;
        return desc !== "" || emo > 0 || pointFilled;
      });
      if (!item.question.nameQuestion?.trim()) {
        if (hasAnyAnswerInfo) return `กรุณากรอกข้อความคำถามที่ ${qNo} ก่อน (ตรวจพบว่ามีการกรอกคำตอบ/เลือกอารมณ์แล้ว)`;
        return `กรุณากรอกข้อความคำถามที่ ${qNo}`;
      }

      // ถ้าคำตอบยังไม่มีข้อความ แต่มีคะแนน/อารมณ์ ให้เตือนให้กรอกให้ครบ
      for (let ai = 0; ai < item.answers.length; ai++) {
        const a = item.answers[ai];
        const desc = normalizeText(a.description);
        const emo = Number(a.EmotionChoiceID || 0);
        const pointFilled = a.point !== undefined && a.point !== null && Number(a.point) !== 0;
        if (desc === "" && (emo > 0 || pointFilled)) {
          return `คำตอบที่ ${ai + 1} ของคำถามที่ ${qNo} กรอกข้อมูลไม่ครบ (กรุณากรอกข้อความคำตอบด้วย หรือเคลียร์ฟิลด์ที่ไม่ใช้)`;
        }
      }

      // เลือกเฉพาะคำตอบที่มีข้อความจริง
      const validAnswers = item.answers
        .map((a, idx) => ({ ...a, _idx: idx }))
        .filter((a) => normalizeText(a.description) !== "");
      if (!validAnswers.length) return `กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${qNo}`;

      // ข้อความคำตอบห้ามซ้ำ
      const descSeen = new Map<string, number>();
      for (const ans of validAnswers) {
        const key = normalizeText(ans.description);
        if (descSeen.has(key)) {
          const firstIdx = (descSeen.get(key) ?? 0) + 1;
          const dupIdx = ans._idx + 1;
          return `คำตอบซ้ำกันในคำถามที่ ${qNo} (ตัวเลือกที่ ${firstIdx} และ ${dupIdx})`;
        }
        descSeen.set(key, ans._idx);
      }

      // อารมณ์ห้ามซ้ำ 
      const emoSeen = new Map<number, number>();
      for (const ans of validAnswers) {
        const emo = Number(ans.EmotionChoiceID || 0);
        if (!emo) continue;
        if (emoSeen.has(emo)) {
          const firstIdx = (emoSeen.get(emo) ?? 0) + 1;
          const dupIdx = ans._idx + 1;
          return `อารมณ์ซ้ำกันในคำถามที่ ${qNo} (ตัวเลือกที่ ${firstIdx} และ ${dupIdx})`;
        }
        emoSeen.set(emo, ans._idx);
      }

      // ต้องเลือกอารมณ์ให้ทุกคำตอบที่มีข้อความ
      for (const ans of validAnswers) {
        if (!ans.EmotionChoiceID) return `กรุณาเลือกอารมณ์สำหรับคำตอบที่ ${ans._idx + 1} ของคำถามที่ ${qNo}`;
      }
    }
    return null;
  };

  // เมื่อบันทึกสำเร็จจะพาไปหน้าสร้างเกณฑ์การประเมิน
  const goCreateCriteria = (qid: number) => {
    const role = localStorage.getItem("role");
    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
    navigate(`/${rolePrefix}/createCriteriaPage?questionnaireId=${qid}`, {
      state: { questionnaireId: qid, name: name.trim() }, // ส่ง id เเละ name ไปต่อ
      replace: true,
    });
  };

  // กดบันทึกทั้งหมด: ตรวจ validate > แปลงข้อมูล (ตัดคำตอบว่าง) > เรียก API > ไปหน้าถัดไป
  const handleSubmit = async () => {
    if (submitting) return;
    const err = validateBeforeSubmit();
    if (err) return msg.warning(err);

    let didNavigate = false;
    try {
      setSubmitting(true);
      const cleaned = questions.map((q) => ({
        question: q.question,
        answers: q.answers.filter((a) => normalizeText(a.description) !== ""), // ส่งเฉพาะคำตอบที่มีข้อความ
      }));
      await createQuestions(cleaned);
      await new Promise<void>((resolve) => msg.success({ content: "เพิ่มข้อมูลสำเร็จ", duration: 1.2, onClose: resolve }));
      didNavigate = true;
      goCreateCriteria(questionnaireId!);
    } catch (error: any) {
      console.error(error);
      msg.error(error?.message || "เพิ่มข้อมูลไม่สำเร็จ");
    } finally {
      if (!didNavigate) setSubmitting(false);
    }
  };

  // สร้าง URL รูปตัวเลือกอารมณ์ 
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const joinUrl = (base: string, path: string) => `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const buildImageSrc = (picture?: string | null) =>
    !picture
      ? ""
      : /^https?:\/\//i.test(picture)
      ? picture
      : /^\/?images\/emotion_choice\//i.test(picture)
      ? joinUrl(apiUrl, picture)
      : joinUrl(apiUrl, `images/emotion_choice/${picture}`);

  if (!questionnaireId) return null; // ป้องกันเรนเดอร์หากไม่มี id

  // คลาสตกแต่งฟอร์ม
  const inputCls = "!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors";
  const answerInputCls = "w-full !rounded-md !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0";
  const answerNumberCls = "w-full !rounded-md !border-slate-300 hover:!border-black focus-within:!border-black focus-within:!shadow-none";
  const answerSelectCls =
    "w-full [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-slate-300 " +
    "hover:[&_.ant-select-selector]:!border-black focus:[&_.ant-select-selector]:!border-black";
  const toolBtnCls = "h-10 px-3 sm:px-4 rounded-xl font-medium shadow-sm border transition-colors hover:!border-black active:scale-[.99]";

  return (
    <div className="w-full max-w-none min-h-screen p-4 pb-20 sm:p-6 lg:p-8 md:pb-8">
      {contextHolder}
      <Spin spinning={submitting} fullscreen tip="กำลังบันทึกข้อมูล..." />

      {/* ส่วนหัว: ชื่อหน้า + ปุ่มบันทึก (เดสก์ท็อป) */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={manageQuestionAndAnswerIcon} alt="manage" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
          <div>
            <h2 className="text-2xl sm:text-2xl font-bold text-gray-800">สร้างคำถามและคำตอบ</h2>
            <div className="text-sm text-gray-500">แบบทดสอบ ID: {questionnaireId}, ชื่อเเบบทดสอบ: {name}</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={submitting} className="!bg-[#5DE2FF] hover:!bg-cyan-500">
            บันทึกคำถามและคำตอบทั้งหมด
          </Button>
        </div>
      </div>

      {/* ปุ่มควบคุมขยาย/ย่อ ทั้งหมด */}
      <div className="mb-4">
        <div className="w-full flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button className={`${toolBtnCls} !bg-pink-200 !border-pink-300 !text-pink-800 hover:!bg-pink-300`} onClick={expandAll}>
              ขยายทั้งหมด
            </Button>
            <Button className={`${toolBtnCls} !bg-green-200 !border-green-300 !text-green-800 hover:!bg-green-300`} onClick={collapseAll}>
              ย่อทั้งหมด
            </Button>
          </div>
        </div>
      </div>

      {/* เนื้อหา: ลิสต์คำถามที่ลากเรียงได้ */}
      <Form layout="vertical">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="question-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {questions.map((q, qIndex) => {
                  const panelKey = qIndex.toString();
                  return (
                    <Draggable key={`question-${qIndex}`} draggableId={`question-${qIndex}`} index={qIndex}>
                      {(provided2) => (
                        <div
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          className="w-full mb-4 rounded-2xl shadow-sm overflow-hidden"
                          style={provided2.draggableProps.style}
                        >
                          <div className={`rounded-2xl p-2 sm:p-3 ${bgClasses[qIndex % bgClasses.length]}`}>
                            <Collapse activeKey={activeKeys} bordered={false} className="bg-transparent">
                              <Panel
                                key={panelKey}
                                showArrow={false}
                                className="bg-transparent"
                                header={
                                  // แถบหัวข้อของแต่ละข้อ: ชื่อข้อ + ปุ่มเปิด/ปิด + drag handle + แสดงลำดับ
                                  <div className="flex flex-col gap-1 md:gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                      <img src={questionIcon} alt="question" className="w-5 h-5 object-contain" />
                                      <span className="text-base sm:text-lg font-semibold">คำถามข้อที่ {qIndex + 1}</span>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-1 sm:gap-1 md:gap-2 w-full sm:w-auto justify-end self-end sm:self-auto sm:ml-auto">
                                      <Tag color="black" className="text-white rounded-md px-1.5 py-0.5 text-[11px] sm:text-xs md:text-sm">
                                        ลำดับข้อ : {q.question.priority}
                                      </Tag>
                                      <Button
                                        type="default"
                                        icon={activeKeys.includes(panelKey) ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
                                        onClick={(e) => { e.stopPropagation(); togglePanel(panelKey); }}
                                        className={squareBtnCls}
                                      />
                                      <div
                                        {...provided2.dragHandleProps}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`${squareBtnCls} grid place-items-center cursor-grab active:cursor-grabbing`}
                                        title="ลากเพื่อเปลี่ยนลำดับ"
                                      >
                                        <MenuOutlined />
                                      </div>
                                    </div>
                                  </div>
                                }
                              >
                                <div className="flex flex-col gap-4 lg:flex-row">
                                  <div className="flex-1 flex flex-col gap-3">
                                    {/* ช่องกรอกข้อความคำถาม */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                      <label className="text-sm sm:text-base font-semibold">คำถาม:</label>
                                      <Input
                                        placeholder={`คำถามข้อที่ ${qIndex + 1}`}
                                        value={q.question.nameQuestion}
                                        onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                        className={`w-full ${inputCls}`}
                                      />
                                    </div>

                                    {/* ส่วนหัวตาราง (เดสก์ท็อป) */}
                                    <div className="hidden sm:grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700">
                                      <span className="col-span-6">ตัวเลือกคำตอบ</span>
                                      <span className="col-span-2">คะแนน</span>
                                      <span className="col-span-3">อารมณ์</span>
                                      <span className="col-span-1" />
                                    </div>

                                    {/* จัดวางสำหรับมือถือ */}
                                    <div className="sm:hidden space-y-5">
                                      {q.answers.map((a, i) => (
                                        <div key={`m-q${qIndex}-a${i}-${a.id ?? "new"}`} className="rounded-xl border border-slate-200 bg-white/60 p-4">
                                          <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">คำตอบที่ {i + 1} ของข้อ {qIndex + 1}</span>
                                            <Button
                                              danger
                                              type="primary"
                                              size="small"
                                              icon={<DeleteOutlined />}
                                              className="!bg-rose-600 hover:!bg-rose-700 !border-none"
                                              onClick={() => removeAnswer(qIndex, i)}
                                            />
                                          </div>

                                          <div>
                                            <Input
                                              placeholder={`ตัวเลือกที่ ${i + 1}`}
                                              value={a.description}
                                              onChange={(e) => updateAnswer(qIndex, i, "description", e.target.value)}
                                              className={`${answerInputCls}`}
                                            />

                                            <div className="mt-4">
                                              <InputNumber
                                                placeholder="คะแนน (ไม่บังคับ)"
                                                value={a.point}
                                                onChange={(v) => updateAnswer(qIndex, i, "point", Number(v ?? 0))}
                                                min={0}
                                                style={{ width: "100%" }}
                                                className={`${answerNumberCls} !block [&_.ant-input-number-input]:text-center`}
                                              />
                                            </div>

                                            <div className="mt-4">
                                              <Select
                                                placeholder="เลือกอารมณ์"
                                                value={a.EmotionChoiceID || undefined}
                                                onChange={(v) => setAnswerEmotion(qIndex, i, v as number)}
                                                optionLabelProp="label"
                                                showSearch
                                                style={{ width: "100%" }}
                                                className={`${answerSelectCls} !block`}
                                                filterOption={(input, option) =>
                                                  (option?.label as string).toLowerCase().includes(input.toLowerCase())
                                                }
                                              >
                                                {emotionChoices.map((c) => (
                                                  <Select.Option key={c.id} value={c.id} label={c.name}>
                                                    <div className="flex items-center gap-2">
                                                      {c.picture && (
                                                        <img src={buildImageSrc(c.picture)} alt={c.name} className="w-6 h-6 object-cover rounded-full" />
                                                      )}
                                                      <span>{c.name}</span>
                                                    </div>
                                                  </Select.Option>
                                                ))}
                                              </Select>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* เดสก์ท็อป/แท็บเล็ต: grid 12 คอลัมน์ */}
                                    <div className="hidden sm:block">
                                      <div className="space-y-2">
                                        {q.answers.map((a, i) => (
                                          <div key={`q${qIndex}-a${i}-${a.id ?? "new"}`} className="grid grid-cols-12 gap-2">
                                            <Input
                                              placeholder={`ตัวเลือกที่ ${i + 1}`}
                                              value={a.description}
                                              onChange={(e) => updateAnswer(qIndex, i, "description", e.target.value)}
                                              className={`col-span-6 ${answerInputCls}`}
                                            />
                                            <div className="col-span-2">
                                              <InputNumber
                                                placeholder="คะแนน (ไม่บังคับ)"
                                                value={a.point}
                                                onChange={(v) => updateAnswer(qIndex, i, "point", Number(v ?? 0))}
                                                min={0}
                                                className={`${answerNumberCls} [&_.ant-input-number-input]:text-center w-full`}
                                              />
                                            </div>
                                            <Select
                                              className={`col-span-3 ${answerSelectCls}`}
                                              placeholder="เลือกอารมณ์"
                                              value={a.EmotionChoiceID || undefined}
                                              onChange={(v) => setAnswerEmotion(qIndex, i, v as number)}
                                              optionLabelProp="label"
                                              showSearch
                                              filterOption={(input, option) =>
                                                (option?.label as string).toLowerCase().includes(input.toLowerCase())
                                              }
                                            >
                                              {emotionChoices.map((c) => (
                                                <Select.Option key={c.id} value={c.id} label={c.name}>
                                                  <div className="flex items-center gap-2">
                                                    {c.picture && (
                                                      <img src={buildImageSrc(c.picture)} alt={c.name} className="w-6 h-6 object-cover rounded-full" />
                                                    )}
                                                    <span>{c.name}</span>
                                                  </div>
                                                </Select.Option>
                                              ))}
                                            </Select>
                                            <div className="col-span-1 flex">
                                              <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeAnswer(qIndex, i)}
                                                className={`h-8 w-8 !p-0 flex items-center justify-center !bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 ${noRingCls}`}
                                                style={noRingStyle}
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* เพิ่มตัวเลือกคำตอบใหม่ */}
                                    <Button type="dashed" onClick={() => addAnswer(qIndex)}>
                                      + เพิ่มตัวเลือก
                                    </Button>

                                    {/* อัปโหลดรูปคำถาม */}
                                    <Form.Item label={<span className="text-sm sm:text-base font-semibold">อัปโหลดรูป (ถ้ามี)</span>} className="w-full">
                                      {!q.question.picture ? (
                                        <Upload
                                          listType="picture-card"
                                          className="w-full"
                                          beforeUpload={(file) => handleImageUpload(file, qIndex)}
                                          fileList={[]}
                                        >
                                          <div className="flex flex-col items-center justify-center py-4">
                                            <UploadOutlined />
                                            <div className="mt-2">เพิ่มรูปภาพ</div>
                                          </div>
                                        </Upload>
                                      ) : (
                                        <div className="relative inline-block">
                                          <img
                                            src={q.question.picture}
                                            alt="Preview"
                                            className="w-auto h-auto max-w-full sm:max-w-md max-h-[340px] rounded-xl cursor-pointer object-contain"
                                            onClick={() => handlePreview(q.question.picture!)}
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-100 xl:opacity-0 xl:hover:opacity-100 transition-opacity">
                                            <Button
                                              aria-label="ลบรูป"
                                              icon={<DeleteOutlined />}
                                              onClick={() => handleRemoveImage(qIndex)}
                                              type="text"
                                              danger
                                              className={`!text-white !bg-black/60 rounded-full ${noRingCls}`}
                                              style={noRingStyle}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </Form.Item>
                                  </div>
                                </div>
                              </Panel>
                            </Collapse>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder /* กัน layout กระโดดขณะลาก */}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Form>

      {/* แถบปุ่มล่างแบบติดจอสำหรับมือถือ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex gap-2 px-4 py-2">
          <Button
            block
            type="primary"
            className="!bg-[#5DE2FF] hover:!bg-cyan-500"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={submitting}
          >
            บันทึกทั้งหมด
          </Button>
        </div>
      </div>

      {/* Modal พรีวิวรูป */}
      <Modal
        open={previewVisible}
        footer={null}
        centered
        onCancel={() => setPreviewVisible(false)}
        width={720}
        style={{ maxWidth: "150vw" }}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        {previewImage && <img alt="Preview" src={previewImage} className="block w-full h-auto max-h-[100vh] object-contain rounded-xl" />}
      </Modal>
    </div>
  );
};

export default FormStepQuestion;
