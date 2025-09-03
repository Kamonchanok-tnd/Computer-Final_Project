import React, { useState, useEffect, useRef } from "react";
import { Input,  Select, Form, message } from "antd";
import { getSoundTypes } from "../../../services/https/meditation";
import "./meditation.css"; // import CSS ที่แยกออกมา
import { useNavigate, useParams } from "react-router-dom";
import { Play } from "lucide-react";
import { getSoundByID, updateSoundByID } from "../../../services/https/sounds";
const { Option } = Select;

export const formatDurationHMS = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
};

// แปลง h:mm:ss -> วินาที
export const parseDurationHMS = (input: string) => {
  const parts = input.split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
};

const EditSound: React.FC = () => {
  const [form] = Form.useForm();
  const [soundTypes, setSoundTypes] = useState<any[]>([]);
  const [stid, setStid] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const { id } = useParams();
  const [originalURL, setOriginalURL] = useState<string>("");

  const fetchVideo = async () => {
    try {
      const res = await getSoundByID(Number(id));
      const videoData = res.data;
      console.log("Video data:", res.data);
      form.setFieldsValue({
        name: videoData.name,
        Owner: videoData.owner,
        sound: videoData.sound,
        description: videoData.description,
        lyric: videoData.lyric,
        duration: formatDurationHMS(videoData.duration),
        stid: videoData.stid,
        uid: videoData.uid,
      });
      setOriginalURL(videoData.sound);
      setStid(videoData.STID); // set select
      console.log("Form values after set:", form.getFieldsValue());
    } catch (error) {
      message.error("โหลดข้อมูลวิดีโอไม่สำเร็จ");
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  useEffect(() => {
    const fetchSoundTypes = async () => {
      try {
        const types = await getSoundTypes();
        setSoundTypes(types);
      } catch (error) {
        message.error("ไม่สามารถโหลดประเภทเสียงได้");
      }
    };

    fetchSoundTypes();

    const storedUserId = localStorage.getItem("id");
    if (storedUserId) {
      const idNumber = Number(storedUserId);
      if (!isNaN(idNumber)) {
        setUserId(idNumber);
        form.setFieldsValue({ uid: idNumber });
      } else {
        console.warn(
          "User ID ที่ได้จาก localStorage ไม่ใช่ตัวเลขที่ถูกต้อง:",
          storedUserId
        );
      }
    }
  }, [form]);

  const handleSubmit = async (values: any) => {
    
    if (userId) {
      values.uid = Number(userId);
    }
    values.stid = Number(values.stid);
    values.duration = parseDurationHMS(values.duration);
    console.log(values);
    try {
      await updateSoundByID(Number(id),values);
      message.success("แก้ไขข้อมูลสําเร็จ!");
      form.resetFields();
      setStid(undefined);
      form.setFieldsValue({ uid: Number(userId) });
      setTimeout(() => {
           navigate("/admin/sounds");
      }, 2000);
     
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการแก้ไข");
    }
  };

  const handlePreview = () => {
    const url = form.getFieldValue("sound");
    const videoId = extractYouTubeID(url);
    if (!videoId) {
      message.error("ลิงก์ไม่ถูกต้อง หรือไม่พบวิดีโอ");
      return;
    }

    // แสดง iframe
    if (previewRef.current) {
      previewRef.current.innerHTML = `<div id="yt-player"></div>`;
    }

    // โหลด YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const waitForYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player("yt-player", {
          height: "400",
          width: "100%",
          videoId,
          events: {
            onReady: (event: any) => {
              const durationSeconds = event.target.getDuration();
              const formatted = formatDurationHMS(durationSeconds);
              form.setFieldsValue({ duration: formatted });
            
            },
          },
        });
      } else {
        setTimeout(waitForYT, 300);
      }
    };
    waitForYT();
  };

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className=" mx-auto md:px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-800">
            แก้ไขเสียง
          </h1>
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
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        ชื่อ
                      </span>
                    }
                    name="name"
                    rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                  >
                    <Input
                      className="custom-input h-10 rounded-lg border-gray-300 focus:border-indigo-500 "
                      placeholder=""
                    />
                  </Form.Item>

                  {/* Row 2: หมวดหมู่ + ผู้จัดทำ*/}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          หมวดหมู่
                        </span>
                      }
                      name="stid"
                      rules={[
                        { required: true, message: "กรุณาเลือกประเภทเสียง" },
                      ]}
                    >
                      <Select
                        placeholder=""
                        value={stid}
                        onChange={(value) => {
                          setStid(value);
                          form.setFieldsValue({ stid: value });
                        }}
                        allowClear
                        className="custom-select h-10"
                        style={{ height: "40px" }}
                      >
                        {soundTypes.map((type) => (
                          <Option key={type.ID} value={type.ID}>
                            {type.type}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          จัดทำโดย
                        </span>
                      }
                      name="Owner"
                      rules={[
                        { required: true, message: "กรุณากรอกชื่อผู้จัดทำ" },
                      ]}
                    >
                      <Input
                        className="h-10 rounded-lg border-gray-300 focus:border-indigo-500"
                        placeholder=""
                      />
                    </Form.Item>
                  </div>
                </div>
                {/* Row 3: คำอธิบาย + คําบรรยาย*/}
                <div className="grid grid-cols-1 gap-4">
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        คำอธิบาย
                      </span>
                    }
                    name="description"
                  >
                    <Input.TextArea
                      rows={8}
                      className="rounded-lg border-gray-300 focus:border-indigo-500 resize-none"
                      placeholder=""
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        คำบรรยาย
                      </span>
                    }
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
                <div className="grid grid-cols-1 gap-4 ">
                  <Form.Item label="URL เสียง" required>
                    <div className="flex gap-2">
                      <Form.Item
                        name="sound"
                        noStyle
                        rules={[
                          { required: true, message: "กรุณากรอกลิงก์เสียง" },
                        ]}
                      >
                        <Input
                          className="h-10 rounded-lg border-gray-300 focus:border-indigo-500"
                          placeholder=""
                        />
                      </Form.Item>
                      <button
                        type="button"
                        className="cursor-pointer h-10 w-10 bg-background-button border-none rounded-lg flex items-center justify-center"
                        onClick={handlePreview}
                      >
                        <Play className="w-4 h-4 text-blue-word" />
                      </button>
                    </div>
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                  <Form.Item label="ความยาว" required>
                  <Form.Item name="duration" noStyle rules={[{ required: true }]}>
                    <Input placeholder="h:mm:ss"disabled/>
                  </Form.Item>
                </Form.Item>

                    <div></div>
                  </div>
                </div>
                <label className="text-sm font-medium text-gray-700  mt-6 mb-2">
                  Preview
                </label>
                <div
                  className=" bg-background-button/20 border-dashed border-2 border-blue-word rounded-lg flex items-center justify-center min-h-[400px]"
                  ref={previewRef}
                >
                  <div className="text-center text-blue-word ">
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
                  <button className="px-6 bg-button-blue text-white hover:bg-cyan-500 border-cyan-400 rounded-lg">
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

export default EditSound;
