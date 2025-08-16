import { useEffect, useMemo, useState } from 'react';
import { Input, Switch, Empty } from 'antd';
import { IPrompt } from '../../interfaces/IPrompt';
import { getPrompts, nowPrompt, deletePrompt } from '../../services/https/prompt';
import PromptTitleModal from './component/PromptTitleModal';
import PromptCard from './component/PromptCard';

const { Search } = Input;

export default function PromptList({
  refreshTrigger,
  onEditPrompt,
}: {
  refreshTrigger: number;
  onEditPrompt: (prompt: IPrompt) => void;
}) {
  const [prompts, setPrompts] = useState<IPrompt[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (err) {
      console.error('❌ Failed to fetch prompts:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = prompts.filter((p) => {
      const hay = `${p.name ?? ''} ${p.objective ?? ''} ${p.persona ?? ''} ${p.tone ?? ''} ${p.instruction ?? ''} ${p.constraint ?? ''} ${p.context ?? ''}`.toLowerCase();
      const passQuery = q ? hay.includes(q) : true;
      const passActive = onlyActive ? !!p.is_using : true;
      return passQuery && passActive;
    });
    return filtered.sort((a, b) => {
      const activeSort = Number(!!b.is_using) - Number(!!a.is_using);
      if (activeSort !== 0) return activeSort;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [prompts, query, onlyActive]);

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

  const handleEdit = (prompt: IPrompt) => onEditPrompt(prompt);
  const handleExpand = (title: string) => setSelectedTitle(title);

  return (
    <div className="space-y-4">
      {/* Header */}
      {/* Header */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h2 className="text-lg sm:text-xl font-bold text-[#2c3e50]">
    🧠 รายการ Prompt ทั้งหมด <span className="text-slate-500 font-normal">({list.length})</span>
  </h2>

  {/* ขวา: บนมือถือให้เป็น 2 คอลัมน์ (ค้นหา 1fr + สวิตช์ auto) */}
  <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
    <div className="min-w-0">
      <Search
        allowClear
        placeholder="ค้นหาโดยชื่อ/ข้อความในพร้อมพ์…"
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
    </div>

    <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap shrink-0">
      <Switch checked={onlyActive} onChange={setOnlyActive} />
      กำลังใช้งาน
    </label>
  </div>
</div>


      {/* แถวลงล่าง */}
      {list.length === 0 ? (
        <Empty description="ไม่พบพร้อมพ์" />
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((p) => (
            <PromptCard
              key={p.ID ?? `${p.name}-${Math.random()}`}
              prompt={p}
              onUse={() => p.ID && handleUse(p.ID)}
              onDelete={() => p.ID && handleDelete(p.ID)}
              onEdit={() => handleEdit(p)}
              onExpand={() => handleExpand(p.objective || p.name || '')}
            />
          ))}
        </div>
      )}

      <PromptTitleModal
        open={!!selectedTitle}
        titleText={selectedTitle}
        onClose={() => setSelectedTitle(null)}
      />
    </div>
  );
}
