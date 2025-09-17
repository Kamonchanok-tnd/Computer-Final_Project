import { Modal, Form, Input, message } from "antd";
import { useState } from "react";
import { CreatePlaylist } from "../../../../services/https/playlist";
import { useNavigate } from "react-router-dom";

interface PlayermediameditationProps {
  isModalOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // callback สำหรับ refresh & message
}

function PlaylistMeditation({ isModalOpen, onClose, onSuccess }: PlayermediameditationProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ฟังก์ชัน redirect
  const gotoPlaylist = (id: number) => {
    navigate(`/editplaylist/${id}`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // เพิ่ม uid และประเภทอัตโนมัติ
      values.uid = Number(localStorage.getItem("id"));
      values.stid = 2; // สมาธิ
      values.bid = 2;

      console.log("Submitted Playlist:", values);

      const res = await CreatePlaylist(values);

      // ตรวจสอบว่ามี ID จริง ๆ
      if (!res?.ID) {
        message.error("เกิดข้อผิดพลาดในการสร้างเพลย์ลิสต์ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      // สำเร็จ
      message.success("สร้างเพลย์ลิสต์สำเร็จ!");
      //onSuccess?.();
      gotoPlaylist(res.ID); // redirect ไป edit playlist
      form.resetFields();
      onClose();

    } catch (error) {
      console.error("Validation failed", error);
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isModalOpen}
      confirmLoading={loading}
      onCancel={onClose}
      footer={null}
      className="font-ibmthai"
    >
      <Form layout="vertical" form={form} className="font-ibmthai">
        <h1 className="text-xl text-basic-text mb-4 text-center mt-2">สร้างเพลย์ลิสต์</h1>

        <h1 className="text-xl text-basic-text mb-1 text-center">กรุณากรอกชื่อเพลย์ลิสต์</h1>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อเพลย์ลิสต์" }]}
        >
          <Input placeholder="เช่น เสียงผ่อนคลายก่อนนอน" className="font-ibmthai" />
        </Form.Item>
      </Form>

      <div className="flex justify-end gap-4 mt-4 font-ibmthai">
        <button onClick={onClose}>ยกเลิก</button>
        <button
          onClick={handleSubmit}
          className="bg-button-blue duration-300 hover:bg-button-blue-hover text-white px-4 py-2 rounded-lg"
        >
          บันทึกนะจ้ะ
        </button>
      </div>
    </Modal>
  );
}

export default PlaylistMeditation;
