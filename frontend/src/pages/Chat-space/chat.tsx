import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Settings, Moon, Sun,Mic, Plus, ChevronLeft } from 'lucide-react';
import { ChatGemini, GetChat } from '../../services/https/Chat/index';
import type { IConversation } from '../../interfaces/IConversation';
import HistoryChat from '../../components/Chat.tsx/HistoryChat';
import NewChatWelcome from '../../components/Chat.tsx/NewChatWelcome';


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
  const [isNewChat, setIsNewChat] = useState<boolean>(false);


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
  }, [typingText, messages]);

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
    setIsNewChat(false);
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
  const newChat = (): void => {
    setIsNewChat(!isNewChat);
    setMessages([]);   
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] transition-colors duration-300 overflow-auto 
       flex justify-center items-center sm:px-4
      ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-[#EEFCFF]'
    }`}>

      
      <div className="container  duration-300 mx-auto max-w-full  h-[90vh]  flex flex-col justify-between">
        {/* Header */}
        <div className={`sm:rounded-t-2xl md:p-6 p-4 shadow-lg  backdrop-blur-sm duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        } border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <div>
              <ChevronLeft className="w-7 h-7 text-gray-600"/>
              </div>
              <div className={`md:p-3 p-2 rounded-full ${
                isDarkMode ? 'bg-purple-600' : 'bg-indigo-600'
              }`}>
                <Bot className="md:w-6 md:h-6 w-4 h-4 text-white rounded-2xl  duration-300" />
              </div>
              
              <div>
                <h1 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Heal JAI
                </h1>
                <p className={`text-sm hidden md:inline-block ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  พร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
              className='flex items-center md:space-x-2 bg-regal-blue p-2 rounded-lg'
              onClick={newChat}>
                <Plus className="w-5 h-5 text-white" />
                <p className='hidden md:inline-block text-white text-md'>New Chat</p>
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
        
          {
            isNewChat ? (
              <NewChatWelcome  />
            ) : (
              <HistoryChat
                messages={messages}
                isTyping={isTyping}
                typingText={typingText}
                isDarkMode={isDarkMode}
                messagesEndRef={messagesEndRef}
              />
            )
          }
        
       

        {/* Input Area */}
        <div className={`sm:rounded-b-2xl sm:px-10 py-4  border-t backdrop-blur-sm transition-colors duration-300 ${
  isDarkMode 
    ? 'bg-gray-800/80 border-gray-700' 
    : 'bg-white/80 border-gray-200'
}`}>
  <div className="flex items-center space-x-3 md:justify-center px-4">
    <input
      ref={inputRef}
      type="text"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      onKeyDown={handleKeyPress}
      placeholder="พิมพ์ข้อความของคุณ..."
      className={`md:max-w-4xl flex-1 px-4 py-3 rounded-4xl border focus:outline-none focus:ring-2 transition-colors  ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500'
          : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-regal-blue focus:border-regal-blue'
      }`}
      disabled={isTyping}
    />
    
    {/* ปุ่มไมโครโฟน */}
    <button
       // เปลี่ยนเป็นฟังก์ชันสำหรับไมโครโฟน
      disabled={isTyping}
      className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
        isTyping
          ? isDarkMode
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : isDarkMode
            ? 'bg-purple-600 hover:bg-regal-blue text-white '
            : 'bg-gray-200 hover:bg-regal-blue hover:text-white text-gray-400 '
      }`}
      title="บันทึกเสียง"
    >
      <Mic className="w-5 h-5" />
    </button>
    
    {/* ปุ่มส่งข้อความ */}
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
            : 'bg-regal-blue hover:bg-regal-blue text-white shadow-lg'
      }`}
      title="ส่งข้อความ"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default ChatSpace;