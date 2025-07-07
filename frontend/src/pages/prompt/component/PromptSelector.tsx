import { Modal } from 'antd';
import { useState } from 'react';
import { UnorderedListOutlined } from '@ant-design/icons';
import PromptList from '../PromptList';
import { IPrompt } from '../../../interfaces/IPrompt'; // ✅ เพิ่ม import

// ✅ เพิ่ม prop: onEditPrompt
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
        เลือกจาก Prompt ที่มีอยู่
      </button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={700}
      >
        {/* ✅ ส่ง onEditPrompt ต่อไปที่ PromptList */}
       <PromptList
          refreshTrigger={refreshTrigger}
          onEditPrompt={onEditPrompt ?? (() => {})} // ✅ ส่งต่อไปให้ List, แก้ undefined
        />
      </Modal>
    </>
  );
}
