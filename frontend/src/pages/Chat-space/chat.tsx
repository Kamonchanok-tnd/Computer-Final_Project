import React, { useState, useRef, useEffect } from 'react';

import { ChatGemini, CloseChat, GetChat, NewChat } from '../../services/https/Chat/index';
import type { IConversation } from '../../interfaces/IConversation';
import HistoryChat from '../../components/Chat.tsx/HistoryChat';
import NewChatWelcome from '../../components/Chat.tsx/NewChatWelcome';
import { useNavigate, useParams } from 'react-router-dom';
import { IChatRoom } from '../../interfaces/IChatRoom';
import ChatHeader from '../../components/Chat.tsx/ChatHeader';
import ChatInput from '../../components/Chat.tsx/ChatInput';
import { Modal } from 'antd';
import { useDarkMode } from '../../components/Darkmode/toggleDarkmode';


interface ChatbotProps {
  isNewChatDefault?: boolean;
}
// API Configuration


const ChatSpace: React.FC<ChatbotProps> = (isNewChatDefault) => {
  const [messages, setMessages] = useState<IConversation[]>([]); // สร้าง state สําหรับข้อความ
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingText, setTypingText] = useState<string>('');
  const { isDarkMode } = useDarkMode();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isNewChat, setIsNewChat] = useState<boolean>(isNewChatDefault?.isNewChatDefault ?? false);
  const navigate = useNavigate();
  const { chatroom_id } = useParams();
  const [chatRoomID, setChatRoomID] = useState<number | null>(chatroom_id ? Number(chatroom_id) : null);
  const [modal, contextHolder] = Modal.useModal();
  const Uid = localStorage.getItem('id');
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
 
  async function getmessage(id: number) {
    const message = await GetChat(id);
    setMessages(message);
    console.log("old chat: ",message);
  }



  useEffect(() => {
    scrollToBottom();
    if (chatRoomID !== null) {
      getmessage(chatRoomID);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    
  }, [typingText, messages,isNewChat]);

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
  
    let currentRoomID = chatRoomID;
  
    if (!chatRoomID) {
      const data: IChatRoom = { uid: Number(Uid) };
      const res = await NewChat(data);
      console.log("chatroom: ", res.id);
      currentRoomID = res.id;
      setChatRoomID(res.id);
      setIsNewChat(false);
    
    }
  
    const userMessage: IConversation = {
      message: inputText,
      chatroom_id: currentRoomID ?? 1,
      stid: 1,
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsNewChat(false);
  
    
    if (!chatRoomID) {
      navigate(`/chat/${currentRoomID}`);
    }
  
    const apiResponse = await ChatGemini(userMessage);
    const responseText = apiResponse.message;
  
    await simulateTyping(responseText, (finalText) => {
      const botResponse: IConversation = {
        message: finalText,
        chatroom_id: currentRoomID ?? 1,
        stid: 2,
      };
      setMessages((prev) => [...prev, botResponse]);
    });
  };
  

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // const clearChat = (): void => {
  //   // ยกเลิก typing animation ที่กำลังทำงาน
  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }
  //   setIsTyping(false);
  //   setTypingText('');
    
    
  // };

  async function Close() {
    console.log("chatroom: ", chatRoomID);
    await CloseChat(Number(chatRoomID));
    setIsNewChat(!isNewChat);
    setMessages([]);   
    setChatRoomID(null);  
    navigate('/chat');
    
  }

  


  // const formatTime = (date: Date): string => {
  //   return date.toLocaleTimeString('th-TH', { 
  //     hour: '2-digit', 
  //     minute: '2-digit' 
  //   });
  // };

  
  const newChat = (): void => {
      if (chatRoomID) {
        modal.confirm({
          title: 'เริ่มแชทใหม่?',
          content: 'ห้องแชทปัจจุบันจะถูกปิด และเริ่มการสนทนาใหม่ คุณแน่ใจหรือไม่?',
          okText: 'ยืนยัน',
          cancelText: 'ยกเลิก',
          className: 'custom-modal',
          onOk: async () => {
            await Close(); // ปิดห้องแชทปัจจุบัน
            console.log('Closed chatroom:', chatRoomID);
          },
         
        
        });
      }
    
  };

  async function gotoVoice(){
    if (isNewChat === false && chatRoomID !== null) {
      navigate(`/chat/voice-chat/${chatRoomID}`);
      return;
    }
   
    const data: IChatRoom = { uid: Number(Uid) };
    const res = await NewChat(data);
    console.log(" chatroom send: ", res.id);
    setChatRoomID(res.id);
    navigate(`/chat/voice-chat/${res.id}`);

  }

  return (
    <div className={`min-h-[calc(100vh-64px)] transition-colors duration-300 overflow-auto font-ibmthai
       flex justify-center items-center sm:px-4 
      ${
      isDarkMode 
        ? 'bg-background-dark' 
        : 'bg-background-blue'
    }`}>

{contextHolder}
      <div className={` shadow-md rounded-xl container border duration-300 mx-auto max-w-full  h-[90vh]  
      flex flex-col justify-between ${isDarkMode ? ' border-stoke-dark' : 'border-gray-200'}`}>
        {/* Header */}
        <ChatHeader isDarkMode={isDarkMode} onNewChat={newChat} onClearChat={Close} />
        {/* Messages Area */}
          {
            isNewChat ? (
              <NewChatWelcome isDarkMode={isDarkMode} />
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
          <ChatInput
    inputText={inputText}
    setInputText={setInputText}
    onSend={handleSendMessage}
    onKeyPress={handleKeyPress}
    isTyping={isTyping}
    isDarkMode={isDarkMode}
    inputRef={inputRef as React.RefObject<HTMLInputElement>}
    gotoVoice={gotoVoice}
  />

      </div>
    </div>
  );
};

export default ChatSpace;