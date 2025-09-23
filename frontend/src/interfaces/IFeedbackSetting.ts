export interface IFeedbackSetting {
  ID: number;
  placement: string;     // "home" ฯลฯ
  cadence_days: number;  // โชว์ซ้ำทุกกี่วัน
  is_enabled: boolean;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}
