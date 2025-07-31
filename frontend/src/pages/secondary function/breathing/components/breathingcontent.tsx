import { Play } from "lucide-react";

interface SoundCardProps {
  name: string;
  description: string;
  time: string;
}

export default function SoundCard({ name, description, time }: SoundCardProps) {
  return (
    <div className="bg-pink-200 rounded-2xl p-4 w-80 h-64 flex flex-col justify-between">
      {/* ส่วนบน */}
      <div className="flex gap-4">
        {/* รูปสี่เหลี่ยมสีเทา */}
        <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-semibold text-black">{name}</h1>
          <p className="text-black/70 text-sm">{description}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
          <div className="w-1 h-3 bg-black rounded"></div>
        </div>
        <div className="bg-pink-100 px-3 py-1 rounded-md">{time}</div>
        <button className="text-xl font-bold">+</button>
        <button className="text-xl font-bold">−</button>
      </div>

      {/* ปุ่มล่าง */}
      <div className="flex justify-between">
        <button className="bg-gray-200 px-4 py-2 rounded-md">Instructions</button>
        <button className="bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1">
          Start <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
