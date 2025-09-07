// import { useEffect, useState } from "react";
// import {
//   getVisitFrequency,
//   getRetentionRate,
//   getNewUsers,
//   getReturningUsers,
//   VisitFrequency,
//   RetentionRate,
//   NewUser,
//   ReturningUser,
// } from "../../../services/https/activity";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { DatePicker, Space, ConfigProvider } from "antd";
// import thTH from "antd/lib/locale/th_TH";
// import admin from "../../../assets/analysis.png";
// import dayjs, { Dayjs } from "dayjs";

// const COLORS = ["#3b82f6", "#10b981"]; // ฟ้า = ผู้ใช้ใหม่, เขียว = ผู้ใช้เดิม

// export default function AdminDashboardContent() {
//   const [visitData, setVisitData] = useState<VisitFrequency[]>([]);
//   const [retentionData, setRetentionData] = useState<RetentionRate[]>([]);
//   const [newUserData, setNewUserData] = useState<NewUser[]>([]);
//   const [returningUserData, setReturningUserData] = useState<ReturningUser[]>([]);

//   const [filteredVisitData, setFilteredVisitData] = useState<VisitFrequency[]>([]);
//   const [filteredRetentionData, setFilteredRetentionData] = useState<RetentionRate[]>([]);
//   const [filteredNewUserData, setFilteredNewUserData] = useState<NewUser[]>([]);
//   const [filteredReturningUserData, setFilteredReturningUserData] = useState<ReturningUser[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
//   const [selectedYear, setSelectedYear] = useState<number | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);
//       try {
//         const [visits, retention, newUsers, returningUsers] = await Promise.all([
//           getVisitFrequency(),
//           getRetentionRate(),
//           getNewUsers(),
//           getReturningUsers(),
//         ]);

//         const formatDate = (date: string) =>
//           new Date(date).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//             calendar: "gregory",
//           });

//         const formattedVisits = visits.map((item) => ({
//           ...item,
//           day: formatDate(item.date),
//         }));

//         const formattedRetention = retention.map((item) => ({
//           ...item,
//           day: formatDate(item.date),
//         }));

//         const formattedNewUsers = newUsers.map((item) => ({
//           ...item,
//           day: formatDate(item.date),
//         }));

//         const formattedReturningUsers = returningUsers.map((item) => ({
//           ...item,
//           day: formatDate(item.date),
//         }));

//         setVisitData(formattedVisits);
//         setRetentionData(formattedRetention);
//         setNewUserData(formattedNewUsers);
//         setReturningUserData(formattedReturningUsers);

//         setFilteredVisitData(formattedVisits);
//         setFilteredRetentionData(formattedRetention);
//         setFilteredNewUserData(formattedNewUsers);
//         setFilteredReturningUserData(formattedReturningUsers);
//       } catch (error) {
//         console.error("ไม่สามารถโหลดข้อมูลได้:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, []);

//   // กรองข้อมูลตามเดือนและปี
//   useEffect(() => {
//     const filterData = (data: any[]) =>
//       data.filter((item) => {
//         const date = new Date(item.date);
//         const matchMonth = selectedMonth !== null ? date.getMonth() === selectedMonth : true;
//         const matchYear = selectedYear !== null ? date.getFullYear() === selectedYear : true;
//         return matchMonth && matchYear;
//       });

//     setFilteredVisitData(filterData(visitData));
//     setFilteredRetentionData(filterData(retentionData));
//     setFilteredNewUserData(filterData(newUserData));
//     setFilteredReturningUserData(filterData(returningUserData));
//   }, [selectedMonth, selectedYear, visitData, retentionData, newUserData, returningUserData]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[70vh]">
//         <p className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
//       </div>
//     );
//   }

//   // KPI
//   const newUsersCount = filteredNewUserData.reduce((acc, d) => acc + d.visits, 0);
//   const returningUsersCount = filteredReturningUserData.reduce((acc, d) => acc + d.users, 0);
//   const activeUsers = newUsersCount + returningUsersCount;

//   const donutData = [
//     { name: "ผู้ใช้ใหม่", value: newUsersCount },
//     { name: "ผู้ใช้เดิม", value: returningUsersCount },
//   ];

