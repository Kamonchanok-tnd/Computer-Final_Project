import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Form, message } from 'antd';
import { getSoundTypes, createVideo } from '../../../services/https/meditation';
const { Option } = Select;

const VideoForm: React.FC = () => {
  const [form] = Form.useForm();
  const [soundTypes, setSoundTypes] = useState<any[]>([]);
  const [stid, setStid] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSoundTypes = async () => {
      try {
        const types = await getSoundTypes();
        setSoundTypes(types);
      } catch (error) {
        message.error('ไม่สามารถโหลดประเภทเสียงได้');
      }
    };

    fetchSoundTypes();

    const storedUserId = localStorage.getItem('id');
    console.log("id page meditation :",storedUserId)
    if (storedUserId) {
  const idNumber = Number(storedUserId); // แปลงเป็น number
  if (!isNaN(idNumber)) {
    setUserId(idNumber); // ✅ ไม่มี error แล้ว
    form.setFieldsValue({ uid: idNumber });
  } else {
    console.warn('User ID ที่ได้จาก localStorage ไม่ใช่ตัวเลขที่ถูกต้อง:', storedUserId);
  }
}

  }, [form]);

  const handleSubmit = async (values: any) => {
  if (userId) {
    values.uid = Number(userId); // ✅ แปลง uid เป็น number
  }
  values.stid = Number(values.stid); // ✅ ดีแล้ว

  console.log('ส่งข้อมูลไป backend:', values);

  try {
    await createVideo(values);
    message.success('เพิ่มข้อมูลสำเร็จ!');
    form.resetFields();
    setStid(undefined);
    form.setFieldsValue({ uid: Number(userId) }); // หรือไม่ set ก็ได้เพราะ field นี้ disabled
  } catch (err) {
    console.error('Error from backend:', err);
    message.error('เกิดข้อผิดพลาดในการเพิ่มวิดีโอ');
  }
};

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">เพิ่มข้อมูลคลิปวิดีโอ</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="ชื่อวิดีโอ"
          name="name"
          rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ลิงก์เสียง (Sound URL)"
          name="sound"
          rules={[{ required: true, message: 'กรุณากรอกลิงก์เสียง' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="เนื้อเพลง / คำบรรยาย" name="lyric">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="ประเภทเสียง (Sound Type ID)"
          name="stid"
          rules={[{ required: true, message: 'กรุณาเลือกประเภทเสียง' }]}
        >
          <Select
            placeholder="เลือกประเภทเสียง"
            value={stid}
            onChange={(value) => {
              setStid(value);
              form.setFieldsValue({ stid: value });
            }}
            allowClear
          >
            {soundTypes.map((type) => (
              <Option key={type.ID} value={type.ID}>
                {type.type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {userId && (
          <Form.Item label="ผู้ใช้งาน (User ID)" name="uid">
            <Input type="number" disabled />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            บันทึก
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VideoForm;
