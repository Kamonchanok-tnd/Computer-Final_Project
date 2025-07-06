import { Button, Modal } from 'antd';
import { useState } from 'react';
import { UnorderedListOutlined } from '@ant-design/icons';
import PromptList from './PromptList'; // ✅ import เข้ามาใช้เลย

export default function PromptSelector() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-all"
      >
        <UnorderedListOutlined />
        เลือกจาก Prompt ที่มีอยู่
      </button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="รายการ Prompt ที่มี"
        footer={null}
        width={700} // ✅ กำหนดขนาดให้กว้างขึ้น
      >
        <PromptList /> {/* ✅ แสดง PromptList จริงในนี้เลย */}
      </Modal>
    </>
  );
}
