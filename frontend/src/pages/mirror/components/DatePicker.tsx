type Props = {
  value: string;               // YYYY-MM-DD
  onChange: (v: string) => void;
  loading?: boolean;
  saving?: boolean;
};
export default function DatePicker({ value, onChange, loading, saving }: Props) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <label className="sr-only" htmlFor="date">เลือกวันที่</label>
      <div className="flex-1 shadow-sm rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2 flex items-center gap-3">
        <span aria-hidden>📅</span>
        <input
          id="date"
          type="date"
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
        />
        {loading ? (
          <span className="text-xs text-slate-500">Loading…</span>
        ) : saving ? (
          <span className="text-xs text-slate-500">Saved</span>
        ) : null}
      </div>
    </div>
  );
}
