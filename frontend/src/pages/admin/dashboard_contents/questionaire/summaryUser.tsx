import { use, useEffect, useState } from "react";
import { GetUsersById } from "../../../../services/https/login";
import { useParams } from "react-router-dom";
import { UsersInterface } from "../../../../interfaces/IUser";
import { GetUserKPI, UserKPI, UserSummary } from "../../../../services/https/dashboardcontents";
import { BookCheck, CalendarCheck, Clock10, FolderPen, ListChecks, MessageSquare, User, UsersRound } from "lucide-react";
import { message } from "antd";
import BarTransaction from "./componentsum/barTransaction";
import BarchartCompare from "./componentsum/barchartcompare";
const PROFILE_BASE_URL = import.meta.env.VITE_PF_URL;

export function formatThaiDateTime(
  isoString: string,
  options?: {
    withTime?: boolean; // true = แสดงเวลา, false = เฉพาะวันที่
    withSeconds?: boolean; // true = แสดงวินาที
  }
): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  const { withTime = true, withSeconds = false } = options || {};

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  if (withTime) {
    dateOptions.hour = "2-digit";
    dateOptions.minute = "2-digit";
    if (withSeconds) dateOptions.second = "2-digit";
  }

  return date.toLocaleString("th-TH", dateOptions);
}

function SummaryUser() {
    const userId = useParams().id;
    const [user, setUser] = useState<UserSummary | null>(null);
    const [kpidata, setKpidata] = useState< UserKPI| null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    async function UseKPI(id: number) {
        try {
            const res = await GetUserKPI(id);
            setKpidata(res);
            // console.log("ข้อมูลผู้ใช้ kpi", res);
        } catch (err: any) {
            console.error("Cannot fetch latest respondents:", err);
            message.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    }


    
    useEffect(() => {
        if (userId) {
            GetUsersById(userId.toString()).then(res => {
              if (res.status === 200) {
                setUser(res.data);
                // console.log("ข้อมูลผู้ใช้", res);
                if (res.data.ProfileAvatar) {
                  setAvatarUrl(`${PROFILE_BASE_URL}${res.data.ProfileAvatar.avatar}`);
                }
                
              }
            });
          }
        
    }, [userId]);

    useEffect(() => {
       
          UseKPI(Number(userId));
        
      }, []);

    
    return (
        <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]  py-8 px-16 space-y-4 ">
                {/* profile user */}
                <div>
                    <div className="flex flex-col items-center  space-y-2">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                          <p className="text-lg font-bold">{user?.username}</p>
                          <p className="text-gray-600">{user?.email}</p>
                    </div>
                </div>
                {/* card */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1 - Chat Rooms */}
        <div className="h-30 bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
          <div className="bg-white text-[#39a6c3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#39a6c3]/20 flex-shrink-0">
            <FolderPen size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">จำนวนแบบสอบถามที่ทำไปทั้งหมด</p>
            <p className="text-xl sm:text-2xl font-bold">{kpidata?.total_taken}</p>
          </div>
        </div>

        {/* Card 2 - Messages */}
        <div className="h-30 bg-gradient-to-br from-[#c6c2f7] to-[#ece9fc] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
          <div className="bg-white text-[#6c5dd3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#6c5dd3]/20 flex-shrink-0">
            <ListChecks size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">จำนวนแบบสอบถามที่ทำแล้ว</p>
            <p className="text-xl sm:text-2xl font-bold">{kpidata?.total_taken}</p>
          </div>
        </div>

        {/* Card 3 - Active Users */}
        <div className=" h-30 bg-gradient-to-br from-[#a1d5c4] to-[#e3faf2] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
          <div className="bg-white text-[#1f8a70] p-3 sm:p-4 rounded-full shadow-lg shadow-[#1f8a70]/20 flex-shrink-0">
            <CalendarCheck size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm sm:text-base">วันที่ทำแบบสอบถามล่าสุด</p>
            <p className="text-xl sm:text-2xl font-bold">{formatThaiDateTime(kpidata?.last_taken_date ?? '') }</p>
          </div>
        </div>
      </div>
      <BarTransaction uid={Number(userId)}/>
      <BarchartCompare uid={Number(userId)}/>
        </div>
    )
}
export default SummaryUser;