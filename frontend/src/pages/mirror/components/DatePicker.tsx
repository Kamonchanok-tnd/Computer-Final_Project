type Props = {
  value: string;               // YYYY-MM-DD
  onChange: (v: string) => void;
  loading?: boolean;
  saving?: boolean;
};

export default function DatePicker({ value, onChange, loading, saving }: Props) {
  return (
    <div className="mt-2">
      <label className="sr-only" htmlFor="date">เลือกวันที่</label>

      <div className="flex items-center gap-2 rounded-xl h-11 px-3 bg-white/95 ring-1 ring-slate-200 shadow-sm">
        {/* icon ใหญ่ขึ้นนิด */}
        <span aria-hidden className="grid place-items-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v2m8-2v2M4 7h16M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
          </svg>
        </span>

        {/* ใจความอยู่กลางกล่องจริง ๆ */}
        <input
          id="date"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
           className="min-w-0 w-full bg-transparent outline-none 
             text-base sm:text-lg leading-none px-1 py-0.5
             text-center appearance-none date-center 
             font-ibmthai font-light"
        />

        {/* สถานะเล็ก ๆ */}
        {loading ? (
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" aria-label="กำลังโหลด" />
        ) : saving ? (
          <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" aria-label="กำลังบันทึก" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="พร้อม" />
        )}
      </div>
    </div>
  );
}
