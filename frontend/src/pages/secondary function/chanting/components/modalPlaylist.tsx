import { Modal, Form, Input, Button, message } from "antd";
import { useState } from "react";

interface ModalPlaylistProps {
  isModalOpen: boolean;
  onClose: () => void;
}

function ModalPlaylist({ isModalOpen, onClose }: ModalPlaylistProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: ส่งข้อมูลไป backend หรือจัดการตามต้องการ
      console.log("Submitted Playlist Name:", values.name);
      message.success("สร้างเพลย์ลิสต์สำเร็จ!");

      form.resetFields();
      onClose(); // ปิด modal
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
     

    >
      
      <Form layout="vertical" form={form}>
        <div>
          <h1 className="text-xl  text-basic-text mb-4 text-center mt-2">สร้างเพลย์ลิสต์</h1>
        </div>
        <Form.Item
         
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อเพลย์ลิสต์" }]}
        > 
         <h1 className="text-xl  text-basic-text mb-4 text-center">กรุณากรอกชื่อเพลย์ลิสต์</h1>
          <Input placeholder="เช่น เสียงผ่อนคลายก่อนนอน" />
        </Form.Item>
      </Form>
     
      <div className="flex justify-end gap-4 mt-4">
    <button onClick={onClose}>ยกเลิก</button>
    <button
      onClick={handleSubmit}
      className="bg-button-blue duration-300 hover:bg-button-blue-hover text-white px-4 py-2 rounded-lg"
    >
      บันทึก
    </button>
  </div>

    </Modal>
  );
}

export default ModalPlaylist;
