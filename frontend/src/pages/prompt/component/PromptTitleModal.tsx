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
      open={open}
      onCancel={onClose}
      footer={null}
      centered                          // อยู่กึ่งกลางแนวตั้ง
      destroyOnClose
      maskClosable
      width="min(100vw - 32px, 680px)"  // กว้างแบบ responsive
      title={
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-500" />
          <span className="tracking-wide text-slate-800 font-semibold">OBJECTIVE</span>
        </div>
      }
      styles={{
        content: { borderRadius: 16 },                         // มุมโค้งที่กล่องโมดัล
        header: { borderBottom: '1px solid rgba(15,23,42,.08)' },
        body: { padding: 16 },
      }}
    >
      {/* เนื้อหา: ไม่มีการ์ดซ้อนอีกต่อไป */}
      <div className="relative">
        <div className="pl-4 text-[14px] leading-7 text-slate-800 whitespace-pre-line">
          {titleText || '-'}
        </div>
      </div>
    </Modal>
  );
}
