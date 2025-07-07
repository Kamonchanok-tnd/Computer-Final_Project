import { useState } from 'react';
import PromptForm from './PromptForm';
import PromptSelector from './component/PromptSelector';
import { IPrompt } from '../../interfaces/IPrompt';

export default function PromptAdminPage() {
  const [editingPrompt, setEditingPrompt] = useState<IPrompt | null>(null);
  const [, setRefreshTrigger] = useState(0);

  const handleFinishEdit = () => {
    setEditingPrompt(null);
    setRefreshTrigger((t) => t + 1);
  };

  const handleEditPrompt = (prompt: IPrompt) => {
    setEditingPrompt(prompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-[#f8f9fa] to-[#e2e6ea] py-6 px-6 text-[#333]">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-[#2C3E50] drop-shadow-sm tracking-wide">
          จัดการลักษณะของ AI Bot
        </h1>

        <div className="rounded-xl shadow-lg bg-white/80 backdrop-blur-sm p-8">
          <PromptForm
            extraButtons={
              <PromptSelector onEditPrompt={handleEditPrompt} />
            }
            editingPrompt={editingPrompt}
            onFinishEdit={handleFinishEdit}
          />
        </div>   
      </div>
    </div>
  );
}
