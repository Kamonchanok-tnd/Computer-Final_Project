import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {Button, Form, Input, InputNumber, Modal, Tag, Collapse, Upload, Select, message, Spin,} from "antd";
import {DeleteOutlined, MenuOutlined, MinusSquareOutlined, PlusSquareOutlined, UploadOutlined,PlusOutlined, SaveOutlined, RollbackOutlined,} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../../../interfaces/IEmotionChoices";
import {getQuestionsWithAnswersByQuestionnaireID,getAllEmotionChoices,updateQuestionAndAnswer,} from "../../../../services/https/questionnaire";
import manageQuestionAndAnswerIcon from "../../../../assets/manageQuestionAndAnswer.png";
import questionIcon from "../../../../assets/question-mark.png";

const { Panel } = Collapse;

// โครงสร้างข้อมูลคำถามเเละคำตาม
interface QuestionWithAnswers {
  question: Question & { priority: number }; 
  answers: AnswerOption[];
}
type NavState = { questionnaireId?: number };

// สีพื้นหลังสลับแต่ละคำถาม
const bgClasses = [
  "bg-gradient-to-br from-blue-50 to-blue-100",
  "bg-gradient-to-br from-pink-50 to-pink-100",
  "bg-gradient-to-br from-green-50 to-green-100",
  "bg-gradient-to-br from-amber-50 to-amber-100",
  "bg-gradient-to-br from-violet-50 to-violet-100",
];

// การตกเเต่งปุ่มต่างๆ
const squareBtnCls =
  "!p-0 rounded-lg border border-slate-300 bg-white text-gray-700 " +
  "hover:!border-black hover:!text-black active:scale-[.98] " +
  "!h-8 !w-8 sm:!h-9 sm:!w-9 md:!h-10 md:!w-10";
const noRingCls = "!border-none !shadow-none";
const noRingStyle: React.CSSProperties = { boxShadow: "none", outline: "none" };

