import { useEffect, useMemo, useRef, useState } from "react";
import { WordHealingContent } from "../../interfaces/IWordHealingContent";
import {checkIfLikedArticle,getAllWordHealingMessagesForUser,likeMessage,unlikeMessage,countViewMessage,} from "../../services/https/message";
import { BookOpen, Heart } from "lucide-react";
import { Modal } from "antd";
import { AiFillHeart, AiOutlineHeart, AiOutlineEye } from "react-icons/ai";
import healmessage from "../../assets/healmessage.jpg";
import { useNavigate } from "react-router-dom";

/* ---------------- Helpers ---------------- */
const isPdf = (s?: string | null) =>
  !!s && (s.includes("application/pdf") || /\.pdf($|\?)/i.test(s || ""));
const isImage = (s?: string | null) =>
  !!s &&
  (s.startsWith("data:image/") ||
    /image\//i.test(s) ||
    /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(s || ""));
const hasImage = (s?: string | null) => !!s && !isPdf(s) && isImage(s);

const safeTs = (d?: string | Date | null) => {
  if (!d) return 0;
  const t = new Date(d as any).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const fmtDate = (d?: string | Date) => {
  if (!d) return "ไม่มีวันที่";
  const dd = new Date(d);
  if (Number.isNaN(dd.getTime())) return "ไม่มีวันที่";
  const today = new Date(); today.setHours(0,0,0,0);
  const that  = new Date(dd); that.setHours(0,0,0,0);
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diffDays === 0) return "วันนี้";
  if (diffDays === 1) return "เมื่อวาน";
  return dd.toLocaleDateString("en-GB");
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
  const textMs = (wordLike / WPM) * 60000;
  const imgMs  = Math.min(imageCount, 10) * 3000;
  const total  = base + textMs + imgMs;
  return Math.max(8000, Math.min(total * 0.7, 300000));
};

/** จัดอันดับ: like มาก → view มาก → วันที่ใหม่ */
const sortByPopularityThenRecency = (a: WordHealingContent, b: WordHealingContent) => {
  const la = a.no_of_like ?? 0;
  const lb = b.no_of_like ?? 0;
  if (lb !== la) return lb - la;

  const va = a.viewCount ?? 0;
  const vb = b.viewCount ?? 0;
  if (vb !== va) return vb - va;

  const da = safeTs(a.date);
  const db = safeTs(b.date);
  if (db !== da) return db - da;

  return (b.id ?? 0) - (a.id ?? 0);
};

/* ---------------- Empty State ---------------- */
const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex flex-col items-center justify-center rounded-2xl border border-sky-100/70 bg-gradient-to-b from-sky-50 to-sky-100/50 px-8 py-10 text-center">
      <svg viewBox="0 0 64 64" aria-hidden className="mb-4 h-14 w-14" fill="none">
        <rect x="6" y="10" width="52" height="44" rx="8" className="fill-sky-200/60" />
        <rect x="12" y="16" width="40" height="6" rx="3" className="fill-white/80" />
        <rect x="12" y="26" width="28" height="4" rx="2" className="fill-white/70" />
        <rect x="12" y="34" width="32" height="4" rx="2" className="fill-white/70" />
      </svg>
      <p className="text-slate-500">ไม่มี{label}</p>
    </div>
  </div>
);

