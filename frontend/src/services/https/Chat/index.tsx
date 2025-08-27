import { IChatRoom } from "../../../interfaces/IChatRoom";
import { IConversation } from "../../../interfaces/IConversation";

export const apiUrl = import.meta.env.VITE_API_URL;
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");
export async function ChatGemini(data: IConversation) {

  if (!Authorization || !Bearer) {
    console.error("Missing token or token_type in localStorage");
    return;
  }
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
      `${apiUrl}/gemini`,
      requestOptions
    );
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}

export async function GetChat(id: number) {
  

  if (!Authorization || !Bearer) {
    console.error("Missing token or token_type in localStorage");
    return;
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${Bearer} ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/conversation/${id}`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function NewChat(data: IChatRoom) {
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
      `${apiUrl}/new-chat`,
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

export async function CloseChat(id: number) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `${Bearer} ${Authorization}`);
  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `${apiUrl}/end-chat/${id}`,
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

export async function RecentChat(id: number) { //เอาไว้ดู ห้อง chat ที่ยัง ไม่จบบทสนทนา
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `${Bearer} ${Authorization}`);
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `${apiUrl}/recent?uid=${id}`,
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

export async function TotalUseChat() {
  

  if (!Authorization || !Bearer) {
    console.error("Missing token or token_type in localStorage");
    return;
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${Bearer} ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/chat_rooms/count_uid`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}