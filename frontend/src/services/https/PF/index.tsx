export const apiUrl = import.meta.env.VITE_API_URL as string;

export const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;

export function buildImageSrc(picture: string): string {
  if (!picture) return "";
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emoji\//i.test(picture)) return joinUrl(apiUrl, picture);
  return joinUrl(apiUrl, `images/emoji/${picture}`);
}

const Authorization = localStorage.getItem("token");
export const IMG_URL = import.meta.env.VITE_PF_URL;
export async function GetALllAvatar() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Authorization}`,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/profile`, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}