import { useEffect, useState } from "react";


import {  Folder, ListTodo, User } from "lucide-react";
import { GetQuestionaireOverview, QuestionaireOverview } from "../../../../services/https/dashboardcontents";

import SurveyVisualization from "./DashboardSurveyBarChart";
import AverageScoreChart from "./AvgScore";

import TableUseAsses from "./tableuseasses";







function Quetionairedetail() {
  const [data, setData] = useState<QuestionaireOverview | null>(null);

 
  // เพิ่ม "today" เข้ามา
 

  const fetchOverview = async () => {

    try {
      const res = await GetQuestionaireOverview();

      setData(res);
    } catch (err) {
      console.error(err);
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
      <div className="bg-white text-[#39a6c3] p-3 sm:p-4 rounded-full shadow-lg shadow-[#39a6c3]/20 flex-shrink-0">
        <Folder size={24} className="sm:w-[30px] sm:h-[30px]"/>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-gray-600 text-sm sm:text-base">จำนวนแบบสอบถามทั้งหมด</p>
        <p className="text-xl sm:text-2xl font-bold">{data?.total_questionnaires}</p>
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-[#f8c3a4] to-[#f7ede1] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8">
      <div className="bg-white text-[#f59056] p-3 sm:p-4 rounded-full shadow-lg shadow-[#f59056]/20 flex-shrink-0">
        <ListTodo size={24} className="sm:w-[30px] sm:h-[30px]"/>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-gray-600 text-sm sm:text-base">จำนวนการทำแบบสอบถามทั้งหมด</p>
        <p className="text-xl sm:text-2xl font-bold">{data?.total_assessments}</p>
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-[#a1d5c4] to-[#e3faf2] rounded-2xl p-4 sm:p-6 text-center flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-8 md:col-span-2 lg:col-span-1">
      <div className="bg-white text-[#1f8a70] p-3 sm:p-4 rounded-full shadow-lg shadow-[#1f8a70]/20 flex-shrink-0">
        <User size={24} className="sm:w-[30px] sm:h-[30px]"/>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-gray-600 text-sm sm:text-base">จำนวนผู้ใช้งานทั้งหมด</p>
        <p className="text-xl sm:text-2xl font-bold">{data?.total_users}</p>
      </div>
    </div>
  </div>
  
  {/* ส่ง granularity ไปให้กราฟ */}
  {/* <DashboardQuestionnaire/> */}
 <AverageScoreChart/>
<SurveyVisualization/>
    {/* <RecentUseQu/>  */}
    <TableUseAsses/>
</div>
  );
}

export default Quetionairedetail;
