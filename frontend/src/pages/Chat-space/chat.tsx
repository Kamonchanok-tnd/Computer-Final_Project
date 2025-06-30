import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Settings, Moon, Sun } from 'lucide-react';
import { ChatGemini, GetChat } from '../../services/https/Chat/index';
import type { IConversation } from '../../interfaces/IConversation';


interface ChatbotProps {}

// API Configuration

const ChatSpace: React.FC<ChatbotProps> = () => {
  const [messages, setMessages] = useState<IConversation[]>([]); // สร้าง state สําหรับข้อความ
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingText, setTypingText] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isApiMode, setIsApiMode] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
 
  async function getmessage(id: number) {
    const message = await GetChat();
    setMessages(message);
  }

  useEffect(() => {
    scrollToBottom();
    getmessage(1);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [typingText]);

  // API Functions


  // Typing Animation Function
  const simulateTyping = async (text: string, callback: (finalText: string) => void): Promise<void> => {
    setTypingText('');
    setIsTyping(true);

    // แบ่งข้อความเป็นคำ
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      // จำลองความเร็วในการพิมพ์ที่แตกต่างกัน
      const typingSpeed = Math.random() * 100 + 50; // 50-150ms ต่อคำ
      
      await new Promise(resolve => {
        typingTimeoutRef.current = setTimeout(() => {
          currentText += (i === 0 ? '' : ' ') + words[i];
          setTypingText(currentText);
          resolve(void 0);
        }, typingSpeed);
      });

      // หยุดพักบางครั้งเหมือนคนจริง
      if (i > 0 && i % 5 === 0 && Math.random() > 0.7) {
        await new Promise(resolve => {
          typingTimeoutRef.current = setTimeout(resolve, Math.random() * 500 + 200);
        });
      }
    }

    // หยุดพักก่อนแสดงข้อความสุดท้าย
    await new Promise(resolve => {
      typingTimeoutRef.current = setTimeout(resolve, 300);
    });

    setIsTyping(false);
    setTypingText('');
    callback(text);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim()) return;

    const userMessage: IConversation = {
      message: inputText,
      chatroom_id: 1,
      stid: 1
    };

    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    let responseText: string;

 
      // เรียก API จริง
      const apiResponse = await ChatGemini(userMessage);
      console.log('api: ',apiResponse.message);
      responseText = apiResponse.message;
   

    // แสดง typing animation
    await simulateTyping(responseText, (finalText) => {
        const botResponse: IConversation = {
          message: finalText,
          chatroom_id: 1, // or some other valid value
          stid: 2 // or some other valid value
        };
        setMessages(prev => [...prev, botResponse]);
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = (): void => {
    // ยกเลิก typing animation ที่กำลังทำงาน
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    setTypingText('');
    
    // setMessages([
    //   {
    //     id: '1',
    //     text: 'สวัสดีครับ! ผมเป็น AI Assistant พร้อมช่วยเหลือคุณ มีอะไรให้ช่วยไหมครับ?',
    //     sender: 'bot',
    //     timestamp: new Date()
    //   }
    // ]);
  };

  const toggleApiMode = (): void => {
    setIsApiMode(!isApiMode);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleDarkMode = (): void => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-auto ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-[#C8F3FD]  to-[#DAF8FF]'
    }`}>
      <div className="container mx-auto max-w-full h-screen flex flex-col p-4  ">
        {/* Header */}
        <div className={`rounded-t-2xl p-6 shadow-lg backdrop-blur-sm bg-white duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        } border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${
                isDarkMode ? 'bg-purple-600' : 'bg-indigo-600'
              }`}>
                <Bot className="w-6 h-6 text-white rounded-2xl" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Heal JAI
                </h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  พร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleApiMode}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  isApiMode
                    ? isDarkMode 
                      ? 'bg-green-600 text-white' 
                      : 'bg-green-500 text-white'
                    : isDarkMode 
                      ? 'bg-gray-600 text-gray-300' 
                      : 'bg-gray-300 text-gray-600'
                }`}
                title={isApiMode ? 'กำลังใช้ API จริง' : 'กำลังใช้โหมดจำลอง'}
              >
                {isApiMode ? 'API Mode' : 'Demo Mode'}
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={clearChat}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
                title="ล้างการสนทนา"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
          isDarkMode ? 'bg-gray-800/40' : 'bg-white/40'
        } backdrop-blur-sm`}>
          {messages.map((message) => (
            <div
              key={message.ID}
              className={`flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300 ${
                message.stid === 1 ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.stid === 1
                  ? isDarkMode ? 'bg-blue-600' : 'bg-[#675DFF]'
                  : isDarkMode ? 'bg-purple-600' : 'bg-indigo-500'
              }`}>
                {message.stid === 1 ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-xs lg:max-w-md ${
                message.stid === 1? 'text-right' : 'text-left'
              }`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                  message.stid === 1
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#675DFF] text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-100 border border-gray-600' 
                      : 'bg-white text-gray-800 border border-gray-200'
                } ${message.stid === 1 ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                </div>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ${message.stid === 1 ? 'text-right' : 'text-left'}`}>
                  {/* {formatTime()} */}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator with Real-time Text */}
          {isTyping && (
            <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-purple-600' : 'bg-indigo-500'
              }`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className={`max-w-xs lg:max-w-md`}>
                <div className={`px-4 py-3 rounded-2xl rounded-bl-md shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border border-gray-600 text-gray-100' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  {typingText ? (
                    <div>
                      <p className="text-sm leading-relaxed">{typingText}</p>
                      <div className="flex space-x-1 mt-2">
                        <div className={`w-1 h-4 animate-pulse ${
                          isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                        }`}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                      }`} style={{ animationDelay: '0ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                      }`} style={{ animationDelay: '150ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                      }`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
                <p className={`text-xs mt-1 text-left ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {typingText ? 'กำลังพิมพ์...' : 'กำลังคิด...'}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`rounded-b-2xl p-4 border-t backdrop-blur-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความของคุณ..."
              className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-indigo-500'
              }`}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                !inputText.trim() || isTyping
                  ? isDarkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isDarkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
              }`}
              title="ส่งข้อความ"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-xs mt-2 text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            กด Enter เพื่อส่งข้อความ • {isApiMode ? 'เชื่อมต่อกับ API จริง' : 'โหมดจำลอง'} • React + TypeScript
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSpace;