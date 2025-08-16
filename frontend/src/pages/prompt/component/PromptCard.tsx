import { Button, Card, Tag, Typography, Tooltip, Space } from 'antd';
import {
  CheckCircleTwoTone,
  StarTwoTone,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { IPrompt } from '../../../interfaces/IPrompt';

const { Paragraph, Text } = Typography;

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
      className="w-full shadow-sm hover:shadow-md transition-all rounded-xl"
      title={
        <div className="flex items-center justify-between gap-2">
          {/* ชื่อ + ไอคอน */}
          <div className="flex items-center gap-2 overflow-hidden">
            <StarTwoTone twoToneColor="#eb2f96" />
            <span className="truncate font-semibold">
              {prompt.name || 'ไม่มีหัวข้อ'}
            </span>
          </div>

          {/* Actions: อยู่ขวาบนเสมอ → ไม่ยืดตามความยาวข้อความ */}
          <Space size={4} wrap={false}>
            {prompt.is_using ? (
              <Tag
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                color="success"
                className="px-2"
              >
                กำลังใช้งาน
              </Tag>
            ) : (
              <Button size="small" type="primary" onClick={onUse}>
                ใช้
              </Button>
            )}

            <Tooltip title="ดูทั้งหมด">
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={onExpand} />
            </Tooltip>
            <Tooltip title="แก้ไข">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
            </Tooltip>
            <Tooltip title="ลบ">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
            </Tooltip>
          </Space>
        </div>
      }
    >
      {/* ตัวเนื้อหา: เหลือแค่สรุปสั้น ๆ */}
      <Paragraph
        className="text-[13.5px] text-gray-800 mb-0"
        ellipsis={{ rows: 3, tooltip: prompt.objective || 'Objective' }}
      >
        <Text strong>Objective:</Text> {prompt.objective || 'ไม่ระบุ'}
      </Paragraph>
    </Card>
  );
}
