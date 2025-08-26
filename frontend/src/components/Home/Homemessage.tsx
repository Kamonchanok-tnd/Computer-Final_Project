import { useEffect, useState } from "react";
import { WordHealingContent } from "../../interfaces/IWordHealingContent";
import {
  checkIfLikedArticle,
  getAllWordHealingMessagesForUser,
  likeMessage,
  unlikeMessage,
  updateViewCount,
} from "../../services/https/message";
import { BookOpen, Heart } from "lucide-react";
import { Modal } from "antd";
import { AiFillHeart, AiOutlineEye, AiOutlineHeart } from "react-icons/ai";
import healmessage from "../../assets/healmessage.jpg"

function Homemessage() {
  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const uid = localStorage.getItem("id");
  const [selectedMessage, setSelectedMessage] =
    useState<WordHealingContent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const fetchMessages = async () => {
    const fetchedMessages = await getAllWordHealingMessagesForUser();
    setMessages(fetchedMessages);

    if (uid) {
      for (const message of fetchedMessages) {
        const { isLiked } = await checkIfLikedArticle(message.id, uid);
        setLiked((prev) => ({
          ...prev,
          [message.id]: isLiked,
        }));
      }
    }
  };
  const showModal = (message: WordHealingContent) => {
    setSelectedMessage(message); // ✅ เก็บ object ของการ์ดที่คลิก
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleReadClick = async (id: string) => {
    const success = await updateViewCount(id);
    if (success) {
      // เพิ่มจำนวนการเข้าชมใน frontend ทันที
      setSelectedMessage((prev) => {
        if (prev && prev.id === parseInt(id)) {
          return { ...prev, viewCount: prev.viewCount + 1 }; // เพิ่มการเข้าชม
        }
        return prev;
      });
    } else {
      console.log("เกิดข้อผิดพลาดในการอัปเดตจำนวนการเข้าชม");
    }
  };
  const fmtDate = (d?: string) => {
    if (!d) return "ไม่มีวันที่";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "ไม่มีวันที่";
    return date.toLocaleDateString();
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

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
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)),
            }
          : m
      )
    );

    const ok = currentlyLiked
      ? await unlikeMessage(id, uid)
      : await likeMessage(id, uid);

    if (!ok) {
      setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                no_of_like: Math.max(
                  0,
                  m.no_of_like + (currentlyLiked ? +1 : -1)
                ),
              }
            : m
        )
      );
    }
  };

  return (
    <div className="font-ibmthai mt-4 xl:px-30 ">
      <div className="">
        <div className="text-2xl mb-4 text-basic-text dark:text-text-dark">
          <p className="px-2">ข้อความให้กำลังใจ</p>
        </div>

        <div className="flex gap-6 px-1 xl:px-0">
  {/* ฝั่งซ้าย (การ์ดใหญ่) */}
  <div className="flex-1">
    <div className="h-full">
      {messages.length > 0 && (
        <div className="bg-white/50 backdrop-blur-md dark:bg-chat-dark  rounded-2xl p-4 shadow-sm space-y-2 h-full flex flex-col justify-between
        text-basic-text dark:text-text-dark">
          <img
            src={messages[0].photo}
            alt="main"
            className="rounded-xl mb-3"
          />
          <span className="inline-block w-fit px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-100/50">
            {messages[0].articleType}
          </span>

          <p className="text-lg font-medium text-center">{messages[0].name}</p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLike(messages[0].id)}
                className="text-red-500 text-3xl"
                aria-label={liked[messages[0].id] ? "เลิกถูกใจ" : "ถูกใจ"}
              >
                {liked[messages[0].id] ? <AiFillHeart /> : <AiOutlineHeart />}
              </button>
              <span className="text-gray-700 dark:text-white">
                {messages[0].no_of_like}
              </span>
            </div>
            <button
              onClick={() => {
                showModal(messages[0]);
                handleReadClick(messages[0].id.toString());
              }}
              className="cursor-pointer  px-7 py-2 bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white rounded-lg flex items-center gap-4  transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700
              dark:text-background-dark"
             >
              <BookOpen className="w-5 h-5" />
              <span>อ่าน</span>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* ฝั่งขวา (list ข้อความเล็กๆ) */}
  <div className="w-1/2 flex flex-col gap-2  justify-between">
    <div className="bg-gradient-to-br from-[#F8BBD0] to-[#F48FB1] flex-1 rounded-2xl p-3 space-y-4 flex  justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 text-[#F06292] bg-white rounded-full shadow-sm">
            <Heart />
          </div>
          <p className="text-2xl font-bold text-[#1F1F22] ">ข้อความให้กำลังใจ</p>
        </div>
        <p className="text-lg ">
          รับข้อความให้กำลังใจ ที่อาจเป็นสิ่งเล็ก ๆ แต่ช่วยได้มากกว่าที่คิด
        </p>
      </div>
      <img src={healmessage} alt="" className="lg:w-40 hidden lg:flex rounded-2xl" />
    </div>

    {messages.slice(1).map((message) => (
      <div
        key={message.id}
        className="bg-white/50 backdrop-blur-md dark:bg-chat-dark rounded-2xl p-3 flex items-center justify-between shadow-sm
        text-basic-text dark:text-text-dark"
      >
        <div className="flex items-center gap-3">
          <img
            src={message.photo}
            alt="thumb"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="h-full flex flex-col justify-between gap-2 px-2">
            <span className="w-fit px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-100/50">
              {message.articleType}
            </span>
            <p className="text-sm font-bold line-clamp-2">{message.name}</p>
          </div>
        </div>
        <button
          onClick={() => {
            showModal(message);
            handleReadClick(message.id.toString());
          }}
          className="cursor-pointer px-4 py-1 bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white dark:text-background-dark rounded-full flex items-center gap-4  transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          <span>อ่าน</span>
        </button>
      </div>
    ))}

    {/* ปุ่มดูเพิ่มเติม */}
    <div className="flex justify-center">
      <button className=" dark:text-background-dark bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white  py-2 px-8 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105">
        ดูเพิ่มเติม
      </button>
    </div>
  </div>
</div>

      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        className="custom-modal"
      >
        {selectedMessage && (
          <div>
            <div className="flex justify-center items-center flex-col mb-4">
              <img
                src={selectedMessage.photo}
                alt={selectedMessage.name}
                className="w-80 h-80 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/default-image.png";
                }}
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center dark:text-white">
                {selectedMessage.name}
              </h3>
              <p className="text-2xl whitespace-pre-line leading-relaxed mt-4">
                {selectedMessage.content || "-"}
              </p>
            </div>

            <div className="flex flex-col text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {selectedMessage.articleType && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                    {selectedMessage.articleType}
                  </span>
                )}
                <span className="text-gray-600 dark:text-white">
                  {fmtDate(selectedMessage.date)}
                </span>
              </div>
              <div className="text-gray-600 dark:text-white">
                ผู้เขียน: {selectedMessage.author}
              </div>
              <div className="mt-4 text-sm text-gray-500 text-center dark:text-white flex justify-between px-95">
                <div>ถูกใจทั้งหมด: {selectedMessage.no_of_like}</div>
                <div>การเข้าชม: {selectedMessage.viewCount}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Homemessage;
