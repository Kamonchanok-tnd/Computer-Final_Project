import { apiUrl } from "../Chat";


const Authorization = localStorage.getItem("token");
export const IMG_URL = import.meta.env.VITE_IMG_URL;

export async function GetBackground() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/Background`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
