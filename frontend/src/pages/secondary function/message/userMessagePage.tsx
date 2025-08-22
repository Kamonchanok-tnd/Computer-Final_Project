// import { useState, useEffect } from "react";
// import { Modal } from "antd";
// import { AiOutlineHeart, AiFillHeart, AiOutlineArrowLeft } from "react-icons/ai"; // ใช้ไอคอน Heart สำหรับ Like
// import {getAllWordHealingMessagesForUser,likeMessage,unlikeMessage,checkIfLikedArticle} from "../../../services/https/message";
// import { WordHealingContent } from "../../../interfaces/IWordHealingContent";
// import "./userMessagePage.css"
// import { BookOpen } from "lucide-react";
// import HeartBackground from "./้heartbackground"; // นำเข้า HeartBackground

// // กำหนด type สำหรับสถานะการ Like

// type ViewMode = "all" | "liked";

// function UserMessagePage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [messages, setMessages] = useState<WordHealingContent[]>([]);
//   const [liked, setLiked] = useState<Record<number, boolean>>({}); // กำหนด type ให้กับ liked
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);
//   const [view, setView] = useState<ViewMode>("all");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // ตรวจสอบการล็อกอินและดึงข้อมูลสถานะการ Like
// useEffect(() => {
//   const token = localStorage.getItem("token");
//   setIsLoggedIn(!!token); // ตรวจสอบสถานะการล็อกอิน

//   const fetchMessages = async () => {
//     const fetchedMessages = await getAllWordHealingMessagesForUser();
//     setMessages(fetchedMessages);

//     if (token) {
//       // ดึงข้อมูลการ Like ของผู้ใช้จากฐานข้อมูล
//       try {
//         // ดึง `uid` จาก localStorage
//         const uid = localStorage.getItem("id");

//         if (uid) {
//           // เช็คว่า user เคยไลค์บทความนี้หรือไม่ สำหรับแต่ละบทความ
//           for (const message of fetchedMessages) {
//             const { isLiked } = await checkIfLikedArticle(message.id, uid);

//             setLiked((prev) => ({
//               ...prev,
//               [message.id]: isLiked, // ตั้งค่า true/false ว่าผู้ใช้ไลค์บทความนี้หรือไม่
//             }));
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching liked messages:", error);
//       }
//     }
//   };

//   fetchMessages();
// }, []);


//   // ค้นหาข้อความ
//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(event.target.value);
//   };

//   // การกรองข้อความตามคำค้นหา
//   const baseFiltered = messages.filter((m) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       m.name.toLowerCase().includes(q) ||
//       m.author.toLowerCase().includes(q) ||
//       (m.articleType || "").toLowerCase().includes(q) ||
//       (m.content || "").toLowerCase().includes(q)
//     );
//   });

//   // การกรองข้อความตามสถานะ "liked"
//   const displayedMessages = view === "liked" ? baseFiltered.filter((m) => liked[m.id]) : baseFiltered;

//   // การนับจำนวนข้อความที่ผู้ใช้ถูกใจ
//   const likedCount = messages.reduce((acc, m) => acc + (liked[m.id] ? 1 : 0), 0);

//   // ฟังก์ชันสำหรับกด Like/Unlike
// const toggleLike = async (id: number) => {
//   if (!isLoggedIn) {
//     alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ");
//     return;
//   }

//   const currentlyLiked = !!liked[id];
//   const uid = localStorage.getItem("id"); // ดึง UID จาก localStorage
//   console.log("UID:", uid); // แสดง UID ใน console เพื่อตรวจสอบ

//   // ตรวจสอบว่า uid ถูกดึงออกมาถูกต้องหรือไม่
//   if (!uid) {
//     alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ");
//     return;
//   }

//   // ปรับสถานะ UI โดยไม่ต้องรอ API (Optimistic UI)
//   setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
//   setMessages((prev) =>
//     prev.map((m) =>
//       m.id === id
//         ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) }
//         : m
//     )
//   );

//   // ส่ง uid ไปยังฟังก์ชัน likeMessage หรือ unlikeMessage
//   const ok = currentlyLiked ? await unlikeMessage(id, uid) : await likeMessage(id, uid);

//   // ย้อนกลับการเปลี่ยนแปลงหาก API ล้มเหลว
//   if (!ok) {
//     setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === id
//           ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) }
//           : m
//       )
//     );
//   }
// };

