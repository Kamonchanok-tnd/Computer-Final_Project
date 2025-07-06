import { Form, Input, message } from 'antd';
import {
  AimOutlined,
  BgColorsOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PlusOutlined,
  StopOutlined,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { createPrompt } from '../../services/https/prompt';
import { IPrompt } from '../../interfaces/IPrompt'; // ✅ เพิ่มบรรทัดนี้

const { TextArea } = Input;

interface PromptFormProps {
  extraButtons?: React.ReactNode;
}

export default function PromptForm({ extraButtons }: PromptFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: Omit<IPrompt, 'id'>) => { // ✅ เพิ่ม type ให้ values
    try {
      await createPrompt(values);
      message.success('✅ เพิ่ม Prompt สำเร็จ');
      form.resetFields();
    } catch (error) {
      message.error('❌ เกิดข้อผิดพลาด');
      console.error(error);
    }
  };

  return (
    <div className="bg-white sm:rounded-xl sm:shadow-lg sm:p-6 p-2 rounded-md">
      <h2 className="text-xl mb-4 flex items-center gap-2 text-[#2c3e50]">
        <EditOutlined />
        เพิ่ม Prompt ใหม่
      </h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <AimOutlined />
                Objective
              </span>
            }
            name="objective"
            rules={[{ required: true }]}
          >
            <TextArea rows={2} placeholder="ใส่วัตถุประสงค์ของ AI..." />
          </Form.Item>

          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <UserOutlined />
                Persona
              </span>
            }
            name="persona"
          >
            <TextArea rows={2} placeholder="ลักษณะบุคลิกของ AI..." />
          </Form.Item>
          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <BgColorsOutlined />
                Tone
              </span>
            }
            name="tone"
          >
            <TextArea rows={2} placeholder="น้ำเสียง/โทนที่ต้องการ..." />
          </Form.Item>

          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <FileTextOutlined />
                Instruction
              </span>
            }
            name="instruction"
          >
            <TextArea rows={2} placeholder="คำแนะนำการทำงาน..." />
          </Form.Item>

          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <StopOutlined />
                Constraint
              </span>
            }
            name="constraint"
          >
            <TextArea rows={2} placeholder="ข้อจำกัดในการตอบกลับ..." />
          </Form.Item>

          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <GlobalOutlined />
                Context
              </span>
            }
            name="context"
          >
            <TextArea rows={2} placeholder="บริบทเพิ่มเติม..." />
          </Form.Item>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-6">
          {extraButtons}
          <button
            type="submit"
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-blue-400 text-white text-base font-medium rounded-md shadow hover:bg-blue-700 transition-all"
          >
            <PlusOutlined />
            บันทึก Prompt
          </button>
        </div>
      </Form>
    </div>
  );
}
