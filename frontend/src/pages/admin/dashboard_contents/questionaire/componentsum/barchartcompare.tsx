import { useEffect, useState } from "react";
import { Questionnaire } from "../../../../../interfaces/IQuestionnaire";
import { getAllQuestionnaires } from "../../../../../services/https/questionnaire";
import {
  GetDetailQuestionnaire,
  getPersonalTransactions,
  getPrePostTransactionsCompare,
  IDetailquestionire,
} from "../../../../../services/https/dashboardcontents";
import { Select, Spin } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import NoData from "../../../../secondary function/Playlist/Component/noSoundplaylist";

const { Option } = Select;

interface Transaction {
  questionnaire_group: string;
  total_score: number;
  date: string;
  session_number?: number;
}

interface barProps {
  uid: number;
}

function BarchartCompare({ uid }: barProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("Personal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [detailQu,setDetailQu] = useState<IDetailquestionire | null>(null)

  // ดึงข้อมูลแบบสอบถามทั้งหมด
  async function fetchQuestionnaires() {
    try {
      const res = await getAllQuestionnaires();
      setQuestionnaires(res ?? []);
      if (res?.length > 0) setSelectedId(res[0]?.id ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }


  async function fetchDetailQuestionnaire(uid: number, description: string) {
    try {
      const res = await GetDetailQuestionnaire(uid, description);
      console.log("detail show", res);
      setDetailQu(res) ;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }



  // ดึงข้อมูล Pre/Post
  async function fetchTransactions(questionnaireName: string) {
    try {
      setLoading(true);
      const res = await getPrePostTransactionsCompare(uid, questionnaireName);
      console.log(res);
      setTransactions(res ?? []); 
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  }

  // ดึงข้อมูล Personal
  async function fetchPersonTransactions(questionnaireName: string) {
    try {
      setLoading(true);
      const res = await getPersonalTransactions(uid, questionnaireName);
      setTransactions(res ?? []); 
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  }

  // โหลดข้อมูลเมื่อเลือกแบบสอบถามหรือกลุ่ม
  useEffect(() => {
    if (selectedId && selectedGroupId) {
      const q = questionnaires.find((q) => q.id === selectedId);
      if (!q) return;

      if (selectedGroupId === "Pre/Post") {
        fetchTransactions(q.nameQuestionnaire);
        fetchDetailQuestionnaire(uid, q.nameQuestionnaire);
      } else if (selectedGroupId === "Personal") {
        fetchPersonTransactions(q.nameQuestionnaire);
        fetchDetailQuestionnaire(uid, q.nameQuestionnaire);
      }
    }
  }, [selectedId, selectedGroupId]);

  useEffect(() => {
    fetchQuestionnaires();
 
  }, []);

  // แปลงข้อมูลสำหรับ BarChart (Pre/Post)
  const chartDataBar = (transactions ?? []).reduce((acc: any[], t) => {
    const session = t.session_number;
    let sessionObj = acc.find((s) => s.name === `รอบที่ ${session}`);
    if (!sessionObj) {
      sessionObj = { name: `รอบที่ ${session}` };
      acc.push(sessionObj);
    }
    if (t.questionnaire_group === "Pre-test") {
      sessionObj.Pre = t.total_score;
    } else if (t.questionnaire_group === "Post-test Interval") {
      sessionObj.Pre = t.total_score; // interval ทำหน้าที่เหมือน pre รอบถัดไป
    } else if (t.questionnaire_group === "Post-test") {
      sessionObj.Post = t.total_score;
    }
    return acc;
  }, []);

  // แปลงข้อมูลสำหรับ LineChart (Personal)
  const chartDataLine = (transactions ?? []).map((t, idx) => ({
    name: `ครั้งที่ ${idx + 1}`,
    score: t.total_score,
    date: new Date(t.date).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 font-ibmthai
    grid grid-cols-1 md:grid-cols-4 gap-4 min-h-70">
      <div className="col-span-3" >

      <div className="flex justify-between">
      <h3 className="text-lg font-semibold mb-3">วิเคราะห์การทำแบบสอบถาม</h3>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Selector Group */}
        <Select
          className="custom-select"
          value={selectedGroupId ?? undefined}
          onChange={(value) => setSelectedGroupId(value)}
          style={{ width: "100%", maxWidth: "200px" }}
          placeholder="เลือกกลุ่มแบบสอบถาม"
        >
          <Option value="Pre/Post">ก่อนและหลัง</Option>
          <Option value="Personal">ทั่วไป</Option>
        </Select>

        {/* Selector Questionnaire */}
        <Select
         className="custom-select"
          value={selectedId ?? undefined}
          onChange={(value) => setSelectedId(value)}
          style={{ width: "100%", maxWidth: "300px" }}
          placeholder="เลือกแบบสอบถาม"
        >
          {questionnaires.map((q) => (
            <Option key={q.id} value={q.id}>
              {q.nameQuestionnaire}
            </Option>
          ))}
        </Select>
      </div>   
      </div>
     

      {loading ? (
        <Spin tip="Loading..." />
      ) : selectedGroupId === "Pre/Post" ? (
        chartDataBar.length > 0 ? (
       
         
                <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartDataBar}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pre" fill="#BBF0FC" />
                <Bar dataKey="Post" fill="#5DE2FF" />
              </BarChart>
            </ResponsiveContainer>
          
         
        ) : (
          <p>ไม่มีข้อมูลสำหรับแบบสอบถามนี้</p>
        )
      ) : chartDataLine.length > 0 ? (
        <div>
           <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartDataLine}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#5DE2FF"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
       
      ) : (
        <NoData message="ไม่มีข้อมูลสำหรับแบบสอบถามนี้" />
      )}
           
          </div>
          <div className="flex flex-col justify-between py-8">
            <div className="bg-gradient-to-tl from-[#C8F3FD] to-[#5DE2FF] text-basic-text p-4 rounded-xl space-y-4">
                <p className="text-lg font-semibold">เกณฑ์การวัดล่าสุด</p>
                <p className="text-md font-semibold">{detailQu?.latest_result || "ไม่มีข้อมูลสำหรับแบบสอบถามนี้"}</p> 
            </div>
            <div className="flex justify-center  ">
              <div className="flex space-x-2  w-full py-8 rounded-xl justify-center ">
                  {
                      detailQu?.previous_score === null ? 
                      <p></p>
                      :
                      <div className="flex space-x-2 text-3xl  text-basic-text"> 
                        <div>
                           <p className="font-semibold">{detailQu?.previous_score } </p>
                           <p className="text-sm">ก่อน</p>
                        </div>
                       
                        <p>{">"}</p>
                      </div>
                    }
                    <div>
                        <p className="font-bold text-basic-text text-3xl">{detailQu?.latest_score }</p>
                        {
                          detailQu?.previous_score !== null &&
                          <p className="text-sm">หลัง</p>
                        }
                      
                    </div>
                  
              </div>
             
            </div>
           <div  className="bg-gradient-to-tl from-[#C8F3FD] to-[#5DE2FF] text-basic-text p-4 rounded-xl space-y-4
           text-xl font-bold flex flex-col items-center">
             <p>คะแนนเฉลี่ย</p>
             <p>{detailQu?.average_score}</p>
           </div>
          </div>
    </div>
  );
}

export default BarchartCompare;
