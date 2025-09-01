import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {Button,Form,Input,InputNumber,Modal,         Tag,Collapse,Upload,Select,Spin,message} from "antd";
import {DeleteOutlined,MenuOutlined,MinusSquareOutlined,PlusSquareOutlined,UploadOutlined,EyeOutlined,PlusOutlined,SaveOutlined,RollbackOutlined,} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../../../interfaces/IEmotionChoices";
import {getQuestionsWithAnswersByQuestionnaireID,getAllEmotionChoices,updateQuestionAndAnswer,} from "../../../../services/https/questionnaire";
import manageQuestionAndAnswerIcon from "../../../../assets/manageQuestionAndAnswer.png";
import questionIcon from "../../../../assets/question-mark.png";

const { Panel } = Collapse;

interface QuestionWithAnswers {
  question: Question & { priority: number };
  answers: AnswerOption[];
}
type NavState = { questionnaireId?: number; quantity?: number };

const bgClasses = [
  "bg-gradient-to-br from-blue-50 to-blue-100",
  "bg-gradient-to-br from-pink-50 to-pink-100",
  "bg-gradient-to-br from-green-50 to-green-100",
  "bg-gradient-to-br from-amber-50 to-amber-100",
  "bg-gradient-to-br from-violet-50 to-violet-100",
];

//  ยูทิลคลาส/สไตล์: ตัดกรอบ/เงา/outline ของปุ่มให้เนียน
const noRingCls =
  "border-none shadow-none focus:shadow-none focus:outline-none active:shadow-none hover:shadow-none";
const noRingStyle: React.CSSProperties = { boxShadow: "none", outline: "none" };