//   return (
//     <div className="p-6 space-y-8">
//       <h2 className="text-xl sm:text-2xl font-bold text-gray-700 flex items-center gap-2">
//         <img src={admin} alt="Admin" className="w-13 h-13" />
//         แดชบอร์ดเว็บไซต์
//       </h2>

//       {/* ตัวเลือกเดือนและปี */}
//       <div className="flex justify-end mb-4">
//         <ConfigProvider locale={thTH}>
//           <Space>
//             <DatePicker
//               picker="month"
//               placeholder="เลือกเดือน"
//               onChange={(date: Dayjs | null) => {
//                 setSelectedMonth(date ? date.month() : null);
//                 setSelectedYear(date ? date.year() : null);
//               }}
//               value={
//                 selectedMonth !== null && selectedYear !== null
//                   ? dayjs().year(selectedYear).month(selectedMonth)
//                   : null
//               }
//               format="MMMM YYYY"
//             />
//           </Space>
//         </ConfigProvider>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl shadow p-4 text-center">
//           <p className="text-gray-500">ผู้ใช้ใหม่</p>
//           <h3 className="text-2xl font-bold text-blue-600">{newUsersCount}</h3>
//         </div>
//         <div className="bg-white rounded-xl shadow p-4 text-center">
//           <p className="text-gray-500">ผู้ใช้เดิม</p>
//           <h3 className="text-2xl font-bold text-green-600">{returningUsersCount}</h3>
//         </div>
//         <div className="bg-white rounded-xl shadow p-4 text-center">
//           <p className="text-gray-500">ผู้ใช้งานทั้งหมด</p>
//           <h3 className="text-2xl font-bold text-purple-600">{activeUsers}</h3>
//         </div>
//       </div>

//       {/* Donut + Line */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Donut */}
//         <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-4">ผู้ใช้ใหม่ vs ผู้ใช้เดิม</h2>
//           <PieChart width={250} height={250}>
//             <Pie
//               data={donutData}
//               innerRadius={70}
//               outerRadius={100}
//               paddingAngle={5}
//               dataKey="value"
//             >
//               {donutData.map((_, i) => (
//                 <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
//               ))}
//             </Pie>
//           </PieChart>
//           <p className="text-gray-600 mt-2 font-medium">รวม {activeUsers} ผู้ใช้</p>
//         </div>

//         {/* Line Chart: New vs Returning Trend */}
//         <div className="bg-white rounded-xl shadow p-4">
//           <h2 className="text-lg font-semibold mb-4">แนวโน้มผู้ใช้ใหม่ vs ผู้ใช้เดิม</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="day" />
//               <YAxis />
//               <Tooltip formatter={(value: any) => `${value} คน`} />
//               <Legend />
//               <Line type="monotone" dataKey="visits" data={filteredNewUserData} stroke="#3b82f6" name="ผู้ใช้ใหม่" />
//               <Line type="monotone" dataKey="users" data={filteredReturningUserData} stroke="#10b981" name="ผู้ใช้เดิม" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Visit Frequency */}
//       <div className="bg-white rounded-xl shadow p-4">
//         <h2 className="text-xl font-semibold mb-4">ความถี่การเข้าชมเว็บไซต์</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={filteredVisitData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="day" />
//             <YAxis />
//             <Tooltip formatter={(value: any) => `${value} ครั้ง`} />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="visits"
//               stroke="#3b82f6"
//               strokeWidth={2}
//               name="จำนวนผู้เข้าชม"
//               dot={{ r: 4 }}
//               activeDot={{ r: 6 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Retention Rate */}
//       <div className="bg-white rounded-xl shadow p-4">
//         <h2 className="text-xl font-semibold mb-4">อัตราการกลับมาใช้ซ้ำ (%)</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={filteredRetentionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="day" />
//             <YAxis unit="%" />
//             <Tooltip formatter={(value: any) => `${value}%`} />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="retentionRate"
//               stroke="#10b981"
//               strokeWidth={2}
//               name="อัตราการกลับมาใช้ซ้ำ"
//               dot={{ r: 4 }}
//               activeDot={{ r: 6 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }






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
import { UserAddOutlined, UserSwitchOutlined, TeamOutlined } from "@ant-design/icons";


const COLORS = ["#3b82f6", "#10b981"]; // ฟ้า = ผู้ใช้ใหม่, เขียว = ผู้ใช้เดิม

