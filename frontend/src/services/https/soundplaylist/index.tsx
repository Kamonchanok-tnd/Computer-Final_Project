
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
    return { status: response.status, result };
  } catch (error) {
    console.error(error);
    throw error;
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
    throw error;
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
      throw error;
    }
  }

  export async function GetTopSoundPlaylist(id: number) {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Authorization}`,
      },
    };
  
    try {
      const response = await fetch(`${apiUrl}/CheckFirstSoundPlaylist/${id}`, requestOptions);
      if (response.ok) {
        const result = await response.json();
        if ( (result.message) ) {
          return { noVdo: true, message: result.message };
        }
        
        return { noVdo: false, data: result };
      }
      else{
        return false
      }
      
    } catch (error) {
      console.error(error);
      return false
    }
  }
  
  export async function DeleteSoundPlaylistByPID(id: number) {
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Authorization}`,
      },
    };
  
    try {
      const response = await fetch(`${apiUrl}/DeleteSoundPlaylistByPID/${id}`, requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  

