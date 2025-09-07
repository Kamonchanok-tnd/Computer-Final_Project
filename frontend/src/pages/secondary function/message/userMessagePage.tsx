import React, { useEffect, useRef, useState, useMemo } from "react";
import { Modal } from "antd";
import { AiOutlineArrowLeft, AiOutlineEye, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BookOpen } from "lucide-react";
import {getAllWordHealingMessagesForUser,likeMessage,unlikeMessage,checkIfLikedArticle,countViewMessage,} from "../../../services/https/message";
import type { WordHealingContent } from "../../../interfaces/IWordHealingContent";
import AmbientBackground from "./AmbientBackground";

/* ============================ Global styles/constants ============================ */
// ปุ่ม "อ่าน" ใช้ร่วมกันทั้งไฟล์ (กันประกาศซ้ำ)
const READ_BTN =
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5DE2FF] text-white hover:bg-[#4AC5D9] transition";

/* ============================ Helpers ============================ */
const isPdf = (s?: string | null) =>
  !!s && (s.includes("application/pdf") || /\.pdf($|\?)/i.test(s || ""));
const isImage = (s?: string | null) =>
  !!s &&
  (s.startsWith("data:image/") ||
    /image\//i.test(s) ||
    /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(s || ""));
const hasImage = (s?: string | null) => !!s && !isPdf(s) && isImage(s);

const fmtDate = (d?: string | Date) => {
  if (!d) return "ไม่มีวันที่";
  const dd = new Date(d);
  if (Number.isNaN(dd.getTime())) return "ไม่มีวันที่";
  const today = new Date(); today.setHours(0,0,0,0);
  const that  = new Date(dd); that.setHours(0,0,0,0);
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86_400_000);
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
  const textMs = (wordLike / WPM) * 60_000;
  const imgMs  = Math.min(imageCount, 10) * 3000;
  const total  = base + textMs + imgMs;
  return Math.max(8000, Math.min(total * 0.7, 300_000));
};

/* ====================== ShortBubble ====================== */
type ShortBubbleProps = {
  content: string;
  author?: string;
  dateStr?: string;
  photo?: string | null;
  isRight?: boolean;   // ใช้กำหนดฝั่ง → สีสลับ
  liked?: boolean;
  likeCount?: number;
  viewCount?: number;
  onLike?: () => void;
  onImageClick?: (src: string) => void;
  onOpen?: () => void;
  layout?: "bubble" | "card";
};

