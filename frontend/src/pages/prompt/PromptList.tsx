import { useEffect, useState } from 'react';
import { IPrompt } from '../../interfaces/IPrompt';
import { getPrompts, nowPrompt, deletePrompt } from '../../services/https/prompt';
import PromptTitleModal from './component/PromptTitleModal';
import PromptCard from './component/PromptCard';

export default function PromptList({
  refreshTrigger,
  onEditPrompt,
}: {
  refreshTrigger: number;
  onEditPrompt: (prompt: IPrompt) => void;
}) {
  const [prompts, setPrompts] = useState<IPrompt[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (err) {
      console.error('❌ Failed to fetch prompts:', err);
    }
  };

  const handleUse = async (id: number) => {
    try {
      await nowPrompt(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePrompt(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (prompt: IPrompt) => {
    onEditPrompt(prompt); // ✅ ส่งกลับไปให้ index.tsx
  };

  const handleExpand = (title: string) => {
    setSelectedTitle(title);
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#2c3e50]">🧠 รายการ Prompt ที่มี</h2>
      {prompts.map((p) => (
        <PromptCard
          key={p.ID ?? Math.random()}
          prompt={p}
          onUse={() => p.ID && handleUse(p.ID)}
          onDelete={() => p.ID && handleDelete(p.ID)}
          onEdit={() => handleEdit(p)}
          onExpand={() => handleExpand(p.objective || '')}
        />
      ))}

      <PromptTitleModal
        open={!!selectedTitle}
        titleText={selectedTitle}
        onClose={() => setSelectedTitle(null)}
      />
    </div>
  );
}
