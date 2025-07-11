import { ArrowRight } from "lucide-react";
import Image1 from "../../assets/image1.png";
import How from "./How";
function ChatBan() {
  return (
    <div
      className="flex-col flex justify-center items-center  bg-gradient-to-tr from-[#C2FCFF]
    [#9AEDFF] to-[#FFFF] pb-4"
    >
      <div className=" justify-center  md:flex  md:justify-center md:space-x-2 items-center p-4 pr-36">
        <div className="w-full h-auto flex justify-center ">
          <img src={Image1} alt="" className="w-lg h-auto" />
        </div>
        <div className="flex flex-col items-start">
          <p className="text-3xl kanit-regular text-[#1F1F22] text-wrap">
            <span
              className="kanit-bold bg-clip-text text-transparent 
                     bg-gradient-to-r to-[#5D7285]  from-[#2196F3]"
            >
              SUT SUKJAI{" "}
            </span>
            ไม่ใช่แค่บอท แต่คือเพื่อนที่คุณวางใจได้ <br />
            เพราะ
            <span
              className="kanit-bold bg-clip-text text-transparent 
                     bg-gradient-to-r to-[#5D7285]  from-[#2196F3]"
            >
              {" "}
              ทุกคน...สมควรได้รับการรับฟัง
            </span>
          </p>
          <p className="text-sm kanit-regular text-[#1F1F22] mt-2">
            ไม่ว่าคุณจะเศร้า เหนื่อย ท้อ หรือแค่ต้องการใครสักคนรับฟัง SUT
            HEALJAI คือพื้นที่ของคุณ <br />
            ที่คุณจะได้ระบายความรู้สึกอย่างอิสระ ไม่ตัดสิน ไม่ถามกลับ
            แค่รับฟังอย่างอ่อนโยน
          </p>

          <button
            className="kanit-regular bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF]
                text-white  py-2 px-4 rounded-lg mt-4  text-xl flex gap-2 items-center
                
                "
          >
            เริ่มการสนทนา <span><ArrowRight/></span>
          </button>
        </div>
      </div>
      <div>
        <How />
      </div>
    </div>
  );
}
export default ChatBan;
