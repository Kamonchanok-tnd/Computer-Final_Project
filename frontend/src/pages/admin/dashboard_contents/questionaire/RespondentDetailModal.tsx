import { Modal, Card, Spin } from "antd";
import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getPrePostTransactions, getStandaloneTransactions } from "../../../../services/https/dashboardcontents";
import { GetUsersById } from "../../../../services/https/login";

interface Transaction {
  questionnaire_group: string;
  total_score: number;
  date: string;
  session_number?: number;
}

interface RespondentWithTrend {
  username: string;
  questionnaire_name: string;
  survey_type: string;
  trend: Transaction[];
  score?: number;
  level?: string;
  taken_at?: string;
}

interface RespondentDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string
  description: string;
  result: string
  surveyType: string;
  assess_date:string ;
  tid:number ;
}
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
  

export default function RespondentDetailModal({
  open,
  onClose,
  userId,
  userName,
  description,
  surveyType,
  result,
  assess_date,
  tid

}: RespondentDetailModalProps) {
  const [respondent, setRespondent] = useState<RespondentWithTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
       

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let trend: Transaction[] = [];
        
        if (surveyType === "Pre-test" || surveyType === "Post-test") {
          trend = await getPrePostTransactions(userId, description,tid);
          console.log("trend is : ",trend);
        } else {
          trend = await getStandaloneTransactions(userId, description,tid);
          console.log("trend is person : ",trend);
        }

        setRespondent({
          username: `${userName}`,
          questionnaire_name: description,
          survey_type: surveyType,
          trend: Array.isArray(trend) ? trend : [],
          score: Array.isArray(trend) && trend.length > 0 ? trend[trend.length - 1].total_score : 0,
        });
      } catch (err) {
        console.error("Cannot fetch respondent with trend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, userId, description, surveyType]);

    useEffect(() => {
        if (userId) {
            GetUsersById(userId.toString()).then(res => {
              if (res.status === 200) {
               
                if (res.data.ProfileAvatar) {
                  setAvatarUrl(`${PROFILE_BASE_URL}${res.data.ProfileAvatar.avatar}`);
                }
                
              }
            });
          }
    }, [userId]);

  const { graphData, isPrePostType } = useMemo(() => {
    if (!respondent || !Array.isArray(respondent.trend) || respondent.trend.length === 0) {
      return { graphData: [], isPrePostType: false };
    }

    const isPrePost = respondent.trend.some(
      t => t.questionnaire_group === "Pre-test" || t.questionnaire_group === "Post-test"
    );

    if (isPrePost) {
      // จัดกลุ่ม Pre/Post เป็นคู่
      const grouped: Record<number, { 
        session: number; 
        label: string; 
        preScore?: number; 
        postScore?: number 
      }> = {};

      respondent.trend.forEach((t) => {
        const session = t.session_number ?? 0;
        if (!grouped[session]) {
          grouped[session] = {
            session,
            label: `รอบ ${session}`,
          };
        }

        if (t.questionnaire_group === "Pre-test") {
          grouped[session].preScore = t.total_score;
        } else if (t.questionnaire_group === "Post-test") {
          grouped[session].postScore = t.total_score;
        }
      });

      return { graphData: Object.values(grouped), isPrePostType: true };
    } else {
      // Standalone
      const data = respondent.trend.map((t) => ({
        label: new Date(t.date).toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
        }),
        score: t.total_score,
      }));

      return { graphData: data, isPrePostType: false };
    }
  }, [respondent]);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-700 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value} คะแนน
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      className="respondent-detail-modal font-ibmthai"
      title={
        <div className="px-2 py-1  flex justify-center">
          <div className="flex flex-col items-center text-sm">
               <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover"></img>
               <p className ="text-subtitle text-lg">{respondent?.username ?? "-"}</p>
          </div>
        </div>
      }
    >
      <div className="p-2">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80">
            <Spin size="large" />
            <p className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>
          </div>
        ) : respondent ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <div 
                className="text-center border-l-4 border-l-blue-500 hover:shadow-md transition-shadow bg-blue-200/20 p-2 "
              >
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-ibmthai">คะแนนที่ได้</p>
                  <p className="text-2xl font-bold text-blue-600">{respondent.score ?? 0}</p>
                
                </div>
              </div>
              <div 
                className="text-center border-l-4 border-l-purple-500 hover:shadow-md transition-shadow bg-purple-200/20 p-2"
               
              >
                <div className="space-y-2 font-ibmthai">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">ผลการประเมิน</p>
                  <p className="text-2xl font-bold text-purple-600">{result ?? "-"}</p>
                
                </div>
              </div>

              <div 
                className="text-center border-l-4 border-l-orange-500 hover:shadow-md transition-shadow bg-orange-200/20 p-2"
              
              >
                <div className="space-y-2 font-ibmthai">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">วันที่ทำล่าสุด</p>
                  <p className="text-lg font-bold text-orange-600">{formatThaiDateTime(assess_date, { withTime: false }) ?? "-"}</p>
                 
                </div>
              </div>
            </div>

            {/* Graph Section */}
            <div 
              className=""
        
            >
              <div className="h-80 w-full">
                {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={graphData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {isPrePostType ? (
                        <>
                          <Bar 
                            dataKey="preScore" 
                            fill="url(#preGradient)" 
                            name="Pre-test" 
                            radius={[2, 2, 0, 0]}
                            maxBarSize={60}
                          />
                          <Bar 
                            dataKey="postScore" 
                            fill="url(#postGradient)" 
                            name="Post-test" 
                            radius={[2, 2, 0, 0]}
                            maxBarSize={60}
                          />
                          <defs>
                            <linearGradient id="preGradient" x1="0" y1="0" x2="0" y2="1">
                           
                              <stop offset="100%" stopColor="#BBF0FC" />
                            </linearGradient>
                            <linearGradient id="postGradient" x1="0" y1="0" x2="0" y2="1">
                            
                              <stop offset="100%" stopColor="#5DE2FF" />
                            </linearGradient>
                          </defs>
                        </>
                      ) : (
                        <>
                          <Bar 
                            dataKey="score" 
                            fill="url(#standaloneGradient)" 
                            name="คะแนน" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={80}
                          />
                          <defs>
                            <linearGradient id="standaloneGradient" x1="0" y1="0" x2="0" y2="1">
                        
                              <stop offset="100%" stopColor="#C9C5F3" />
                            </linearGradient>
                          </defs>
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-lg">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>
                    <p className="text-sm mt-2">กรุณาตรวจสอบข้อมูลใหม่อีกครั้ง</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-gray-400">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-lg">ไม่พบข้อมูล</p>
            <p className="text-sm mt-2">กรุณาลองใหม่อีกครั้ง</p>
          </div>
        )}
      </div>
    </Modal>
  );
}