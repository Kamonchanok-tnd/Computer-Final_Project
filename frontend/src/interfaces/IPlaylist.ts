import { IBackground } from "./IBackground";
export interface IPlaylist {
    ID?: number;
    name?: string;
    uid?: number;
    bid?: number;
    stid?: number;
    Background?: IBackground; // ✅ เพิ่มตรงนี้
  
}