import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export interface ASMRRecord {
  id: number;
  uid: number;
  time: string;
  createdAt: string;
  updatedAt: string;
}

// recentSettings: [{ sid: number, volume: number }]
export const createASMR = async (
  uid: number,
  durationMinutes: number,
  recentSettings: { sid: number; volume: number }[] = []
) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `${apiUrl}/createasmr`,
    { uid, duration: durationMinutes, recentSettings },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.asmrs;
};
