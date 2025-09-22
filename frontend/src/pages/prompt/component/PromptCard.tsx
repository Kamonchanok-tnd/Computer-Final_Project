import { Button, Card, Tooltip, Space } from 'antd';
import {
  CheckCircleTwoTone,
  StarTwoTone,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { IPrompt } from '../../../interfaces/IPrompt';


interface PromptCardProps {
  prompt: IPrompt;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExpand: () => void;
}

export default function PromptCard({
  prompt,
  onUse,
  onEdit,
  onDelete,
  onExpand,
}: PromptCardProps) {
  return (
    <Card
      hoverable
      size="small"
      className="
        relative w-full rounded-xl shadow-sm hover:shadow-md transition-all
        before:absolute before:inset-y-0 before:left-0 before:w-1.5
        before:bg-gradient-to-b before:from-sky-400 before:to-amber-400 before:rounded-l-xl
      "
      title={
        <div className="flex items-center justify-between gap-2">
          {/* ชื่อ + ไอคอน */}
          <div className="flex items-center gap-2 overflow-hidden">
            <StarTwoTone twoToneColor="#f59e0b" />
            <span className="truncate font-semibold text-slate-800">
              {prompt.name || 'ไม่ได้ตั้งชื่อ'}
            </span>
          </div>

          {/* Actions (โทนฟ้า–เหลือง) */}
          <Space size={4} wrap={false} className="text-slate-600">
            {prompt.is_using ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 text-xs font-medium">
                <CheckCircleTwoTone twoToneColor="#f59e0b" className="-mt-px" />
                กำลังใช้งาน
              </span>
            ) : (
               <Button size="small" onClick={onUse} className="use-btn">
    <CheckOutlined />
    ใช้
  </Button>
            )}
            <Tooltip title="ดูทั้งหมด">
              <Button type="text" size="small" icon={<EyeOutlined />} className="text-slate-500 hover:text-sky-600" onClick={onExpand} />
            </Tooltip>
            <Tooltip title="แก้ไข">
              <Button type="text" size="small" icon={<EditOutlined />} className="text-slate-500 hover:text-sky-600" onClick={onEdit} />
            </Tooltip>
            <Tooltip title="ลบ">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
            </Tooltip>
          </Space>
        </div>
      }
    >
      {/* กล่อง Objective: โทนฟ้า–เหลือง + สูงเท่ากันเสมอ + ตัด 2 บรรทัด */}
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-amber-50 p-3 shadow-inner min-h-[78px] md:min-h-[92px]">
        <div className="text-[13.5px] text-slate-800">
          <strong className="text-slate-900">Objective:</strong>{' '}
          <span className="prompt-clamp-2" title={prompt.objective || 'Objective'}>
            {prompt.objective || 'ไม่ระบุ'}
          </span>
        </div>
      </div>

      {/* line-clamp 2 บรรทัด (ไม่ใช้ any) */}
      <style>
        {`
          .prompt-clamp-2{
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </Card>
  );
}
