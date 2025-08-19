// src/pages/mirror/components/Header.tsx
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  /** ตั้ง false เพื่อซ่อนไอคอนกราฟด้านขวา (เช่นในหน้าสรุป) */
  showOverviewButton?: boolean;
};

export default function Header({
  title = "วันนี้เป็นไงบ้าง",
  showBack = true,
  showOverviewButton = true,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="mx-auto w-full max-w-screen-md px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
      {/* ปุ่มย้อนกลับ */}
      <div className="h-9 flex items-center">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-9 w-9 -ml-1 rounded-full grid place-items-center hover:bg-black/5 active:scale-95"
            aria-label="ย้อนกลับ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5.5 w-5.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* หัวข้อ */}
      <h1 className="font-ibmthai text-xl sm:text-2xl font-semibold">{title}</h1>

      {/* ปุ่มไปหน้า 'สรุปอารมณ์รายเดือน' หรือ spacer ให้บาลานซ์ */}
      <div className="h-9 flex items-center justify-end">
        {showOverviewButton ? (
          <button
            type="button"
            onClick={() => navigate("/user/mirror/overview")}
            aria-label="ดูสรุปอารมณ์รายเดือน"
            className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center hover:ring-1 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5.5 h-5.5 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 20h18" />
              <path d="M7 16v4" />
              <path d="M11 10v10" />
              <path d="M15 13v7" />
              <path d="M19 7v13" />
            </svg>
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </header>
  );
}
