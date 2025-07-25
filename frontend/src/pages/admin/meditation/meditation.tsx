import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Select, Form, message } from 'antd';
import { getSoundTypes, createVideo } from '../../../services/https/meditation';
import './meditation.css'; // import CSS ที่แยกออกมา
import { useNavigate } from "react-router-dom";
import { Check, CheckCircle, X, Play, Music } from 'lucide-react';
const { Option } = Select;

const VideoForm: React.FC = () => {
  const [form] = Form.useForm();
  const [soundTypes, setSoundTypes] = useState<any[]>([]);
  const [stid, setStid] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);

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
    values.duration = Number(values.duration);
    console.log(values);
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

  const handlePreview = () => {
    const url = form.getFieldValue("sound");
    const videoId = extractYouTubeID(url);
    if (videoId && previewRef.current) {
      previewRef.current.innerHTML = `
        <iframe width="100%" height="400"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="rounded-lg shadow-lg">
        </iframe>
      `;
    } else {
      message.error("ลิงก์ไม่ถูกต้อง หรือไม่พบวิดีโอ");
    }
  };
  
  // ดึง video ID จาก youtube link
  const extractYouTubeID = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className=" mx-auto md:px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-800">สร้างคอนเทนต์เสียง</h1>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            className="space-y-6"
          >
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2  gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Row 1: ชื่อ  */}
                <div className="grid grid-cols-1 gap-4">
                  <Form.Item
                    label={<span className="text-sm font-medium text-gray-700">ชื่อ</span>}
                    name="name"
                    rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
                  >
                    <Input 
                      className="h-10 rounded-lg border-gray-300 focus:border-indigo-500" 
                      placeholder=""
                    />
                  </Form.Item>

                
                {/* Row 2: หมวดหมู่ + ผู้จัดทำ*/}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Form.Item
                    label={<span className="text-sm font-medium text-gray-700">หมวดหมู่</span>}
                    name="stid"
                    rules={[{ required: true, message: 'กรุณาเลือกประเภทเสียง' }]}
                  >
                    <Select
                      placeholder=""
                      value={stid}
                      onChange={(value) => {
                        setStid(value);
                        form.setFieldsValue({ stid: value });
                      }}
                      allowClear
                      className="h-10"
                      style={{ height: '40px' }}
                    >
                      {soundTypes.map((type) => (
                        <Option key={type.ID} value={type.ID}>
                          {type.type}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">จัดทำโดย</span>}
                  name="Owner"
                  rules={[{ required: true, message: 'กรุณากรอกชื่อผู้จัดทำ' }]}
                >
                  <Input 
                    className="h-10 rounded-lg border-gray-300 focus:border-indigo-500" 
                    placeholder=""
                  />
                </Form.Item>
                </div>
                </div>
                {/* Row 3: คำอธิบาย + คําบรรยาย*/}
               <div className='grid grid-cols-1 gap-4'>
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">คำอธิบาย</span>}
                  name="description"
                >
                  <Input.TextArea 
                    rows={8} 
                    className="rounded-lg border-gray-300 focus:border-indigo-500 resize-none" 
                    placeholder=""
                  />
                </Form.Item> 
                <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">คำบรรยาย</span>}
                  name="lyric"
                >
                  <Input.TextArea 
                    rows={8} 
                    className="rounded-lg border-gray-300 focus:border-indigo-500 resize-none" 
                    placeholder=""
                  />
                </Form.Item>
               </div>
              </div>

              {/* Right Column - Preview */}
              <div className="flex flex-col">
               <div className='grid grid-cols-1 gap-4 '>
                  <Form.Item
                  label={<span className="text-sm font-medium text-gray-700">Url เสียง</span>}
                  name="sound"
                  rules={[{ required: true, message: 'กรุณากรอกลิงก์เสียง' }]}
                >
                  <div className="flex gap-2">
                    <Input 
                      className="h-10 rounded-lg border-gray-300 focus:border-indigo-500" 
                      placeholder=""
                    />
                    <button
                      type='button'
                      className="cursor-pointer h-10 w-10 bg-background-button border-none rounded-lg flex items-center justify-center"
                      onClick={handlePreview}
                    >
                      <Play className="w-4 h-4 text-blue-word" />
                    </button>
                  </div>
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label={<span className="text-sm font-medium text-gray-700">ความยาว</span>}
                    name="duration"
                    rules={[{ required: true, message: 'กรุณากรอกความยาว' }]}
                  >
                    <div className="flex">
                      <Input 
                        className="h-10 rounded-l-lg border-gray-300 focus:border-indigo-500" 
                        placeholder=""
                        type="number"
                        step="0.01"
                      />
                      <span className=" px-3 h-10 flex items-center text-gray-600 rounded-r-lg text-sm">
                        นาที
                      </span>
                    </div>
                  </Form.Item>
                  <div></div>
                </div>
                </div>
                <label className="text-sm font-medium text-gray-700  mt-6 mb-2">Preview</label>
                <div 
                  className=" bg-background-button rounded-lg flex items-center justify-center min-h-[400px]"
                  ref={previewRef}
                >
                  <div className="text-center text-blue-word">
                    <Play className="w-12 h-12 mx-auto mb-2 text-blue-word" />
                    <p>ใส่ลิงก์ YouTube และกดดูตัวอย่าง</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => navigate("/admin")}
                className="px-6 py-2 text-red-500 hover:text-red-600 border-none shadow-none bg-transparent"
              >
                ยกเลิก
              </button>
              <button 
                className="px-6 bg-button-blue text-white hover:bg-cyan-500 border-cyan-400 rounded-lg"
              >
                บันทึก
              </button>
            </div>
              </div>
            </div>

            {/* Hidden User ID Field */}
            {userId && (
              <Form.Item name="uid" hidden>
                <Input type="number" />
              </Form.Item>
            )}

        
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VideoForm;