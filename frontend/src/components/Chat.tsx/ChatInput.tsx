import React, { RefObject } from 'react';
import { Mic, Send } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isTyping: boolean;
  isDarkMode: boolean;
  inputRef: RefObject<HTMLInputElement>;
}

function ChatInput({ inputText, setInputText, onSend, onKeyPress, isTyping, isDarkMode, inputRef }: ChatInputProps) {
  return (
    <div
      className={` sm:rounded-b-2xl sm:px-10 py-4  backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white'
      }`}
    >
      <div className="flex  h-full items-center space-x-3 md:justify-center px-4">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="พิมพ์ข้อความของคุณ..."
          className={`md:max-w-4xl flex-1 px-4 py-3 rounded-4xl border focus:outline-none focus:ring-2 transition-colors ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500'
              : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-regal-blue focus:border-regal-blue'
          }`}
          disabled={isTyping}
        />

        {/* ปุ่มไมโครโฟน */}
        <button
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
          onClick={onSend}
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
  )
}

export default ChatInput