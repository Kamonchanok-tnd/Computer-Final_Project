import { useEffect, useState } from "react";
import { GetQverview } from "../../../../services/https/Chat";
import { Select, DatePicker } from "antd";

import { Clock10, Folder, ListTodo, MessageSquare, User, UsersRound } from "lucide-react";
import { GetQuestionaireOverview, QuestionaireOverview } from "../../../../services/https/dashboardcontents";
import DashboardQuestionnaire from "./barchartquestionaire";
import SurveyVisualization from "./DashboardSurveyBarChart";
import AverageScoreChart from "./AvgScore";

const { Option } = Select;
const { RangePicker } = DatePicker;





function Quetionairedetail() {
  const [data, setData] = useState<QuestionaireOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // เพิ่ม "today" เข้ามา
 

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await GetQuestionaireOverview();
      console.log("overview: ",res);
      setData(res);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูล Overview ได้");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);
  

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-4 ">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl  p-6 text-center flex justify-around items-center gap-8 ">
          <div className="bg-white  text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
            <Folder size={30} className=""/>
          </div>
          <div>
            <p className="text-gray-600">จำนวนแบบสอบถามทั้งหมด</p>
            <p className="text-2xl font-bold">{data?.total_questionnaires} </p>
          </div>
          
        </div>
        <div className="bg-gradient-to-br from-[#f8c3a4] to-[#f7ede1] rounded-2xl  p-6 text-center flex justify-around items-center gap-8">
          <div className="bg-white  text-[#f59056] p-4 rounded-full shadow-lg shadow-[#f59056]/20">
             <ListTodo size={30}/>
          </div>
         
          <div>
            <p className="text-gray-600">จำนวนการทำแบบสอบถามทั้งหมด</p>
            <p className="text-2xl font-bold">{data?.total_assessments}</p>
            </div>
        </div>
        <div className="bg-gradient-to-br from-[#a1d5c4] to-[#e3faf2] rounded-2xl p-6 text-center flex justify-around items-center gap-8">
          <div className="bg-white  text-[#1f8a70] p-4 rounded-full shadow-lg shadow-[#1f8a70]/20">
             <User size={30}/>
          </div>
         
          <div>
            <p className="text-gray-600">จำนวนผู้ใช้งานทั้งหมด</p>
          <p className="text-2xl font-bold">{data?.total_users} </p>
          </div>
          
        </div>
        
      </div>
    
     
      {/* ส่ง granularity ไปให้กราฟ */}
      {/* <DashboardQuestionnaire/> */}
       <AverageScoreChart/>
        <SurveyVisualization/>
      
      
     
    
      

    </div>
  );
}

export default Quetionairedetail;
