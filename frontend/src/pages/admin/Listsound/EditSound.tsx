// import { useEffect, useState, useRef } from "react";
// import { Form, Input, Select, message, Spin } from "antd";
// import { useNavigate, useParams } from "react-router-dom";
// import { getSoundByID, updateSoundByID } from "../../../services/https/sounds";
// import { Play } from "lucide-react";

// const { TextArea } = Input;
// const { Option } = Select;

// function EditSoundPage() {
//   const [form] = Form.useForm();
//   const { id } = useParams<{ id: string }>();
//   const [loading, setLoading] = useState(false);
//   const [soundTypes, setSoundTypes] = useState<any[]>([]);
//   const [stid, setStid] = useState<number | undefined>(undefined);
//   const [soundUrl, setSoundUrl] = useState<string>("");
//   const navigate = useNavigate();
//   const previewRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     fetchSoundTypes();
//     if (id) fetchSound(Number(id));
//   }, [id]);

//   // โหลดประเภทเสียง
//   const fetchSoundTypes = async () => {
//     const types = [
//       { ID: 1, type: "ASMR" },
//       { ID: 2, type: "เสียงธรรมชาติ" },
//       { ID: 3, type: "สวดมนต์" },
//       { ID: 4, type: "ดนตรีบำบัด" },
//     ];
//     setSoundTypes(types);
//   };

//   // โหลดข้อมูลเสียง
//   const fetchSound = async (soundId: number) => {
//     setLoading(true);
//     try {
//       console.log("🔹 Fetching sound with ID:", soundId);
//       const res: any = await getSoundByID(soundId);
//       console.log("📌 API Response:", res);

//       if (!res || !res.data) {
//         console.warn("⚠️ ไม่มีข้อมูลเสียงใน API response");
//         message.error("ไม่พบข้อมูลเสียง");
//         return;
//       }

//       const data = res.data;
//       console.log("📌 Sound Data:", data);

//       const mappedData = {
//         name: data.name,
//         sound: data.sound,
//         owner: data.owner,
//         lyric: data.lyric,
//         description: data.description,
//         stid: data.stid,
//         duration: data.duration,
//       };
//       console.log("📌 Mapped Data for Form:", mappedData);

//       form.setFieldsValue(mappedData);
//       setStid(data.stid);
//       setSoundUrl(data.sound); // เซ็ต state เพื่อ preview อัตโนมัติ
//     } catch (err) {
//       message.error("ไม่สามารถโหลดข้อมูลเสียงได้");
//       console.error("❌ Fetch Sound Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // submit form
//   const handleSubmit = async (values: any) => {
//     if (!id) return;
//     setLoading(true);
//     values.stid = Number(values.stid);
//     values.duration = Number(values.duration);
//     try {
//       await updateSoundByID(Number(id), values);
//       message.success("แก้ไขข้อมูลเสียงสำเร็จ");
//       navigate("/admin/sounds");
//     } catch (err) {
//       message.error("เกิดข้อผิดพลาดในการแก้ไขเสียง");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // preview iframe
//   const handlePreview = () => {
//     const url = soundUrl || form.getFieldValue("sound");
//     const videoId = extractYouTubeID(url);
//     if (videoId && previewRef.current) {
//       previewRef.current.innerHTML = `
//         <iframe width="100%" height="400"
//           src="https://www.youtube.com/embed/${videoId}"
//           frameborder="0"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowfullscreen
//           class="rounded-lg shadow-lg">
//         </iframe>
//       `;
//     } else {
//       message.error("ลิงก์ไม่ถูกต้อง หรือไม่พบวิดีโอ");
//     }
//   };

//   // ดึง video ID
//   const extractYouTubeID = (url: string) => {
//     const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//     const match = url.match(regex);
//     return match ? match[1] : null;
//   };

//   // watch soundUrl เพื่อทำ preview อัตโนมัติ
//   useEffect(() => {
//     if (soundUrl) {
//       handlePreview();
//     }
//   }, [soundUrl]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[60vh]">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-6">
//       <div className="mx-auto md:px-4 max-w-5xl">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">แก้ไขเสียง</h1>

//         <div className="bg-white rounded-2xl shadow-sm p-8">
//           <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Left Column */}
//               <div className="space-y-6">
//                 <Form.Item
//                   label="ชื่อเสียง"
//                   name="name"
//                   rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
//                 >
//                   <Input className="h-10 rounded-lg border-gray-300 focus:border-indigo-500" />
//                 </Form.Item>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Form.Item
//                     label="หมวดหมู่เสียง"
//                     name="stid"
//                     rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่เสียง' }]}
//                   >
//                     <Select
//                       placeholder=""
//                       value={stid}
//                       onChange={(value) => {
//                         setStid(value);
//                         form.setFieldsValue({ stid: value });
//                       }}
//                       allowClear
//                       className="h-10 rounded-lg"
//                     >
//                       {soundTypes.map((type) => (
//                         <Option key={type.ID} value={type.ID}>
//                           {type.type}
//                         </Option>
//                       ))}
//                     </Select>
//                   </Form.Item>

//                   <Form.Item label="เจ้าของเสียง" name="owner">
//                     <Input className="h-10 rounded-lg border-gray-300 focus:border-indigo-500" />
//                   </Form.Item>
//                 </div>

//                 <Form.Item label="คำอธิบาย" name="description">
//                   <TextArea rows={4} className="rounded-lg border-gray-300 focus:border-indigo-500 resize-none" />
//                 </Form.Item>

//                 <Form.Item label="เนื้อเพลง / Lyric" name="lyric">
//                   <TextArea rows={4} className="rounded-lg border-gray-300 focus:border-indigo-500 resize-none" />
//                 </Form.Item>
//               </div>

//               {/* Right Column */}
//               <div className="flex flex-col">
//                 <Form.Item
//                   label="ลิงก์ YouTube"
//                   name="sound"
//                   rules={[{ required: true, message: 'กรุณากรอกลิงก์ YouTube' }]}
//                 >
//                   <div className="flex gap-2">
//                     <Input
//     className="h-10 rounded-lg border-gray-300 focus:border-indigo-500"
//     value={soundUrl} // ผูกค่า value
//     onChange={(e) => {
//       setSoundUrl(e.target.value); 
//       form.setFieldsValue({ sound: e.target.value }); // update form ด้วย
//     }}
//   />
//                     <button
//                       type="button"
//                       className="cursor-pointer h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center"
//                       onClick={handlePreview}
//                     >
//                       <Play className="w-4 h-4 text-blue-500" />
//                     </button>
//                   </div>
//                 </Form.Item>

//                 <Form.Item label="ความยาว (วินาที)" name="duration">
//                   <Input type="number" className="h-10 rounded-lg border-gray-300 focus:border-indigo-500" />
//                 </Form.Item>

//                 <label className="text-sm font-medium text-gray-700 mt-6 mb-2">Preview</label>
//                 <div
//                   className="bg-gray-100 border-dashed border-2 border-blue-400 rounded-lg flex items-center justify-center min-h-[400px]"
//                   ref={previewRef}
//                 >
//                   <div className="text-center text-blue-500">
//                     <Play className="w-12 h-12 mx-auto mb-2 text-blue-500" />
//                     <p>ใส่ลิงก์ YouTube และกดดูตัวอย่าง</p>
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-3 mt-6">
//                   <button
//                     type="button"
//                     onClick={() => navigate("/admin/sounds")}
//                     className="px-6 py-2 text-red-500 hover:text-red-600 bg-transparent"
//                   >
//                     ยกเลิก
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                   >
//                     บันทึกการแก้ไข
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditSoundPage;
