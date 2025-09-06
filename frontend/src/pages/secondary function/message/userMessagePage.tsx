import React, { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { AiOutlineArrowLeft, AiOutlineEye, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  getAllWordHealingMessagesForUser,
  likeMessage,
  unlikeMessage,
  checkIfLikedArticle,
  updateViewCount,
} from "../../../services/https/message";
import type { WordHealingContent } from "../../../interfaces/IWordHealingContent";
import { BookOpen } from "lucide-react";
import AmbientBackground from "./AmbientBackground";

type ViewMode = "all" | "liked";

/* ---------- helpers: แสดงรูปเฉพาะเมื่อเป็น "รูป" จริง ๆ ---------- */
const isPdf = (s?: string | null) =>
  !!s && (s.includes("application/pdf") || /\.pdf($|\?)/i.test(s || ""));

const isImage = (s?: string | null) =>
  !!s &&
  (
    s.startsWith("data:image/") ||                     // data URL รูป
    /image\//i.test(s) ||                              // มี mime type image/*
    /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(s)    // นามสกุลไฟล์ภาพทั่วไป
  );

const hasImage = (s?: string | null) => !!s && !isPdf(s) && isImage(s);
/* ------------------------------------------------------------------- */

export default function UserMessagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [view, setView] = useState<ViewMode>("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [readMs, setReadMs] = useState(0);
  const [requiredMs, setRequiredMs] = useState(15000);
  const [isActive, setIsActive] = useState(true);
  const [hasCountedView, setHasCountedView] = useState<Record<number, boolean>>({});

  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchMessages = async () => {
      const data = await getAllWordHealingMessagesForUser();
      setMessages(data);

      if (token) {
        const uid = localStorage.getItem("id");
        if (uid) {
          for (const m of data) {
            const { isLiked } = await checkIfLikedArticle(m.id, uid);
            setLiked((prev) => ({ ...prev, [m.id]: isLiked }));
          }
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fmtDate = (d?: string) => {
    if (!d) return "ไม่มีวันที่";
    const dd = new Date(d);
    if (Number.isNaN(dd.getTime())) return "ไม่มีวันที่";
    return dd.toLocaleDateString();
  };

  const fmtDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, "0")}`;
  };

  const estimateRequiredMs = (text: string, imageCount = 0) => {
    const wordLike = Math.max(
      text.trim().split(/\s+/).filter(Boolean).length,
      Math.round((text || "").length / 6)
    );
    const WPM = 200;
    const base = 5000;
    const textMs = (wordLike / WPM) * 60_000;
    const imgMs = Math.min(imageCount, 10) * 3000;
    const total = base + textMs + imgMs;
    return Math.max(8000, Math.min(total * 0.7, 300_000));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const baseFiltered = messages.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q) ||
      (m.articleType || "").toLowerCase().includes(q) ||
      (m.content || "").toLowerCase().includes(q)
    );
  });

  const displayedMessages = view === "liked" ? baseFiltered.filter((m) => liked[m.id]) : baseFiltered;
  const likedCount = messages.reduce((acc, m) => acc + (liked[m.id] ? 1 : 0), 0);

  const toggleLike = async (id: number) => {
    if (!isLoggedIn) {
      alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ");
      return;
    }
    const currentlyLiked = !!liked[id];
    const uid = localStorage.getItem("id");
    if (!uid) {
      alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ");
      return;
    }
    setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) } : m))
    );
    const ok = currentlyLiked ? await unlikeMessage(id, uid) : await likeMessage(id, uid);
    if (!ok) {
      setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) } : m))
      );
    }
  };

  const indexOfLast = currentPage * articlesPerPage;
  const indexOfFirst = indexOfLast - articlesPerPage;
  const currentMessages = view === "liked" ? displayedMessages : displayedMessages.slice(indexOfFirst, indexOfLast);
  const totalPages = view === "liked" ? 1 : Math.ceil(displayedMessages.length / articlesPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleViewChange = (v: ViewMode) => {
    setView(v);
    if (v === "liked") setCurrentPage(1);
  };

  const showModal = (message: WordHealingContent) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    setHasCountedView((prev) => ({ ...prev, [message.id]: false }));
    const imgCount = hasImage(message.photo) ? 1 : 0;                 // <— นับรูปเฉพาะเมื่อเป็นรูปจริง
    setRequiredMs(estimateRequiredMs(message.content || "", imgCount));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  const computeContentPct = () => {
    const el = scrollBodyRef.current;
    if (!el) return 0;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollHeight <= clientHeight + 2) return 100;
    return Math.min(100, Math.max(0, ((scrollTop + clientHeight) / Math.max(1, scrollHeight)) * 100));
  };

  const checkAndCountView = () => {
    if (!selectedMessage || hasCountedView[selectedMessage.id]) return;
    const pct = computeContentPct();
    setScrollProgress(pct);
    const el = scrollBodyRef.current;
    const scrollable = el ? el.scrollHeight > el.clientHeight + 2 : false;
    const contentOk = scrollable ? pct >= 90 : true;
    const timeOk = readMs >= requiredMs * 0.7;

    if (contentOk && timeOk) {
      updateViewCount(String(selectedMessage.id)).then((ok) => {
        if (!ok) return;
        setHasCountedView((prev) => ({ ...prev, [selectedMessage.id]: true }));
        setSelectedMessage((prev) => (prev ? { ...prev, viewCount: prev.viewCount + 1 } : prev));
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessage.id ? { ...m, viewCount: m.viewCount + 1 } : m))
        );
      });
    }
  };

  useEffect(() => {
    if (!isModalVisible) return;
    setScrollProgress(0);
    setReadMs(0);
    setIsActive(true);
    if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;

    const onAct = () => (lastActivityRef.current = Date.now());
    window.addEventListener("mousemove", onAct);
    window.addEventListener("keydown", onAct);
    window.addEventListener("wheel", onAct, { passive: true });
    window.addEventListener("touchmove", onAct, { passive: true });

    const timer = setInterval(() => {
      const visible = !document.hidden;
      const active = Date.now() - lastActivityRef.current < 15_000;
      setIsActive(visible && active);
      if (visible && active) setReadMs((t) => t + 1000);
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", onAct);
      window.removeEventListener("keydown", onAct);
      window.removeEventListener("wheel", onAct);
      window.removeEventListener("touchmove", onAct);
    };
  }, [isModalVisible]);

  useEffect(() => {
    if (!isModalVisible || !selectedMessage) return;
    checkAndCountView();
  }, [readMs, isModalVisible, selectedMessage, requiredMs]);

  const onModalBodyScroll: React.UIEventHandler<HTMLDivElement> = () => {
    lastActivityRef.current = Date.now();
    checkAndCountView();
  };

  const handleBack = () => window.history.back();

  /* ---------- Dynamic content sizing (Modal) ---------- */
  const contentLen = (selectedMessage?.content || "").trim().length;
  // เกณฑ์: <=60 (สั้นมาก), <=240 (สั้น/ปานกลาง), มากกว่านั้น = ยาว
  const isVeryShort = contentLen <= 60;
  const isShortish  = contentLen > 60 && contentLen <= 240;

  const contentWidthClass = isVeryShort || isShortish ? "max-w-2xl" : "max-w-3xl";
  const contentPadYClass  = isVeryShort ? "py-10" : "py-4";
  const contentTextSize   = isVeryShort ? "text-2xl sm:text-3xl leading-9"
                        : isShortish  ? "text-xl leading-8"
                                      : "text-lg leading-7";
  const contentAlignClass = isVeryShort || isShortish ? "text-center" : "text-left";
  /* --------------------------------------------------- */

  return (
    <div
      className="font-ibmthai relative flex flex-col items-center p-6 min-h-screen
           bg-gradient-to-b from-[#C2F4FF] to-[#5DE2FF]
           dark:bg-gradient-to-b dark:from-[#1B2538] dark:to-[#0E1626]
           transition-all duration-300"
    >
      {/* AmbientBackground เฉพาะโหมด 'ทั้งหมด' */}
      {view === "all" && (
        <AmbientBackground
          scope="page"
          dayCloudsSrc="/ambient/day-clouds.jpg"
          nightStyle="milkyway"
          milkyWaySrc="/ambient/milkyway.jpg"
        />
      )}

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="w-full max-w-4xl mx-auto mb-4 flex items-center">
          <button
            onClick={handleBack}
            className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300"
          >
            <AiOutlineArrowLeft size={24} />
          </button>
          <input
            type="text"
            placeholder="ค้นหาบทความ (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-2 rounded-lg border border-gray-300 ml-4 dark:text-white dark:bg-gray-800"
          />
        </div>

        {/* Title + toggle */}
        <div className="w-full max-w-4xl mx-auto mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">บทความเสริมพลังใจ</h2>
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => handleViewChange("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                view === "all" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ทั้งหมด ({messages.length})
            </button>
            <button
              onClick={() => handleViewChange("liked")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                view === "liked" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ที่ถูกใจ ({likedCount})
            </button>
          </div>
        </div>

        {/* Cards */}
        {currentMessages.length === 0 ? (
          <div className="w-full max-w-4xl mx-auto px-4 dark:text-white">
            <div className="w-full rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
              {view === "liked" ? "ยังไม่มีบทความที่คุณถูกใจ" : "ไม่พบบทความตามคำค้นหา"}
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 w-full items-stretch ${view === "liked" ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3": "grid-cols-1"}`}>
            {currentMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white ${
                  view === "liked" ? "w-full" : "lg:w-3/4 xl:w-1/2 w-full"
                } transition-all duration-300`}
              >
                <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

                
                {hasImage(m.photo) && (
                  <figure className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={m.photo!}
                      alt=""
                      className="w-full aspect-[16/9] object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </figure>
                )}

                <div className="flex items-center space-x-2">
                  {m.articleType && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{m.articleType}</span>
                  )}
                  <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
                </div>

                {/* คงเดิม: สรุปเนื้อหา 1 บรรทัด */}
                <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
                  {m.content}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(m.id)}
                      className="text-red-500 text-3xl"
                      aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
                    >
                      {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
                    </button>
                    <span className="text-gray-700 dark:text-white">{m.no_of_like}</span>
                    <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
                    <span className="text-gray-700 dark:text-white">{m.viewCount}</span>
                  </div>
                  <button
                    onClick={() => showModal(m)}
                    className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>อ่าน</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (เฉพาะโหมดทั้งหมด) */}
        {view === "all" && (
          <div className="pagination dark:text-white mt-4 text-xl text-center space-x-4">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              ก่อนหน้า
            </button>
            <span>{`หน้า ${currentPage} จาก ${totalPages}`}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              ถัดไป
            </button>
          </div>
        )}

        {/* Reader Modal */}
        <Modal
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={1000}
          centered
          destroyOnClose
          styles={{
            mask:    { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)" },
            content: { padding: 0, background: "transparent", boxShadow: "none", border: "none", overflow: "hidden" },
            body:    { padding: 0, paddingRight: 0, paddingBottom: 0 },
            header:  { display: "none" },
            footer:  { display: "none" },
          }}
          closeIcon={<span style={{ color: "#e50c0cff", fontSize: 20, lineHeight: 1 }}>✕</span>}
        >
          {selectedMessage && (
            <div className=" font-ibmthai relative h-[calc(100dvh-120px)] md:h-[calc(100dvh-160px)] overflow-hidden">

              <div
                ref={scrollBodyRef}
                onScroll={onModalBodyScroll}
                className="h-full overflow-y-auto overscroll-contain bg-[#F4FFFF] dark:bg-[#1B2538] dark:text-white"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {/* แถบสรุปด้านบน */}
                <div className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                  <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-2">
                    <div className="flex items-center justify-between text-[13px] sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">อ่านแล้ว {Math.round(scrollProgress)}%</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                            isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                          }`}
                          title="นับเวลาเฉพาะตอนหน้าจอเปิดและมีการใช้งาน"
                        >
                          <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-500"}`} />
                          {isActive ? "กำลังอ่าน" : "พัก"}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">เวลาอ่าน {fmtDuration(readMs)} / {fmtDuration(requiredMs)}</div>
                        <div className="text-[12px] opacity-70">คงเหลือ ~ {fmtDuration(Math.max(0, requiredMs - readMs))}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* บอดี้ของโมดัล: ปรับตามความยาวเนื้อหา */}
                <div className={`${contentWidthClass} mx-auto w-full px-4 sm:px-6 ${contentPadYClass}`}>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
                    {selectedMessage.name}
                  </h1>

                  {/* รูป: แสดงเฉพาะเมื่อเป็นรูปจริง */}
                  {hasImage(selectedMessage.photo) && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={selectedMessage.photo!}
                        alt=""
                        className="w-full sm:w-[520px] h-auto rounded-xl object-cover shadow"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <article className="prose prose-slate dark:prose-invert max-w-none mt-4">
                    <p className={`whitespace-pre-wrap break-words ${contentTextSize} ${contentAlignClass}`}>
                      {selectedMessage.content || "-"}
                    </p>
                  </article>

                 <div className="mt-4 flex flex-col gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-white">
                  <div className="flex items-center gap-2">
                    {selectedMessage.articleType && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                        {selectedMessage.articleType}
                      </span>
                    )}
                    <span>{fmtDate(selectedMessage.date)}</span>
                  </div>

                  <div>
                    <span className="opacity-80">ผู้เขียน: {selectedMessage.author}</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 opacity-90 text-center mt-4">
                    <span>ถูกใจทั้งหมด: {selectedMessage.no_of_like}</span>
                    <span>การเข้าชม: {selectedMessage.viewCount}</span>
                  </div>
                </div>
                </div>
              </div>

              {/* overlay บัง scrollbar */}
              <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 dark:hidden" style={{ background: "#F4FFFF" }} />
              <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 hidden dark:block" style={{ background: "#1B2538" }} />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
