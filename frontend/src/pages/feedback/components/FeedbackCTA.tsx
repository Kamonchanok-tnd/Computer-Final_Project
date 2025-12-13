import { MouseEventHandler } from "react";
import character2 from "../../../assets/character2.png";

type Props = { onOpen: MouseEventHandler<HTMLButtonElement> };

export default function FeedbackCTA({ onOpen }: Props) {
  return (
    <section className="w-full bg-white">
      {/* Banner Title – ใช้ธีม #99EDFF */}
      <div className="w-full">
        <div className="mx-auto w-full px-4 py-5 sm:py-6 bg-[linear-gradient(90deg,#8FE8FF_0%,#99EDFF_35%,#B7F3FF_100%)]">
          <h2 className="text-center text-slate-900 text-xl sm:text-2xl font-extrabold tracking-tight">
            แบบประเมินการใช้งานเว็บแอปพลิเคชัน
          </h2>
        </div>
      </div>

      {/* HERO */}
      <div className="relative w-full overflow-hidden border-y border-[#D7F6FF]">
        {/* พื้นหลัง gradient + radial glow */}
        <div className="absolute inset-0 -z-10 bg-[conic-gradient(from_180deg_at_50%_0%,#EFFFFF_0deg,#F7FEFF_120deg,#FFFFFF_240deg,#EFFFFF_360deg)]" />
        <div className="absolute inset-0 -z-10 opacity-80
                        bg-[radial-gradient(70%_60%_at_20%_20%,#E9FBFF_0%,transparent_60%),
                            radial-gradient(60%_60%_at_90%_80%,#D5F5FF_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-end">
            {/* LEFT */}
            <div className="md:pr-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9F2FF] bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-[#1687A7] shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#32C5EC]" />
                ร่วมสะท้อนประสบการณ์ของคุณ
              </div>

              <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
                ช่วยให้ <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">SUT Heal Jai</span> ดียิ่งขึ้น
              </h3>

              <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur border border-[#D7F6FF] p-5 shadow-[0_10px_35px_rgba(0,163,204,0.10)]">
                <ul className="space-y-3 text-slate-700 text-sm sm:text-base">
                  <li className="flex items-start gap-3"><CheckIcon/><span>เข้าใจความต้องการของผู้ใช้งานจริง เพื่อนำไปพัฒนาฟีเจอร์</span></li>
                  <li className="flex items-start gap-3"><CheckIcon/><span>ยกระดับประสบการณ์และความพึงพอใจของผู้ใช้ทุกคน</span></li>
                  <li className="flex items-start gap-3"><CheckIcon/><span>ใช้เวลาเพียง <strong>3–5 นาที</strong> และตอบได้ทุกอุปกรณ์</span></li>
                </ul>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Pill>ไม่เก็บข้อมูลส่วนตัว</Pill>
                  <Pill>ปรับปรุงทุกสปรินต์</Pill>
                  <Pill>ขอบคุณที่ร่วมพัฒนา 💙</Pill>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4">
                <button
                  onClick={onOpen}
                  className="inline-flex items-center justify-center gap-2 rounded-xl 
                             bg-[#99EDFF] text-slate-900 px-6 py-3 text-sm sm:text-base font-semibold
                             shadow-[0_6px_18px_rgba(50,197,236,0.35)]
                             ring-1 ring-inset ring-[#5FD9F5]/50
                             hover:bg-[#5FD9F5] active:bg-[#32C5EC] active:scale-[0.99]
                             transition"
                >
                  เริ่มทำแบบประเมิน <span aria-hidden>✨</span>
                </button>
              </div>
            </div>

            {/* RIGHT – ให้ภาพ “ล่าง-กลางคอลัมน์” จริง ๆ */}
            <div className="flex justify-center md:justify-center items-end">
              <img
                src={character2}
                alt="ตัวละครเชิญทำแบบประเมิน"
                className="select-none object-contain h-80 md:h-96 w-auto drop-shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* soft glows */}
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#99EDFF]/35 blur-3xl" />
        <div className="pointer-events-none absolute -top-16 right-10 h-56 w-56 rounded-full bg-[#B7F3FF]/50 blur-3xl" />
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-1 h-5 w-5 flex-none text-[#32C5EC]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414l2.293 2.293 6.543-6.543a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#C9F2FF] bg-[#E9FBFF]/70 px-3 py-1 text-xs font-medium text-slate-800">
      {children}
    </span>
  );
}
