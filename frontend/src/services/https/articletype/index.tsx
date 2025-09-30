
import type { ArticleType } from "../../../interfaces/IArticleType";
// const apiUrl = "http://localhost:8003";
const apiUrl = "http://localhost:8000";

// รองรับเคสที่ BE ส่ง field แบบต่างกัน
const pick = (o: any, ...keys: string[]) => keys.find(k => o?.[k] !== undefined) ? o[keys.find(k => o?.[k] !== undefined)!] : undefined;

const mapArticleType = (raw: any): ArticleType => ({
  id: Number(pick(raw, "id", "ID")) || undefined,
  name: pick(raw, "name", "Name") ?? "",
  description: pick(raw, "description", "Description", "desc", "Desc") ?? "",
});

// GET /articletypes
export const getAllArticleTypes = async (): Promise<ArticleType[]> => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/articletypes`, {
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  const body = await res.json().catch(() => null);
  const list: any[] = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : []);
  return list.map(mapArticleType);
};

// GET /articletype/:id
export const getArticleTypeById = async (id: number): Promise<ArticleType | null> => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/articletype/${id}`, {
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return mapArticleType(await res.json());
};

// POST /createarticletype
export const createArticleType = async (payload: ArticleType): Promise<ArticleType> => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/createarticletype`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: payload.name, description: payload.description }),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `Error: ${res.status}`));
  return mapArticleType(await res.json());
};

// PATCH /updatearticletype/:id
export const updateArticleType = async (id: number, payload: Partial<ArticleType>): Promise<ArticleType> => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/updatearticletype/${id}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json", 
       Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `Error: ${res.status}`));
  return mapArticleType(await res.json());
};

// DELETE /deletearticletype/:id  (soft delete ฝั่ง BE)
export const deleteArticleType = async (id: number): Promise<boolean> => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/deletearticletype/${id}`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` },
  });
  if (res.status === 200 || res.status === 204) return true;
  throw new Error(await res.text().catch(() => `Error: ${res.status}`));
};
