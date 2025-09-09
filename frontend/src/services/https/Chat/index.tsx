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

export async function GetChat(id: number, navigate?: (path: string) => void) {
  const authHeader = getAuthHeader();
  if (!authHeader) return null;

  try {
    const response = await fetch(`${apiUrl}/conversation/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    if (response.status === 403) {
      // ถ้า navigate ถูกส่งมา → redirect ไป /chat
      if (navigate) navigate("/chat");
      return null;
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch chat:", error);
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

export async function ClearChat(id: number) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/conversation/${id}`, {
      method: "DELETE",
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

export async function GetQverview(

) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;
 
  const url = `${apiUrl}/dashboard/overview`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function GetChatUsage(
  granularity: "today" | "day" | "week" | "month" | "year" | "custom" = "today",
  filter: "all" | "user" = "all",
  startDate?: string,
  endDate?: string
) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  const params: Record<string, string> = { granularity, filter };
  if (startDate) params["start_date"] = startDate;
  if (endDate) params["end_date"] = endDate;

  try {
    const url = new URL(`${apiUrl}/dashboard/usage/daily`);

    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": authHeader },
    });

    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}


export async function GettopUser() {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/dashboard/users/top`, {
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

export async function Getstatus() {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/dashboard/sessions/gender`, {
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

export async function Getduration() {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/dashboard/sessions/duration`, {
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

export async function getActiveUsers(granularity: "day" | "week" | "month") {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/dashboard/visit-frequency?granularity=${granularity}`, {
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

export async function GetCohort (days: number = 30) {
  const authHeader = getAuthHeader();
  if (!authHeader) return;

  try {
    const response = await fetch(`${apiUrl}/dashboard/retention-rate?days=${days}`, {
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








