
import { useEffect, useState } from "react";
import {
  getVisitFrequency,
  getRetentionRate,
  getNewUsers,
  getReturningUsers,
  VisitFrequency,
  RetentionRate,
  NewUser,
  ReturningUser,
} from "../../../services/https/activity";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DatePicker, Space, ConfigProvider } from "antd";
import thTH from "antd/lib/locale/th_TH";
import admin from "../../../assets/analysis.png";
import dayjs, { Dayjs } from "dayjs";
import { UserAddOutlined, UserSwitchOutlined, TeamOutlined, MoreOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Tooltip as AntdTooltip, Button} from "antd";

const COLORS = ["#3b82f6", "#10b981"]; // ฟ้า = ผู้ใช้ใหม่, เขียว = ผู้ใช้เดิม

export default function AdminDashboardContent() {
  const [visitData, setVisitData] = useState<VisitFrequency[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionRate[]>([]);
  const [newUserData, setNewUserData] = useState<(NewUser & { day: string })[]>([]);
  const [returningUserData, setReturningUserData] = useState<(ReturningUser & { day: string })[]>([]);

  const [filteredVisitData, setFilteredVisitData] = useState<VisitFrequency[]>([]);
  const [filteredRetentionData, setFilteredRetentionData] = useState<RetentionRate[]>([]);
  const [filteredNewUserData, setFilteredNewUserData] = useState<(NewUser & { day: string })[]>([]);
  const [filteredReturningUserData, setFilteredReturningUserData] = useState<
    (ReturningUser & { day: string })[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [visits, retention, newUsers, returningUsers] = await Promise.all([
          getVisitFrequency(),
          getRetentionRate(),
          getNewUsers(),
          getReturningUsers(),
        ]);

        const formatDate = (date: string) =>
         dayjs(date).format("YYYY-MM-DD");


        const formattedVisits = (visits ?? []).map((item) => ({ ...item, day: formatDate(item.date) }));
        const formattedRetention = (retention ?? []).map((item) => ({ ...item, day: formatDate(item.date) }));
        const formattedNewUsers = (newUsers ?? []).map((item) => ({ ...item, day: formatDate(item.date) }));
        const formattedReturningUsers = (returningUsers ?? []).map((item) => ({ ...item, day: formatDate(item.date) }));

        setVisitData(formattedVisits);
        setRetentionData(formattedRetention);
        setNewUserData(formattedNewUsers);
        setReturningUserData(formattedReturningUsers);

        setFilteredVisitData(formattedVisits);
        setFilteredRetentionData(formattedRetention);
        setFilteredNewUserData(formattedNewUsers);
        setFilteredReturningUserData(formattedReturningUsers);

        // console.log("NewUsers:", formattedNewUsers);
        // console.log("ReturningUsers:", formattedReturningUsers);
      } catch (error) {
        console.error("ไม่สามารถโหลดข้อมูลได้:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // กรองข้อมูลตามเดือนและปี
  useEffect(() => {
    const filterByMonth = (data: any[]) => {
      if (!selectedMonth) return data;
      return data.filter((item) => {
        const date = dayjs(item.date);
        return date.month() === selectedMonth.month() && date.year() === selectedMonth.year();
      });
    };

    setFilteredVisitData(filterByMonth(visitData));
    setFilteredRetentionData(filterByMonth(retentionData));
    setFilteredNewUserData(filterByMonth(newUserData));
    setFilteredReturningUserData(filterByMonth(returningUserData));
  }, [selectedMonth, visitData, retentionData, newUserData, returningUserData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // KPI
  const newUsersCount = filteredNewUserData.reduce((acc, d) => acc + d.visits, 0);
  const returningUsersCount = filteredReturningUserData.reduce((acc, d) => acc + d.users, 0);
  const activeUsers = newUsersCount + returningUsersCount;

  const donutData = [
    { name: "ผู้ใช้ใหม่", value: newUsersCount },
    { name: "ผู้ใช้เดิม", value: returningUsersCount },
  ];

  // Merge data for LineChart safely
  const allDaysSet = new Set<string>();
  filteredNewUserData.forEach((d) => allDaysSet.add(d.day));
  filteredReturningUserData.forEach((d) => allDaysSet.add(d.day));
  const allDays = Array.from(allDaysSet).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());

  const mergedData = allDays.map((day) => {
    const newUser = filteredNewUserData.find((d) => d.day === day);
    const returningUser = filteredReturningUserData.find((d) => d.day === day);
    return {
      day,
      visits: newUser ? newUser.visits : 0,
      users: returningUser ? returningUser.users : 0,
    };
  });

  //console.log("MergedData:", mergedData);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-700 flex items-center gap-2">
        <img src={admin} alt="Admin" className="w-13 h-13" />
        แดชบอร์ดเว็บไซต์
      </h2>

      {/* ตัวเลือกเดือนและปี */}
      <div className="flex justify-end mb-4">
        <ConfigProvider locale={thTH}>
          <Space>
            <DatePicker
              picker="month"
              placeholder="เลือกเดือน"
              value={selectedMonth}
              format="MMMM YYYY"
              onChange={(date) => setSelectedMonth(date)}
              style={{ width: 150 }}
            />
          </Space>
        </ConfigProvider>
      </div>

      {/* KPI Cards */}
<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
  {/* ผู้ใช้ใหม่ */}
  <div className="bg-gradient-to-br from-[#cce8ff] to-[#e6f5ff] rounded-2xl p-6 flex justify-around items-center gap-4">
    <div className="bg-white text-blue-600 p-4 rounded-full shadow-lg shadow-blue-300/30">
      <UserAddOutlined className="text-2xl" />
    </div>
    <div className="text-left">
      <p className="text-gray-600">ผู้ใช้ใหม่</p>
      <p className="text-2xl font-bold text-blue-600">{newUsersCount}</p>
    </div>
  </div>

  {/* ผู้ใช้เดิม */}
  <div className="bg-gradient-to-br from-[#d1f7e2] to-[#e6fcf0] rounded-2xl p-6 flex justify-around items-center gap-4">
    <div className="bg-white text-green-600 p-4 rounded-full shadow-lg shadow-green-300/30">
      <UserSwitchOutlined className="text-2xl" />
    </div>
    <div className="text-left">
      <p className="text-gray-600">ผู้ใช้เดิม</p>
      <p className="text-2xl font-bold text-green-600">{returningUsersCount}</p>
    </div>
  </div>

  {/* ผู้ใช้งานทั้งหมด */}
  <div className="bg-gradient-to-br from-[#e2d1f7] to-[#f3e6fc] rounded-2xl p-6 flex justify-around items-center gap-4">
    <div className="bg-white text-purple-600 p-4 rounded-full shadow-lg shadow-purple-300/30">
      <TeamOutlined className="text-2xl" />
    </div>
    <div className="text-left">
      <p className="text-gray-600">ผู้ใช้งานทั้งหมด</p>
      <p className="text-2xl font-bold text-purple-600">{activeUsers}</p>
    </div>
  </div>
</div>

      {/* Donut + Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">ผู้ใช้ใหม่ vs ผู้ใช้เดิม</h2>
          <PieChart width={250} height={250}>
            <Pie data={donutData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
              {donutData.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <p className="text-gray-600 mt-2 font-medium">รวม {activeUsers} ผู้ใช้</p>
        </div>

        {/* Line Chart */}
        {/* Line Chart */}
<div className="bg-white rounded-xl shadow p-4">
  <h2 className="text-lg font-semibold mb-4">
  แนวโน้มผู้ใช้ใหม่ vs ผู้ใช้เดิม - {(selectedMonth ?? dayjs()).format("MMMM YYYY")}
</h2>

<ResponsiveContainer width="100%" height={250}>
  <LineChart data={mergedData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="day"
      tickFormatter={(value) => dayjs(value).format("D")} // โชว์แค่เลขวัน
    />
    <YAxis />
    <Tooltip
      labelFormatter={(value) => `วันที่ ${dayjs(value).format("D MMM YYYY")}`}
      formatter={(val: any) => `${val} คน`}
    />
    <Legend />
    <Line type="monotone" dataKey="visits" stroke="#3b82f6" name="ผู้ใช้ใหม่" />
    <Line type="monotone" dataKey="users" stroke="#10b981" name="ผู้ใช้เดิม" />
  </LineChart>
</ResponsiveContainer>

  
</div>

      </div>

      {/* Visit Frequency & Retention Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visit Frequency Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col min-h-[250px]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">ความถี่การเข้าชมเว็บไซต์</h2>
            <AntdTooltip title="ดูเพิ่มเติม">
              <Link to="/admin/visit-frequency">
                <Button type="text" shape="circle" icon={<MoreOutlined />} />
              </Link>
            </AntdTooltip>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="text-gray-500">จำนวนการเข้าชมล่าสุด</p>
            <h3 className="text-3xl font-bold text-blue-600">
              {filteredVisitData.length > 0
                ? filteredVisitData[filteredVisitData.length - 1].visits
                : 0}
            </h3>
          </div>
        </div>

        {/* Retention Rate Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col min-h-[250px]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">อัตราการกลับมาใช้ซ้ำ (%)</h2>
            <AntdTooltip title="ดูเพิ่มเติม">
              <Link to="/admin/retention-rate">
                <Button type="text" shape="circle" icon={<MoreOutlined />} />
              </Link>
            </AntdTooltip>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="text-gray-500">อัตราล่าสุด</p>
            <h3 className="text-3xl font-bold text-green-600">
              {filteredRetentionData.length > 0
                ? `${filteredRetentionData[filteredRetentionData.length - 1].retentionRate}%`
                : "0%"}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
