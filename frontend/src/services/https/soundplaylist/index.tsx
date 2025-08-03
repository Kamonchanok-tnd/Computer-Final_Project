import { IPlaylist } from "../../../interfaces/IPlaylist";
import { ISoundPlaylist } from "../../../interfaces/ISoundPlaylist";
import { apiUrl } from "../Chat";

const Authorization = localStorage.getItem("token");
export const IMG_URL = import.meta.env.VITE_IMG_URL;
export async function CreateSoundPlaylist(data: ISoundPlaylist) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${Authorization}`);
  const raw = JSON.stringify(data);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  try {
    const response = await fetch(
      `${apiUrl}/CreateSoundPlaylist`,
      requestOptions
    );
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function GetSoundPlaylistByPID(id: number) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/SoundPlaylistByPID/${id}`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function DeleteSoundPlaylistByID(id: number) {
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Authorization}`,
      },
    };
  
    try {
      const response = await fetch(`${apiUrl}/DeleteSoundPlaylist/${id}`, requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  
  
