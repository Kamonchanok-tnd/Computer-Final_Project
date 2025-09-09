import { useEffect, useState } from "react";
import { GetQverview } from "../../../../services/https/Chat";
import ChatTrendChart from "./ChatTrendChart";
import { Clock10, MessageSquare, User, UsersRound } from "lucide-react";
import DashboardSessionsStatus from "./Piestatus";
import ActiveUsersChart from "./ActiveUsersChart";



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

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await GetQverview();
      console.log("overview: ", res);
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-4 md:p-6 space-y-4">
      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 - Chat Rooms */}
        <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
          <div className="bg-white text-[#39a6c3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#39a6c3]/20 flex-shrink-0">
            <UsersRound size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">จำนวนห้องแชททั้งหมด</p>
            <p className="text-xl sm:text-2xl font-bold">{data?.total_chat_rooms}</p>
          </div>
        </div>

        {/* Card 2 - Messages */}
        <div className="bg-gradient-to-br from-[#c6c2f7] to-[#ece9fc] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
          <div className="bg-white text-[#6c5dd3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#6c5dd3]/20 flex-shrink-0">
            <MessageSquare size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">จำนวนข้อความทั้งหมด</p>
            <p className="text-xl sm:text-2xl font-bold">{data?.total_messages}</p>
          </div>
        </div>

        {/* Card 3 - Active Users */}
        <div className="bg-gradient-to-br from-[#a1d5c4] to-[#e3faf2] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
          <div className="bg-white text-[#1f8a70] p-3 sm:p-4 rounded-full shadow-lg shadow-[#1f8a70]/20 flex-shrink-0">
            <User size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">จำนวนผู้ใช้งานทั้งหมด</p>
            <p className="text-xl sm:text-2xl font-bold">{data?.active_users}</p>
          </div>
        </div>

        {/* Card 4 - Response Time */}
        <div className="bg-gradient-to-br from-[#d9bcdf] to-[#f2e2fd] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8 ">
          <div className="bg-white text-[#d2bada] p-3 sm:p-4 rounded-full shadow-lg shadow-[#d2bada]/20 flex-shrink-0">
            <Clock10 size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">เวลาในการตอบกลับ (วินาที)</p>
            <p className="text-xl sm:text-2xl font-bold">
              {data?.avg_ai_response_seconds ? data.avg_ai_response_seconds.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section - Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Main Chart - Takes 3/4 on XL screens, full width on smaller screens */}
        <div className="xl:col-span-3 order-1 xl:order-1">
          <div className="bg-white rounded-2xl p-4 sm:p-6">
            <ChatTrendChart />
          </div>
        </div>

        {/* Side Chart - Takes 1/4 on XL screens, full width on smaller screens */}
        <div className="xl:col-span-1 order-2 xl:order-2">
          <div className="bg-white rounded-2xl p-4 sm:p-6 h-full">
            <DashboardSessionsStatus />
          </div>
        </div>
      </div>

      {/* Active Users Chart - Full Width */}
      <div className="bg-white rounded-2xl p-4 sm:p-6">
        <ActiveUsersChart />
      </div>
    </div>
  );
}

export default ChatSpaceDetail;