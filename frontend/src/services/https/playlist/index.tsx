import { IPlaylist } from "../../../interfaces/IPlaylist";
import { apiUrl } from "../Chat";

const Authorization = localStorage.getItem("token");
export const IMG_URL = import.meta.env.VITE_IMG_URL;
export async function CreatePlaylist(data: IPlaylist) {
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
      `${apiUrl}/Playlist`,
      requestOptions
    );
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function GetPlaylistByUID(id: number ,stid: number) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/Playlist/${id}/${stid}`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function GetPlaylistByID(id: number) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/PlaylistByID/${id} `, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function UpdatePlaylist(data: IPlaylist, id: number) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${Authorization}`);
  const raw = JSON.stringify(data);

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
  };

  try {
    const response = await fetch(`${apiUrl}/Playlist/${id}`, requestOptions);
    
    const result = await response.json();

    if (!response.ok) {
    
      throw new Error(result.message || "Failed to update playlist");
    }

    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error; // ต้อง throw ต่อไปเพื่อให้ try/catch ใน handleSaveName ทำงาน
  }
}


export async function getPlaylistsByUserAndType(uid: number, stid: number): Promise<IPlaylist[]> {
  try {
    const response = await fetch(`${apiUrl}/playlists?uid=${uid}&stid=${stid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Authorization}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch playlists");
    }

    const data = await response.json();
    console.log("🎧 Loaded playlists:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching playlists:", error);
    return [];
  }
}

  export async function DeletePlaylistByID(id: number) {
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Authorization}`,
      },
    };
  
    try {
      const response = await fetch(`${apiUrl}/Playlist/${id}`, requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  

