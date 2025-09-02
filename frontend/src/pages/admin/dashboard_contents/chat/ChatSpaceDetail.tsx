import { useEffect, useState } from "react";
import { GetQverview } from "../../../../services/https/Chat";
import ChatTrendMessagesFilter from "./ChatTrendCardRecharts";
import { Select, DatePicker } from "antd";
import ChatTrendChart from "./ChatTrendChart";
import { Clock10, MessageSquare, User, UsersRound } from "lucide-react";
import DashboardSessionsStatus from "./Piestatus";
import ActiveUsersChart from "./ActiveUsersChart";
const { Option } = Select;
const { RangePicker } = DatePicker;



interface OverviewData {
  total_chat_rooms: number;
  total_messages: number;
  active_users: number;
  avg_ai_response_seconds: number;
}

function ChatSpaceDetail() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // เพิ่ม "today" เข้ามา
 

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await GetQverview();
      console.log("overview: ",res);
      setData(res);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูล Overview ได้");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOverview();
  }, []);
  

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-4 ">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl  p-1 text-center flex justify-around items-center gap-8 ">
          <div className="bg-white  text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
            <UsersRound size={30} className=""/>
          </div>
          <div>
            <p className="text-gray-600">จำนวนห้องแชททั้งหมด</p>
            <p className="text-2xl font-bold">{data?.total_chat_rooms} </p>
          </div>
          
        </div>
        <div className="bg-gradient-to-br from-[#c6c2f7] to-[#ece9fc] rounded-2xl  p-1 text-center flex justify-around items-center gap-8">
          <div className="bg-white  text-[#6c5dd3] p-4 rounded-full shadow-lg shadow-[#6c5dd3]/20">
             <MessageSquare size={30}/>
          </div>
         
          <div>
            <p className="text-gray-600">จำนวนข้อความทั้งหมด</p>
            <p className="text-2xl font-bold">{data?.total_messages}</p>
            </div>
        </div>
        <div className="bg-gradient-to-br from-[#a1d5c4] to-[#e3faf2] rounded-2xl p-1 text-center flex justify-around items-center gap-8">
          <div className="bg-white  text-[#1f8a70] p-4 rounded-full shadow-lg shadow-[#1f8a70]/20">
             <User size={30}/>
          </div>
         
          <div>
            <p className="text-gray-600">จำนวนผู้ใช้งานทั้งหมด</p>
          <p className="text-2xl font-bold">{data?.active_users} </p>
          </div>
          
        </div>
        <div className="bg-gradient-to-br from-[#d9bcdf] to-[#f2e2fd] rounded-2xl p-6 text-center flex justify-around items-center gap-8">
          <div className="bg-white text-[#d2bada] p-4 rounded-full shadow-lg shadow-[#d2bada]/20">
              <Clock10 size={30}/>
          </div>
        
          <div>
            <p className="text-gray-600">เวลาในการตอบกลับ</p>
            <p className="text-2xl font-bold"> {data?.avg_ai_response_seconds.toFixed(4)}</p>
          </div>
          
        </div>
      </div>
    
     
      {/* ส่ง granularity ไปให้กราฟ */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3 h-full">
            <ChatTrendChart/>
        </div>
       <div className="col-span-1">
         <DashboardSessionsStatus/>
       </div>
       
      </div>
      <ActiveUsersChart/>
     
      

    </div>
  );
}

export default ChatSpaceDetail;
