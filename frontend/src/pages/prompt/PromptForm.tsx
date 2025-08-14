import { Form, Input, message } from 'antd';
import {
  AimOutlined, BgColorsOutlined, FileTextOutlined,
  GlobalOutlined, PlusOutlined, StopOutlined, UserOutlined, EditOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import { createPrompt, updatePrompt } from '../../services/https/prompt';
import { IPrompt } from '../../interfaces/IPrompt';

const { TextArea } = Input;

interface PromptFormProps {
  extraButtons?: React.ReactNode;
  editingPrompt?: IPrompt | null;
  onFinishEdit?: () => void;
}

export default function PromptForm({ extraButtons, editingPrompt, onFinishEdit }: PromptFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingPrompt) {
      form.setFieldsValue(editingPrompt);
    } else {
      form.resetFields();
    }
  }, [editingPrompt, form]);

  const handleSubmit = async (values: Omit<IPrompt, 'id' | 'ID'>) => {
    try {
      if (editingPrompt?.ID) {
        await updatePrompt(editingPrompt.ID, values);
        message.success('แก้ไข Prompt สำเร็จ');
        onFinishEdit?.();
      } else {
        await createPrompt(values);
        message.success('เพิ่ม Prompt สำเร็จ');
      }
      form.resetFields();
    } catch {
      message.error('❌ เกิดข้อผิดพลาด');
    }
  };

  const textAreaStyle = {
    height: 140,
    maxHeight: 140,
    overflow: 'auto',
    resize: 'none' as const,
  };

  return (
    <div className="bg-white sm:rounded-xl sm:shadow-lg sm:p-6 p-2 rounded-md">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* ช่องกรอกชื่อ Prompt พร้อมไอคอนในกล่อง */}
        <Form.Item
          name="name"
          className="mb-4"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            bordered={false}
            placeholder="เช่น GreetingBot หรือ ChatHelper"
            className="text-xl font-semibold"
            prefix={<EditOutlined className="text-[#2c3e50]" />}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item label={<><AimOutlined /> Objective</>} name="objective" rules={[{ required: true }]}>
            <TextArea rows={5} style={textAreaStyle} />
          </Form.Item>
          <Form.Item label={<><UserOutlined /> Persona</>} name="persona">
            <TextArea rows={5} style={textAreaStyle} />
          </Form.Item>
          <Form.Item label={<><BgColorsOutlined /> Tone</>} name="tone">
            <TextArea rows={5} style={textAreaStyle} />
          </Form.Item>
          <Form.Item label={<><FileTextOutlined /> Instruction</>} name="instruction">
            <TextArea rows={5} style={textAreaStyle} />
          </Form.Item>
          <Form.Item label={<><StopOutlined /> Constraint</>} name="constraint">
            <TextArea rows={5} style={textAreaStyle} />
          </Form.Item>
          <Form.Item label={<><GlobalOutlined /> Context</>} name="context">
            <TextArea rows={5} style={textAreaStyle} />
          </Form.Item>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-6">
          {!editingPrompt && extraButtons}

          <button
            type="submit"
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-blue-400 text-white text-base font-medium rounded-md shadow hover:bg-blue-700 transition-all"
          >
            <PlusOutlined />
            {editingPrompt ? 'บันทึกการแก้ไข' : 'บันทึก Prompt'}
          </button>
        </div>
      </Form>
    </div>
  );
}
