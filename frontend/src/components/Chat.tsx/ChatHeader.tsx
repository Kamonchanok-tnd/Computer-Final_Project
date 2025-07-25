import React, { createContext } from 'react';
import { ChevronLeft, Bot, Plus, Trash2 } from 'lucide-react';
import './custom.css'
interface ChatHeaderProps {
  isDarkMode: boolean;
  onNewChat: () => void;
  onClearChat: () => void;
 
}


function ChatHeader({ isDarkMode, onNewChat, onClearChat }: ChatHeaderProps) {

  return (
    <div
    className={` sm:rounded-t-2xl md:p-2 px-4 py-2 backdrop-blur-sm duration-300 ${
      isDarkMode
        ? 'bg-gray-800/80 border-gray-700'
        : 'bg-white border-gray-200'
    } `}
  ><div>
    
  </div>
    <div className=" flex items-center justify-between px-2">
      <div className="flex items-center space-x-3">
       
        <div
          className={`md:p-3 p-2 rounded-full ${
            isDarkMode ? 'bg-purple-600' : 'bg-indigo-600'
          }`}
        >
          <Bot className="md:w-6 md:h-6 w-4 h-4 text-white rounded-2xl duration-300" />
        </div>

        <div>
          <h1
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-black-word'
            }`}
          >
            Heal JAI
          </h1>
          {/* <p
            className={`text-sm hidden md:inline-block ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            พร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง
          </p> */}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="flex items-center md:space-x-2 bg-button-blue p-2 rounded-lg"
          onClick={onNewChat}
        >
          <Plus className="w-5 h-5 text-white" />
          <p className="hidden md:inline-block text-white text-md">สร้างแชท</p>
        </button>
        <button
          onClick={onClearChat}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
              : 'bg-red-50 hover:bg-red-100 text-red-600'
          }`}
          title="ปิดห้องแชท"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
  )
}
export default ChatHeader