const ShortBubble: React.FC<ShortBubbleProps> = ({
  content,
  author = "ไม่ระบุผู้เขียน",
  dateStr,
  photo,
  isRight = false,
  liked = false,
  likeCount = 0,
  viewCount = 0,
  onLike,
  onImageClick,
  onOpen,
  layout = "card",
}) => {
  // สีการ์ดเดิม (สำหรับฝั่งซ้าย)
  const CARD_BG = "#EAFBFF";
  const CARD_RING = "#BFEAF5";

  const metaColor = isRight ? "text-white/90" : "text-slate-500 dark:text-slate-500";
  const ghostBtn =
    isRight
      ? "border-white/60 hover:bg-white/20 text-white"
      : "border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-100";

  if (layout === "card") {
    const IMG_W = "w-[128px] sm:w-[136px]";
    const IMG_H = "h-[96px] sm:h-[112px]";
    const emphasisBg = isRight ? "bg-white/20" : "bg-black/5 dark:bg-white/10";
    const emphasisRing = isRight ? "ring-white/25" : "ring-black/5 dark:ring-white/10";

    const outerClass = isRight
      ? "relative flex-1 rounded-2xl px-3 py-3 shadow bg-gradient-to-br from-[#5DE2FF] to-[#49C3D6] text-white"
      : "relative flex-1 rounded-2xl px-3 py-3 shadow";
    const outerStyle = isRight
      ? {}
      : { background: CARD_BG, boxShadow: "0 8px 20px rgba(0,0,0,0.06)", border: `1px solid ${CARD_RING}` };

    return (
      <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
        <div className="flex items-stretch gap-3 max-w-[820px] w-full animate-[fadeSlide_.25s_ease-out]">
          <div className={outerClass} style={outerStyle} role="group">
            <div
              className="flex items-center gap-3"
              onClick={onOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
              title="คลิกเพื่ออ่าน"
            >
              {!!photo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick?.(photo!);
                  }}
                  className={`shrink-0 overflow-hidden rounded-xl ${isRight ? "ring-1 ring-white/40" : "ring-1 ring-black/5"}`}
                  title="คลิกดูรูปใหญ่"
                >
                  <img
                    src={photo!}
                    alt=""
                    className={`${IMG_W} ${IMG_H} object-cover`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                </button>
              )}

              <div className="flex-1 min-h-[96px] sm:min-h-[112px] flex items-center">
                <div className={["w-full rounded-xl px-3 py-2", emphasisBg, "ring", emphasisRing, "backdrop-blur-[1px]"].join(" ")}>
                  <p
                    className={`text-center font-semibold text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words ${isRight ? "text-white" : "text-slate-900 dark:text-slate-900"}`}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {content}
                  </p>

                  <div className={`mt-1 text-[11px] sm:text-[12px] ${metaColor} text-center`}>
                    {author} • {dateStr}
                  </div>

                  <div className={`mt-2 flex items-center justify-center gap-4 text-[12px] ${isRight ? "text-white" : ""}`}>
                    <span className="inline-flex items-center gap-1">
                      <AiOutlineEye  className={`${isRight ? "text-white" : "text-[#5DE2FF]"} w-6 h-6`} />
                      <span className={isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-500 tabular-nums"}>{viewCount}</span>
                    </span>

                    {/* ♥ แดงเมื่อถูกใจ */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onLike?.(); }}
                      className="inline-flex items-center gap-1"
                      aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
                      title="ถูกใจ"
                    >
                      {liked ? <AiFillHeart size={18} className="text-red-500" /> : <AiOutlineHeart size={18} className={isRight ? "text-white" : ""} />}
                      <span className={isRight ? "text-white text-[12px]" : "text-slate-700 dark:text-slate-500 text-[12px]"}>{likeCount}</span>
                    </button>

                    <button
                      className={READ_BTN}
                      onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      อ่าน
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* หาง */}
            {isRight ? (
              <div className="absolute w-3 h-3 rotate-45 -bottom-1 right-3 bg-[#49C3D6] shadow" />
            ) : (
              <div
                className="absolute w-3 h-3 rotate-45 -bottom-1 left-3 shadow"
                style={{ background: CARD_BG, borderBottom: `1px solid ${CARD_RING}`, borderRight: `1px solid ${CARD_RING}` }}
              />
            )}
          </div>

          {/* ปุ่มหัวใจวงกลม (กรอบเดิม) */}
          <button
            onClick={() => onLike?.()}
            className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(" ")}
            aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
            title="ถูกใจ"
          >
            {liked ? <AiFillHeart size={20} className="text-red-500" /> : <AiOutlineHeart size={20} className={isRight ? "text-white" : ""} />}
          </button>
        </div>

        <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // bubble เดิม (ไม่ใช่การ์ด)
  const bubbleColor = isRight
    ? "bg-gradient-to-br from-[#5DE2FF] to-[#49C3D6] text-white"
    : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100";
  const metaColor2 = isRight ? "text-white/90" : "text-slate-500 dark:text-slate-300";
  const tailColor = isRight ? "bg-[#49C3D6]" : "bg-white dark:bg-slate-800";
  const ringColor = isRight ? "ring-white/30" : "ring-slate-200 dark:ring-slate-600";

  return (
    <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-[780px] w-full animate-[fadeSlide_.25s_ease-out]">
        <div
          className={`relative rounded-2xl px-4 py-2 shadow ${bubbleColor}`}
          onDoubleClick={onLike}
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
          title="คลิกเพื่ออ่าน"
        >
          <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
          <p className="text-lg leading-relaxed whitespace-pre-wrap break-words ">{content}</p>

          {!!photo && (
            <button
              onClick={(e) => { e.stopPropagation(); onImageClick?.(photo!); }}
              className="mt-2 block relative overflow-hidden rounded-xl group"
              title="คลิกเพื่อดูรูปใหญ่"
            >
              <img
                src={photo!}
                alt=""
                className="w-full max-h-56 sm:max-h-64 object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
              <span className={`pointer-events-none absolute inset-0 rounded-xl ring-1 ${ringColor}`} />
              <span className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </button>
          )}

          <div className={`mt-1 text-[12px] ${metaColor2}`}>{author} • {dateStr}</div>

          <div className="mt-2 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1 opacity-90">
              <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
              <span className={isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-200 tabular-nums"}>{viewCount}</span>
            </div>
            <button className={READ_BTN} onClick={(e) => { e.stopPropagation(); onOpen?.(); }}>
              <BookOpen className="w-3.5 h-3.5" /> อ่าน
            </button>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onLike?.(); }}
          className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(" ")}
          aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
          title="ถูกใจ"
        >
          {liked ? <AiFillHeart size={20} className="text-red-500" /> : <AiOutlineHeart size={20} className={isRight ? "text-white" : ""} />}
          <span className={["ml-1 text-[12px] tabular-nums", isRight ? "text-white" : "text-slate-700 dark:text-slate-200"].join(" ")}>
            {likeCount}
          </span>
        </button>
      </div>

      <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

