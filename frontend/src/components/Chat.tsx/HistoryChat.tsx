
import { IConversation } from "../../interfaces/IConversation";
import headbot from "../../assets/logo/header1.png";
import { useUser } from "../../layout/HeaderLayout/UserContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


interface ChatMessagesProps {
 
  messages: IConversation[];
  isTyping: boolean;
  typingText: string;
  isDarkMode: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function HistoryChat({

  messages,
  isTyping,
  typingText,
  isDarkMode,
  messagesEndRef,

}: ChatMessagesProps) {
  const { avatarUrl } = useUser();

  // ฟังก์ชันสำหรับจัดรูปแบบข้อความ
  const formatMessage = (message: string) => {
    if (!message) return "";
    
    // แปลง \n เป็น line break ที่ถูกต้องสำหรับ markdown
    let formattedMessage = message.replace(/\\n/g, '\n');
    
    // ไม่ต้อง format อะไรเพิ่ม ให้ ReactMarkdown จัดการเอง
    // เพื่อไม่ให้ตัวเลขลำดับหาย
    
    return formattedMessage;
  };

 

  return (
    <div
      className={`flex-1 md:px-4 space-y-4 h-[70%] duration-300 ${
        isDarkMode ? "bg-box-dark" : "bg-white"
      } backdrop-blur-sm`}
    >
        
        
      <div
        className={`md:px-4 pb-4 h-full scrollbar-hide duration-300
            overflow-y-auto ${
              isDarkMode
                ? "bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]"
                : "bg-linear-to-t from-[#C8F3FD] to-background-blue"
            } rounded-t-2xl`}
      >
        <div className="h-full py-6 sm:px-4 duration-300">
          {messages.map((message) => {
            const cleanMessage = formatMessage(message.message || "");
            // console.log("formatted message:", cleanMessage);

            return (
              <div
                key={message.ID}
                className={`flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300 mb-6 ${
                  message.stid === 1 ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 mx-3">
                  {message.stid === 1 ? (
                    <img
                      src={avatarUrl}
                      alt="user avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src={headbot}
                      alt="bot avatar"
                      className="w-8 h-8 object-center"
                    />
                  )}
                </div>
                <div
                  className={` max-w-3/4  ${
                    message.stid === 1 ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.stid === 1
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-[#675DFF] text-white"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-100 border-gray-600"
                        : "bg-white text-gray-800 border-gray-200"
                    } ${message.stid === 1 ? "rounded-br-md" : "rounded-bl-md"}`}
                  >
                    <div className="md:text-xl text-md leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom component สำหรับ list items
                          li: ({children}) => (
                            <li className="mb-2 leading-relaxed text-inherit">{children}</li>
                          ),
                          // Custom component สำหรับ paragraphs  
                          p: ({children}) => (
                            <p className="mb-2 leading-relaxed text-inherit">{children}</p>
                          ),
                          // Custom component สำหรับ strong/bold text
                          strong: ({children}) => (
                            <strong className="font-bold text-inherit">
                              {children}
                            </strong>
                          ),
                          // Custom component สำหรับ ordered list
                          ol: ({children}) => (
                            <ol className="list-decimal list-inside space-y-2 text-inherit">{children}</ol>
                          ),
                          // Custom component สำหรับ unordered list
                          ul: ({children}) => (
                            <ul className="list-disc space-y-2 text-inherit ml-6">{children}</ul>
                          )
                        }}
                      >
                        {cleanMessage}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } ${message.stid === 1 ? "text-right" : "text-left"}`}
                  >
                    {/* เวลาแชท (ถ้ามี) */}
                  </p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300">
              <img
                src={headbot}
                alt="bot avatar"
                className="w-8 h-8 object-center"
              />
              <div className={`max-w-3/4`}>
                <div
                  className={`px-4 py-3 rounded-2xl rounded-bl-md ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100"
                      : "bg-white text-black-word"
                  }`}
                >
                  {typingText ? (
                    <div>
                      <div className="md:text-xl text-md leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formatMessage(typingText)}
                        </ReactMarkdown>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div
                          className={`w-1 h-4 animate-pulse ${
                            isDarkMode ? "bg-gray-400" : "bg-gray-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? "bg-gray-400" : "bg-gray-500"
                        }`}
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? "bg-gray-400" : "bg-gray-500"
                        }`}
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? "bg-gray-400" : "bg-gray-500"
                        }`}
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  )}
                </div>
                <p
                  className={`md:text-xl text-md mt-1 text-left ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {typingText ? "กำลังพิมพ์..." : "กำลังคิด..."}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default HistoryChat;