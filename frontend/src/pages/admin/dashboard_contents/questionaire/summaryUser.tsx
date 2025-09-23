import {  useEffect, useState } from "react";
import { GetUsersById } from "../../../../services/https/login";
import { useParams } from "react-router-dom";

import { GetUserKPI, UserKPI, UserSummary } from "../../../../services/https/dashboardcontents";
import {  CalendarCheck,  FolderPen, ListChecks } from "lucide-react";
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
        <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 xl:px-16 space-y-6">
                {/* Profile User */}
                <div className="w-full flex justify-center">
                    <div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-center">
                            {user?.username}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 text-center break-all">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    
                    {/* Card 1 - Total Surveys Taken */}
                    <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 min-h-[120px] sm:min-h-[130px] lg:min-h-[140px] hover:shadow-lg transition-shadow duration-200">
                        <div className="bg-white text-[#39a6c3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#39a6c3]/20 flex-shrink-0 order-1 sm:order-none">
                            <FolderPen size={20} className="sm:w-[24px] sm:h-[24px] lg:w-[28px] lg:h-[28px]" />
                        </div>
                        <div className="text-center sm:text-right flex-1 order-2 sm:order-none">
                            <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">
                                จำนวนแบบสอบถามที่ทำไปทั้งหมด
                            </p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#39a6c3]">
                                {kpidata?.total_taken || 0}
                            </p>
                        </div>
                    </div>

                    {/* Card 2 - Completed Surveys */}
                    <div className="bg-gradient-to-br from-[#c6c2f7] to-[#ece9fc] rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 min-h-[120px] sm:min-h-[130px] lg:min-h-[140px] hover:shadow-lg transition-shadow duration-200">
                        <div className="bg-white text-[#6c5dd3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#6c5dd3]/20 flex-shrink-0 order-1 sm:order-none">
                            <ListChecks size={20} className="sm:w-[24px] sm:h-[24px] lg:w-[28px] lg:h-[28px]" />
                        </div>
                        <div className="text-center sm:text-right flex-1 order-2 sm:order-none">
                            <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">
                                จำนวนแบบสอบถามที่ทำแล้ว
                            </p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#6c5dd3]">
                                {kpidata?.total_taken || 0}
                            </p>
                        </div>
                    </div>

                    {/* Card 3 - Last Survey Date */}
                    <div className="bg-gradient-to-br from-[#a1d5c4] to-[#e3faf2] rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 min-h-[120px] sm:min-h-[130px] lg:min-h-[140px] hover:shadow-lg transition-shadow duration-200 sm:col-span-2 xl:col-span-1">
                        <div className="bg-white text-[#1f8a70] p-3 sm:p-4 rounded-full shadow-lg shadow-[#1f8a70]/20 flex-shrink-0 order-1 sm:order-none">
                            <CalendarCheck size={20} className="sm:w-[24px] sm:h-[24px] lg:w-[28px] lg:h-[28px]" />
                        </div>
                        <div className="text-center sm:text-right flex-1 order-2 sm:order-none">
                            <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">
                                วันที่ทำแบบสอบถามล่าสุด
                            </p>
                            <p className="text-sm sm:text-base lg:text-lg font-bold text-[#1f8a70] break-words">
                                {formatThaiDateTime(kpidata?.last_taken_date ?? '') || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="space-y-6">
                    <div className="w-full overflow-hidden">
                        <BarTransaction uid={Number(userId)}/>
                    </div>
                    <div className="w-full overflow-hidden">
                        <BarchartCompare uid={Number(userId)}/>
                    </div>
                </div>
        </div>
    )
}

export default SummaryUser;