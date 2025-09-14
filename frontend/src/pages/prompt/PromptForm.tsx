// src/pages/prompt/PromptForm.tsx
import { Form, Input, message } from "antd";
import {
  AimOutlined, BgColorsOutlined, FileTextOutlined,
  GlobalOutlined, StopOutlined, UserOutlined, EditOutlined,
  SaveOutlined, PlusOutlined
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { createPrompt, updatePrompt } from "../../services/https/prompt";
import type { IPrompt } from "../../interfaces/IPrompt";

const { TextArea } = Input;

interface PromptFormProps {
  extraButtons?: React.ReactNode;
  editingPrompt?: IPrompt | null;
  onFinishEdit?: (updated: IPrompt) => void;
  onStartCreate?: () => void;
}

export default function PromptForm({
  extraButtons,
  editingPrompt,
  onFinishEdit,
  onStartCreate,
}: PromptFormProps) {
  const [form] = Form.useForm();

  /** มือถือ? → ไม่ใช้ any/fallback แดง ใช้ window.resize แบบ typed */
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** โหลด/ล้างค่าเมื่อสลับโหมด */
  useEffect(() => {
    if (editingPrompt) form.setFieldsValue(editingPrompt);
    else form.resetFields();
  }, [editingPrompt, form]);

  /** ---- ทำให้ “ขยายเท่ากัน” ตอนแก้ไข (เดสก์ท็อป/แท็บเล็ต) ----
   * ดูค่าจริงในฟอร์มด้วย useWatch ทุกช่อง → คำนวณจำนวนแถวของแต่ละช่อง →
   * เอาค่าสูงสุดมาใช้กับทุกกล่อง
   */
  const W_OBJECTIVE   = Form.useWatch("objective",   form) as string | undefined;
  const W_PERSONA     = Form.useWatch("persona",     form) as string | undefined;
  const W_TONE        = Form.useWatch("tone",        form) as string | undefined;
  const W_INSTRUCTION = Form.useWatch("instruction", form) as string | undefined;
  const W_CONSTRAINT  = Form.useWatch("constraint",  form) as string | undefined;
  const W_CONTEXT     = Form.useWatch("context",     form) as string | undefined;

  const DESKTOP_BASE_MIN = 4;     // ขนาดฐานที่คุณโอเคตอนสร้าง
  const DESKTOP_BASE_MAX = 8;
  const DESKTOP_UNIFORM_MAX = 10; // เพดานตอน “ขยายให้เท่ากัน”
  const CHARS_PER_LINE = 70;

  const uniformRows = useMemo(() => {
    // ใช้เฉพาะตอนแก้ไข + ไม่ใช่มือถือ
    if (!editingPrompt || isMobile) return DESKTOP_BASE_MIN;

    const texts = [
      W_OBJECTIVE ?? "",
      W_PERSONA ?? "",
      W_TONE ?? "",
      W_INSTRUCTION ?? "",
      W_CONSTRAINT ?? "",
      W_CONTEXT ?? "",
    ];

    const estimateRows = (t: string) => {
      if (!t) return DESKTOP_BASE_MIN;
      const lines = t.split(/\r?\n/);
      let rows = 0;
      for (const line of lines) {
        const len = line.trim().length;
        rows += Math.max(1, Math.ceil(len / CHARS_PER_LINE));
      }
      return Math.max(rows, DESKTOP_BASE_MIN);
    };

    const needed = texts.reduce((m, t) => Math.max(m, estimateRows(t)), DESKTOP_BASE_MIN);
    return Math.min(needed, DESKTOP_UNIFORM_MAX);
  }, [
    editingPrompt,
    isMobile,
    W_OBJECTIVE, W_PERSONA, W_TONE, W_INSTRUCTION, W_CONSTRAINT, W_CONTEXT,
  ]);

  /** ตั้ง autosize ตามโหมดที่ต้องการ */
  const autoSize =
    isMobile
      ? { minRows: 7, maxRows: 14 }                           // มือถือ: ตามที่ตั้งไว้
      : editingPrompt
        ? { minRows: uniformRows, maxRows: uniformRows }      // แก้ไข (เดสก์ท็อป): ทุกกล่องเท่ากัน
        : { minRows: DESKTOP_BASE_MIN, maxRows: DESKTOP_BASE_MAX }; // สร้างใหม่: ขนาดเดิม

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} className="grid gap-2">
      {/* ชื่อ Prompt */}
      <Form.Item name="name" className="mb-1" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
        <Input
          size="large"
          bordered={false}
          placeholder="ใส่ชื่อพร้อมพ์"
          className="text-xl font-semibold"
          prefix={<EditOutlined className="text-[#2c3e50]" />}
        />
      </Form.Item>

      {/* ฟิลด์หลัก */}
      <div className="min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-4 mr-0 sm:mr-2">
        <Form.Item label={<><AimOutlined /> วัตถุประสงค์</>} name="objective" rules={[{ required: true }]} style={{ marginBottom: 10 }}>
          <TextArea autoSize={autoSize} className="resize-y sm:resize-none" />
        </Form.Item>

        <Form.Item label={<><UserOutlined /> บุคลิกผู้ช่วย</>} name="persona" style={{ marginBottom: 10 }}>
          <TextArea autoSize={autoSize} className="resize-y sm:resize-none" />
        </Form.Item>

        <Form.Item label={<><BgColorsOutlined /> น้ำเสียง</>} name="tone" style={{ marginBottom: 10 }}>
          <TextArea autoSize={autoSize} className="resize-y sm:resize-none" />
        </Form.Item>

        <Form.Item label={<><FileTextOutlined /> คำสั่งเพิ่มเติม</>} name="instruction" style={{ marginBottom: 10 }}>
          <TextArea autoSize={autoSize} className="resize-y sm:resize-none" />
        </Form.Item>

        <Form.Item label={<><StopOutlined /> ข้อจำกัด</>} name="constraint" style={{ marginBottom: 10 }}>
          <TextArea autoSize={autoSize} className="resize-y sm:resize-none" />
        </Form.Item>

        <Form.Item label={<><GlobalOutlined /> ข้อมูลประกอบ</>} name="context" style={{ marginBottom: 10 }}>
          <TextArea autoSize={autoSize} className="resize-y sm:resize-none" />
        </Form.Item>
      </div>

      {/* แถบปุ่มล่าง — อยู่ใต้ฟิลด์จริง ๆ */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div
          className={
            editingPrompt
              ? "w-full sm:w-auto grid grid-cols-2 gap-2 sm:flex sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto"
              : "w-full sm:w-auto grid grid-cols-1 gap-2 sm:flex sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto"
          }
        >
          {extraButtons}
          {editingPrompt && (
            <button
              type="button"
              onClick={() => onStartCreate?.()}
              className="
                inline-flex items-center justify-center gap-2
                h-11 px-4 rounded-lg
                border border-sky-200 bg-sky-50 text-sky-700 font-medium
                shadow-sm hover:shadow-md hover:bg-sky-100
                whitespace-nowrap transition
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-offset-2 focus-visible:ring-sky-300
              "
            >
              <PlusOutlined className="text-[18px] align-middle" />
              เพิ่มพร้อมพ์ใหม่
            </button>
          )}
        </div>

        <button
          type="submit"
          className="
            w-full sm:w-auto
            inline-flex items-center justify-center gap-2
            h-11 px-5 rounded-lg
            bg-sky-300 text-white font-semibold
            shadow-sm hover:shadow-md hover:bg-blue-700 active:translate-y-[1px]
            whitespace-nowrap
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2 focus-visible:ring-blue-500
            transition
          "
          aria-label={editingPrompt ? "บันทึกการแก้ไข" : "บันทึกพร้อมพ์"}
        >
          {editingPrompt
            ? <SaveOutlined className="text-[18px] align-middle" />
            : <PlusOutlined className="text-[18px] align-middle" />}
          <span className="leading-none">
            {editingPrompt ? "บันทึกการแก้ไข" : "บันทึกพร้อมพ์"}
          </span>
        </button>
      </div>
    </Form>
  );

  async function handleSubmit(values: Omit<IPrompt, "id" | "ID">) {
    try {
      if (editingPrompt?.ID) {
        await updatePrompt(editingPrompt.ID, values);
        message.success("แก้ไข Prompt สำเร็จ");
        onFinishEdit?.({ ...editingPrompt, ...values });
      } else {
        await createPrompt(values);
        message.success("เพิ่ม Prompt สำเร็จ");
        form.resetFields();
      }
    } catch {
      message.error("❌ เกิดข้อผิดพลาด");
    }
  }
}
