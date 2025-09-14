import { Modal } from "antd";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: (e?: React.MouseEvent<HTMLElement>) => void;
  onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
  loading?: boolean;
}

const DeleteConfirmModal = ({ open, onConfirm, onCancel, loading }: DeleteConfirmModalProps) => {
  return (
    <Modal
      title="ยืนยันการลบ Playlist"
      open={open}
      onOk={(e) => {
        e?.stopPropagation(); // ✅ ป้องกัน click ไป parent
        onConfirm();
      }}
      onCancel={(e) => {
        e?.stopPropagation();
        onCancel();
      }}
      okText="ลบ"
      cancelText="ยกเลิก"
      confirmLoading={loading}
      className="custom-modal"
    >
      <p>คุณแน่ใจหรือไม่ว่าต้องการลบ Playlist นี้?</p>
    </Modal>
  );
};

export default DeleteConfirmModal;
