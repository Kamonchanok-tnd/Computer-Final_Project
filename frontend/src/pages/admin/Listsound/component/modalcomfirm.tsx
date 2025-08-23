import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import "./customdeletemodal.css"

interface ConfirmDeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  content?: string;
  videoName?: string; 
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    open,
    onCancel,
    onConfirm,
    title = "คุณแน่ใจหรือไม่?",
    content,
    videoName 
  }) => {
    return (
      <Modal
        open={open}
        title={title}
        onCancel={onCancel}
        onOk={onConfirm}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        className="custom-delete-modal" 
      >
         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <ExclamationCircleOutlined style={{ color: "#f97316", fontSize: "20px" }} />
    <span>{content ?? `คุณต้องการลบวิดีโอ "${videoName}" จริงหรือไม่?`}</span>
  </div>
      </Modal>
    );
  };
  

export default ConfirmDeleteModal;
