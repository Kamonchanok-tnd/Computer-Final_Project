import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Form, message } from 'antd';
import { getSoundTypes, createVideo } from '../../../services/https/meditation';
import './meditation.css'; // import CSS ที่แยกออกมา
import { useNavigate } from "react-router-dom";
const { Option } = Select;

const VideoForm: React.FC = () => {
  const [form] = Form.useForm();
  const [soundTypes, setSoundTypes] = useState<any[]>([]);
  const [stid, setStid] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();

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
    if (storedUserId) {
      const idNumber = Number(storedUserId);
      if (!isNaN(idNumber)) {
        setUserId(idNumber);
        form.setFieldsValue({ uid: idNumber });
      } else {
        console.warn('User ID ที่ได้จาก localStorage ไม่ใช่ตัวเลขที่ถูกต้อง:', storedUserId);
      }
    }
  }, [form]);

  const handleSubmit = async (values: any) => {
    if (userId) {
      values.uid = Number(userId);
    }
    values.stid = Number(values.stid);

    try {
      await createVideo(values);
      message.success('เพิ่มข้อมูลสำเร็จ!');
      form.resetFields();
      setStid(undefined);
      form.setFieldsValue({ uid: Number(userId) });
    } catch (err) {
      message.error('เกิดข้อผิดพลาดในการเพิ่มวิดีโอ');
    }
  };

  return (
    <div className="videoform-container">
      <div className="videoform-wrapper">
        <h2 className="videoform-title">เพิ่มข้อมูลคลิปวิดีโอ</h2>

        <div className="videoform-box">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            className="videoform"
          >
            <Form.Item
              label={<span className="videoform-label">ชื่อวิดีโอ</span>}
              name="name"
              rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
            >
              <Input className="videoform-input" />
            </Form.Item>

            <Form.Item
              label={<span className="videoform-label">ลิงก์เสียง (Sound URL)</span>}
              name="sound"
              rules={[{ required: true, message: 'กรุณากรอกลิงก์เสียง' }]}
            >
              <Input className="videoform-input" />
            </Form.Item>

            <Form.Item
              label={<span className="videoform-label">เนื้อเพลง / คำบรรยาย</span>}
              name="lyric"
            >
              <Input.TextArea rows={4} className="videoform-input" />
            </Form.Item>

            <Form.Item
              label={<span className="videoform-label">ประเภทเสียง</span>}
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
                className="videoform-input"
              >
                {soundTypes.map((type) => (
                  <Option key={type.ID} value={type.ID}>
                    {type.type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {userId && (
              <Form.Item
                label={<span className="videoform-label">ผู้ใช้งาน (User ID)</span>}
                name="uid" hidden
              >
                <Input type="number" disabled className="videoform-input" />
              </Form.Item>
            )}

            <Form.Item>
              <div className="videoform-btn-group">
                <Button type="primary" htmlType="submit" size="large">
                  บันทึก
                </Button>
                <Button size="large" onClick={() => navigate("/admin")}>
                  ยกเลิก
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VideoForm;