const EditQuestionAndAnswer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  //  antd message แบบ local instance + holder
  const [msg, contextHolder] = message.useMessage();

  const { questionnaireId, quantity } = (location.state as NavState) || {};

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emotionChoices, setEmotionChoices] = useState<EmotionChoice[]>([]);

  const makeSnapshot = (q: QuestionWithAnswers[]) => JSON.stringify(q);
  const isDirty = useMemo(
    () => makeSnapshot(questions) !== initialSnapshot,
    [questions, initialSnapshot]
  );
  const remaining = useMemo(() => {
    if (typeof quantity === "number") return quantity - questions.length;
    return undefined;
  }, [quantity, questions.length]);

  useEffect(() => {
    if (!questionnaireId) {
      // ❌ ไม่ใช้ Modal — แจ้งสั้นๆ แล้วเด้งกลับ/ไปหน้าเลือก
      msg.warning("ไม่พบข้อมูลแบบทดสอบ");
      navigate("/admin/forminfo", { replace: true });
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        const ec = await getAllEmotionChoices();
        setEmotionChoices(ec || []);

        const serverItems: any[] = (await getQuestionsWithAnswersByQuestionnaireID(
          questionnaireId
        )) as any[];

        const normalize = (item: any, index: number): QuestionWithAnswers => {
          const qRaw = item?.question ?? item ?? {};
          const answersRaw =
            item?.answers ??
            qRaw?.answers ??
            qRaw?.answer_options ??
            qRaw?.AnswerOptions ??
            [];

          const q: Question & { priority: number } = {
            id: qRaw.id ?? qRaw.ID ?? 0,
            nameQuestion:
              qRaw.nameQuestion ?? qRaw.NameQuestion ?? qRaw.name_question ?? "",
            quID: qRaw.quID ?? qRaw.QuID ?? qRaw.quid ?? questionnaireId!,
            picture: qRaw.picture ?? qRaw.Picture ?? null,
            priority: qRaw.priority ?? qRaw.Priority ?? index + 1,
          };

          const answers: AnswerOption[] = (answersRaw as any[]).map((a) => ({
            id: a.id ?? a.ID ?? 0,
            description: a.description ?? a.Description ?? "",
            point: a.point ?? a.Point ?? 0,
            EmotionChoiceID:
              a.emotionChoiceID ?? a.EmotionChoiceID ?? a.emotion_choice_id ?? 0,
          }));

          return { question: q, answers };
        };

        const mapped: QuestionWithAnswers[] = (serverItems || []).map(normalize);

        const prioritized = mapped
          .sort((a, b) => (a.question.priority || 0) - (b.question.priority || 0))
          .map((x, i) => ({
            ...x,
            question: { ...x.question, priority: i + 1 },
          }));

        setQuestions(prioritized);
        setActiveKeys(prioritized.map((_, i) => i.toString()));
        setInitialSnapshot(makeSnapshot(prioritized));
      } catch (e: any) {
        console.error(e);
        msg.error(e?.message || "โหลดคำถามและคำตอบไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionnaireId]);

  const togglePanel = (key: string) =>
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
  const collapseAll = () => setActiveKeys([]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    const updated = reordered.map((q, index) => ({
      ...q,
      question: { ...q.question, priority: index + 1 },
    }));
    setQuestions(updated);
  };

  const updateQuestionText = (qIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        question: { ...updated[qIndex].question, nameQuestion: value },
      };
      return updated;
    });
  };

  const updateAnswer = (
    qIndex: number,
    aIndex: number,
    field: "description" | "point",
    value: string | number
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[qIndex].answers];
      const a = { ...answers[aIndex] } as any;
      a[field] = value;
      answers[aIndex] = a;
      updated[qIndex] = { ...updated[qIndex], answers };
      return updated;
    });
  };

  const setAnswerEmotion = (qIndex: number, aIndex: number, emoId: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[qIndex].answers];
      answers[aIndex] = { ...answers[aIndex], EmotionChoiceID: emoId };
      updated[qIndex] = { ...updated[qIndex], answers };
      return updated;
    });
  };

  const addAnswer = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[qIndex].answers];
      answers.push({ id: 0, description: "", point: 0, EmotionChoiceID: 0 });
      updated[qIndex] = { ...updated[qIndex], answers };
      return updated;
    });
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    // ลบทันที (ไม่มี modal)
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[qIndex].answers];
      answers.splice(aIndex, 1);
      updated[qIndex] = { ...updated[qIndex], answers };
      return updated;
    });
  };

  const addQuestion = () => {
    if (typeof quantity === "number" && questions.length >= quantity) {
      msg.info("ครบจำนวนข้อที่กำหนดแล้ว");
      return;
    }
    setQuestions((prev) => {
      const newIndex = prev.length;
      const nextPriority = newIndex + 1;
      const next = [
        ...prev,
        {
          question: {
            id: 0,
            nameQuestion: "",
            quID: questionnaireId!,
            picture: null,
            priority: nextPriority,
          },
          answers: [
            { id: 0, description: "", point: 0, EmotionChoiceID: 0 },
            { id: 0, description: "", point: 0, EmotionChoiceID: 0 },
          ],
        },
      ];
      setActiveKeys((keys) => [...keys, String(newIndex)]);
      return next;
    });
  };

  const removeQuestion = (qIndex: number) => {
    // ลบทันที (ไม่มี modal)
    setQuestions((prev) => {
      const arr = [...prev];
      arr.splice(qIndex, 1);
      const next = arr.map((q, i) => ({
        ...q,
        question: { ...q.question, priority: i + 1 },
      }));
      setActiveKeys((keys) => keys.filter((k) => k !== String(qIndex)));
      return next;
    });
  };

  const handleImageUpload = (file: File, qIndex: number) => {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      msg.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      msg.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
      return false;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestions((prev) => {
        const updated = [...prev];
        updated[qIndex] = {
          ...updated[qIndex],
          question: { ...updated[qIndex].question, picture: reader.result as string },
        };
        return updated;
      });
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const handleRemoveImage = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        question: { ...updated[qIndex].question, picture: null },
      };
      return updated;
    });
  };

  const validateBeforeSave = (): string | null => {
    if (!questions.length) return "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ";
    for (const [i, item] of questions.entries()) {
      if (!item.question.nameQuestion?.trim()) {
        return `กรุณากรอกข้อความคำถามที่ ${i + 1}`;
      }
      const validAnswers = item.answers.filter((a) => a.description.trim() !== "");
      if (validAnswers.length === 0) return `กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${i + 1}`;
      for (const [j, a] of validAnswers.entries()) {
        if (!a.EmotionChoiceID || a.EmotionChoiceID === 0) {
          return `กรุณาเลือกอารมณ์สำหรับคำตอบที่ ${j + 1} ของคำถามที่ ${i + 1}`;
        }
      }
    }
    return null;
  };

  // helper นำทางแบบ robust: แนบทั้ง state และ query
  const goEditCriteria = (qid: number) => {
    const path = "/admin/editCriteriaPage";
    const url = `${path}?questionnaireId=${qid}`;
    navigate(url, { state: { questionnaireId: qid }, replace: true });
  };

  const handleSave = async () => {
    const err = validateBeforeSave();
    if (err) {
      msg.warning(err);
      return;
    }

    try {
      setSaving(true);
      const payload = questions.map((q) => ({
        question: q.question,
        answers: q.answers.filter((a) => a.description.trim() !== ""),
      }));

      await updateQuestionAndAnswer(questionnaireId!, payload);

      // อัปเดต snapshot เพื่อถือว่า "ไม่มีการแก้ไขค้าง"
      setInitialSnapshot(makeSnapshot(questions));

      // แสดง toast ชัวร์ แล้ว navigate ต่อ (ดีเลย์เล็กน้อยให้ผู้ใช้เห็นข้อความ)
      msg.success("บันทึกสำเร็จ");
      setTimeout(() => goEditCriteria(questionnaireId!), 50);
    } catch (e: any) {
      console.error(e);
      msg.error(e?.message || "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    // กลับทันที ไม่มี modal
    navigate(-1);
  };

  const apiUrl = import.meta.env.VITE_API_URL as string;
  const joinUrl = (base: string, path: string): string =>
    `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const buildImageSrc = (picture: string): string => {
    if (!picture) return "";
    if (/^https?:\/\//i.test(picture)) return picture;
    if (/^\/?images\/emotion_choice\//i.test(picture)) {
      return joinUrl(apiUrl, picture);
    }
    return joinUrl(apiUrl, `images/emotion_choice/${picture}`);
  };

  if (!questionnaireId) return null;

  // ==== คลาสอินพุต ====
  const inputCls =
    "!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors";
  const answerInputCls =
    "w-full !rounded-md !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0";
  const answerNumberCls =
    "w-full !rounded-md !border-slate-300 hover:!border-black focus-within:!border-black focus-within:!shadow-none";
  const answerSelectCls =
    "w-full [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-slate-300 " +
    "hover:[&_.ant-select-selector]:!border-black focus:[&_.ant-select-selector]:!border-black";

  return (
    <div className="w-full max-w-none min-h-screen p-4 pb-20 sm:p-6 lg:p-8 md:pb-8">
      {contextHolder}

      {/* Title Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={manageQuestionAndAnswerIcon}
            alt="manage"
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">แก้ไขคำถามและคำตอบ</h2>
            <div className="text-sm text-gray-500">
              แบบทดสอบ ID: {questionnaireId}
              {typeof quantity === "number" && (
                <Tag color={remaining! < 0 ? "red" : "blue"} className="ml-2">
                  จำนวนข้อที่กำหนด: {quantity}
                  {typeof remaining === "number" && remaining >= 0 && (
                    <> (เหลือเพิ่มได้อีก {remaining})</>
                  )}
                </Tag>
              )}
              {isDirty && <Tag color="orange" className="ml-2">มีการแก้ไข</Tag>}
            </div>
          </div>
        </div>

        {/* ปุ่มควบคุมด้านขวา (เดสก์ท็อป) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={expandAll}>ขยายทั้งหมด</Button>
          <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
          <Button
            icon={<PlusOutlined />}
            onClick={addQuestion}
            disabled={typeof quantity === "number" && questions.length >= quantity}
          >
            เพิ่มคำถาม
          </Button>

          <div className="hidden items-center gap-2 md:flex">
            <Button icon={<RollbackOutlined />} onClick={goBack}>
              กลับ
            </Button>
            <Button type="primary" className="!bg-[#5DE2FF] hover:!bg-cyan-500" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              บันทึกการแก้ไข
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spin size="large" />
        </div>
      ) : (
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
                                  className="bg-transparent"
                                  header={
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <img src={questionIcon} alt="question" className="w-5 h-5 object-contain" />
                                        <span className="text-base sm:text-lg font-semibold">
                                          คำถามข้อที่ {qIndex + 1}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Tag color="black" className="ml-3 text-white rounded-md px-2 py-1 text-xs sm:text-sm">
                                          ลำดับข้อ : {q.question.priority}
                                        </Tag>
                                        {/* ปุ่มลบคำถาม: ไม่มีกรอบ/เงา */}
                                        <Button
                                          danger
                                          type="primary"
                                          icon={<DeleteOutlined />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeQuestion(qIndex);
                                          }}
                                          className={noRingCls}
                                          style={noRingStyle}
                                        />
                                      </div>
                                    </div>
                                  }
                                  extra={
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="text"
                                        icon={activeKeys.includes(panelKey) ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePanel(panelKey);
                                        }}
                                        className="!text-gray-600 hover:!text-gray-800"
                                      />
                                      <div
                                        {...provided2.dragHandleProps}
                                        className="cursor-grab text-lg text-gray-500 hover:text-gray-700"
                                        title="ลากเพื่อเปลี่ยนลำดับ"
                                      >
                                        <MenuOutlined />
                                      </div>
                                    </div>
                                  }
                                >
                                  <div className="flex flex-col gap-4 lg:flex-row">
                                    <div className="flex-1 flex flex-col gap-3">
                                      {/* Question text */}
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <label className="text-sm sm:text-base font-semibold">คำถาม:</label>
                                        <Input
                                          placeholder={`คำถามข้อที่ ${qIndex + 1}`}
                                          value={q.question.nameQuestion}
                                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                          className={`w-full ${inputCls}`}
                                        />
                                      </div>

                                      {/* Header */}
                                      <div className="hidden sm:grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700">
                                        <span className="col-span-6">ตัวเลือกคำตอบ</span>
                                        <span className="col-span-2">คะแนน</span>
                                        <span className="col-span-3">อารมณ์</span>
                                        <span className="col-span-1" />
                                      </div>

                                      {/* Answer rows */}
                                      <div className="space-y-2">
                                        {q.answers.map((a, aIndex) => (
                                          <div key={`q${qIndex}-a${aIndex}-${a.id ?? "new"}`} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                            <Input
                                              placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
                                              value={a.description}
                                              onChange={(e) =>
                                                updateAnswer(qIndex, aIndex, "description", e.target.value)
                                              }
                                              className={`sm:col-span-6 ${answerInputCls}`}
                                              size="middle"
                                            />
                                            <div className="sm:col-span-2">
                                              <InputNumber
                                                placeholder="คะแนน"
                                                value={a.point}
                                                onChange={(value) => updateAnswer(qIndex, aIndex, "point", value || 0)}
                                                min={0}
                                                size="middle"
                                                className={`${answerNumberCls} [&_.ant-input-number-input]:text-center`}
                                              />
                                            </div>
                                            <Select
                                              className={`sm:col-span-3 ${answerSelectCls}`}
                                              placeholder="เลือกอารมณ์"
                                              value={a.EmotionChoiceID || undefined}
                                              onChange={(value) => setAnswerEmotion(qIndex, aIndex, value)}
                                              optionLabelProp="label"
                                              size="middle"
                                              showSearch
                                              filterOption={(input, option) =>
                                                (option?.label as string).toLowerCase().includes(input.toLowerCase())
                                              }
                                            >
                                              {emotionChoices.map((choice) => (
                                                <Select.Option key={choice.id} value={choice.id} label={choice.name}>
                                                  <div className="flex items-center gap-2">
                                                    {choice.picture && (
                                                      <img
                                                        src={buildImageSrc(choice.picture)}
                                                        alt={choice.name}
                                                        className="w-6 h-6 object-cover rounded-full"
                                                      />
                                                    )}
                                                    <span>{choice.name}</span>
                                                  </div>
                                                </Select.Option>
                                              ))}
                                            </Select>
                                            <div className="sm:col-span-1 flex">
                                              {/* ปุ่มลบคำตอบ: ไม่มีกรอบ/เงา */}
                                              <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeAnswer(qIndex, aIndex)}
                                                className={`h-8 w-8 !p-0 flex items-center justify-center ${noRingCls}`}
                                                style={noRingStyle}
                                                size="middle"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <Button type="dashed" onClick={() => addAnswer(qIndex)}>
                                        + เพิ่มตัวเลือก
                                      </Button>

                                      {/* Upload */}
                                      <Form.Item
                                        label={<span className="text-sm sm:text-base font-semibold">อัปโหลดรูป (ถ้ามี)</span>}
                                        className="w-full"
                                      >
                                        {!q.question.picture ? (
                                          <div className="w-full">
                                            <Upload
                                              listType="picture-card"
                                              className="w-full"
                                              beforeUpload={(file) => handleImageUpload(file, qIndex)}
                                              fileList={[]}
                                              onPreview={() => q.question.picture && handlePreview(q.question.picture)}
                                            >
                                              <div className="flex flex-col items-center justify-center py-4">
                                                <UploadOutlined />
                                                <div className="mt-2">เพิ่มรูปภาพ</div>
                                              </div>
                                            </Upload>
                                          </div>
                                        ) : (
                                          <div className="relative inline-block">
                                            <img
                                              src={q.question.picture}
                                              alt="Preview"
                                              className="w-auto h-auto max-w-full sm:max-w-md max-h-[340px] rounded-xl cursor-pointer object-contain"
                                              onClick={() => handlePreview(q.question.picture!)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                                              <Button
                                                icon={<EyeOutlined />}
                                                onClick={() => handlePreview(q.question.picture!)}
                                                type="text"
                                                className={`!text-white !bg-black/50 rounded-full ${noRingCls}`}
                                                style={noRingStyle}
                                              />
                                              <Button
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveImage(qIndex)}
                                                type="text"
                                                danger
                                                className={`!text-white !bg-black/50 rounded-full ${noRingCls}`}
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
      )}

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

      {/* Mobile action bar (sticky) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex gap-2 px-4 py-2">
          <Button block icon={<RollbackOutlined />} onClick={goBack}>
            กลับ
          </Button>
          <Button block type="primary" className="!bg-[#5DE2FF] hover:!bg-cyan-500" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionAndAnswer;


