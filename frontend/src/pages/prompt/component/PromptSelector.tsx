import { Modal } from "antd";
import { useState } from "react";
import { UnorderedListOutlined } from "@ant-design/icons";
import PromptList from "../PromptList";
import { IPrompt } from "../../../interfaces/IPrompt";

export default function PromptSelector({
  onEditPrompt,
}: {
  onEditPrompt?: (p: IPrompt) => void;
}) {
  const [open, setOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpen = () => {
    setRefreshTrigger((prev) => prev + 1);
    setOpen(true);
  };

  // ปิดโมดัลทันทีเมื่อเลือก "แก้ไข"
  const handleEditFromList = (p: IPrompt) => {
    onEditPrompt?.(p);
    setOpen(false);
  };

  return (
    <>
      {/* ปุ่มสไตล์ปุ่มรอง (ให้หน้าตาแมตช์กับแถบปุ่มล่าง) */}
     <button
  type="button"
  onClick={handleOpen}
  className="
    w-full sm:w-auto inline-flex items-center justify-center gap-2
    h-11 px-4 rounded-lg
    border border-slate-300 bg-white
    text-slate-700 font-medium
    shadow-sm hover:shadow-md
    whitespace-nowrap transition
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-offset-2 focus-visible:ring-slate-300
  "
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
        width="min(100vw - 24px, 1000px)"
        styles={{ body: { padding: 0 } }}
        title={null}
        centered
      >
        <div className="px-4 sm:px-5 py-4">
          <PromptList
            refreshTrigger={refreshTrigger}
            onEditPrompt={handleEditFromList}
          />
        </div>
      </Modal>
    </>
  );
}