const EditQuestionAndAnswer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();

  // รับค่า id เเละ name แบบทดสอบจากหน้าสร้างเเบบทดสอบ
  const { questionnaireId } = (location.state as NavState) || {};
  const name = (location.state as any)?.name ?? "";
  
  //  สเตตหลักของหน้า
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);     // รายการคำถาม+คำตอบ
  const [activeKeys, setActiveKeys] = useState<string[]>([]);                
  const [previewImage, setPreviewImage] = useState<string | null>(null);     // รูป preview
  const [previewVisible, setPreviewVisible] = useState(false);               // modal preview
  const [saving, setSaving] = useState(false);                            
  const [emotionChoices, setEmotionChoices] = useState<EmotionChoice[]>([]); 

  const goBack = () => navigate(-1);

  // โหลดข้อมูลเริ่มต้น: ตัวเลือกอารมณ์ เเละ คำถาม/คำตอบของแบบทดสอบนี้ 
  useEffect(() => {
    if (!questionnaireId) {
      msg.warning("ไม่พบข้อมูลแบบทดสอบ");
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
      navigate(`/${rolePrefix}/forminfo`, { replace: true });
      return;
    }
    (async () => {
      try {
        const [ec, serverItems] = await Promise.all([
          getAllEmotionChoices(),
          getQuestionsWithAnswersByQuestionnaireID(questionnaireId),
        ]);
        setEmotionChoices(ec || []);

        // แปลงข้อมูลจากเซิร์ฟเวอร์ให้เป็นรูปแบบที่หน้าใช้งาน
        const normalize = (item: any, idx: number): QuestionWithAnswers => {
          const qRaw = item?.question ?? item ?? {};
          const answersRaw =
            item?.answers ??
            qRaw?.answers ??
            qRaw?.answer_options ??
            qRaw?.AnswerOptions ??
            [];
          const q = {
            id: qRaw.id ?? qRaw.ID ?? 0,
            nameQuestion:
              qRaw.nameQuestion ?? qRaw.NameQuestion ?? qRaw.name_question ?? "",
            quID: qRaw.quID ?? qRaw.QuID ?? qRaw.quid ?? questionnaireId!,
            picture: qRaw.picture ?? qRaw.Picture ?? null,
            priority: qRaw.priority ?? qRaw.Priority ?? idx + 1,
          } as Question & { priority: number };

          const answers: AnswerOption[] = (answersRaw as any[]).map((a) => ({
            id: a.id ?? a.ID ?? 0,
            description: a.description ?? a.Description ?? "",
            point: a.point ?? a.Point ?? 0,
            EmotionChoiceID:
              a.emotionChoiceID ?? a.EmotionChoiceID ?? a.emotion_choice_id ?? 0,
          }));
          return { question: q, answers };
        };

        // เรียงตาม priority และรีเลขลำดับใหม่ให้ต่อเนื่อง
        const mapped = (serverItems || []).map(normalize);
        const prioritized = mapped
          .sort((a, b) => (a.question.priority || 0) - (b.question.priority || 0))
          .map((x, i) => ({ ...x, question: { ...x.question, priority: i + 1 } }));

        setQuestions(prioritized);
        setActiveKeys(prioritized.map((_, i) => i.toString())); // เปิดทุก panel
      } catch (e: any) {
        console.error(e);
        msg.error(e?.message || "โหลดคำถามและคำตอบไม่สำเร็จ");
      }
    })();
  }, [questionnaireId]);

  // จัดการเปิด/ปิดทั้งหมด และลากสลับลำดับคำถาม 
  const togglePanel = (key: string) =>
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
  const collapseAll = () => setActiveKeys([]);

  // เมื่อลากแล้วปล่อย: อัปเดตลำดับ priority ใหม่
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setQuestions(
      reordered.map((q, i) => ({
        ...q,
        question: { ...q.question, priority: i + 1 },
      }))
    );
  };

  // ฟังก์ชันแก้ไขข้อมูลในสเตต (mutators)
  const updateQuestionText = (qi: number, v: string) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = {
        ...next[qi],
        question: { ...next[qi].question, nameQuestion: v },
      };
      return next;
    });

  const updateAnswer = (
    qi: number,
    ai: number,
    field: "description" | "point",
    v: string | number
  ) =>
    setQuestions((prev) => {
      const next = [...prev];
      const answers = [...next[qi].answers];
      answers[ai] = { ...(answers[ai] as any), [field]: v } as any;
      next[qi] = { ...next[qi], answers };
      return next;
    });

  const setAnswerEmotion = (qi: number, ai: number, emoId: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      const answers = [...next[qi].answers];
      answers[ai] = { ...answers[ai], EmotionChoiceID: emoId };
      next[qi] = { ...next[qi], answers };
      return next;
    });
  
  // เพิ่มคำตอบ
  const addAnswer = (qi: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = {
        ...next[qi],
        answers: [
          ...next[qi].answers,
          { id: 0, description: "", point: 0, EmotionChoiceID: 0 },
        ],
      };
      return next;
    });
  
  // ลบคำตอบ
  const removeAnswer = (qi: number, ai: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      const answers = [...next[qi].answers];
      answers.splice(ai, 1);
      next[qi] = { ...next[qi], answers };
      return next;
    });

  // เพิ่มคำถามทั้งข้อ
  const addQuestion = () =>
    setQuestions((prev) => {
      const newItem: QuestionWithAnswers = {
        question: {
          id: 0,
          nameQuestion: "",
          quID: questionnaireId!,
          picture: null,
          priority: prev.length + 1,
        },
        answers: [
          { id: 0, description: "", point: 0, EmotionChoiceID: 0 },
          { id: 1, description: "", point: 0, EmotionChoiceID: 0 },
        ],
      };
      const next = [...prev, newItem];
      setActiveKeys((keys) => [...keys, String(next.length - 1)]); // เปิด panel ข้อใหม่
      return next;
    });
  
  // ลบคำถามทั้งข้อ
  const removeQuestion = (qi: number) =>
    setQuestions((prev) => {
      const arr = [...prev];
      arr.splice(qi, 1);
      
      // รีเลข priority ให้ต่อเนื่อง
      return arr.map((q, i) => ({
        ...q,
        question: { ...q.question, priority: i + 1 },
      }));
    });

  // ส่วนอัปโหลด / พรีวิว / ลบรูปของคำถาม
  const handleImageUpload = (file: File, qi: number) => {
    if (!file.type?.startsWith("image/")) {
      msg.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return false;
    }
    if (file.size / 1024 / 1024 >= 5) {
      msg.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
      return false;
    }
    const fr = new FileReader();
    fr.onloadend = () =>
      setQuestions((prev) => {
        const next = [...prev];
        next[qi] = {
          ...next[qi],
          question: { ...next[qi].question, picture: fr.result as string },
        };
        return next;
      });
    fr.readAsDataURL(file);
    return false; // ปิดอัปโหลดจริงของ antd (เราแปลงเอง)
  };

  // พรีวิวรูป
  const handlePreview = (img: string) => {
    setPreviewImage(img);
    setPreviewVisible(true);
  };
  const handleRemoveImage = (qi: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = {
        ...next[qi],
        question: { ...next[qi].question, picture: null },
      };
      return next;
    });

  // ตรวจความถูกต้องก่อนบันทึก (คำถาม/คำตอบ/อารมณ์) 
  const normalizeText = (s: string) => (s ?? "").replace(/\s+/g, " ").trim();

  const validateBeforeSave = (): string | null => {
    if (!questions.length) return "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ"; // หากไม่มีเลยจะมีการเเจ้งเตือน

    for (const [qi, item] of questions.entries()) {
      const qNo = qi + 1;

      // ถ้าพิมพ์คำตอบหรือเลือกอารมณ์/คะแนนแล้ว แต่ยังไม่กรอกคำถามให้เตือน
      const hasAnyAnswerInfo = item.answers.some((a) => {
        const desc = normalizeText(a.description);
        const emo = Number(a.EmotionChoiceID || 0);
        const pointFilled =
          a.point !== undefined && a.point !== null && Number(a.point) !== 0;
        return desc !== "" || emo > 0 || pointFilled;
      });
      if (!item.question.nameQuestion?.trim()) {
        if (hasAnyAnswerInfo) {
          return `กรุณากรอกข้อความคำถามที่ ${qNo} ก่อน (ตรวจพบว่ามีการกรอกคำตอบ/เลือกอารมณ์แล้ว)`;
        }
        return `กรุณากรอกข้อความคำถามที่ ${qNo}`;
      }

      // ถ้ากรอกคะแนน/อารมณ์ แต่ยังไม่กรอกข้อความคำตอบ ให้เตือน
      for (let ai = 0; ai < item.answers.length; ai++) {
        const a = item.answers[ai];
        const desc = normalizeText(a.description);
        const emo = Number(a.EmotionChoiceID || 0);
        const pointFilled =
          a.point !== undefined && a.point !== null && Number(a.point) !== 0;
        if (desc === "" && (emo > 0 || pointFilled)) {
          return `คำตอบที่ ${ai + 1} ของคำถามที่ ${qNo} กรอกข้อมูลไม่ครบ (กรุณากรอกข้อความคำตอบด้วย หรือเคลียร์ฟิลด์ที่ไม่ใช้)`;
        }
      }

      // ใช้เฉพาะคำตอบที่มีข้อความ
      const validAnswers = item.answers
        .map((a, idx) => ({ ...a, _idx: idx }))
        .filter((a) => normalizeText(a.description) !== "");

      if (!validAnswers.length) {
        return `กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${qNo}`;
      }

      // ข้อความคำตอบห้ามซ้ำในข้อเดียวกัน
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
        if (!ans.EmotionChoiceID) {
          return `กรุณาเลือกอารมณ์สำหรับคำตอบที่ ${ans._idx + 1} ของคำถามที่ ${qNo}`;
        }
      }
    }

    return null;
  };

  // ไปหน้าแก้ไขเกณฑ์ 
  const goEditCriteria = (qid: number) => {
    const role = localStorage.getItem("role");
    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
    navigate(`/${rolePrefix}/editCriteriaPage?questionnaireId=${qid}`, {
      state: { questionnaireId: qid, name: name.trim()}, // ส่ง id เเละ name ไปยังหน้า เเก้ไขเกณฑ์
      replace: true,
    });
  };

  // บันทึกการเเเก้ไข
  const handleSave = async () => {

    // ตรวจสอบ
    const err = validateBeforeSave();
    if (err) return msg.warning(err);

    let didNavigate = false;
    try {
      setSaving(true);
      const payload = questions.map((q) => ({
        question: q.question,
        // ส่งเฉพาะคำตอบที่ “มีข้อความ”
        answers: q.answers.filter((a) => normalizeText(a.description) !== ""),
      }));

      // เรียกใช้ฟังก์ชัน
      await updateQuestionAndAnswer(questionnaireId!, payload);

      await new Promise<void>((r) =>
        msg.success({ content: "แก้ไขข้อมูลสำเร็จ", duration: 1.2, onClose: r })
      );

      didNavigate = true;

      // ไปหน้าต่อไป
      goEditCriteria(questionnaireId!);
    } catch (e: any) {
      console.error(e);
      msg.error(e?.message || "เเก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      if (!didNavigate) setSaving(false);
    }
  };

  // helper แปลง path รูปอารมณ์จาก Backend >> URL เต็ม
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const joinUrl = (base: string, path: string) =>
    `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const buildImageSrc = (p?: string | null) =>
    !p
      ? ""
      : /^https?:\/\//i.test(p)
      ? p
      : /^\/?images\/emotion_choice\//i.test(p)
      ? joinUrl(apiUrl, p)
      : joinUrl(apiUrl, `images/emotion_choice/${p}`);

  if (!questionnaireId) return null;

  // คลาสตกแต่งอินพุตในตารางคำตอบ
  const inputCls =
    "!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors";
  const answerInputCls =
    "w-full !rounded-md !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0";
  const answerNumberCls =
    "w-full !rounded-md !border-slate-300 hover:!border-black focus-within:!border-black focus-within:!shadow-none";
  const answerSelectCls =
    "w-full [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-slate-300 " +
    "hover:[&_.ant-select-selector]:!border-black focus:[&_.ant-select-selector]:!border-black";

  const toolBtnCls =
    "h-10 px-3 sm:px-4 rounded-xl font-medium shadow-sm border transition-colors hover:!border-black active:scale-[.99]";

  return (
    <div className="w-full max-w-none min-h-screen p-4 pb-20 sm:p-6 lg:p-8 md:pb-8">
      {/* การเเจ้งเตือน */}
      {contextHolder}
    
      <Spin spinning={saving} fullscreen tip="กำลังบันทึกข้อมูล..." />

      {/* ส่วนหัว */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={manageQuestionAndAnswerIcon}
            alt="manage"
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
          />
          <div>
            <h2 className="text-2xl sm:text-2xl font-bold text-gray-800">
              แก้ไขคำถามและคำตอบ
            </h2>
            <div className="text-sm text-gray-500">
              แบบทดสอบ ID: {questionnaireId}, ชื่อเเบบทดสอบ: {name}
            </div>
          </div>
        </div>

        {/* ปุ่ม กลับเเละบันทึก สำหรับ (เดสก์ท็อป) */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            icon={<RollbackOutlined />}
            onClick={goBack}
            className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm hover:!border-black hover:!bg-gray-700"
          >
            กลับ
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            className="!bg-[#5DE2FF] hover:!bg-cyan-500"
          >
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>

      {/* ปุ่มจัดการกลางจอ: ขยาย/ย่อ/เพิ่มข้อ */}
      <div className="mb-4">
        <div className="w-full flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              className={`${toolBtnCls} !bg-pink-200 !border-pink-300 !text-pink-800 hover:!bg-pink-300`}
              onClick={expandAll}
            >
              ขยายทั้งหมด
            </Button>
            <Button
              className={`${toolBtnCls} !bg-green-200 !border-green-300 !text-green-800 hover:!bg-green-300`}
              onClick={collapseAll}
            >
              ย่อทั้งหมด
            </Button>
            <Button
              icon={<PlusOutlined />}
              className={`${toolBtnCls} !bg-yellow-200 !border-yellow-300 !text-yellow-800 hover:!bg-yellow-300`}
              onClick={addQuestion}
            >
              เพิ่มคำถาม
            </Button>
          </div>
        </div>
      </div>

      {/* เนื้อหา: ลิสต์คำถามแบบลากเรียงได้ */}
      <Form layout="vertical">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="question-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {questions.map((q, qIndex) => {
                  const panelKey = qIndex.toString();
                  return (
                    <Draggable
                      key={`question-${qIndex}`}
                      draggableId={`question-${qIndex}`}
                      index={qIndex}
                    >
                      {(provided2) => (
                        <div
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          className="w-full mb-4 rounded-2xl shadow-sm overflow-hidden"
                          style={provided2.draggableProps.style}
                        >
                          <div
                            className={`rounded-2xl p-2 sm:p-3 ${
                              bgClasses[qIndex % bgClasses.length]
                            }`}
                          >
                            <Collapse
                              activeKey={activeKeys}
                              bordered={false}
                              className="bg-transparent"
                            >
                              <Panel
                                key={panelKey}
                                showArrow={false}
                                className="bg-transparent"
                                header={

                                  // แถบหัวของแต่ละคำถาม: ชื่อ + ปุ่มลบ/เปิดปิด/ลากเรียง
                                  <div className="flex flex-col gap-1 md:gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={questionIcon}
                                        alt="question"
                                        className="w-5 h-5 object-contain"
                                      />
                                      <span className="text-base sm:text-lg font-semibold">
                                        คำถามข้อที่ {qIndex + 1}
                                      </span>
                                    </div>

                                    {/* ปุ่มจัดการทั้ง 4 ชิดขวา */}
                                    <div className="flex items-center flex-wrap gap-1 sm:gap-1 md:gap-2 w-full sm:w-auto justify-end self-end sm:self-auto sm:ml-auto">
                                      <Tag
                                        color="black"
                                        className="text-white rounded-md px-1.5 py-0.5 text-[11px] sm:text-xs md:text-sm"
                                      >
                                        ลำดับข้อ : {q.question.priority}
                                      </Tag>

                                      {/* ลบทั้งข้อ */}
                                      <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeQuestion(qIndex);
                                        }}
                                        className={`${squareBtnCls} !bg-rose-600 hover:!bg-rose-700 active:!bg-rose-800 ${noRingCls}`}
                                        style={noRingStyle}
                                      />

                                      {/* เปิด/ปิด panel */}
                                      <Button
                                        type="default"
                                        icon={
                                          activeKeys.includes(panelKey) ? (
                                            <MinusSquareOutlined />
                                          ) : (
                                            <PlusSquareOutlined />
                                          )
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePanel(panelKey);
                                        }}
                                        className={squareBtnCls}
                                      />

                                      {/* ที่จับสำหรับลากเรียงลำดับ */}
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
                                      <label className="text-sm sm:text-base font-semibold">
                                        คำถาม:
                                      </label>
                                      <Input
                                        placeholder={`คำถามข้อที่ ${qIndex + 1}`}
                                        value={q.question.nameQuestion}
                                        onChange={(e) =>
                                          updateQuestionText(
                                            qIndex,
                                            e.target.value
                                          )
                                        }
                                        className={`w-full ${inputCls}`}
                                      />
                                    </div>

                                    {/* หัวตาราง (เฉพาะจอใหญ่) */}
                                    <div className="hidden sm:grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700">
                                      <span className="col-span-6">
                                        ตัวเลือกคำตอบ
                                      </span>
                                      <span className="col-span-2">คะแนน</span>
                                      <span className="col-span-3">
                                        อารมณ์
                                      </span>
                                      <span className="col-span-1" />
                                    </div>

                                    {/* มุมมองมือถือ: แสดงคำตอบเป็นการ์ด */}
                                    <div className="sm:hidden space-y-5">
                                      {q.answers.map((a, i) => (
                                        <div
                                          key={`m-q${qIndex}-a${i}-${a.id ?? "new"}`}
                                          className="rounded-xl border border-slate-200 bg-white/60 p-4"
                                        >
                                          <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">
                                              คำตอบที่ {i + 1} ของข้อ {qIndex + 1}
                                            </span>
                                            <Button
                                              danger
                                              type="primary"
                                              size="small"
                                              icon={<DeleteOutlined />}
                                              className="!bg-rose-600 hover:!bg-rose-700 !border-none"
                                              onClick={() =>
                                                removeAnswer(qIndex, i)
                                              }
                                            />
                                          </div>

                                          {/* คำตอบ / คะแนน / อารมณ์ */}
                                          <div>
                                            <Input
                                              placeholder={`ตัวเลือกที่ ${i + 1}`}
                                              value={a.description}
                                              onChange={(e) =>
                                                updateAnswer(
                                                  qIndex,
                                                  i,
                                                  "description",
                                                  e.target.value
                                                )
                                              }
                                              className={`${answerInputCls}`}
                                            />

                                            <div className="mt-4">
                                              <InputNumber
                                                placeholder="คะแนน"
                                                value={a.point}
                                                onChange={(v) =>
                                                  updateAnswer(
                                                    qIndex,
                                                    i,
                                                    "point",
                                                    Number(v ?? 0)
                                                  )
                                                }
                                                min={0}
                                                style={{ width: "100%" }}
                                                className={`${answerNumberCls} !block [&_.ant-input-number-input]:text-center`}
                                              />
                                            </div>

                                            <div className="mt-4">
                                              <Select
                                                placeholder="เลือกอารมณ์"
                                                value={
                                                  a.EmotionChoiceID || undefined
                                                }
                                                onChange={(v) =>
                                                  setAnswerEmotion(
                                                    qIndex,
                                                    i,
                                                    v as number
                                                  )
                                                }
                                                optionLabelProp="label"
                                                showSearch
                                                style={{ width: "100%" }}
                                                className={`${answerSelectCls} !block`}
                                                filterOption={(
                                                  input,
                                                  option
                                                ) =>
                                                  (option?.label as string)
                                                    .toLowerCase()
                                                    .includes(
                                                      input.toLowerCase()
                                                    )
                                                }
                                              >
                                                {emotionChoices.map((c) => (
                                                  <Select.Option
                                                    key={c.id}
                                                    value={c.id}
                                                    label={c.name}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      {c.picture && (
                                                        <img
                                                          src={buildImageSrc(
                                                            c.picture
                                                          )}
                                                          alt={c.name}
                                                          className="w-6 h-6 object-cover rounded-full"
                                                        />
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

                                    {/* มุมมองจอใหญ่: แสดงเป็นแถวในตาราง */}
                                    <div className="hidden sm:block">
                                      <div className="space-y-2">
                                        {q.answers.map((a, i) => (
                                          <div
                                            key={`q${qIndex}-a${i}-${a.id ?? "new"}`}
                                            className="grid grid-cols-12 gap-2"
                                          >
                                            <Input
                                              placeholder={`ตัวเลือกที่ ${i + 1}`}
                                              value={a.description}
                                              onChange={(e) =>
                                                updateAnswer(
                                                  qIndex,
                                                  i,
                                                  "description",
                                                  e.target.value
                                                )
                                              }
                                              className={`col-span-6 ${answerInputCls}`}
                                            />
                                            <div className="col-span-2">
                                              <InputNumber
                                                placeholder="คะแนน"
                                                value={a.point}
                                                onChange={(v) =>
                                                  updateAnswer(
                                                    qIndex,
                                                    i,
                                                    "point",
                                                    Number(v ?? 0)
                                                  )
                                                }
                                                min={0}
                                                className={`${answerNumberCls} [&_.ant-input-number-input]:text-center w-full`}
                                              />
                                            </div>
                                            <Select
                                              className={`col-span-3 ${answerSelectCls}`}
                                              placeholder="เลือกอารมณ์"
                                              value={
                                                a.EmotionChoiceID || undefined
                                              }
                                              onChange={(v) =>
                                                setAnswerEmotion(
                                                  qIndex,
                                                  i,
                                                  v as number
                                                )
                                              }
                                              optionLabelProp="label"
                                              showSearch
                                              filterOption={(
                                                input,
                                                option
                                              ) =>
                                                (option?.label as string)
                                                  .toLowerCase()
                                                  .includes(
                                                    input.toLowerCase()
                                                  )
                                              }
                                            >
                                              {emotionChoices.map((c) => (
                                                <Select.Option
                                                  key={c.id}
                                                  value={c.id}
                                                  label={c.name}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    {c.picture && (
                                                      <img
                                                        src={buildImageSrc(
                                                          c.picture
                                                        )}
                                                        alt={c.name}
                                                        className="w-6 h-6 object-cover rounded-full"
                                                      />
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
                                                onClick={() =>
                                                  removeAnswer(qIndex, i)
                                                }
                                                className={`h-8 w-8 !p-0 flex items-center justify-center !bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 ${noRingCls}`}
                                                style={noRingStyle}
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* เพิ่มตัวเลือกคำตอบภานในคำถาม */}
                                    <Button
                                      type="dashed"
                                      onClick={() => addAnswer(qIndex)}
                                    >
                                      + เพิ่มตัวเลือก
                                    </Button>

                                    {/* อัปโหลดรูปของคำถาม (ไม่บังคับ) */}
                                    <Form.Item
                                      label={
                                        <span className="text-sm sm:text-base font-semibold">
                                          อัปโหลดรูป (ถ้ามี)
                                        </span>
                                      }
                                      className="w-full"
                                    >
                                      {!q.question.picture ? (
                                        <Upload
                                          listType="picture-card"
                                          className="w-full"
                                          beforeUpload={(f) =>
                                            handleImageUpload(f, qIndex)
                                          }
                                          fileList={[]}
                                        >
                                          <div className="flex flex-col items-center justify-center py-4">
                                            <UploadOutlined />
                                            <div className="mt-2">
                                              เพิ่มรูปภาพ
                                            </div>
                                          </div>
                                        </Upload>
                                      ) : (
                                        <div className="relative inline-block">
                                          <img
                                            src={q.question.picture}
                                            alt="Preview"
                                            className="w-auto h-auto max-w-full sm:max-w-md max-h-[340px] rounded-xl cursor-pointer object-contain"
                                            onClick={() =>
                                              handlePreview(
                                                q.question.picture!
                                              )
                                            }
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-100 xl:opacity-0 xl:hover:opacity-100 transition-opacity">
                                            <Button
                                              aria-label="ลบรูป"
                                              icon={<DeleteOutlined />}
                                              onClick={() =>
                                                handleRemoveImage(qIndex)
                                              }
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Form>

      {/* แถบปุ่มล่างสำหรับมือถือ: กลับเเละบันทึก */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex gap-2 px-4 py-2 pb-[env(safe-area-inset-bottom)]">
          <Button
            icon={<RollbackOutlined />}
            onClick={goBack}
            className="rounded-xl border-slate-300 !bg-black px-4 py-2.5 !text-white shadow-sm hover:!border-black hover:!bg-gray-700 flex-1 min-w-[110px]"
          >
            กลับ
          </Button>
          <Button
            type="primary"
            className="!bg-[#5DE2FF] hover:!bg-cyan-500 flex-1 min-w-[110px]"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>

      {/* Modal พรีวิวรูปคำถาม */}
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
        {previewImage && (
          <img
            alt="Preview"
            src={previewImage}
            className="block w-full h-auto max-h-[100vh] object-contain rounded-xl"
          />
        )}
      </Modal>
    </div>
  );
};

export default EditQuestionAndAnswer;
