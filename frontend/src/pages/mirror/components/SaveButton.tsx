type Props = {
  saving?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string; // ใช้กำหนดข้อความปุ่ม
};

export default function SaveButton({
  saving,
  disabled,
  onClick,
  label = "บันทึก",
}: Props) {
  const isDisabled = !!saving || !!disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={saving ? true : undefined}
      className={[
        "inline-flex items-center gap-2",
        "h-10 px-4 rounded-xl",
        "bg-slate-900 text-white",
        "ring-1 ring-black/10 shadow-sm",
        "hover:brightness-110 active:scale-[0.98] transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      {saving ? (
        <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        // ไอคอนแผ่นดิสก์แบบมินิมอล
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h12l4 4v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M8 4v5h8V4" />
        </svg>
      )}
      <span>{saving ? "กำลังบันทึก…" : label}</span>
    </button>
  );
}
