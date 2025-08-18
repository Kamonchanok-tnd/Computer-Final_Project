// src/pages/contents/DoctorContactsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import Headers from "../../layout/HeaderLayout/Header";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";

/* ===== Types ===== */
type Doctor = {
  id: string;
  name: string;
  photo?: string;
  phone: string;
  specialties: string[];
  location: string;
  mapUrl?: string;
};

/* ===== Demo data (เปลี่ยนเป็นข้อมูลจริงได้) ===== */
const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "นพ. ปวริศร์ ธรรมคุณ",
    photo:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=1200&q=80&auto=format&fit=crop",
    phone: "081-234-5678",
    specialties: ["จิตแพทย์", "ซึมเศร้า", "วิตกกังวล"],
    location: "คลินิก SUT HEALJAI, โคราช",
  },
  {
    id: "d2",
    name: "พญ. ศิรินันท์ ชัยวร",
    photo:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80&auto=format&fit=crop",
    phone: "02-345-6789",
    specialties: ["เวชปฏิบัติทั่วไป", "ระบบทางเดินหายใจ"],
    location: "SUT Wellness Academy",
  },
  {
    id: "d3",
    name: "คุณ อลิสา พฤกษ์รัตน์",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80&auto=format&fit=crop",
    phone: "080-000-7788",
    specialties: ["บำบัดครอบครัว", "วัยรุ่น"],
    location: "ศูนย์ปรึกษา SUKJAI",
  },
];

/* ===== Utils ===== */
const telHref = (p: string) => `tel:${p.replace(/[^+\d]/g, "")}`;
const mapHref = (d: Doctor) =>
  d.mapUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    d.location
  )}`;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* ===== Small UI atoms ===== */
const Chip = ({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "h-8 px-3 rounded-full text-[12px] font-semibold transition ring-1",
      active
        ? "bg-sky-600 text-white ring-sky-600 shadow-sm"
        : "bg-white/70 text-sky-700 ring-sky-200 hover:bg-sky-50",
    ].join(" ")}
  >
    {children}
  </button>
);

/* ===== Avatar (fallback เป็นบับเบิลไล่สี + ตัวอักษรย่อ) ===== */
function Avatar({ name, photo }: { name: string; photo?: string }) {
  const [error, setError] = useState(false);
  const usePhoto = !!photo && !error;

  if (usePhoto)
    return (
      <img
        src={photo}
        alt={name}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    );

  return (
    <div className="w-full h-full grid place-items-center text-white text-xl font-bold bg-gradient-to-br from-sky-400 to-indigo-400">
      {initials(name)}
    </div>
  );
}

/* ===== Card ===== */
function DoctorCard({ d }: { d: Doctor }) {
  return (
    <article className="group rounded-3xl overflow-hidden ring-1 ring-sky-100/70 bg-white/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,6,23,0.07)] hover:shadow-[0_18px_56px_rgba(2,6,23,0.12)] transition">
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

        {/* ชิปความเชี่ยวชาญ */}
        <div className="mt-2 flex flex-wrap justify-center gap-1.5 ">
          {d.specialties.map((sp) => (
            <span
              key={sp}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-100"
            >
              {sp}
            </span>
          ))}
        </div>

        {/* ติดต่อ */}
        <div className="mt-4 w-full grid gap-2 text-[15px] text-slate-700">
          <div className="flex items-center justify-center gap-2">
            <PhoneOutlined className="text-sky-600" />
            <a
              href={telHref(d.phone)}
              className="text-sky-700 hover:underline font-medium"
            >
              {d.phone}
            </a>
          </div>
          <div className="flex items-start justify-center gap-2">
            <EnvironmentOutlined className="text-sky-600 mt-0.5" />
            <div className="truncate max-w-[32ch] sm:max-w-[40ch]">
              {d.location}
            </div>
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a
            href={telHref(d.phone)}
            className="h-10 px-4 rounded-xl bg-sky-600 text-white font-medium inline-flex items-center gap-2 hover:bg-sky-700 active:scale-[0.99] transition"
          >
            <PhoneOutlined /> โทรเลย
          </a>
          <a
            href={mapHref(d)}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 rounded-xl bg-white text-sky-700 font-medium ring-1 ring-sky-200 hover:bg-sky-50 inline-flex items-center gap-2"
          >
            <EnvironmentOutlined /> เปิดแผนที่
          </a>
        </div>
      </div>
    </article>
  );
}

/* ===== Page body ===== */
function PageBody({ doctors }: { doctors: Doctor[] }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    doctors.forEach((d) => d.specialties.forEach((t) => s.add(t)));
    return ["ทั้งหมด", ...Array.from(s)];
  }, [doctors]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchQ =
        !keyword ||
        d.name.toLowerCase().includes(keyword) ||
        d.location.toLowerCase().includes(keyword) ||
        d.specialties.some((s) => s.toLowerCase().includes(keyword));
      const matchTag = !tag || tag === "ทั้งหมด" || d.specialties.includes(tag);
      return matchQ && matchTag;
    });
  }, [q, tag, doctors]);

  return (
    <main className="relative min-h-[calc(100dvh-64px)] overflow-x-hidden bg-gradient-to-b from-white to-sky-200">
      {/* background ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-30 bg-sky-200" />
        <div className="absolute -top-28 right-0 w-[560px] h-[560px] rounded-full blur-3xl opacity-30 bg-cyan-200" />
        <div className="absolute inset-x-0 top-56 h-[320px] bg-[repeating-linear-gradient(90deg,rgba(14,165,233,0.10)_0_2px,transparent_2px_20px)] opacity-40" />
      </div>

      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Hero */}
        <div className="rounded-3xl bg-white/75 backdrop-blur-md ring-1 ring-white/70 p-6 sm:p-8 shadow-[0_10px_30px_rgba(2,6,23,0.06)]">
          <div className="flex items-start gap-4 font-ibmthai font-light">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-ibmthai font-bold text-slate-900 tracking-tight ">
                แนะนำผู้เชี่ยวชาญ
              </h1>
              <p className="text-slate-700 mt-1 flex items-center gap-2 ">
                <TeamOutlined /> ติดต่อทีมแพทย์/นักจิตวิทยาของเราได้โดยตรง
              </p>

              {/* Search + Tags */}
              <div className="mt-4 flex flex-col gap-3">
                <div className="h-11 flex items-center gap-2 rounded-xl px-3 bg-white ring-1 ring-slate-200 shadow-sm">
                  <SearchOutlined className="text-slate-500" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="ค้นหาชื่อ / สาขา / สถานที่"
                    className="flex-1 bg-transparent outline-none text-[15px] "
                  />
                </div>
                <div className="flex flex-wrap gap-2 ">
                  {allTags.map((t) => (
                    <Chip
                      key={t}
                      active={tag === t || (!tag && t === "ทั้งหมด")}
                      onClick={() => setTag(t)}
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-6 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DoctorCard key={d.id} d={d} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full grid place-items-center h-40 text-slate-500">
              ไม่พบผู้เชี่ยวชาญที่ตรงกับการค้นหา
            </div>
          )}
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
    const el = document.querySelector(".ant-layout-content") as HTMLElement | null;
    if (el) {
      el.style.background = "transparent";
      el.style.padding = "0";
      setContentEl(el);
    }
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
