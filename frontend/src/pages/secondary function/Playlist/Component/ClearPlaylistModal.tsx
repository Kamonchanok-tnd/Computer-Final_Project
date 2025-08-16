import React, { useState } from "react";
import { Modal, Button, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Eraser } from "lucide-react";
import "./customModal.css"
import { useDarkMode } from "../../../../components/Darkmode/toggleDarkmode";

interface ClearPlaylistModalProps {
  pid?: Number;
  onConfirm: () => void;
}

const ClearPlaylistModal: React.FC<ClearPlaylistModalProps> = ({ pid, onConfirm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode } = useDarkMode();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    onConfirm();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
    <Tooltip placement="top" title="ล้างเพลย์ลิส" color="#5DE2FF">
      <button className="dark:text-text-dark text-basic-text hover:text-red-600 hover:bg-red-600/10
       p-2 
      dark:hover:bg-red-600/20 duration-300 transition-colors rounded-full" 
      onClick={showModal} >
        <Eraser size={20} />
      </button></Tooltip>
      <Modal
        title="ยืนยันการล้าง Playlist"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="ใช่, ลบเลย"
        cancelText="ยกเลิก"
       
        className="custom-modal"
 
      >
        <p className="dark:text-text-dark text-basic-text bg-transparent">
          <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
          คุณต้องการล้าง{" "}
          <strong>{ "Playlist นี้"}</strong> ทั้งหมดหรือไม่?
        </p>
      </Modal>
    </>
  );
};

export default ClearPlaylistModal;
