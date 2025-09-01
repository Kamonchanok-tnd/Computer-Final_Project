import { IChatRoom } from "../../../interfaces/IChatRoom";
import { IConversation } from "../../../interfaces/IConversation";

export const apiUrl = import.meta.env.VITE_API_URL;

// ฟังก์ชันสำหรับดึง token สดใหม่
function getAuthHeader() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  if (!token) {
    console.error("Missing token in localStorage");
    return null;
  }
  return `${tokenType} ${token}`;
}

export async function ChatGemini(data: IConversation) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", authHeader);

  try {
    const response = await fetch(`${apiUrl}/gemini`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function GetChat(id: number) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/conversation/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function NewChat(data: IChatRoom) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/new-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function CloseChat(id: number) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/end-chat/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function RecentChat(id: number) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/recent?uid=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function TotalUseChat() {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/chat_rooms/count_uid`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
