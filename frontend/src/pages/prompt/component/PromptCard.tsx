import { Button, Card, Tag, Typography, Tooltip } from 'antd';
import { CheckCircleTwoTone, StarTwoTone, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { IPrompt } from '../../../interfaces/IPrompt';

const { Paragraph, Text } = Typography;

interface PromptCardProps {
  prompt: IPrompt;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExpand: () => void;
}

export default function PromptCard({ prompt, onUse, onEdit, onDelete, onExpand }: PromptCardProps) {
  return (
    <Card
      title={
        <div className="flex items-center justify-between gap-2 font-semibold text-base w-full">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <StarTwoTone twoToneColor="#eb2f96" />
            <span className="truncate block w-full">{prompt.objective || 'ไม่มีหัวข้อ'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip title="ดูทั้งหมด">
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={onExpand} />
            </Tooltip>
            <Tooltip title="แก้ไข Prompt">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
            </Tooltip>
          </div>
        </div>
      }
      variant="outlined"
      className="shadow-sm hover:shadow-md transition-all"
      size="small"
    >
      <Paragraph className="text-sm text-gray-700 mb-1">
        <Text strong>Persona:</Text> {prompt.persona || 'ไม่ระบุ'}
      </Paragraph>

      <div className="flex gap-4 mt-2">
        {prompt.is_using ? (
          <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
            กำลังใช้งาน
          </Tag>
        ) : (
          <Button type="link" onClick={onUse} className="p-0">
            ใช้ Prompt นี้
          </Button>
        )}

        <Button type="link" danger onClick={onDelete} icon={<DeleteOutlined />} className="p-0">
          ลบ
        </Button>
      </div>
    </Card>
  );
}