/* ============================= Page ============================= */
type PageMode = "shorts" | "articles" | "likedShorts" | "likedArticles";

export default function UserMessagePage() {
  const [mode, setMode] = useState<PageMode>("shorts");
  const [searchQuery, setSearchQuery] = useState("");

  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // pagination
  const [shortPage, setShortPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const [likedShortsPage, setLikedShortsPage] = useState(1);
  const [likedArticlesPage, setLikedArticlesPage] = useState(1);

  const SHORTS_PER_PAGE = 10;
  const ARTICLES_PER_PAGE = 5;
  const LIKED_SHORTS_PER_PAGE = 10;
  const LIKED_ARTICLES_PER_PAGE = 10;

  const [shortImagePreview, setShortImagePreview] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);

  // Reader states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readMs, setReadMs] = useState(0);
  const [requiredMs, setRequiredMs] = useState(15000);
  const [isActive, setIsActive] = useState(true);

  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const lastActivityRef = useRef(Date.now());
  const passedRef = useRef(false);
  const sentRef = useRef(false);

  useEffect(() => {
    ["/ambient/day-clouds.jpg", "/ambient/milkyway.jpg"].forEach((u) => { const img = new Image(); img.src = u; });
  }, []);

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

  /* ------------------------------ Search + Split ------------------------------ */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShortPage(1); setArticlePage(1); setLikedShortsPage(1); setLikedArticlesPage(1);
  };

  const baseFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return messages.filter((m) =>
      [m.name, m.author, m.articleType ?? "", m.content ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // เรียงวันล่าสุดก่อน
  const byDateDesc = (a: WordHealingContent, b: WordHealingContent) =>
    new Date(b.date as any).getTime() - new Date(a.date as any).getTime();

  // เรียง id ล่าสุดก่อนภายในวัน
  const byIdDesc = (a: WordHealingContent, b: WordHealingContent) => (b.id ?? 0) - (a.id ?? 0);

  const shortsAll = useMemo(
    () => baseFiltered.filter((m) => (m.articleType ?? "").trim() === "บทความสั้น").sort(byDateDesc),
    [baseFiltered]
  );
  const articlesAll = useMemo(
    () => baseFiltered.filter((m) => (m.articleType ?? "").trim() !== "บทความสั้น").sort(byDateDesc),
    [baseFiltered]
  );
  const likedShortsAll = useMemo(
    () => baseFiltered.filter((m) => liked[m.id] && (m.articleType ?? "") === "บทความสั้น").sort(byDateDesc),
    [baseFiltered, liked]
  );
  const likedArticlesAll = useMemo(
    () => baseFiltered.filter((m) => liked[m.id] && (m.articleType ?? "") !== "บทความสั้น").sort(byDateDesc),
    [baseFiltered, liked]
  );

  // pagination totals
  const shortsTotalPages        = Math.max(1, Math.ceil(shortsAll.length / SHORTS_PER_PAGE));
  const articlesTotalPages      = Math.max(1, Math.ceil(articlesAll.length / ARTICLES_PER_PAGE));
  const likedShortsTotalPages   = Math.max(1, Math.ceil(likedShortsAll.length / LIKED_SHORTS_PER_PAGE));
  const likedArticlesTotalPages = Math.max(1, Math.ceil(likedArticlesAll.length / LIKED_ARTICLES_PER_PAGE));

  // page items
  const shortsPageItems = useMemo(
    () => shortsAll.slice((shortPage - 1) * SHORTS_PER_PAGE, shortPage * SHORTS_PER_PAGE),
    [shortsAll, shortPage]
  );
  const articlesPageItems = useMemo(
    () => articlesAll.slice((articlePage - 1) * ARTICLES_PER_PAGE, articlePage * ARTICLES_PER_PAGE),
    [articlesAll, articlePage]
  );
  const likedShortsPageItems = useMemo(
    () => likedShortsAll.slice((likedShortsPage - 1) * LIKED_SHORTS_PER_PAGE, likedShortsPage * LIKED_SHORTS_PER_PAGE),
    [likedShortsAll, likedShortsPage]
  );
  const likedArticlesPageItems = useMemo(
    () => likedArticlesAll.slice((likedArticlesPage - 1) * LIKED_ARTICLES_PER_PAGE, likedArticlesPage * LIKED_ARTICLES_PER_PAGE),
    [likedArticlesAll, likedArticlesPage]
  );

  /* --------------------------------- Like --------------------------------- */
  const toggleLike = async (id: number) => {
    if (!isLoggedIn) { alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ"); return; }
    const currentlyLiked = !!liked[id];
    const uid = localStorage.getItem("id");
    if (!uid) { alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ"); return; }

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

  /* ---------------------------- Reader ---------------------------- */
  const showModal = (message: WordHealingContent) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    sentRef.current = false; passedRef.current = false;
    setScrollProgress(0); setReadMs(0); setIsActive(true);
    if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;

    const imgCount = hasImage(message.photo) ? 1 : 0;
    setRequiredMs(estimateRequiredMs(message.content || "", imgCount));
  };

  const computeContentPct = () => {
    const el = scrollBodyRef.current; if (!el) return 0;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 1) return 100;
    const ratio = (scrollTop + clientHeight) / Math.max(1, scrollHeight);
    return Math.max(0, Math.min(99, Math.floor(ratio * 100)));
  };

  const evalPass = (msg: WordHealingContent | null, pct: number, ms: number) => {
    if (!msg) return false;
    const contentLen = (msg.content || "").trim().length;
    const isVeryShort = contentLen <= 60;
    const scrollable = scrollBodyRef.current
      ? scrollBodyRef.current.scrollHeight > scrollBodyRef.current.clientHeight + 2
      : false;
    const timeOk = isVeryShort ? true : ms >= requiredMs * 0.7;
    const contentOk = scrollable ? pct >= 90 : true;
    return timeOk && contentOk;
  };

  useEffect(() => {
    if (!isModalVisible) return;
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
      setScrollProgress(computeContentPct());
      if (!passedRef.current && evalPass(selectedMessage, computeContentPct(), readMs + (visible && active ? 1000 : 0))) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible, selectedMessage, requiredMs]);

  const onModalBodyScroll: React.UIEventHandler<HTMLDivElement> = () => {
    lastActivityRef.current = Date.now();
    setScrollProgress(computeContentPct());
    if (!passedRef.current && evalPass(selectedMessage, computeContentPct(), readMs)) passedRef.current = true;
  };

  const handleCancel = async () => {
    if (selectedMessage && !sentRef.current && passedRef.current && isLoggedIn) {
      sentRef.current = true;
      const pctFinal = computeContentPct();
      const msFinal  = readMs;
      try {
        const res = await countViewMessage(selectedMessage.id, { readMs: msFinal, pctScrolled: Math.max(pctFinal, scrollProgress) });
        const newCount = typeof res?.view_count === "number" ? res.view_count : (selectedMessage.viewCount || 0) + 1;
        setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? { ...m, viewCount: newCount } : m)));
        setSelectedMessage((prev) => (prev ? { ...prev, viewCount: newCount } : prev));
      } catch {}
    }
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  const handleBack = () => window.history.back();

  /* ----------------- Group by day ----------------- */
  function groupByDay<T extends { date: string | Date }>(items: T[]) {
    const groups: Record<string, T[]> = {};
    for (const it of items) {
      const d = new Date(it.date);
      const key = d.toDateString();
      (groups[key] ||= []).push(it);
    }
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }
  function humanDay(label: string) {
    const d = new Date(label);
    const today = new Date(); today.setHours(0,0,0,0);
    const that  = new Date(d); that.setHours(0,0,0,0);
       const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
    if (diff === 0) return "วันนี้";
    if (diff === 1) return "เมื่อวาน";
    return d.toLocaleDateString("en-GB");
  }

  const isLikedMode = mode === "likedShorts" || mode === "likedArticles";

  /* ================================ UI ================================ */
  return (
    <div className="font-ibmthai relative flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-[#C2F4FF] to-[#5DE2FF] dark:bg-gradient-to-b dark:from-[#1B2538] dark:to-[#0E1626] transition-all duration-300">
      {/* Ambient */}
      <div aria-hidden className={["pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ease-out", isLikedMode ? "opacity-0" : "opacity-100"].join(" ")}>
        <AmbientBackground scope="page" dayCloudsSrc="/ambient/day-clouds.jpg" nightStyle="milkyway" milkyWaySrc="/ambient/milkyway.jpg" />
      </div>

      <div className="relative z-10 w-full">
        {/* Header: ปุ่มย้อนกลับ + ค้นหา (บรรทัดเดียว) */}
        <div className="w-full max-w-5xl mx-auto mb-4 flex items-center gap-3">
          <button onClick={handleBack} className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300" aria-label="ย้อนกลับ">
            <AiOutlineArrowLeft size={24} />
          </button>
          <input
            type="text"
            placeholder="ค้นหา (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1 p-2 rounded-lg border border-gray-300 dark:text-white dark:bg-gray-800"
          />
        </div>

        {/* Tabs กลางจอ */}
        <div className="w-full max-w-5xl mx-auto mb-6 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/70 p-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
            {([
              { key: "shorts",        label: "บทความสั้น",        count: shortsAll.length },
              { key: "articles",      label: "บทความ",            count: articlesAll.length },
              { key: "likedShorts",   label: "ที่ถูกใจ (บทสั้น)", count: likedShortsAll.length },
              { key: "likedArticles", label: "ที่ถูกใจ (บทความ)", count: likedArticlesAll.length },
            ] as { key: PageMode; label: string; count: number }[]).map((b) => {
              const active = mode === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => setMode(b.key)}
                  className={[
                    "relative px-4 py-2 text-sm font-medium rounded-full transition",
                    active ? "bg-[#5DE2FF] text-white shadow" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
                  ].join(" ")}
                >
                  {b.label}
                  <span
                    className={[
                      "ml-2 inline-flex items-center justify-center h-5 rounded-full text-[11px] tabular-nums min-w-[2.25rem]",
                      active ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100",
                    ].join(" ")}
                  >
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================== CONTENT ============================== */}
        {/* ---- บทความสั้น ---- */}
        <section className={mode === "shorts" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "shorts"}>
          <div className="w-full max-w-5xl mx-auto mb-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">บทความสั้น ({shortsAll.length})</h3>

            {shortsPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">ไม่มีบทความสั้น</div>
            ) : (
              groupByDay(shortsPageItems).map(([dayKey, items]) => {
                const itemsSorted = [...items].sort(byIdDesc); // id ล่าสุดก่อน
                return (
                  <div key={dayKey} className="mb-6">
                    <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                      <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                        {humanDay(dayKey)}
                      </span>
                    </div>

                    {itemsSorted.map((s: any, idx: number) => {
                      const isRight = idx % 2 === 1; // สลับซ้าย/ขวา
                      return (
                        <ShortBubble
                          key={s.id}
                          content={s.content}
                          author={s.author}
                          dateStr={fmtDate(s.date)}
                          photo={hasImage(s.photo) ? String(s.photo) : undefined}
                          isRight={!!isRight}
                          liked={!!liked[s.id]}
                          likeCount={s.no_of_like}
                          viewCount={s.viewCount}
                          onLike={() => toggleLike(s.id)}
                          onImageClick={(src) => setShortImagePreview(src)}
                          onOpen={() => showModal(s)}
                          layout="card"
                        />
                      );
                    })}
                  </div>
                );
              })
            )}

            {shortsAll.length > SHORTS_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setShortPage((p) => Math.max(1, p - 1))} disabled={shortPage === 1}>ก่อนหน้า</button>
                <span>{`หน้า ${shortPage} จาก ${shortsTotalPages}`}</span>
                <button onClick={() => setShortPage((p) => Math.min(shortsTotalPages, p + 1))} disabled={shortPage === shortsTotalPages}>ถัดไป</button>
              </div>
            )}
          </div>
        </section>

        {/* ---- บทความ ---- */}
        <section className={mode === "articles" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "articles"}>
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">บทความ ({articlesAll.length})</h3>

            {articlesPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">ไม่มีบทความตามเงื่อนไข</div>
            ) : (
              groupByDay(articlesPageItems).map(([dayKey, items]) => {
                const itemsSorted = [...items].sort(byIdDesc);
                return (
                  <div key={dayKey} className="mb-6">
                    <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                      <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                        {humanDay(dayKey)}
                      </span>
                    </div>

                    <div className="grid gap-4 grid-cols-1">
                      {itemsSorted.map((m: WordHealingContent) => (
                        <div key={m.id} className="flex flex-col bg-[#BFEAF5] rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300">
                          <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

                          {hasImage(m.photo) && (
                            <figure className="mb-4 overflow-hidden rounded-lg">
                              <img
                                src={m.photo!}
                                alt=""
                                className="w-full aspect-[16/9] object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            </figure>
                          )}

                          <div className="flex items-center gap-2">
                            {m.articleType && <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{m.articleType}</span>}
                            <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
                          </div>

                          <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
                            {m.content}
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleLike(m.id)} className="text-3xl" aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}>
                                {liked[m.id] ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart />}
                              </button>
                              <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
                              <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
                              <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
                            </div>
                            <button onClick={() => showModal(m)} className={READ_BTN}>
                              <BookOpen className="w-5 h-5" />
                              <span>อ่าน</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {articlesAll.length > ARTICLES_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setArticlePage((p) => Math.max(1, p - 1))} disabled={articlePage === 1}>ก่อนหน้า</button>
                <span>{`หน้า ${articlePage} จาก ${articlesTotalPages}`}</span>
                <button onClick={() => setArticlePage((p) => Math.min(articlesTotalPages, p + 1))} disabled={articlePage === articlesTotalPages}>ถัดไป</button>
              </div>
            )}
          </div>
        </section>

        {/* ---- ที่ถูกใจ (บทสั้น) ---- */}
        <section className={mode === "likedShorts" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "likedShorts"}>
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">ที่ถูกใจ (บทสั้น) ({likedShortsAll.length})</h3>

            {likedShortsPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">ยังไม่มีบทความสั้นที่คุณถูกใจ</div>
            ) : (
              groupByDay(likedShortsPageItems).map(([dayKey, items]) => {
                const itemsSorted = [...items].sort(byIdDesc);
                return (
                  <div key={dayKey} className="mb-6">
                    <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                      <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                        {humanDay(dayKey)}
                      </span>
                    </div>

                    {itemsSorted.map((s: any, idx: number) => {
                      const isRight = idx % 2 === 1;
                      return (
                        <ShortBubble
                          key={s.id}
                          content={s.content}
                          author={s.author}
                          dateStr={fmtDate(s.date)}
                          photo={hasImage(s.photo) ? String(s.photo) : undefined}
                          isRight={!!isRight}
                          liked={!!liked[s.id]}
                          likeCount={s.no_of_like}
                          viewCount={s.viewCount}
                          onLike={() => toggleLike(s.id)}
                          onImageClick={(src) => setShortImagePreview(src)}
                          onOpen={() => showModal(s)}
                          layout="card"
                        />
                      );
                    })}
                  </div>
                );
              })
            )}

            {likedShortsAll.length > LIKED_SHORTS_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setLikedShortsPage((p) => Math.max(1, p - 1))} disabled={likedShortsPage === 1}>ก่อนหน้า</button>
                <span>{`หน้า ${likedShortsPage} จาก ${likedShortsTotalPages}`}</span>
                <button onClick={() => setLikedShortsPage((p) => Math.min(likedShortsTotalPages, p + 1))} disabled={likedShortsPage === likedShortsTotalPages}>ถัดไป</button>
              </div>
            )}
          </div>
        </section>

        {/* ---- ที่ถูกใจ (บทความ) ---- */}
        <section className={mode === "likedArticles" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "likedArticles"}>
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">ที่ถูกใจ (บทความ) ({likedArticlesAll.length})</h3>

            {likedArticlesPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">ยังไม่มีบทความที่คุณถูกใจ</div>
            ) : (
              groupByDay(likedArticlesPageItems).map(([dayKey, items]) => {
                const itemsSorted = [...items].sort(byIdDesc);
                return (
                  <div key={dayKey} className="mb-6">
                    <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                      <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                        {humanDay(dayKey)}
                      </span>
                    </div>

                    <div className="grid gap-4 grid-cols-1">
                      {itemsSorted.map((m: WordHealingContent) => (
                        <div key={m.id} className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300">
                          <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

                          {hasImage(m.photo) && (
                            <figure className="mb-4 overflow-hidden rounded-lg">
                              <img
                                src={m.photo!}
                                alt=""
                                className="w-full aspect-[16/9] object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            </figure>
                          )}

                          <div className="flex items-center gap-2">
                            {m.articleType && <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{m.articleType}</span>}
                            <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
                          </div>

                          <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
                            {m.content}
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleLike(m.id)} className="text-3xl" aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}>
                                {liked[m.id] ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart />}
                              </button>
                              <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
                              <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
                              <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
                            </div>
                            <button onClick={() => showModal(m)} className={READ_BTN}>
                              <BookOpen className="w-5 h-5" />
                              <span>อ่าน</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {likedArticlesAll.length > LIKED_ARTICLES_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setLikedArticlesPage((p) => Math.max(1, p - 1))} disabled={likedArticlesPage === 1}>ก่อนหน้า</button>
                <span>{`หน้า ${likedArticlesPage} จาก ${likedArticlesTotalPages}`}</span>
                <button onClick={() => setLikedArticlesPage((p) => Math.min(likedArticlesTotalPages, p + 1))} disabled={likedArticlesPage === likedArticlesTotalPages}>ถัดไป</button>
              </div>
            )}
          </div>
        </section>

        {/* ========================= Reader Modal ========================= */}
        <Modal
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={1000}
          centered
          destroyOnClose
          styles={{
            mask: { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)" },
            content: { padding: 0, background: "transparent", boxShadow: "none", border: "none", overflow: "hidden" },
            body: { padding: 0, paddingRight: 0, paddingBottom: 0 },
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

        {/* ========================= Lightbox รูปบทสั้น ========================= */}
        <Modal
          open={!!shortImagePreview}
          onCancel={() => setShortImagePreview(null)}
          footer={null}
          centered
          destroyOnClose
          width={720}
          styles={{
            mask: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" },
            content: { padding: 0, background: "transparent", boxShadow: "none", border: "none" },
            body: { padding: 0 },
          }}
          closeIcon={<span style={{ color: "#fff", fontSize: 22 }}>✕</span>}
        >
          {shortImagePreview && (
            <div className="p-2">
              <img
                src={shortImagePreview}
                alt=""
                className="w-full h-auto rounded-2xl object-contain bg-black/20"
                onError={() => setShortImagePreview(null)}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

/* ---------------------- ArticleReader ---------------------- */
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
  const contentPadYClass  = isVeryShort ? "py-10" : "py-4";
  const contentTextSize   = isVeryShort ? "text-2xl sm:text-3xl leading-9" : isShortish ? "text-xl leading-8" : "text-lg leading-7";
  const contentAlignClass = isVeryShort || isShortish ? "text-center" : "text-left";

  return (
    <div className="font-ibmthai relative h-[calc(100dvh-120px)] md:h-[calc(100dvh-160px)] overflow-hidden">
      <div
        ref={scrollBodyRef}
        onScroll={onModalBodyScroll}
        className="h-full overflow-y-auto overscroll-contain bg-[#F4FFFF] dark:bg-[#1B2538] dark:text-white"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* summary bar */}
        <div className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-2">
            <div className="flex items-center justify-between text-[13px] sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">อ่านแล้ว {Math.floor(scrollProgress)}%</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`} title="นับเวลาเฉพาะตอนหน้าจอเปิดและมีการใช้งาน">
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

        <div className={`${contentWidthClass} mx-auto w-full px-4 sm:px-6 ${contentPadYClass}`}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
            {message.name}
          </h1>

          {hasImage(message.photo) && (
            <div className="mt-4 flex justify-center">
              <img
                src={message.photo!}
                alt=""
                className="w-full sm:w-[520px] h-auto rounded-xl object-cover shadow"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <article className="prose prose-slate dark:prose-invert max-w-none mt-4">
            <p className={`whitespace-pre-wrap break-words ${contentTextSize} ${contentAlignClass}`}>{message.content || "-"}</p>
          </article>

          <div className="mt-4 flex flex-col gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-white">
            <div className="flex items-center gap-2">
              {message.articleType && <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{message.articleType}</span>}
              <span>{fmtDate(message.date)}</span>
            </div>

            <div><span className="opacity-80">ผู้เขียน: {message.author}</span></div>

            <div className="flex items-center justify-center gap-6 opacity-90 text-center mt-4">
              <span>ถูกใจทั้งหมด: {message.no_of_like}</span>
              <span>การเข้าชม: {message.viewCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 dark:hidden" style={{ background: "#F4FFFF" }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 hidden dark:block" style={{ background: "#1B2538" }} />
    </div>
  );
}
