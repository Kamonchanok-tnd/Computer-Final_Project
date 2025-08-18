import { Modal, Form, Input,  Select } from "antd";
import { useState } from "react";
import { CreatePlaylist } from "../../../../services/https/playlist";

interface PlayermediameditationProps {
  isModalOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // ✅ เพิ่ม callback สำหรับ refresh & message
}

function PlaylistMeditation({ isModalOpen, onClose , onSuccess}: PlayermediameditationProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    setLoading(true);

    const uid = Number(localStorage.getItem("id"));
    const { stid } = values;

    values.uid = uid;

    // ✅ ตั้งค่า background ID ตามประเภทเพลย์ลิสต์
    if (stid === 2) {
      values.bid = 2; // สมาธิ
    } else if (stid === 3) {
      values.bid = 3; // ฝึกลมหายใจ
    }

    console.log("Submitted Playlist:", values);
    await CreatePlaylist(values);
    onSuccess?.(); // ✅ เรียกเมื่อสร้างสำเร็จ
    

    form.resetFields();
    onClose();
  } catch (error) {
    console.error("Validation failed", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal
  open={isModalOpen}
  confirmLoading={loading}
  onCancel={onClose}
  okText="บันทึก"
  cancelText="ยกเลิก"
  footer={null}
  className="font-ibmthai" // ✅ ใส่ฟอนต์ IBM Thai ให้ Modal ทั้งหมด
>
  <Form layout="vertical" form={form} className="font-ibmthai">
    <div>
      <h1 className="text-xl text-basic-text mb-4 text-center mt-2">สร้างเพลย์ลิสต์</h1>
    </div>

    {/* ชื่อเพลย์ลิสต์ */}
    <h1 className="text-xl text-basic-text mb-1 text-center">กรุณากรอกชื่อเพลย์ลิสต์</h1>
    <Form.Item
      name="name"
      rules={[{ required: true, message: "กรุณากรอกชื่อเพลย์ลิสต์" }]}
    >
      <Input placeholder="เช่น เสียงผ่อนคลายก่อนนอน" className="font-ibmthai" />
    </Form.Item>

    {/* เลือกประเภทเสียง */}
    <Form.Item
      name="stid"
      label="ประเภทเพลย์ลิสต์"
      rules={[{ required: true, message: "กรุณาเลือกประเภทเพลย์ลิสต์" }]}
    >
      <Select placeholder="เลือกประเภทเพลย์ลิสต์" className="font-ibmthai">
        <Select.Option value={2}>นั่งสมาธิ</Select.Option>
        <Select.Option value={3}>ฝึกลมหายใจ</Select.Option>
      </Select>
    </Form.Item>
  </Form>

  {/* ปุ่ม */}
  <div className="flex justify-end gap-4 mt-4">
    <button onClick={onClose} className="font-ibmthai">ยกเลิก</button>
    <button
      onClick={handleSubmit}
      className="bg-button-blue duration-300 hover:bg-button-blue-hover text-white px-4 py-2 rounded-lg font-ibmthai"
    >
      บันทึก
    </button>
  </div>
</Modal>

  );
}

export default PlaylistMeditation;