//   // ฟังก์ชันแสดงรายละเอียดบทความใน Modal
//   const showModal = (message: WordHealingContent) => {
//     setSelectedMessage(message);
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//     setSelectedMessage(null);
//   };

//   // ฟังก์ชันช่วยในการจัดรูปแบบวันที่
//   const fmtDate = (d?: string) => {
//     if (!d) return "ไม่มีวันที่";
//     const date = new Date(d);
//     if (Number.isNaN(date.getTime())) return "ไม่มีวันที่";
//     return date.toLocaleDateString();
//   };

//   // ฟังก์ชันสำหรับปุ่มย้อนกลับ
//   const handleBack = () => {
//     window.history.back();
//   };



//   return (
//     <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-white to-[#C2F4FF] dark:bg-gray-900 dark:from-gray-800 dark:to-gray-900 duration-300 transition-all">
//       {/* ส่วนค้นหาข้อความ */}
//       <HeartBackground/>

//      <div className="w-full max-w-4xl mb-4 flex items-center">
//     {/* ปุ่มย้อนกลับ */}
//     <button
//       onClick={handleBack}
//       className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300"
//     >
//       <AiOutlineArrowLeft size={24} />
//     </button>

//     {/* ช่องค้นหาข้อความ */}
//     <input
//       type="text dark:text-white"
//       placeholder="ค้นหาบทความ (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
//       value={searchQuery}
//       onChange={handleSearch}
//       className="w-full p-2 rounded-lg border border-gray-300 ml-4 dark:text-white " // เพิ่ม ml-4 เพื่อเพิ่มระยะห่างจากปุ่ม
//     />
//   </div>

//       {/* ส่วนหัวและปุ่มเลือกการดูข้อความ */}
//       <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
//         <h2 className="text-xl font-bold text-gray-800 dark:text-white">บทความเสริมพลังใจ</h2>

//         <div className="inline-flex bg-gray-100 rounded-full p-1">
//           <button
//             onClick={() => setView("all")}
//             className={`px-4 py-2 rounded-full text-sm font-medium transition
//               ${view === "all" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
//           >
//             ทั้งหมด ({messages.length})
//           </button>
//           <button
//             onClick={() => setView("liked")}
//             className={`px-4 py-2 rounded-full text-sm font-medium transition  ${view === "liked" ? "bg-white shadow text-gray-900 " : "text-gray-600 hover:text-gray-800"}`}
//           >
//             ที่ถูกใจ ({likedCount})
//           </button>
//         </div>
//       </div>

//       {/* แสดงข้อความ */}
//       {displayedMessages.length === 0 ? (
//         <div className="w-full max-w-4xl px-4 dark:text-white">
//           <div className="w-full rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//             {view === "liked" ? "ยังไม่มีบทความที่คุณถูกใจ" : "ไม่พบบทความตามคำค้นหา"}
//           </div>
//         </div>
//       ) : (
//         <div
//           className={`grid gap-4 w-full  items-stretch   ${view === "liked" ? "md:grid-cols-2 xl:grid-cols-3 grid-col-1" : "grid-cols-1 "}`}
//         >
//           {displayedMessages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex flex-col bg-white rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-gray-700 text-white ${view === "liked" ? "w-full" : "lg:w-3/4 xl:w-1/2 w-full"} transition-all duration-300`}
//               style={{
                
//                 height: 'auto', // ปรับความสูงให้ไม่เกินขอบการ์ด
//                 overflow: 'hidden', // ป้องกันไม่ให้ข้อความล้นออกมา
//               }}
//             >
//               <h3 className="text-lg mb-4 font-bold text-gray-800 dark:text-white">{message.name}</h3>
//               <img
//                 src={message.photo}
//                 alt={message.name}
//                 className="w-full h-120 object-cover rounded-lg mb-4"
//                 onError={(e) => {
//                   (e.currentTarget as HTMLImageElement).src = "/default-image.png";
//                 }}
//               />
//               <div className="flex items-center space-x-2">
//                 {message.articleType && (
//                   <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                     {message.articleType}
//                   </span>
//                 )}
//                 <p className="text-gray-600 dark:text-white">{fmtDate(message.date)}</p>
//               </div>
//               <p className="text-lg font-bold text-gray-800  mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
//                 {message.content}
//               </p>

