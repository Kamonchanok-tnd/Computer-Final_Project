//import { apiUrl } from "../../../pages/mirror/components/report/utils";

const Authorization = localStorage.getItem("token");
export const IMG_URL = import.meta.env.VITE_IMG_URL;
export async function GetALllAvatar() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${IMG_URL}/profile`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}