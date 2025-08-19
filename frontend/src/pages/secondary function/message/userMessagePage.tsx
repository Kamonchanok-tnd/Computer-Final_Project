import { useState, useEffect } from "react";
import { Modal } from "antd";
import { AiOutlineHeart, AiFillHeart, AiOutlineArrowLeft } from "react-icons/ai"; // ใช้ไอคอน Heart สำหรับ Like
import {getAllWordHealingMessagesForUser,likeMessage,unlikeMessage,getUserLikedMessages,} from "../../../services/https/message";
import { WordHealingContent } from "../../../interfaces/IWordHealingContent";
import { BookOpen } from "lucide-react";

type ViewMode = "all" | "liked";

function UserMessagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({}); // กำหนด type ให้กับ liked
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);
  const [view, setView] = useState<ViewMode>("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ตรวจสอบการล็อกอินและดึงข้อมูลสถานะการ Like
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // ตรวจสอบสถานะการล็อกอิน

    
    const fetchMessages = async () => {
      const fetchedMessages = await getAllWordHealingMessagesForUser();
      setMessages(fetchedMessages);

      if (token) {
        // ดึงข้อมูลการ Like ของผู้ใช้จากฐานข้อมูล
        try {
          const likedMessages = await getUserLikedMessages();
          
          // กำหนดประเภทให้กับ acc ว่าเป็น Record<number, boolean> ซึ่งรองรับการใช้คีย์ประเภท number
          const likedMessagesMap: Record<number, boolean> = likedMessages.reduce((acc: Record<number, boolean>, id) => {
            acc[id] = true; // ตั้งค่าเป็น true เมื่อผู้ใช้ถูกใจข้อความ
            return acc;
          }, {});

          setLiked(likedMessagesMap);
        } catch (error) {
          console.error("Error fetching liked messages:", error);
        }
      }
    };

    fetchMessages();
  }, []);

  // ค้นหาข้อความ
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // การกรองข้อความตามคำค้นหา
  const baseFiltered = messages.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q) ||
      (m.articleType || "").toLowerCase().includes(q) ||
      (m.content || "").toLowerCase().includes(q)
    );
  });

  // การกรองข้อความตามสถานะ "liked"
  const displayedMessages = view === "liked" ? baseFiltered.filter((m) => liked[m.id]) : baseFiltered;

  // การนับจำนวนข้อความที่ผู้ใช้ถูกใจ
  const likedCount = messages.reduce((acc, m) => acc + (liked[m.id] ? 1 : 0), 0);

  // ฟังก์ชันสำหรับกด Like/Unlike
  const toggleLike = async (id: number) => {
    if (!isLoggedIn) {
      alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ");
      return;
    }

    const currentlyLiked = !!liked[id];

    // ปรับสถานะ UI โดยไม่ต้องรอ API (Optimistic UI)
    setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) }
          : m
      )
    );

    const ok = currentlyLiked ? await unlikeMessage(id) : await likeMessage(id);

    // ย้อนกลับการเปลี่ยนแปลงหาก API ล้มเหลว
    if (!ok) {
      setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) }
            : m
        )
      );
    }
  };

  // ฟังก์ชันแสดงรายละเอียดบทความใน Modal
  const showModal = (message: WordHealingContent) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  // ฟังก์ชันช่วยในการจัดรูปแบบวันที่
  const fmtDate = (d?: string) => {
    if (!d) return "ไม่มีวันที่";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "ไม่มีวันที่";
    return date.toLocaleDateString();
  };

  // ฟังก์ชันสำหรับปุ่มย้อนกลับ
  const handleBack = () => {
    window.history.back();
  };



  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-white to-[#C2F4FF] ">
      {/* ส่วนค้นหาข้อความ */}
     <div className="w-full max-w-4xl mb-4 flex items-center">
    {/* ปุ่มย้อนกลับ */}
    <button
      onClick={handleBack}
      className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300"
    >
      <AiOutlineArrowLeft size={24} />
    </button>

    {/* ช่องค้นหาข้อความ */}
    <input
      type="text"
      placeholder="ค้นหาบทความ (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
      value={searchQuery}
      onChange={handleSearch}
      className="w-full p-2 rounded-lg border border-gray-300 ml-4" // เพิ่ม ml-4 เพื่อเพิ่มระยะห่างจากปุ่ม
    />
  </div>

      {/* ส่วนหัวและปุ่มเลือกการดูข้อความ */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">บทความเสริมพลังใจ</h2>

        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setView("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${view === "all" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
          >
            ทั้งหมด ({messages.length})
          </button>
          <button
            onClick={() => setView("liked")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${view === "liked" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
          >
            ที่ถูกใจ ({likedCount})
          </button>
        </div>
      </div>

      {/* แสดงข้อความ */}
      {displayedMessages.length === 0 ? (
        <div className="w-full max-w-4xl px-4">
          <div className="w-full rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            {view === "liked" ? "ยังไม่มีบทความที่คุณถูกใจ" : "ไม่พบบทความตามคำค้นหา"}
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-6 w-full px-4 items-stretch ${view === "liked" ? "grid-cols-3" : "grid-cols-1"}`}
        >
          {displayedMessages.map((message) => (
            <div
              key={message.id}
              className="flex flex-col bg-white rounded-xl shadow-lg p-6 mx-auto"
              style={{
                width: view === "all" ? '700px' : '600px', // กำหนดความกว้างแยกตามหน้า
                height: 'auto', // ปรับความสูงให้ไม่เกินขอบการ์ด
                overflow: 'hidden', // ป้องกันไม่ให้ข้อความล้นออกมา
              }}
            >
              <h3 className="text-lg mb-4 font-bold text-gray-800">{message.name}</h3>
              <img
                src={message.photo}
                alt={message.name}
                className="w-full h-140 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/default-image.png";
                }}
              />
              <div className="flex items-center space-x-2">
                {message.articleType && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                    {message.articleType}
                  </span>
                )}
                <p className="text-gray-600">{fmtDate(message.date)}</p>
              </div>
              <p className="text-lg font-bold text-gray-800  mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap">
                {message.content}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(message.id)}
                    className="text-red-500 text-3xl"
                    aria-label={liked[message.id] ? "เลิกถูกใจ" : "ถูกใจ"}
                  >
                    {liked[message.id] ? <AiFillHeart /> : <AiOutlineHeart />}
                  </button>
                  <span className="text-gray-700">{message.no_of_like}</span>
                </div>
              <button
                  onClick={() => showModal(message)}
                  className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300"
                >
                 <BookOpen className="w-5 h-5"/>
                  <span>อ่าน</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal สำหรับแสดงรายละเอียด */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000} // กำหนดความกว้างของ Modal
      >
        {selectedMessage && (
          <div>
            {/* กึ่งกลาง: รูป, ชื่อ, การถูกใจทั้งหมด */}
            <div className="flex justify-center items-center flex-col mb-4">
              <img
                src={selectedMessage.photo}
                alt={selectedMessage.name}
                className="w-80 h-80 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/default-image.png";
                }}
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{selectedMessage.name}</h3>

              <p className="text-2xl whitespace-pre-line leading-relaxed mt-4">{selectedMessage.content || "-"}</p>
            </div>

            <div className="flex flex-col text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {selectedMessage.articleType && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                    {selectedMessage.articleType}
                  </span>
                )}
                <span className="text-gray-600">{fmtDate(selectedMessage.date)}</span>
              </div>
              <div className="text-gray-600">ผู้เขียน: {selectedMessage.author}</div>
              <div className="mt-4 text-sm text-gray-500 text-center">
                ถูกใจทั้งหมด: {selectedMessage.no_of_like}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserMessagePage;


