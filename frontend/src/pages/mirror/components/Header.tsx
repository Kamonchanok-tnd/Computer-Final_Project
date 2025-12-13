// path: frontend/src/pages/mirror/components/Header.tsx
import { useNavigate } from "react-router-dom";
import { BarChart2, ChevronLeft } from "lucide-react";

type HeaderProps = {
  title?: string;
  showBack?: boolean;
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
      <div className="h-9 flex items-center">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-9 w-9 -ml-1 rounded-full grid place-items-center hover:bg-black/5 active:scale-95"
            aria-label="ย้อนกลับ"
          >
            {/* (ถ้าอันนี้ไม่สำคัญจะคงไว้ก็ได้) */}
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <h1 className="font-ibmthai text-xl sm:text-2xl font-semibold">{title}</h1>

      <div className="h-9 flex items-center justify-end">
  {showOverviewButton ? (
    <div className="relative group">
      <button
        id="overview-button-anchor"
        type="button"
        onClick={() => navigate("/user/mirror/overview")}
        aria-label="ดูสรุปอารมณ์ช่วงที่ผ่านมา"
        className="relative h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center
                   hover:ring-1 hover:ring-slate-300
                   focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <BarChart2
          id="overview-icon"
          className="w-[22px] h-[22px] text-slate-700"
          aria-hidden
        />
      </button>

      {/* Tooltip ใต้ปุ่ม */}
      <div
        role="tooltip"
        className="
          pointer-events-none
          absolute right-0 top-full mt-2
          hidden group-hover:block
          rounded-md bg-slate-800 px-2 py-1
          text-xs text-white whitespace-nowrap
          shadow-md
          opacity-0 translate-y-1
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-150
        "
      >
        สรุปอารมณ์ช่วงที่ผ่านมา
      </div>
    </div>
  ) : (
    <div className="w-9" />
  )}
</div>

    </header>
  );
}
