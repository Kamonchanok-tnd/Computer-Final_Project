import { useState } from "react";
import PromptForm from "./PromptForm";
import PromptSelector from "./component/PromptSelector";
import { IPrompt } from "../../interfaces/IPrompt";

export default function PromptAdminPage() {
  const [editingPrompt, setEditingPrompt] = useState<IPrompt | null>(null);
  const [, setRefreshTrigger] = useState(0);

  const handleFinishEdit = () => {
    setEditingPrompt(null);
    setRefreshTrigger((t) => t + 1);
  };

  const handleEditPrompt = (prompt: IPrompt) => {
    setEditingPrompt(prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="
        min-h-[calc(100svh-var(--admin-header-h,64px))]
        md:min-h-[calc(100dvh-var(--admin-header-h,64px))]
        bg-gradient-to-br from-[#f8f9fa] to-[#e2e6ea]
        text-[#333] flex flex-col
      "
    >
      {/* Title */}
      <div className="px-0 lg:px-6 pt-6">{/* ⟵ เอา padding ออกถึง lg */}
        <div className="w-full mr-auto max-w-screen-xl 2xl:max-w-screen-2xl pb-3 md:pb-4">
          <h2 className="m-0 flex items-center gap-3 text-[20px] md:text-[22px] leading-none font-bold text-[#2C3E50]">
            <img
              src="/images/robot.png"
              alt="AI Bot"
              className="h-[45px] w-[45px] shrink-0 select-none object-contain"
              draggable={false}
            />
            จัดการลักษณะของ AI Bot
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-0 lg:px-6 pb-6">{/* ⟵ เอา padding ออกถึง lg */}
        <div className="w-full mr-auto max-w-screen-xl 2xl:max-w-screen-2xl">
          <div
            className="
              bg-white/80 backdrop-blur-sm
              rounded-none md:rounded-none lg:rounded-xl   /* ⟵ full-bleed จนถึง lg */
              shadow-none  md:shadow-none  lg:shadow-lg    /* ⟵ ไม่ให้มีเงาจนถึง lg */
              p-4 md:p-5
            "
          >
            <PromptForm
              extraButtons={<PromptSelector onEditPrompt={handleEditPrompt} />}
              editingPrompt={editingPrompt}
              onFinishEdit={handleFinishEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
