import  { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatBan from "../../components/Home/ChatBan";
import Question from "../../components/Home/Question";

import Footer from "../../components/Home/Footer";

import Homeasmr from "../../components/Home/Homeasmr";

import Homemessage from "../../components/Home/Homemessage";
import Homedoctor from "../../components/Home/Homedoctor";
import { getAvailableGroupsAndNext } from "../../services/https/assessment";
import { logActivity } from "../../services/https/activity";
function Home() {
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<{
    groupId: number;
    quid: number;
  } | null>(null);
  const [_checking, setChecking] = useState(false);
  const [didFinishOnLogin, setDidFinishOnLogin] = useState(false);

  const checkOnLoginGroup = useCallback(async () => {
    // ✅ อ่าน uid ให้ชัวร์ (เหมือนที่ใช้ใน MoodPopup)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = Number(user?.id || localStorage.getItem("id"));

    if (!uid) {
      console.warn("⚠️ ไม่มี uid — ข้ามการเช็ค onLogin popup");
      setShowPopup(false);
      setPopupData(null);
      return;
    }

    try {
      setChecking(true);

      // ✅ ขอเฉพาะกลุ่ม onLogin
      const groups = await getAvailableGroupsAndNext(uid, "onLogin");
      // console.log("📦 groups (onLogin):", groups);

      // ถ้า backend ฟิลเตอร์แล้ว จะเหลือแต่ onLogin; เผื่อไว้หาอีกรอบ
      const found = groups.find((g: any) => g.available && g.next);

      if (found && found.next) {
        // ⏳ ยัง “available” แปลว่ายังไม่ได้ทำ → ต้องแสดง popup
        // console.log("🟢 onLogin ยังไม่ทำ → เตรียมนำทางไป popup", found);
        setPopupData({ groupId: found.id, quid: found.next.id });
        setShowPopup(true);
      } else {
        // ✅ ไม่ available แล้ว (หรือไม่มี next) → ถือว่าทำไปแล้ว → ซ่อน popup
        // console.log("✅ onLogin ทำไปแล้ว/ไม่มี next → ซ่อน popup");
        setShowPopup(false);
        setPopupData(null);
        setDidFinishOnLogin(true); // ⬅️ เพิ่มบรรทัดนี้
      }
    } catch (e) {
      console.error("❌ ตรวจ onLogin popup ล้มเหลว:", e);
      // ล้มเหลวก็อย่าให้กวนผู้ใช้
      setShowPopup(false);
      setPopupData(null);
    } finally {
      setChecking(false);
    }
  }, []);

  // เช็คเมื่อเข้าหน้า
  useEffect(() => {
    checkOnLoginGroup();
  }, [checkOnLoginGroup]);

  // เช็คซ้ำเมื่อแท็บกลับมา active (เช่น ทำเสร็จแล้วกลับมาหน้า Home)
  useEffect(() => {
    const onFocus = () => checkOnLoginGroup();
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkOnLoginGroup();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [checkOnLoginGroup]);

  // เลื่อนขึ้นบนสุดเมื่อเข้าหน้า
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 🔁 ถ้าเงื่อนไขให้แสดง popup → นำทางไป route ใหม่ /assessment/:groupId/:quid
  useEffect(() => {
    if (showPopup && popupData) {
      navigate(`/assessment/${popupData.groupId}/${popupData.quid}`, {
        replace: false,
      });
    }
  }, [showPopup, popupData, navigate]);
  const hasLoggedRef = useRef(false); // ref เพื่อตรวจสอบว่า log แล้วหรือยัง

  const checkIntervalGroup = useCallback(async () => {
    // ต้องทำ onLogin ไปแล้วเท่านั้นถึงจะเช็ค interval
    if (!didFinishOnLogin) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = Number(user?.id || localStorage.getItem("id"));
    if (!uid) return;

    try {
      const groups = await getAvailableGroupsAndNext(uid, "interval");
      // console.log("⏱️ groups (interval):", groups);

      if (Array.isArray(groups)) {
        const found = groups.find((g: any) => g?.available && g?.next);
        if (found?.id && found?.next?.id) {
          // console.log("🟢 interval พบงานให้ทำ → ไป assessment", found);
          navigate(`/assessment/${found.id}/${found.next.id}`, {
            replace: false,
          });
        }
      }
    } catch (e) {
      console.error("❌ ตรวจ interval ล้มเหลว:", e);
    }
  }, [didFinishOnLogin, navigate]);

  // เรียกทันทีครั้งแรก หลัง onLogin ผ่านแล้ว
  useEffect(() => {
    if (didFinishOnLogin) {
      checkIntervalGroup();
    }
  }, [didFinishOnLogin, checkIntervalGroup]);

  // เวลาโฟกัสหรือกลับมา visible ให้เช็ค interval ด้วย (เฉพาะหลัง onLogin ผ่าน)
  useEffect(() => {
    const onFocus = () => {
      checkOnLoginGroup(); // เดิม
      checkIntervalGroup(); // ⬅️ เพิ่ม
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkOnLoginGroup(); // เดิม
        checkIntervalGroup(); // ⬅️ เพิ่ม
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [checkOnLoginGroup, checkIntervalGroup]);

  useEffect(() => {
    if (hasLoggedRef.current) return; // ถ้าเรียกแล้ว → ข้าม
    hasLoggedRef.current = true; // บันทึกว่าเรียกแล้ว

    const uid = Number(localStorage.getItem("id"));
    if (!uid) return;

    logActivity({
      uid,
      action: "visit_page_first",
      page: "/home",
    });
  }, []);

  return (
    <div className="bg-[#F4FFFF] relative dark:bg-background-dark ">
      <ChatBan />
      <Question />
  
      <Homeasmr />
  
      <Homemessage />
      <Homedoctor />

      <Footer />
    </div>
  );
}

export default Home;
