import { Bot, User } from "lucide-react";
import { IConversation } from "../../interfaces/IConversation";

interface ChatMessagesProps {
    messages: IConversation[];
    isTyping: boolean;
    typingText: string;
    isDarkMode: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;

  }
  function HistoryChat( { messages, isTyping, typingText,  isDarkMode, messagesEndRef }: ChatMessagesProps) {
    return (
        <div className={`  flex-1  md:px-4 space-y-4 h-[70%] duration-300  ${
            isDarkMode ? 'bg-box-dark' :'bg-white'
          } backdrop-blur-sm`}>
            <div className={`md:px-4 pb-4 h-full scrollbar-hide duration-300
            overflow-y-auto ${isDarkMode ? 'bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]' :'bg-linear-to-t from-[#C8F3FD] to-background-blue'} rounded-t-2xl`}>
              <div className="h-full  py-6 sm:px-4 duration-300">
              {messages.map((message) => (
                <div
                  key={message.ID}
                  className={`flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300 ${
                    message.stid === 1 ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-3 ${
                      message.stid === 1
                        ? isDarkMode
                          ? 'bg-blue-600'
                          : 'bg-[#675DFF]'
                        : isDarkMode
                        ? 'bg-purple-600'
                        : 'bg-indigo-500'
                    }`}
                  >
                    {message.stid === 1 ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      message.stid === 1 ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl  ${
                        message.stid === 1
                          ? isDarkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#675DFF] text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-100  border-gray-600'
                          : 'bg-white text-gray-800  border-gray-200'
                      } ${message.stid === 1 ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    >
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      } ${message.stid === 1 ? 'text-right' : 'text-left'}`}
                    >
                      {/* เวลาแชท (ถ้ามี) */}
                    </p>
                  </div>
                </div>
              ))}
      
              {isTyping && (
                <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-purple-600' : 'bg-indigo-500'
                    }`}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className={`max-w-xs lg:max-w-md`}>
                    <div
                      className={`px-4 py-3 rounded-2xl rounded-bl-md  ${
                        isDarkMode
                          ? 'bg-gray-700   text-gray-100'
                          : 'bg-white  text-black-word'
                      }`}
                    >
                      {typingText ? (
                        <div>
                          <p className="text-sm leading-relaxed">{typingText}</p>
                          <div className="flex space-x-1 mt-2">
                            <div
                              className={`w-1 h-4 animate-pulse ${
                                isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                              }`}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <div
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                            }`}
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                            }`}
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                            }`}
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 text-left ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {typingText ? 'กำลังพิมพ์...' : 'กำลังคิด...'}
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