//               <div className="flex items-center justify-between mt-auto">
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => toggleLike(message.id)}
//                     className="text-red-500 text-3xl"
//                     aria-label={liked[message.id] ? "เลิกถูกใจ" : "ถูกใจ"}
//                   >
//                     {liked[message.id] ? <AiFillHeart /> : <AiOutlineHeart />}
//                   </button>
//                   <span className="text-gray-700 dark:text-white">{message.no_of_like}</span>
//                 </div>
//               <button
//                   onClick={() => showModal(message)}
//                   className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
//                 >
//                  <BookOpen className="w-5 h-5"/>
//                   <span>อ่าน</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal สำหรับแสดงรายละเอียด */}
//       <Modal
//         open={isModalVisible}
//         onCancel={handleCancel}
//         footer={null}
//         width={1000} // กำหนดความกว้างของ Modal
//       >
//         {selectedMessage && (
//           <div>
//             {/* กึ่งกลาง: รูป, ชื่อ, การถูกใจทั้งหมด */}
//             <div className="flex justify-center items-center flex-col mb-4">
//               <img
//                 src={selectedMessage.photo}
//                 alt={selectedMessage.name}
//                 className="w-80 h-80 object-cover rounded-lg mb-4"
//                 onError={(e) => {
//                   (e.currentTarget as HTMLImageElement).src = "/default-image.png";
//                 }}
//               />
//               <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{selectedMessage.name}</h3>

//               <p className="text-2xl whitespace-pre-line leading-relaxed mt-4">{selectedMessage.content || "-"}</p>
//             </div>

//             <div className="flex flex-col text-sm text-gray-700">
//               <div className="flex items-center gap-2 mb-2">
//                 {selectedMessage.articleType && (
//                   <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                     {selectedMessage.articleType}
//                   </span>
//                 )}
//                 <span className="text-gray-600">{fmtDate(selectedMessage.date)}</span>
//               </div>
//               <div className="text-gray-600">ผู้เขียน: {selectedMessage.author}</div>
//               <div className="mt-4 text-sm text-gray-500 text-center">
//                 ถูกใจทั้งหมด: {selectedMessage.no_of_like}
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

// export default UserMessagePage;



import { useState, useEffect } from "react";
import { Modal } from "antd";
import { AiOutlineHeart, AiFillHeart, AiOutlineArrowLeft } from "react-icons/ai"; // ใช้ไอคอน Heart สำหรับ Like
import { getAllWordHealingMessagesForUser, likeMessage, unlikeMessage, checkIfLikedArticle } from "../../../services/https/message";
import { WordHealingContent } from "../../../interfaces/IWordHealingContent";
import "./userMessagePage.css";
import { BookOpen } from "lucide-react";
import HeartBackground from "./้heartbackground"; // นำเข้า HeartBackground

// กำหนด type สำหรับสถานะการ Like
type ViewMode = "all" | "liked";

function UserMessagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({}); // กำหนด type ให้กับ liked
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);
  const [view, setView] = useState<ViewMode>("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // การตั้งค่าหน้าปัจจุบันและจำนวนบทความที่จะแสดงต่อหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;  // จำนวนบทความที่จะแสดงต่อหน้า

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // ตรวจสอบสถานะการล็อกอิน

    const fetchMessages = async () => {
      const fetchedMessages = await getAllWordHealingMessagesForUser();
      setMessages(fetchedMessages);

      if (token) {
        // ดึงข้อมูลการ Like ของผู้ใช้จากฐานข้อมูล
        try {
          // ดึง `uid` จาก localStorage
          const uid = localStorage.getItem("id");

          if (uid) {
            // เช็คว่า user เคยไลค์บทความนี้หรือไม่ สำหรับแต่ละบทความ
            for (const message of fetchedMessages) {
              const { isLiked } = await checkIfLikedArticle(message.id, uid);

              setLiked((prev) => ({
                ...prev,
                [message.id]: isLiked, // ตั้งค่า true/false ว่าผู้ใช้ไลค์บทความนี้หรือไม่
              }));
            }
          }
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
    const uid = localStorage.getItem("id"); // ดึง UID จาก localStorage

    if (!uid) {
      alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ");
      return;
    }

    setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) }
          : m
      )
    );

    const ok = currentlyLiked ? await unlikeMessage(id, uid) : await likeMessage(id, uid);

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

  // คำนวณข้อมูลบทความที่จะแสดงในแต่ละหน้า
  const indexOfLastMessage = currentPage * articlesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - articlesPerPage;
  const currentMessages = displayedMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const totalPages = view === "liked" ? 1 : Math.ceil(displayedMessages.length / articlesPerPage); // ถ้าเป็นโหมด liked ให้แสดงหน้าเดียว

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // รีเซ็ตหน้าทุกครั้งที่เปลี่ยนโหมด
  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    if (newView === "liked") {
      setCurrentPage(1);  // รีเซ็ตหน้าเมื่อเข้าโหมด "liked"
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-white to-[#C2F4FF] dark:bg-gray-900 dark:from-gray-800 dark:to-gray-900 duration-300 transition-all">
      {/* ส่วนค้นหาข้อความ */}
      <HeartBackground />

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
          type="text dark:text-white"
          placeholder="ค้นหาบทความ (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 rounded-lg border border-gray-300 ml-4 dark:text-white"
        />
      </div>

      {/* ส่วนหัวและปุ่มเลือกการดูข้อความ */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">บทความเสริมพลังใจ</h2>

        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => handleViewChange("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${view === "all" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
          >
            ทั้งหมด ({messages.length})
          </button>
          <button
            onClick={() => handleViewChange("liked")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition  ${view === "liked" ? "bg-white shadow text-gray-900 " : "text-gray-600 hover:text-gray-800"}`}
          >
            ที่ถูกใจ ({likedCount})
          </button>
        </div>
      </div>

      {/* แสดงข้อความ */}
      {currentMessages.length === 0 ? (
        <div className="w-full max-w-4xl px-4 dark:text-white">
          <div className="w-full rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
            {view === "liked" ? "ยังไม่มีบทความที่คุณถูกใจ" : "ไม่พบบทความตามคำค้นหา"}
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-4 w-full items-stretch ${view === "liked" ? "md:grid-cols-2 xl:grid-cols-3 grid-col-1" : "grid-cols-1"}`}
        >
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col bg-white rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-gray-700 text-white ${view === "liked" ? "w-full" : "lg:w-3/4 xl:w-1/2 w-full"} transition-all duration-300`}
              style={{
                height: 'auto', // ปรับความสูงให้ไม่เกินขอบการ์ด
                overflow: 'hidden', // ป้องกันไม่ให้ข้อความล้นออกมา
              }}
            >
              <h3 className="text-lg mb-4 font-bold text-gray-800 dark:text-white">{message.name}</h3>
              <img
                src={message.photo}
                alt={message.name}
                className="w-full h-120 object-cover rounded-lg mb-4"
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
                <p className="text-gray-600 dark:text-white">{fmtDate(message.date)}</p>
              </div>
              <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
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
                  <span className="text-gray-700 dark:text-white">{message.no_of_like}</span>
                </div>
                <button
                  onClick={() => showModal(message)}
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

      {/* Pagination สำหรับโหมด "all" */}
      {view === "all" && (
        <div className="pagination dark:text-white mt-4 space-x-4 text-xl">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            ก่อนหน้า
          </button>

          <span>{`หน้า ${currentPage} จาก ${totalPages}`}</span>

          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            ถัดไป
          </button>
        </div>
      )}

      {/* Modal สำหรับแสดงรายละเอียด */}
      <Modal open={isModalVisible} onCancel={handleCancel} footer={null} width={1000} className="custom-modal">
        {selectedMessage && (
          <div>
            <div className="flex justify-center items-center flex-col mb-4">
              <img
                src={selectedMessage.photo} 
                alt={selectedMessage.name}
                className="w-80 h-80 object-cover rounded-lg mb-4 "
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/default-image.png";
                }}
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center dark:text-white">{selectedMessage.name}</h3>
              <p className="text-2xl whitespace-pre-line leading-relaxed mt-4">{selectedMessage.content || "-"}</p>
            </div>

            <div className="flex flex-col text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {selectedMessage.articleType && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                    {selectedMessage.articleType}
                  </span>
                )}
                <span className="text-gray-600 dark:text-white">{fmtDate(selectedMessage.date)}</span>
              </div>
              <div className="text-gray-600 dark:text-white">ผู้เขียน: {selectedMessage.author}</div>
              <div className="mt-4 text-sm text-gray-500 text-center dark:text-white">
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