export default function AdminDashboardContent() {
  const [visitData, setVisitData] = useState<VisitFrequency[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionRate[]>([]);
  const [newUserData, setNewUserData] = useState<NewUser[]>([]);
  const [returningUserData, setReturningUserData] = useState<ReturningUser[]>([]);

  const [filteredVisitData, setFilteredVisitData] = useState<VisitFrequency[]>([]);
  const [filteredRetentionData, setFilteredRetentionData] = useState<RetentionRate[]>([]);
  const [filteredNewUserData, setFilteredNewUserData] = useState<NewUser[]>([]);
  const [filteredReturningUserData, setFilteredReturningUserData] = useState<ReturningUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

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
          new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            calendar: "gregory",
          });

        const formattedVisits = visits.map((item) => ({
          ...item,
          day: formatDate(item.date),
        }));

        const formattedRetention = retention.map((item) => ({
          ...item,
          day: formatDate(item.date),
        }));

        const formattedNewUsers = newUsers.map((item) => ({
          ...item,
          day: formatDate(item.date),
        }));

        const formattedReturningUsers = returningUsers.map((item) => ({
          ...item,
          day: formatDate(item.date),
        }));

        setVisitData(formattedVisits);
        setRetentionData(formattedRetention);
        setNewUserData(formattedNewUsers);
        setReturningUserData(formattedReturningUsers);

        setFilteredVisitData(formattedVisits);
        setFilteredRetentionData(formattedRetention);
        setFilteredNewUserData(formattedNewUsers);
        setFilteredReturningUserData(formattedReturningUsers);
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
    const filterData = (data: any[]) =>
      data.filter((item) => {
        const date = new Date(item.date);
        const matchMonth = selectedMonth !== null ? date.getMonth() === selectedMonth : true;
        const matchYear = selectedYear !== null ? date.getFullYear() === selectedYear : true;
        return matchMonth && matchYear;
      });

    setFilteredVisitData(filterData(visitData));
    setFilteredRetentionData(filterData(retentionData));
    setFilteredNewUserData(filterData(newUserData));
    setFilteredReturningUserData(filterData(returningUserData));
  }, [selectedMonth, selectedYear, visitData, retentionData, newUserData, returningUserData]);

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
              onChange={(date: Dayjs | null) => {
                setSelectedMonth(date ? date.month() : null);
                setSelectedYear(date ? date.year() : null);
              }}
              value={
                selectedMonth !== null && selectedYear !== null
                  ? dayjs().year(selectedYear).month(selectedMonth)
                  : null
              }
              format="MMMM YYYY"
            />
          </Space>
        </ConfigProvider>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
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
            <Pie
              data={donutData}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {donutData.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <p className="text-gray-600 mt-2 font-medium">รวม {activeUsers} ผู้ใช้</p>
        </div>

        {/* Line Chart: New vs Returning Trend */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4">แนวโน้มผู้ใช้ใหม่ vs ผู้ใช้เดิม</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value} คน`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                data={filteredNewUserData}
                stroke="#3b82f6"
                name="ผู้ใช้ใหม่"
              />
              <Line
                type="monotone"
                dataKey="users"
                data={filteredReturningUserData}
                stroke="#10b981"
                name="ผู้ใช้เดิม"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visit Frequency + Retention Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visit Frequency */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">ความถี่การเข้าชมเว็บไซต์</h2>

          {/* KPI Card */}
          <div className="mb-4 text-center">
            <p className="text-gray-500">จำนวนการเข้าชมล่าสุด</p>
            <h3 className="text-2xl font-bold text-blue-600">
              {filteredVisitData.length > 0
                ? filteredVisitData[filteredVisitData.length - 1].visits
                : 0}
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredVisitData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value} ครั้ง`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#3b82f6"
                strokeWidth={2}
                name="จำนวนผู้เข้าชม"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Rate */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">อัตราการกลับมาใช้ซ้ำ (%)</h2>

          {/* KPI Card */}
          <div className="mb-4 text-center">
            <p className="text-gray-500">อัตราล่าสุด</p>
            <h3 className="text-2xl font-bold text-green-600">
              {filteredRetentionData.length > 0
                ? `${filteredRetentionData[filteredRetentionData.length - 1].retentionRate}%`
                : "0%"}
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredRetentionData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis unit="%" />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="retentionRate"
                stroke="#10b981"
                strokeWidth={2}
                name="อัตราการกลับมาใช้ซ้ำ"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
