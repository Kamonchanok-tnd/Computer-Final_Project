import { Form, Input, message } from "antd";
import {
  AimOutlined, BgColorsOutlined, FileTextOutlined,
  GlobalOutlined, PlusOutlined, StopOutlined, UserOutlined, EditOutlined
} from "@ant-design/icons";
import { useEffect } from "react";
import { createPrompt, updatePrompt } from "../../services/https/prompt";
import type { IPrompt } from "../../interfaces/IPrompt";

const { TextArea } = Input;

interface PromptFormProps {
  extraButtons?: React.ReactNode;
  editingPrompt?: IPrompt | null;
  onFinishEdit?: () => void;
}

export default function PromptForm({
  extraButtons,
  editingPrompt,
  onFinishEdit,
}: PromptFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingPrompt) form.setFieldsValue(editingPrompt);
    else form.resetFields();
  }, [editingPrompt, form]);

  const handleSubmit = async (values: Omit<IPrompt, "id" | "ID">) => {
    try {
      if (editingPrompt?.ID) {
        await updatePrompt(editingPrompt.ID, values);
        message.success("แก้ไข Prompt สำเร็จ");
        onFinishEdit?.();
      } else {
        await createPrompt(values);
        message.success("เพิ่ม Prompt สำเร็จ");
      }
      form.resetFields();
    } catch {
      message.error("❌ เกิดข้อผิดพลาด");
    }
  };

  const textAreaStyle = {
    height: 96,   // พอดีจอใหญ่
    maxHeight: 96,
    overflow: "auto",
    resize: "none" as const,
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="grid gap-2"
    >
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

      {/* ฟิลด์หลัก: iPad/แท็บเล็ต = แถวเดียว, Desktop ใหญ่ค่อยเป็น 2 คอลัมน์ */}
      <div className="min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-4">
        <Form.Item label={<><AimOutlined /> Objective</>} name="objective" rules={[{ required: true }]} style={{ marginBottom: 10 }}>
          <TextArea style={textAreaStyle} />
        </Form.Item>

        <Form.Item label={<><UserOutlined /> Persona</>} name="persona" style={{ marginBottom: 10 }}>
          <TextArea style={textAreaStyle} />
        </Form.Item>

        <Form.Item label={<><BgColorsOutlined /> Tone</>} name="tone" style={{ marginBottom: 10 }}>
          <TextArea style={textAreaStyle} />
        </Form.Item>

        <Form.Item label={<><FileTextOutlined /> Instruction</>} name="instruction" style={{ marginBottom: 10 }}>
          <TextArea style={textAreaStyle} />
        </Form.Item>

        <Form.Item label={<><StopOutlined /> Constraint</>} name="constraint" style={{ marginBottom: 10 }}>
          <TextArea style={textAreaStyle} />
        </Form.Item>

        <Form.Item label={<><GlobalOutlined /> Context</>} name="context" style={{ marginBottom: 10 }}>
          <TextArea style={textAreaStyle} />
        </Form.Item>
      </div>

      {/* ปุ่มล่าง: สวย/สม่ำเสมอ/Responsive */}
      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {/* ปุ่มเลือก Prompt (ทำให้หน้าตาเป็นปุ่มบน md+ และสูงเท่ากัน) */}
        {!editingPrompt && (
          <div
            className="
              w-full sm:w-auto
              [&>*]:w-full sm:[&>*]:w-auto
              [&>*]:inline-flex [&>*]:items-center [&>*]:justify-center
              [&>*]:h-11 [&>*]:px-4 [&>*]:rounded-lg
              [&>*]:border [&>*]:border-slate-300 [&>*]:bg-white
              [&>*]:text-slate-700 [&>*]:font-medium
              [&>*]:shadow-sm hover:[&>*]:shadow-md
              [&>*]:transition [&>*]:duration-150
              focus-within:[&>*]:outline-none focus-within:[&>*]:ring-2
              focus-within:[&>*]:ring-offset-2 focus-within:[&>*]:ring-slate-300
            "
          >
            {extraButtons}
          </div>
        )}

        {/* ปุ่มบันทึก */}
        <button
          type="submit"
          className="
            w-full sm:w-auto
            inline-flex items-center justify-center gap-2
            h-11 px-5 rounded-lg
            bg-sky-300 text-white font-semibold
            shadow-sm hover:shadow-md hover:bg-blue-700 active:translate-y-[1px]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2 focus-visible:ring-blue-500
            transition
          "
        >
          <PlusOutlined />
          {editingPrompt ? "บันทึกการแก้ไข" : "บันทึก Prompt"}
        </button>
      </div>
    </Form>
  );
}
