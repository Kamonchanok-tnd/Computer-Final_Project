import React, { useState } from "react";
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
  Area,
  AreaChart,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  Users,
  CheckCircle,
  Target,
  AlertCircle,
  Award,
  BookOpen,
  MessageCircle,
} from "lucide-react";

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState("user123");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");

  // Mock assessment definitions with their own scoring systems
  const assessmentTypes = {
    depression: {
      name: "แบบคัดกรองโรคซึมเศร้า 2 คำถาม (2Q)",
      maxScore: 2,
      categories: [
        {
          range: [0, 0],
          label: "ปกติ ไม่เป็นโรคซึมเศร้า",
          color: "bg-green-500",
          textColor: "text-green-700",
        },
        {
          range: [1, 2],
          label: "เป็นผู้มีความเสี่ยง หรือ มีแนวโน้มที่จะเป็นโรคซึมเศร้า",
          color: "bg-red-500",
          textColor: "text-red-700",
        },
      ],
      isPositive: false,
    },
    anxiety: {
      name: "แบบคัดกรองโรคซึมเศร้า 9 คำถาม (9Q)",
      maxScore: 27,
      categories: [
        {
          range: [0, 6],
          label:
            "ไม่มีอาการของโรคซึมเศร้าหรือมีอาการของโรคซึมเศร้าระดับน้อยมาก",
          color: "bg-green-500",
          textColor: "text-green-700",
        },
        {
          range: [7, 12],
          label: "มีอาการของโรคซึมเศร้า ระดับน้อย",
          color: "bg-blue-500",
          textColor: "text-blue-700",
        },
        {
          range: [13, 18],
          label: "มีอาการของโรคซึมเศร้า ระดับปานกลาง",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
        },
        {
          range: [19, 27],
          label: "มีอาการของโรคซึมเศร้า ระดับรุนแรง",
          color: "bg-red-500",
          textColor: "text-red-700",
        },
      ],
      isPositive: false,
    },
    wellbeing: {
      name: "แบบวัดระดับสติ (State Mindfulness Scale – ฉบับย่อ)",
      maxScore: 30,
      categories: [
        {
          range: [1, 15],
          label: "ขาดสติ ในขณะนั้น",
          color: "bg-red-500",
          textColor: "text-red-700",
        },
        {
          range: [16, 30],
          label: "มีสติ อยู่กับปัจจุบัน",
          color: "bg-green-500",
          textColor: "text-green-700",
        },
      ],
      isPositive: true,
    },
    stress: {
      name: "แบบวัดความเครียด (ST-5)",
      maxScore: 15,
      categories: [
        {
          range: [0, 4],
          label: "ไม่มีความเครียด",
          color: "bg-green-500",
          textColor: "text-green-700",
        },
        {
          range: [5, 7],
          label: "เครียดปานกลาง",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
        },
        {
          range: [8, 9],
          label: "เครียดมาก",
          color: "bg-orange-500",
          textColor: "text-orange-700",
        },
        {
          range: [10, 15],
          label: "ความเครียดสมากที่สุด",
          color: "bg-red-700",
          textColor: "text-red-700",
        },
      ],
      isPositive: false,
    },
    resilience: {
      name: "แบบวัดระดับความสุข คะแนน 0-10",
      maxScore: 10,
      categories: [
        {
          range: [0, 0],
          label: "ไม่มีความสุขเลย",
          color: "bg-red-500",
          textColor: "text-red-700",
        },
        {
          range: [1, 2],
          label: "มีความสุขน้อยที่สุด",
          color: "bg-pink-500",
          textColor: "text-pink-700",
        },
        {
          range: [3, 4],
          label: "มีความสุขน้อย",
          color: "bg-orange-500",
          textColor: "text-orange-700",
        },
        {
          range: [5, 6],
          label: "มีความสุขปานกลาง",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
        },
        {
          range: [7, 8],
          label: "มีความสุขมาก",
          color: "bg-green-500",
          textColor: "text-green-700",
        },
        {
          range: [9, 10],
          label: "มีความสุขมากที่สุด",
          color: "bg-blue-500",
          textColor: "text-blue-700",
        },
      ],
      isPositive: false,
    },
  };

  // Mock user data with different assessments
  type AssessmentResult = { score: number; assessment: string };
  type AssessmentTypes =
    | "depression"
    | "anxiety"
    | "wellbeing"
    | "stress"
    | "resilience";
  type PreTest = {
    completed: boolean;
    date: string;
    results: Record<AssessmentTypes, AssessmentResult>;
  };
  type PostTest = {
    id: number;
    date: string;
    session: string;
    results: Partial<Record<AssessmentTypes, AssessmentResult>>;
  };
  type LongTermTest = {
    id: number;
    date: string;
    week: string;
    results: Record<AssessmentTypes, AssessmentResult>;
  };
  type User = {
    name: string;
    preTest: PreTest;
    postTests: PostTest[];
    longTermTests: LongTermTest[];
    nextLongTermTest: string;
  };
  const userData: { [key: string]: User } = {
    user123: {
      name: "ผู้ใช้งาน A",
      preTest: {
        completed: true,
        date: "2024-01-15",
        results: {
          depression: { score: 1, assessment: "depression" },
          anxiety: { score: 13, assessment: "anxiety" },
          wellbeing: { score: 18, assessment: "wellbeing" },
          stress: { score: 8, assessment: "stress" },
          resilience: { score: 4, assessment: "resilience" },
        },
      },
      postTests: [
        {
          id: 1,
          date: "2024-01-20",
          session: "Session 1",
          results: {
            depression: { score: 0, assessment: "depression" },
            anxiety: { score: 0, assessment: "anxiety" },
            wellbeing: { score: 18, assessment: "wellbeing" },
          },
        },
        {
          id: 2,
          date: "2024-01-22",
          session: "Session 2",
          results: {
            depression: { score: 1, assessment: "depression" },
            anxiety: { score: 2, assessment: "anxiety" },
            wellbeing: { score: 16, assessment: "wellbeing" },
          },
        },
      ],
      longTermTests: [
        {
          id: 1,
          date: "2024-01-30",
          week: "สอบครั้งที่ 1",
          results: {
            depression: { score: 1, assessment: "depression" },
            anxiety: { score: 3, assessment: "anxiety" },
            wellbeing: { score: 15, assessment: "wellbeing" },
            stress: { score: 8, assessment: "stress" },
            resilience: { score: 3, assessment: "resilience" },
          },
        },
      ],
      nextLongTermTest: "2024-02-27",
    },
  };

  const currentUser = userData[selectedUser];

  const getAssessmentCategory = (
    score: number,
    assessmentType: keyof typeof assessmentTypes
  ) => {
    const assessment = assessmentTypes[assessmentType];
    return (
      assessment.categories.find(
        (cat) => score >= cat.range[0] && score <= cat.range[1]
      ) || assessment.categories[0]
    );
  };

  const getLatestScores = () => {
    const latest: Record<string, AssessmentResult> = {};

    // Get latest scores for each assessment type
    Object.keys(assessmentTypes).forEach((type) => {
      // Check long-term tests first
      for (let i = currentUser.longTermTests.length - 1; i >= 0; i--) {
        if (currentUser.longTermTests[i].results[type as AssessmentTypes]) {
          latest[type] =
            currentUser.longTermTests[i].results[type as AssessmentTypes];
          break;
        }
      }

      // Then check post tests if not found
      if (!latest[type]) {
        for (let i = currentUser.postTests.length - 1; i >= 0; i--) {
          if (currentUser.postTests[i].results[type as AssessmentTypes]) {
            latest[type] =
              currentUser.postTests[i].results[type as AssessmentTypes]!;
            break;
          }
        }
      }

      // Finally check pre-test
      if (
        !latest[type] &&
        currentUser.preTest.results[type as AssessmentTypes]
      ) {
        latest[type] = currentUser.preTest.results[type as AssessmentTypes];
      }
    });

    return latest;
  };

  const latestScores = getLatestScores();

  // Prepare radar chart data
  const radarData = Object.keys(latestScores).map((type) => {
    const assessment = assessmentTypes[type as AssessmentTypes];
    const score = latestScores[type].score;
    const normalizedScore = assessment.isPositive
      ? (score / assessment.maxScore) * 100
      : ((assessment.maxScore - score) / assessment.maxScore) * 100;

    return {
      subject: assessment.name.split("(")[0].trim(),
      score: normalizedScore,
      fullMark: 100,
    };
  });

  // Prepare trend data
  const getTrendData = () => {
    const allTests = [
      { ...currentUser.preTest, type: "Pre-test", id: "pre" },
      ...currentUser.postTests.map((test) => ({ ...test, type: "Post-test" })),
      ...currentUser.longTermTests.map((test) => ({
        ...test,
        type: "Long-term",
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return allTests.map((test) => {
      const dataPoint: {
        name: string;
        date: string;
        [key: string]: string | number;
      } = {
        name:
          test.type === "Pre-test"
            ? "Pre"
            : test.type === "Post-test"
            ? `Post-${test.id}`
            : `LT-${test.id}`,
        date: test.date,
      };

      Object.keys(latestScores).forEach((type) => {
        const score = test.results[type as AssessmentTypes]?.score;
        if (score !== undefined) {
          dataPoint[type] = score;
        }
      });

      return dataPoint;
    });
  };

  const trendData = getTrendData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Mental Health Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Assessment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {Object.keys(latestScores).map((type) => {
            const score = latestScores[type];
            const assessment = assessmentTypes[type as AssessmentTypes];
            const category = getAssessmentCategory(
              score.score,
              type as AssessmentTypes
            );

            return (
              <div
                key={type}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}
                  >
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${category.color} text-white`}
                  >
                    {category.label}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2 leading-tight">
                  {assessment.name}
                </h3>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-2xl font-bold ${category.textColor}`}>
                    {score.score}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {assessment.maxScore}
                  </span>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${category.color}`}
                    style={{
                      width: `${(score.score / assessment.maxScore) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
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
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar
                  name="คะแนน"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                แนวโน้มการเปลี่ยนแปลง
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis />
                <Tooltip />
                {Object.keys(latestScores).map((type, index) => {
                  const colors = [
                    "#8884d8",
                    "#82ca9d",
                    "#ffc658",
                    "#ff7300",
                    "#413ea0",
                  ];
                  return (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Test Schedule & History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pre-test */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Pre-test Assessment
              </h3>
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-blue-100 text-sm mb-4">
              ทำครั้งเดียวตอน Login ครั้งแรก
            </p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm opacity-90">วันที่ทำ:</span>
                <span className="text-sm font-medium">
                  {currentUser.preTest.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">จำนวนแบบสอบ:</span>
                <span className="text-sm font-medium">
                  {Object.keys(currentUser.preTest.results).length} แบบสอบถาม
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-400">
                <span className="text-xs text-blue-200">
                  สถานะ: เสร็จสิ้นแล้ว
                </span>
              </div>
            </div>
          </div>

          {/* Post-test */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Post-test Sessions
              </h3>
              <div className="bg-green-400 rounded-full px-2 py-1 text-xs">
                {currentUser.postTests.length} ครั้ง
              </div>
            </div>
            <p className="text-green-100 text-sm mb-4">
              ทำหลังจากแชทบอททุกครั้ง
            </p>
            <div className="space-y-2">
              {currentUser.postTests.slice(-3).map((test) => (
                <div
                  key={test.id}
                  className="bg-green-400 bg-opacity-30 rounded-lg p-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{test.session}</span>
                    <span className="text-xs">{test.date}</span>
                  </div>
                  <div className="text-xs text-green-100 mt-1">
                    {Object.keys(test.results).length} แบบสอบ
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long-term test */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Post-test Long-term
              </h3>
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-purple-100 text-sm mb-4">ทำทุกๆ 2 อาทิตย์</p>
            <div className="space-y-3">
              {currentUser.longTermTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-purple-400 bg-opacity-30 rounded-lg p-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{test.week}</span>
                    <span className="text-xs">{test.date}</span>
                  </div>
                  <div className="text-xs text-purple-100 mt-1">
                    {Object.keys(test.results).length} แบบสอบ
                  </div>
                </div>
              ))}
              <div className="border-t border-purple-400 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs">การสอบครั้งต่อไป:</span>
                  <span className="text-xs font-medium">
                    {currentUser.nextLongTermTest}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Methodology */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            ข้อมูลแบบประเมินและเกณฑ์การให้คะแนน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(assessmentTypes).map(([key, assessment]) => (
              <div
                key={key}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-gray-900 mb-3 text-sm leading-tight">
                  {assessment.name}
                </h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 mb-2">
                    คะแนนเต็ม: {assessment.maxScore}
                  </div>
                  {assessment.categories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded ${category.color}`}
                      ></div>
                      <div className="text-xs text-gray-700">
                        {category.range[0]}-{category.range[1]}:{" "}
                        {category.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      assessment.isPositive
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {assessment.isPositive ? "คะแนนสูง = ดี" : "คะแนนต่ำ = ดี"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