/* ---------------- ArticleReader (Modal) ---------------- */
function ArticleReader({
  message,
  scrollBodyRef,
  onModalBodyScroll,
  scrollProgress,
  isActive,
  readMs,
  requiredMs,
}: {
  message: WordHealingContent;
  scrollBodyRef: React.MutableRefObject<HTMLDivElement | null>;
  onModalBodyScroll: React.UIEventHandler<HTMLDivElement>;
  scrollProgress: number;
  isActive: boolean;
  readMs: number;
  requiredMs: number;
}) {
  const contentLen = (message?.content || "").trim().length;
  const isVeryShort = contentLen <= 60;
  const isShortish  = contentLen > 60 && contentLen <= 240;

  const contentWidthClass = isVeryShort || isShortish ? "max-w-2xl" : "max-w-3xl";
  const contentPadYClass  = isVeryShort ? "py-8 sm:py-10" : "py-4";
  const contentTextSize   = isVeryShort ? "text-xl sm:text-2xl leading-8 sm:leading-9" : isShortish ? "text-lg sm:text-xl leading-7 sm:leading-8" : "text-base sm:text-lg leading-7";
  const contentAlignClass = isVeryShort || isShortish ? "text-center" : "text-left";

  return (
    <div className="font-ibmthai relative h-[calc(100dvh-120px)] md:h-[calc(100dvh-160px)] max-h-[90dvh] overflow-hidden">
      <div
        ref={scrollBodyRef}
        onScroll={onModalBodyScroll}
        className="no-scrollbar h-full overflow-y-auto overscroll-contain bg-[#F4FFFF] dark:bg-[#1B2538] dark:text-white"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {/* summary bar */}
        <div className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2">
            <div className="flex items-center justify-between text-[12px] sm:text-[13px]">
              <div className="flex items-center gap-2">
                <span className="font-medium">อ่านแล้ว {Math.floor(scrollProgress)}%</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}
                  title="นับเวลาเฉพาะตอนหน้าจอเปิดและมีการใช้งาน"
                >
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-500"}`} />
                  {isActive ? "กำลังอ่าน" : "พัก"}
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">เวลาอ่าน {fmtDuration(readMs)} / {fmtDuration(requiredMs)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${contentWidthClass} mx-auto w-full px-3 sm:px-6 ${contentPadYClass}`}>
          <h1 className="text-xl sm:text-2xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
            {message.name}
          </h1>

          {hasImage(message.photo) && (
            <div className="mt-3 sm:mt-4 flex justify-center">
              {/* Modal แสดงรูปไม่ให้ขาด */}
              <div className=" max-w-[680px] max-h-[46vh] overflow-hidden rounded-2xl">
                <img
                  src={message.photo!}
                  alt=""
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          )}

          <article className="prose prose-slate dark:prose-invert max-w-none px-2 mt-3 sm:mt-4">
            <p className={`whitespace-pre-wrap break-words ${contentTextSize} ${contentAlignClass}`}>{message.content || "-"}</p>
          </article>

          <div className="mt-4 flex flex-col gap-2 text-[12px] sm:text-[13px] text-slate-600 dark:text-white">
            <div className="flex items-center gap-2">
              {message.articleType && <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{message.articleType}</span>}
              <span>{fmtDate(message.date)}</span>
            </div>

            <div><span className="opacity-80">ผู้เขียน: {message.author}</span></div>

            <div className="flex items-center justify-center gap-6 opacity-90 text-center mt-3">
              <span>ถูกใจทั้งหมด: {message.no_of_like}</span>
              <span>การเข้าชม: {message.viewCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* แถบด้านขวาที่เคยทับ scrollbar เอาออกได้; เก็บไว้ถ้าอยากสร้าง padding ด้านขวา */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 dark:hidden" style={{ background: "#F4FFFF" }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 hidden dark:block" style={{ background: "#1B2538" }} />
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function Homemessage() {
  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Reader/Modal
  const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readMs, setReadMs] = useState(0);
  const [requiredMs, setRequiredMs] = useState(15000);
  const [isActive, setIsActive] = useState(true);
  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const lastActivityRef = useRef(Date.now());
  const passedRef = useRef(false);
  const sentRef = useRef(false);

  // ซ้าย: สไลด์วน "บทความ"
  const [articleIdx, setArticleIdx] = useState(0);
  const [isArticlePaused, setIsArticlePaused] = useState(false);
  const articleTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const uid = localStorage.getItem("id");

  const fetchMessages = async () => {
    const fetched = await getAllWordHealingMessagesForUser();
    setMessages(fetched);
    if (uid) {
      for (const m of fetched) {
        const { isLiked } = await checkIfLikedArticle(m.id, uid);
        setLiked((prev) => ({ ...prev, [m.id]: isLiked }));
      }
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchMessages();
  }, []);

  // แยกประเภท
  const articles = useMemo(
    () => messages.filter((m) => (m.articleType ?? "").trim() !== "บทความสั้น"),
    [messages]
  );
  const shorts = useMemo(
    () => messages.filter((m) => (m.articleType ?? "").trim() === "บทความสั้น"),
    [messages]
  );

  // คัด Top อย่างละ 5: like มาก → view มาก → ใหม่สุด
  const topArticles = useMemo(
    () => [...articles].sort(sortByPopularityThenRecency).slice(0, 5),
    [articles]
  );
  const topShorts = useMemo(
    () => [...shorts].sort(sortByPopularityThenRecency).slice(0, 5),
    [shorts]
  );

  // สไลด์วนบทความ (ซ้าย)
  useEffect(() => {
    if (topArticles.length === 0) return;
    if (isArticlePaused) return;
    if (articleTimerRef.current) window.clearInterval(articleTimerRef.current);
    articleTimerRef.current = window.setInterval(() => {
      setArticleIdx((i) => (i + 1) % topArticles.length);
    }, 5000) as unknown as number;
    return () => {
      if (articleTimerRef.current) window.clearInterval(articleTimerRef.current);
    };
  }, [topArticles.length, isArticlePaused]);

  const prevArticle = () => {
    if (topArticles.length === 0) return;
    setArticleIdx((i) => (i - 1 + topArticles.length) % topArticles.length);
  };
  const nextArticle = () => {
    if (topArticles.length === 0) return;
    setArticleIdx((i) => (i + 1) % topArticles.length);
  };

  const showModal = (message: WordHealingContent) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    sentRef.current = false; passedRef.current = false;
    setScrollProgress(0); setReadMs(0); setIsActive(true);
    if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;
    const imgCount = hasImage(message.photo) ? 1 : 0;
    setRequiredMs(estimateRequiredMs(message.content || "", imgCount));
  };

  const toggleLike = async (id: number) => {
    if (!isLoggedIn) { alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ"); return; }
    const currentlyLiked = !!liked[id];
    const userID = localStorage.getItem("id");
    if (!userID) { alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ"); return; }

    setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) } : m))
    );

    const ok = currentlyLiked ? await unlikeMessage(id, userID) : await likeMessage(id, userID);
    if (!ok) {
      setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) } : m))
      );
    }
  };

  // reader loop (modal)
  useEffect(() => {
    if (!isModalVisible) return;
    const onAct = () => (lastActivityRef.current = Date.now());
    window.addEventListener("mousemove", onAct);
    window.addEventListener("keydown", onAct);
    window.addEventListener("wheel", onAct, { passive: true });
    window.addEventListener("touchmove", onAct, { passive: true });

    const computePct = () => {
      const el = scrollBodyRef.current; if (!el) return 0;
      const { scrollTop, clientHeight, scrollHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - 1) return 100;
      const ratio = (scrollTop + clientHeight) / Math.max(1, scrollHeight);
      return Math.max(0, Math.min(99, Math.floor(ratio * 100)));
    };

    const evalPass = (msg: WordHealingContent | null, pctNow: number, ms: number) => {
      if (!msg) return false;
      const contentLen = (msg.content || "").trim().length;
      const isVeryShort = contentLen <= 60;
      const scrollable = scrollBodyRef.current
        ? scrollBodyRef.current.scrollHeight > scrollBodyRef.current.clientHeight + 2
        : false;
      const timeOk = isVeryShort ? true : ms >= requiredMs * 0.7;
      const contentOk = scrollable ? pctNow >= 90 : true;
      return timeOk && contentOk;
    };

    const timer = setInterval(() => {
      const visible = !document.hidden;
      const active = Date.now() - lastActivityRef.current < 15000;
      setIsActive(visible && active);
      if (visible && active) setReadMs((t) => t + 1000);

      const nowPct = computePct();
      setScrollProgress((prev) => Math.max(prev, nowPct));
      if (!passedRef.current && evalPass(selectedMessage, nowPct, readMs + (visible && active ? 1000 : 0))) {
        passedRef.current = true;
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", onAct);
      window.removeEventListener("keydown", onAct);
      window.removeEventListener("wheel", onAct);
      window.removeEventListener("touchmove", onAct);
    };
  }, [isModalVisible, selectedMessage, requiredMs, readMs]);

  const computePctNow = () => {
    const el = scrollBodyRef.current; 
    if (!el) return 0;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 1) return 100;
    const ratio = (scrollTop + clientHeight) / Math.max(1, scrollHeight);
    return Math.max(0, Math.min(99, Math.floor(ratio * 100)));
  };
  const onModalBodyScroll: React.UIEventHandler<HTMLDivElement> = () => {
    lastActivityRef.current = Date.now();
    setScrollProgress((prev) => Math.max(prev, computePctNow()));
  };

  const handleCancel = async () => {
    try {
      if (selectedMessage && !sentRef.current && passedRef.current) {
        sentRef.current = true;
        const pctFinal = Math.max(computePctNow(), scrollProgress);
        const res = await countViewMessage(selectedMessage.id, {
          readMs,
          pctScrolled: pctFinal,
        });
        const newCount =
          typeof res?.view_count === "number"
            ? res.view_count
            : (selectedMessage.viewCount || 0) + 1;

        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessage.id ? { ...m, viewCount: newCount } : m))
        );
        setSelectedMessage((prev) => (prev ? { ...prev, viewCount: newCount } : prev));
      }
    } catch {}
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="font-ibmthai mt-4 px-4 sm:px-6 lg:px-8 xl:px-30">
      {/* ซ่อน scrollbar สำหรับ WebKit */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

      <div className="text-2xl sm:text-2xl mb-4">
        <p className="px-2 text-basic-text dark:text-text-dark">ข้อความให้กำลังใจเเละบทความ</p>
      </div>

      {/* มือถือ + แท็บเล็ต (< xl) */}
      <div className="block xl:hidden">
        {/* การ์ดหัวข้อ */}
        <div className="relative overflow-hidden rounded-2xl p-4
                        bg-gradient-to-br from-[#FFD7E1] via-[#F8BBD0] to-[#F48FB1]
                        shadow-[0_8px_24px_rgba(240,98,146,0.25)] flex flex-col">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-9 shrink-0 rounded-full bg-white shadow-sm">
              <Heart className="w-5 h-5 text-[#F06292]" />
            </div>
            <h3 className="text-[17px] sm:text-xl font-extrabold tracking-tight text-black">
              ข้อความให้กำลังใจ
            </h3>
          </div>

          <div className="mt-3 mx-auto size-24 sm:size-32 rounded-full overflow-hidden shadow-lg ring-2 ring-white/60">
            <img src={healmessage} alt="ภาพประกอบข้อความให้กำลังใจ" className="w-full h-full object-cover" />
          </div>

          <p className="mt-3 text-xl sm: md:text-xl leading-6 text-black/85">
            รับข้อความให้กำลังใจ ที่อาจเป็นสิ่งเล็ก ๆ แต่สร้างพลังให้หัวใจได้เสมอ ไม่ว่าคุณกำลังเผชิญเรื่องไหนอยู่ ลองพักหายใจสักนิด แล้วเปิดรับถ้อยคำดี ๆ ที่จะค่อย ๆ เติมแรงฮึบและรอยยิ้มกลับมาใหม่นะ
          </p>

          <button
            onClick={() => navigate("/message")}
            className="mt-4 mx-auto px-4 py-2 bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] text-white rounded-full hover:to-[#2BD9FF] transition"
          >
            ดูเพิ่มเติม
          </button>
        </div>

        {/* ซ้าย (บทความ) → สไลด์วน */}
        <div
          className="bg-[#BFEAF5] dark:bg-chat-dark rounded-2xl p-3 shadow-sm mt-3"
          onMouseEnter={() => setIsArticlePaused(true)}
          onMouseLeave={() => setIsArticlePaused(false)}
        >
          {topArticles.length === 0 ? (
            <EmptyState label="บทความ" />
          ) : (
            <div className="relative">
              {(() => {
                const m = topArticles[articleIdx];
                return (
                  <article className="bg-[#BFEAF5] dark:bg-[#1B2538] rounded-2xl p-3">
                    {hasImage(m.photo) && (
                      <div className="w-full grid place-items-center py-2">
                        {/* รูปฝั่งซ้าย: สี่เหลี่ยมขอบมน 4:3 (บังคงทรงทุกอุปกรณ์) */}
                        <div className="w-full max-w-[680px] aspect-[4/3] rounded-2xl overflow-hidden">
                          <img src={m.photo!} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <h3 className="mt-2 text-base sm:text-lg font-bold dark:text-white text-center line-clamp-2">
                      {m.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 justify-center">
                      {m.articleType && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                          {m.articleType}
                        </span>
                      )}
                      <span className="text-xs text-gray-600 dark:text-white">{fmtDate(m.date)}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleLike(m.id)} className="text-2xl" aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}>
                          {liked[m.id] ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart className="text-black dark:text-[#5DE2FF]" />}
                        </button>
                        <span className="tabular-nums dark:text-white">{m.no_of_like}</span>
                        <div className="flex items-center gap-1">
                          <AiOutlineEye className="text-black w-7 h-7 dark:text-[#5DE2FF]" />
                          <span className="tabular-nums dark:text-white">{m.viewCount ?? 0}</span>
                        </div>
                      </div>
                      <button onClick={() => showModal(m)} className="px-4 py-1.5 bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white rounded-lg flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> อ่าน
                      </button>
                    </div>
                  </article>
                );
              })()}

              {/* controls */}
              <div className="mt-2 flex items-center justify-center gap-3">
                <button onClick={prevArticle} className="px-3 py-1 rounded-full bg-white/60 hover:bg-white">‹</button>
                <div className="flex items-center gap-1">
                  {topArticles.map((_, i) => (
                    <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === articleIdx ? "bg-sky-600" : "bg-sky-300"}`} onClick={() => setArticleIdx(i)} />
                  ))}
                </div>
                <button onClick={nextArticle} className="px-3 py-1 rounded-full bg-white/60 hover:bg-white">›</button>
              </div>
            </div>
          )}
        </div>

        {/* ขวา (Top 5) */}
        <div className="bg-[#BFEAF5] dark:bg-chat-dark rounded-2xl p-3 shadow-sm mt-3">
          {topShorts.length === 0 ? (
            <EmptyState label="ข้อความให้กำลังใจ" />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {topShorts.map((s) => (
                <div key={s.id} className="rounded-2xl p-3 bg-white/70 dark:bg-[#222b3d] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.photo && <img src={s.photo} alt="" className="w-12 h-12 rounded-full object-cover" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#686868] dark:text-text-dark line-clamp-1">{s.name}</p>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-[#5DE2FF] line-clamp-2 font-bold">{s.content || "-"}</p>
                    </div>
                  </div>
                  <button onClick={() => showModal(s)} className="px-3 py-1.5 rounded-full bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white shrink-0">
                    อ่าน
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* เดสก์ท็อป (>= xl) — สองคอลัมน์ */}
      <div className="hidden xl:grid grid-cols-2 gap-6 items-stretch">
        {/* ซ้าย */}
        <div className="h-[74vh] bg-[#BFEAF5] dark:bg-chat-dark rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col"
             onMouseEnter={() => setIsArticlePaused(true)}
             onMouseLeave={() => setIsArticlePaused(false)}>
          {topArticles.length === 0 ? (
            <EmptyState label="บทความ" />
          ) : (
            <div className="relative flex flex-col h-full">
              {(() => {
                const m = topArticles[articleIdx];
                return (
                  <article className="bg-[#BFEAF5] dark:bg-[#1B2538] rounded-2xl p-4 flex flex-col h-full">
                    {hasImage(m.photo) && (
                      <div className="flex-1 grid place-items-center">
                        {/* รูปฝั่งซ้าย (Desktop): สี่เหลี่ยมขอบมน 4:3 */}
                        <div className="w-full max-w-[min(62vh,740px)] aspect-[4/3] rounded-2xl overflow-hidden">
                          <img src={m.photo!} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="mt-3 space-y-1">
                      <h3 className="text-lg font-bold text-center dark:text-white line-clamp-2">
                        {m.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 justify-center">
                      {m.articleType && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                          {m.articleType}
                        </span>
                      )}
                      <span className="text-xs dark:text-white">{fmtDate(m.date)}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => toggleLike(m.id)}
                          className="text-3xl"
                          aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
                        >
                          {liked[m.id] ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart className=" text-blck dark:text-[#5DE2FF]"/>}
                        </button>
                        <span className="tabular-nums dark:text-white">{m.no_of_like}</span>
                        <div className="flex items-center gap-1">
                          <AiOutlineEye className="w-9 h-9 text-black dark:text-[#5DE2FF]" />
                          <span className="tabular-nums dark:text-white">{m.viewCount ?? 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => showModal(m)}
                        className="px-6 py-2 bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white rounded-lg flex items-center gap-3"
                      >
                        <BookOpen className="w-5 h-5" /> อ่าน
                      </button>
                    </div>
                  </article>
                );
              })()}

              {/* controls + dots */}
              <div className="mt-2 flex items-center justify-center gap-4">
                <button onClick={prevArticle} className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-white">‹</button>
                <div className="flex items-center gap-1">
                  {topArticles.map((_, i) => (
                    <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === articleIdx ? "bg-sky-600" : "bg-sky-300"}`} onClick={() => setArticleIdx(i)} />
                  ))}
                </div>
                <button onClick={nextArticle} className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-white">›</button>
              </div>

              <div className="mt-1 text-center text-[11px] text-slate-600">
                {isArticlePaused}
              </div>
            </div>
          )}
        </div>

        {/* ขวา */}
        <div className="h-[74vh] flex flex-col">
          {/* การ์ดหัวข้อ */}
          <div className="shrink-0 rounded-2xl p-4 md:p-5 bg-gradient-to-br from-[#FAD1DC] via-[#F8BBD0] to-[#F48FB1] shadow-[0_10px_26px_rgba(240,98,146,0.25)]">
            {/* แถวหัวข้อ + ปุ่ม */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm grid place-items-center">
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#F06292]" />
                </div>
                <p className="text-xl md:text-xl font-extrabold text-[#1F1F22]">
                  ข้อความให้กำลังใจ
                </p>
              </div>

              {/* ปุ่มเพิ่มเติม */}
              <button
                onClick={() => navigate("/audiohome/message")}
                className="px-4 py-1.5 md:px-5 md:py-2 rounded-full text-white
                          bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] shadow-md"
              >
                เพิ่มเติม
              </button>
            </div>

            {/* เนื้อหาในการ์ด */}
            <div className="mt-3 flex items-center gap-3 md:gap-4">
              <div className="shrink-0 size-16 md:size-20 rounded-full overflow-hidden ring-2 ring-white/60 shadow-lg">
                <img src={healmessage} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="text-xl  md:text-xl leading-6 text-black/85 line-clamp-2 md:line-clamp-3">
                รับข้อความให้กำลังใจ ที่อาจเป็นสิ่งเล็ก ๆ แต่สร้างพลังให้หัวใจได้เสมอ ไม่ว่าคุณกำลังเผชิญเรื่องไหนอยู่
                ลองพักหายใจสักนิด แล้วเปิดรับถ้อยคำดี ๆ ที่จะค่อย ๆ เติมแรงฮึบและรอยยิ้มกลับมาใหม่นะ
              </p>
            </div>
          </div>

          {/* ลิสต์ Top5 */}
          <div className="mt-3 flex-1 bg-[#BFEAF5] dark:bg-chat-dark rounded-2xl p-4 shadow-sm overflow-y-auto">
            {topShorts.length === 0 ? (
              <EmptyState label="ข้อความให้กำลังใจ" />
            ) : (
              <div className="flex flex-col gap-3">
                {topShorts.map((s: WordHealingContent) => (
                  <div
                    key={s.id}
                    className="bg-white/70 dark:bg-[#222b3d] rounded-2xl p-3
                              grid grid-cols-12 items-center gap-3"
                  >
                    {/* 1) รูป: วงกลม */}
                    <div className="col-span-2 justify-self-start">
                      {s.photo && (
                        <img
                          src={s.photo}
                          alt=""
                          className="w-12 h-12 md:w-14 md:h-14 xl:w-16 xl:h-16
                                    rounded-full object-cover overflow-hidden"
                        />
                      )}
                    </div>

                    {/* 2) ชื่อ + แท็ก */}
                    <div className="col-span-2 min-w-0">
                      {s.articleType && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] xl:text-xs bg-sky-100 text-sky-700">
                          {s.articleType}
                        </span>
                      )}
                      <p className="mt-1 text-sm font-bold text-[#686868] dark:text-text-dark truncate">{s.name}</p>
                    </div>

                    {/* 3) คำโปรย / เนื้อหา */}
                    <div className="col-span-7 min-w-0 text-left">
                      <p className="text-3xl xl:text-sm  text-black dark:text-white font-bold line-clamp-2">
                        {s.content || "-"}
                      </p>
                    </div>

                    {/* 4) ปุ่มอ่าน */}
                    <div className="col-span-1 justify-self-end">
                      <button
                        onClick={() => showModal(s)}
                        className="px-4 py-1.5 rounded-full bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white"
                      >
                        อ่าน
                      </button>
                    </div>
                  </div>
                ))}
              </div>
             )}
           </div>
         </div>
        </div>

      {/* Modal อ่าน */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={Math.min(1000, typeof window !== "undefined" ? window.innerWidth - 24 : 1000)}
        centered
        destroyOnClose
        styles={{
          mask: { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)" },
          content: { padding: 0, background: "transparent", boxShadow: "none", border: "none", overflow: "hidden" },
          body: { padding: 0 },
          header: { display: "none" },
          footer: { display: "none" },
        }}
        closeIcon={<span style={{ color: "#e50c0cff", fontSize: 20, lineHeight: 1 }}>✕</span>}
      >
        {selectedMessage && (
          <ArticleReader
            message={selectedMessage}
            scrollBodyRef={scrollBodyRef}
            onModalBodyScroll={onModalBodyScroll}
            scrollProgress={scrollProgress}
            isActive={isActive}
            readMs={readMs}
            requiredMs={requiredMs}
          />
        )}
      </Modal>
    </div>
  );
}
