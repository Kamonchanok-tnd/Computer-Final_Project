// ✅ ใช้ข้อมูลจาก Service จริงทั้งหมด แทน mock (getAllTransactions, getAllQuestionnaireGroups, getAllCriteria)
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  Activity,
  CheckCircle,
  Award,
  BookOpen,
  Target,
} from "lucide-react";
import {
  getAllTransactions,
  getAllCriteria,
  getAllQuestionnaireGroups,
} from "../../services/https/assessment";
import { ITransaction } from "../../interfaces/ITransaction";

const Dashboard = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [latestScores, setLatestScores] = useState<Record<string, ITransaction>>({});
  const [radarData, setRadarData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const tx = await getAllTransactions();
        const cr = await getAllCriteria();
        const gr = await getAllQuestionnaireGroups();

        setTransactions(Array.isArray(tx) ? tx : []);
        setCriteria(Array.isArray(cr) ? cr : []);
        setGroups(Array.isArray(gr) ? gr : []);

        const latest = getLatestScoresByDescription(tx);
        setLatestScores(latest);
        setRadarData(buildRadarData(latest));
        setTrendData(buildTrendData(tx));
      } catch (err) {
        console.error("❌ Dashboard Load Error:", err);
      }
    })();
  }, []);

  const getLatestScoresByDescription = (tx: ITransaction[]) => {
    const latest: Record<string, ITransaction> = {};
    tx.forEach((t) => {
      const key = t.description;
      if (!latest[key] || new Date(t.CreatedAt) > new Date(latest[key].CreatedAt)) {
        latest[key] = t;
      }
    });
    return latest;
  };

  const buildRadarData = (latest: Record<string, ITransaction>) => {
    return Object.values(latest).map((t) => {
      const normalized = (typeof t.total_score === "number" ? t.total_score : 0) /
        (typeof t.max_score === "number" && t.max_score !== 0 ? t.max_score : 1);
      return {
        subject: t.description.split("(")[0].trim(),
        score: normalized * 100,
        fullMark: 100,
      };
    });
  };

  const buildTrendData = (tx: ITransaction[]) => {
    return [...tx]
      .sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime())
      .map((t) => ({
        date: t.CreatedAt,
        score: t.total_score,
        group: t.questionnaire_group ?? "N/A",
        description: t.description,
      }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mental Health Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {Object.values(latestScores)?.map((t) => (
            <div key={t.ID} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                  {t.result}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2 leading-tight">
                {t.description}
              </h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-blue-700">{t.total_score}</span>
                <span className="text-sm text-gray-500">/ {t.max_score ?? 0}</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${t.max_score ? ((t.total_score ?? 0) / t.max_score) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-2" />
                ภาพรวมสุขภาพจิตปัจจุบัน
              </h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                ข้อมูลล่าสุด
              </div>
            </div>
            {radarData?.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar name="คะแนน" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                แนวโน้มการเปลี่ยนแปลง
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.isArray(groups) && groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    {group.name}
                  </h3>
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-blue-100 text-sm mb-4">
                  ความถี่: {group.frequency_days ?? "-"} วัน
                </p>
                <div className="text-sm">{group.description}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">ไม่พบข้อมูลกลุ่มแบบสอบถาม</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            ข้อมูลแบบประเมินและเกณฑ์การให้คะแนน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.isArray(criteria) && criteria.length > 0 ? (
              criteria.map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm leading-tight">
                    {c.description}
                  </h4>
                  <div className="text-xs text-gray-600 mb-2">
                    คะแนนเต็ม: {c.max_score}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Array.isArray(c.result_criteria) ? (
                      c.result_criteria.map((rc: any, idx: number) => (
                        <div key={idx}>• {rc}</div>
                      ))
                    ) : (
                      <div>–</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลเกณฑ์</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;