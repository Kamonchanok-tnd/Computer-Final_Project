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
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-200 font-ibmthai">
      {/* Mobile Layout - Stack vertically */}
      <div className="block lg:hidden space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <h3 className="text-lg font-semibold">วิเคราะห์การทำแบบสอบถาม</h3>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Selectors */}
        <div className="flex flex-col space-y-3 gap-2">
          <Select
            className="custom-select w-full mb-4"
            value={selectedGroupId ?? undefined}
            onChange={(value) => setSelectedGroupId(value)}
            placeholder="เลือกกลุ่มแบบสอบถาม"
          >
            <Option value="Pre/Post">ก่อนและหลัง</Option>
            <Option value="Personal">ทั่วไป</Option>
          </Select>

          <Select
            className="custom-select w-full"
            value={selectedId ?? undefined}
            onChange={(value) => setSelectedId(value)}
            placeholder="เลือกแบบสอบถาม"
          >
            {questionnaires.map((q) => (
              <Option key={q.id} value={q.id}>
                {q.nameQuestionnaire}
              </Option>
            ))}
          </Select>
        </div>

        {/* Chart Section */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin tip="Loading..." />
            </div>
          ) : selectedGroupId === "Pre/Post" ? (
            chartDataBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
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
              <p className="text-center py-8">ไม่มีข้อมูลสำหรับแบบสอบถามนี้</p>
            )
          ) : chartDataLine.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
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
          ) : (
            <NoData message="ไม่มีข้อมูลสำหรับแบบสอบถามนี้" />
          )}
        </div>

        {/* Info Cards - Stack on mobile */}
        <div className="space-y-4">
          <div className="bg-gradient-to-tl from-[#C8F3FD] to-[#5DE2FF] text-basic-text p-4 rounded-xl">
            <p className="text-base sm:text-lg font-semibold mb-2">เกณฑ์การวัดล่าสุด</p>
            <p className="text-sm sm:text-md font-semibold">
              {detailQu?.latest_result || "ไม่มีข้อมูลสำหรับแบบสอบถามนี้"}
            </p>
          </div>

          {/* Score Comparison */}
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-3 text-basic-text">
              {detailQu?.previous_score !== null && (
                <>
                  <div className="text-center">
                    <p className="font-semibold text-2xl sm:text-3xl">{detailQu?.previous_score}</p>
                    <p className="text-xs sm:text-sm">ก่อน</p>
                  </div>
                  <p className="text-xl sm:text-2xl">{">"}</p>
                </>
              )}
              <div className="text-center">
                <p className="font-bold text-2xl sm:text-3xl">{detailQu?.latest_score}</p>
                {detailQu?.previous_score !== null && (
                  <p className="text-xs sm:text-sm">หลัง</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tl from-[#C8F3FD] to-[#5DE2FF] text-basic-text p-4 rounded-xl text-center">
            <p className="text-lg sm:text-xl font-bold mb-2">คะแนนเฉลี่ย</p>
            <p className="text-lg sm:text-xl font-bold">{detailQu?.average_score}</p>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Chart Section - Takes 3 columns */}
        <div className="col-span-3">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">วิเคราะห์การทำแบบสอบถาม</h3>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          {/* Selectors */}
          <div className="flex gap-4 mb-6">
            <Select
              className="custom-select"
              value={selectedGroupId ?? undefined}
              onChange={(value) => setSelectedGroupId(value)}
              style={{ width: "200px" }}
              placeholder="เลือกกลุ่มแบบสอบถาม"
            >
              <Option value="Pre/Post">ก่อนและหลัง</Option>
              <Option value="Personal">ทั่วไป</Option>
            </Select>

            <Select
              className="custom-select"
              value={selectedId ?? undefined}
              onChange={(value) => setSelectedId(value)}
              style={{ width: "300px" }}
              placeholder="เลือกแบบสอบถาม"
            >
              {questionnaires.map((q) => (
                <Option key={q.id} value={q.id}>
                  {q.nameQuestionnaire}
                </Option>
              ))}
            </Select>
          </div>

          {/* Chart */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spin tip="Loading..." />
            </div>
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
              <p className="text-center py-20">ไม่มีข้อมูลสำหรับแบบสอบถามนี้</p>
            )
          ) : chartDataLine.length > 0 ? (
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
          ) : (
            <NoData message="ไม่มีข้อมูลสำหรับแบบสอบถามนี้" />
          )}
        </div>

        {/* Info Panel - Takes 1 column */}
        <div className="flex flex-col justify-between py-8 space-y-4">
          <div className="bg-gradient-to-tl from-[#C8F3FD] to-[#5DE2FF] text-basic-text p-4 rounded-xl">
            <p className="text-lg font-semibold mb-2">เกณฑ์การวัดล่าสุด</p>
            <p className="text-md font-semibold">
              {detailQu?.latest_result || "ไม่มีข้อมูลสำหรับแบบสอบถามนี้"}
            </p>
          </div>

          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-3 text-basic-text">
              {detailQu?.previous_score !== null && (
                <>
                  <div className="text-center">
                    <p className="font-semibold text-3xl">{detailQu?.previous_score}</p>
                    <p className="text-sm">ก่อน</p>
                  </div>
                  <p className="text-2xl">{">"}</p>
                </>
              )}
              <div className="text-center">
                <p className="font-bold text-3xl">{detailQu?.latest_score}</p>
                {detailQu?.previous_score !== null && (
                  <p className="text-sm">หลัง</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tl from-[#C8F3FD] to-[#5DE2FF] text-basic-text p-4 rounded-xl text-center">
            <p className="text-xl font-bold mb-2">คะแนนเฉลี่ย</p>
            <p className="text-xl font-bold">{detailQu?.average_score}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarchartCompare;