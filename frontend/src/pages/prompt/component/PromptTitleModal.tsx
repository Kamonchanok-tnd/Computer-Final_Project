// src/pages/prompt/components/PromptTitleModal.tsx
import { Modal } from 'antd';

interface PromptTitleModalProps {
  open: boolean;
  titleText: string | null;
  onClose: () => void;
}

export default function PromptTitleModal({ open, titleText, onClose }: PromptTitleModalProps) {
  return (
    <Modal
      title="OBJECTIVE"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <p>{titleText}</p>
    </Modal>
  );
}
// This component displays a modal with the full title of a prompt when the user clicks to view it.