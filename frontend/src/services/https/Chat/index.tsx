import { IConversation } from "../../../interfaces/IConversation";


export async function ChatGemini(data: IConversation) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify(data);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  try {
    const response = await fetch(
      "http://localhost:8000/gemini",
      requestOptions
    );
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function GetChat() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      "http://localhost:8000/conversation/1",
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
}
