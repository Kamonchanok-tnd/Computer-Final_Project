import { Modal, Form, Input, message } from "antd";
import { useState } from "react";
import { CreatePlaylist } from "../../../../services/https/playlist";

interface ModalPlaylistProps {
  isModalOpen: boolean;
  onClose: () => void;
  gotoPlaylist: (id : number) => void
}

function ModalPlaylist({ isModalOpen, onClose, gotoPlaylist }: ModalPlaylistProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    setLoading(true);
    values.uid = Number(localStorage.getItem("id"));
    values.bid = 1;

    // แนบ stid เฉพาะเมื่อต้องการ (อย่าแนบ 0)
    const selectedStid = 3; // ตัวอย่าง ถ้าคุณมี UI ให้เลือก
    if (selectedStid) {
      values.stid = selectedStid;
    }
    console.log("Submitted Playlist Name:", values);
    const res = await CreatePlaylist(values);
    if (!res.ID){
      message.error("เกิดข้อผิดพลาดในการสร้างเพลย์ลิสต์ กรุณาลองใหม่อีกครั้ง");
      onClose();
      return
    }
    message.success("สร้างเพลย์ลิสต์สำเร็จ!");
    gotoPlaylist(res.ID);
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
      className="custom-modal "
     

    >
      
      <Form layout="vertical" form={form}>
        <div className="font-ibmthai font-semibold">
          <h1 className="text-xl  text-basic-text mb-4 text-center mt-2 dark:text-text-dark">สร้างเพลย์ลิสต์</h1>
        </div>

        <h1 className="text-xl text-basic-text mb-1 text-center font-ibmthai dark:text-text-dark">กรุณากรอกชื่อเพลย์ลิสต์</h1>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อเพลย์ลิสต์" }]}
          className="font-ibmthai "
        >
          <Input placeholder="เช่น เสียงผ่อนคลายก่อนนอน" className="placeholder:font-ibmthai font-ibmthai 
        placeholder:text-gray-400    
      dark:placeholder:text-gray-200"></Input>
        </Form.Item>
      </Form>

     
      <div className="flex justify-end gap-4 mt-4 font-ibmthai">
    <button onClick={onClose}>ยกเลิก</button>
    <button
      onClick={handleSubmit}
      className="  bg-button-blue duration-300 hover:bg-button-blue-hover text-white px-4 py-2 rounded-lg"
    >
      บันทึก
    </button>
  </div>

    </Modal>
  );
}

export default ModalPlaylist;
