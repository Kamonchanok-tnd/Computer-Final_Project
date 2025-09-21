// src/pages/contents/DoctorContactsPage.tsx
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Headers from "../../layout/HeaderLayout/Header";
import { logActivity } from "../../services/https/activity";

import n1 from "../../assets/nurse/n1.jpg"
import n2 from "../../assets/nurse/n2.jpg"
import n3 from "../../assets/nurse/n3.jpg"
import n4 from "../../assets/nurse/n4.jpg"
import n5 from "../../assets/nurse/n5.jpg"
import n6 from "../../assets/nurse/n6.jpg"
import QR from "../../assets/nurse/QR.jpg"

/* ===== Types ===== */
type Doctor = {
  id: string;
  name: string;
  photo?: string;
};

/* ===== Demo data ===== */
const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "อ.พี่โอ",
    photo:
      n6,
  },
  {
    id: "d2",
    name: "อ.พี่นก",
    photo:
     n1,
  },
  {
    id: "d3",
    name: "อ.พี่ปุ้ม",
    photo:
      n2,
  },
  {
    id: "d4",
    name: "อ.พี่พลอย",
    photo:
      n3,
  },
  {
    id: "d5",
    name: "อ.พี่ดา",
    photo:
      n4,
  },
  {
    id: "d6",
    name: "อ.พี่เม",
    photo:
      n5,
  },
  
];

/* ===== Avatar (fallback ถ้าโหลดรูปไม่ได้) ===== */
function Avatar({ name, photo }: { name: string; photo?: string }) {
  const [error, setError] = useState(false);
  const usePhoto = !!photo && !error;

  if (usePhoto) {
    return (
      <img
        src={photo}
        alt={name}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full grid place-items-center text-white text-xl font-bold bg-gradient-to-br from-sky-400 to-indigo-400">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ===== Card ===== */
function DoctorCard({ d }: { d: Doctor }) {
  return (
    <article className="group rounded-3xl overflow-hidden ring-1 ring-sky-100/70 bg-white/85 backdrop-blur-xl shadow-md hover:shadow-lg transition">
      {/* accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400" />

      <div className="p-6 flex flex-col items-center text-center font-ibmthai font-light">
        {/* รูป */}
        <div className="w-[112px] h-[112px] sm:w-[136px] sm:h-[136px] rounded-2xl overflow-hidden ring-1 ring-white/80 shadow-md mb-4 ">
          <Avatar name={d.name} photo={d.photo} />
        </div>

        {/* ชื่อ */}
        <h3 className="text-slate-900 text-lg lg:text-xl leading-snug font-ibmthai font-bold">
          {d.name}
        </h3>
      </div>
    </article>
  );
}

/* ===== Page body ===== */
function PageBody({ doctors }: { doctors: Doctor[] }) {
  return (
    <main className="relative min-h-[calc(100dvh-64px)] overflow-x-hidden bg-gradient-to-b from-white to-sky-200">
      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Hero */}
        <div className="rounded-3xl bg-white/75 backdrop-blur-md ring-1 ring-white/70 p-6 sm:p-10 shadow-md">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center ">
    {/* ข้อความ */}
    <div className="space-y-4 font-ibmthai md:col-span-3">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
        Friends Corner SUT
      </h1>
      <p className="text-xl italic text-sky-700">
        “เพราะทุกความรู้สึกนั้นสำคัญเสมอ : Every feeling is important”
      </p>
      <p className="leading-relaxed text-slate-700 lg:text-lg">
        หากคุณเริ่มรู้สึก{" "}
        <span className="font-semibold text-sky-800 lg:text-lg">กังวล</span>,{" "}
        <span className="font-semibold text-sky-800 lg:text-lg">เครียด</span>,{" "}
        <span className="font-semibold text-sky-800 lg:text-lg">ซึมเศร้า</span> <br />
        หรืออยากขอความช่วยเหลือด้านใด{" "}
        <span className="font-semibold text-sky-900 lg:text-lg">
          สามารถแจ้งข้อมูลผ่าน QR Code นี้ได้เลย
        </span>{" "}
        <span className="text-green-600 font-semibold lg:text-lg">(ฟรี ไม่มีค่าใช้จ่าย)</span>
      </p>
      <p className="leading-relaxed text-slate-700 lg:text-lg">
        คณาจารย์สาขา{" "}
        <span className="font-semibold text-indigo-700 lg:text-lg">การพยาบาลจิตเวช</span>{" "}
        พร้อมทั้งหน่วยงานที่เกี่ยวข้อง <br />
        จะดูแลและให้การช่วยเหลือตามความจำเป็น <br />
        ขอเพียง{" "}
        <span className="font-bold text-sky-700 lg:text-lg">ติดต่อมา</span> — คณาจารย์{" "}
        <span className="font-semibold lg:text-lg">สวพย.</span>{" "}
        พร้อมรับฟังและอยู่เคียงข้างคุณ 
      </p>
    </div>

    {/* QR Code */}
    <div className="flex justify-center md:justify-end">
      <img
        src={QR}
        alt="QR Code"
        className="w-40 h-40 md:w-52 md:h-52 rounded-xl shadow-md ring-1 ring-sky-200"
      />
    </div>
  </div>
</div>


        {/* Grid */}
        <div className="mt-6 grid gap-6 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d) => (
            <DoctorCard key={d.id} d={d} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ===== Render ใต้ Header เดิมด้วย portal ===== */
export default function DoctorContactsPage({
  doctors = SAMPLE_DOCTORS,
}: {
  doctors?: Doctor[];
}) {
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.querySelector(
      ".ant-layout-content"
    ) as HTMLElement | null;
    if (el) {
      el.style.background = "transparent";
      el.style.padding = "0";
      setContentEl(el);
    }
  }, []);

  const hasLoggedRef = useRef(false);
  useEffect(() => {
    if (hasLoggedRef.current) return;
    hasLoggedRef.current = true;

    const uid = Number(localStorage.getItem("id"));
    if (!uid) return;

    logActivity({
      uid,
      action: "visit_page",
      page: "/doctor",
    });
  }, []);

  return (
    <>
      <Headers />
      {contentEl ? (
        ReactDOM.createPortal(<PageBody doctors={doctors} />, contentEl)
      ) : (
        <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-sky-200" />
      )}
    </>
  );
}
