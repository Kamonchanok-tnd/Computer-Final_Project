// src/interceptors/axios.ts
import axios, { AxiosHeaders } from "axios";
import { message } from "antd";
import { errorCodeMap } from "../utils/errorCodeMap";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  // withCredentials: true, // ถ้าใช้คุกกี้ ค่อยเปิด
});

/* ---------- JWT helpers (type-safe, no any) ---------- */
const JWT_RE =
  /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

type TokenEnvelope = { token: string };

function isTokenEnvelope(v: unknown): v is TokenEnvelope {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).token === "string"
  );
}

function getValidJwt(): string | null {
  let raw: string | null =
    localStorage.getItem("token") ?? sessionStorage.getItem("token");

  if (!raw) return null;

  // รองรับกรณีเผลอเก็บเป็น JSON {"token":"..."}
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isTokenEnvelope(parsed)) raw = parsed.token;
  } catch {
    /* ไม่ใช่ JSON ก็ปล่อยผ่าน */
  }

  return JWT_RE.test(raw) ? raw : null;
}

/* ---------- Interceptors ---------- */
api.interceptors.request.use((config) => {
  const jwt = getValidJwt();

  // ใช้ AxiosHeaders เพื่อจัดการ header แบบ type-safe
  const headers = AxiosHeaders.from(config.headers);

  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  } else {
    headers.delete("Authorization");
  }

  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const error: unknown = err?.response?.data?.error;
    const code: unknown = err?.response?.data?.code;

    const action = errorCodeMap[code as keyof typeof errorCodeMap];

    if (action) {
      action(); // เช่น logout, redirect, show message
    } else {
      message.error(
        typeof error === "string" && error.length > 0
          ? error
          : "เกิดข้อผิดพลาด"
      );
    }

    return Promise.reject(err);
  }
);

export default api;
