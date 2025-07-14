import { message } from 'antd';

export const errorCodeMap: Record<string, () => void> = {
  VALIDATION_ERROR: () => message.warning('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบ'),
  PROMPT_NOT_FOUND: () => message.error('ไม่พบพรอมต์ที่ร้องขอ'),
  CREATE_FAILED: () => message.error('ไม่สามารถบันทึกพรอมต์ได้'),
  UPDATE_FAILED: () => message.error('อัปเดตพรอมต์ล้มเหลว'),
  DELETE_FAILED: () => message.error('ลบพรอมต์ไม่สำเร็จ'),
  CLEAR_USING_FAILED: () => message.error('ล้างสถานะ prompt ก่อนหน้าไม่สำเร็จ'),
  USE_PROMPT_FAILED: () => message.error('ไม่สามารถตั้ง prompt ที่เลือกเป็น active ได้'),
};
