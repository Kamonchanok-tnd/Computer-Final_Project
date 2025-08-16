import { Modal } from "antd";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmModal = ({ open, onConfirm, onCancel, loading }: DeleteConfirmModalProps) => {
  return (
    <Modal
      title="ยืนยันการลบ Playlist"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="ลบ"
      cancelText="ยกเลิก"
      
      className="custom-modal"
    >
      <p>คุณแน่ใจหรือไม่ว่าต้องการลบ Playlist นี้?</p>
    </Modal>
  );
};

export default DeleteConfirmModal;
