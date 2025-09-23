import { UsersInterface } from "./IUser";

export interface IFeedbackSeen {
  ID: number;
  uid: number;
  last_prompt_at?: string | null;  // ISO
  last_submit_at?: string | null;  // ISO
  dismissed_count: number;

  // relation (optional):
  User?: UsersInterface | null;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}
