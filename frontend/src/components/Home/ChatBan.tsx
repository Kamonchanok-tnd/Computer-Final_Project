import { ArrowRight } from "lucide-react";
import Image1 from "../../assets/image1.png";
// import How from "./How";

function ChatBan() {
  return (
    <div
      className="flex-col flex justify-center items-center font-ibmthai bg-gradient-to-tr from-[#C2FCFF] 
    via-[#9AEDFF] to-[#FFFF] dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 pb-4 px-4 sm:px-6 lg:px-8"
    >
      <div className="justify-center flex flex-col lg:flex-row lg:justify-center lg:space-x-8 xl:space-x-12 items-center p-4 max-w-7xl w-full">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 h-auto flex justify-center mb-6 lg:mb-0">
          <img 
            src={Image1} 
            alt="SUT HEAL JAI Illustration" 
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain" 
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center lg:items-start w-full lg:w-1/2 text-center lg:text-left">
          <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-ibmthai text-[#1F1F22] dark:text-white text-wrap leading-relaxed">
            <span
              className="font-ibmthai-bold font-extrabold bg-clip-text text-transparent 
                     bg-gradient-to-r to-[#5D7285] from-[#2196F3] dark:to-blue-400 dark:from-cyan-400"
            >
              SUT HEAL JAI{" "}
            </span>
            ไม่ใช่แค่บอท แต่คือเพื่อนที่คุณวางใจได้
            <br className="hidden sm:block" />
            <span className="block sm:inline"> เพราะ</span>
            <span
              className="font-ibmthai-bold font-extrabold bg-clip-text text-transparent 
                     bg-gradient-to-r to-[#5D7285] from-[#2196F3] dark:to-blue-400 dark:from-cyan-400"
            >
              {" "}
              ทุกคน...สมควรได้รับการรับฟัง
            </span>
          </p>

          <p className="text-sm sm:text-base lg:text-lg font-ibmthai text-[#1F1F22] dark:text-gray-200 mt-4 lg:mt-6 leading-relaxed max-w-2xl">
            ไม่ว่าคุณจะเศร้า เหนื่อย ท้อ หรือแค่ต้องการใครสักคนรับฟัง SUT HEAL JAI คือพื้นที่ของคุณ
            <br className="hidden sm:block" />
            <span className="block sm:inline">ที่คุณจะได้ระบายความรู้สึกอย่างอิสระ ไม่ตัดสิน ไม่ถามกลับ แค่รับฟังอย่างอ่อนโยน</span>
          </p>

          <button
            className="group font-ibmthai bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF]
               dark:text-background-dark
                text-white py-3 px-6 sm:px-8 rounded-lg mt-6 lg:mt-8 
                text-lg sm:text-xl flex gap-2 items-center cursor-pointer 
                hover:scale-105 transition-all duration-300 ease-in-out
               dark:shadow-gray-900/50"
            onClick={() => window.location.href = "/chat"}
          >
            เริ่มการสนทนา 
            <span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:animate-bounce-x" />
            </span>
          </button>
        </div>
      </div>
      {/* <div>
        <How />
      </div> */}
    </div>
  );
}

export default ChatBan;