export default function Header() {
  return (
    <header className="mx-auto w-full max-w-screen-md px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
      <button className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95" aria-label="Back">‹</button>
      <h1 className="text-lg sm:text-xl font-bold">วันนี้เป็นไงนะ</h1>
      <div className="h-8 w-8 rounded-full bg-slate-300 overflow-hidden">
        {/* Replace with user avatar */}
        <img
          src="https://i.pravatar.cc/64?img=12"
          alt="avatar"
          className="h-full w-full object-cover"
        />
      </div>
    </header>
  );
}
