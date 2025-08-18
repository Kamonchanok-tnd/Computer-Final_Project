import { Modal } from 'antd';
import { useState } from 'react';
import { UnorderedListOutlined } from '@ant-design/icons';
import PromptList from '../PromptList';
import { IPrompt } from '../../../interfaces/IPrompt';

export default function PromptSelector({ onEditPrompt }: { onEditPrompt?: (prompt: IPrompt) => void }) {
  const [open, setOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpen = () => {
    setRefreshTrigger((prev) => prev + 1);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-all"
      >
        <UnorderedListOutlined />
        พร้อมพ์ทั้งหมด
      </button>

      <Modal
  open={open}
  onCancel={() => setOpen(false)}
  footer={null}
  destroyOnClose
  maskClosable
  /** กว้างมากสุด 1000px แต่ไม่เกินขอบจอ - 24px */
  width="min(100vw - 24px, 1000px)"
  styles={{ body: { padding: 0 } }}
  title={null}
  centered
>
  <div className="px-4 sm:px-5 py-4">
    <PromptList
      refreshTrigger={refreshTrigger}
      onEditPrompt={onEditPrompt ?? (() => {})}
    />
  </div>
</Modal>

    </>
  );
}
