import { UsersInterface } from "./IUser";
import { IScore } from "./IScore";

export interface IFeedback {
  ID: number;
  feedback_text: string;
  sid: number;     // link -> Score.ID
  uid: number;     // link -> Users.ID

  // relations (จาก Preload):
  User?: UsersInterface | null;
  Score?: IScore | null;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}
