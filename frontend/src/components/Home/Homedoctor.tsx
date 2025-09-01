import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TotalUseChat } from '../../services/https/Chat';

type Doctor = {
  id: string;
  name: string;
  photo?: string;
  phone: string;
  specialties: string[];
  location: string;
  mapUrl?: string;
};

const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "นพ. ปวริศร์ ธรรมคุณ",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=1200&q=80&auto=format&fit=crop",
    phone: "081-234-5678",
    specialties: ["จิตแพทย์", "ซึมเศร้า", "วิตกกังวล"],
    location: "คลินิก SUT HEALJAI, โคราช",
  },
  {
    id: "d2",
    name: "พญ. ศิรินันท์ ชัยวร",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80&auto=format&fit=crop",
    phone: "02-345-6789",
    specialties: ["เวชปฏิบัติทั่วไป", "ระบบทางเดินหายใจ"],
    location: "SUT Wellness Academy",
  },
  {
    id: "d3",
    name: "คุณ อลิสา พฤกษ์รัตน์",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80&auto=format&fit=crop",
    phone: "080-000-7788",
    specialties: ["บำบัดครอบครัว", "วัยรุ่น"],
    location: "ศูนย์ปรึกษา SUKJAI",
  },
];

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {



  return (
    <div className="bg-white rounded-2xl shadow-sm border-t-8 border-button-blue  p-6 text-center hover:shadow-md transition-shadow">
      {/* Doctor Photo */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            {doctor.photo ? (
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">👨‍⚕️</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Name */}
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {doctor.name}
      </h3>

      {/* Location */}
      <p className="text-sm text-gray-500 leading-relaxed">
        {doctor.location}
      </p>
    </div>
  );
};

function Homedoctor() {
    const navigate = useNavigate();
  return (
    <div className=" bg-gradient-to-b from-background-blue to-button-blue/50 dark:from-transparent py-8 mt-4 font-ibmthai 
    text-basic-text dark:text-text-dark">
        <div>
            <p className='text-2xl font-bold text-center '>Heal Jai Care</p>
            <p className='text-lg text-center mt-4'>พื้นที่ที่มีผู้เชี่ยวชาญทางสุขภาพจิต คอยให้คำแนะนำและอยู่เคียงข้างคุณเสมอ</p>
        </div>
      <div className="max-w-4xl mx-auto px-4 mt-4">
        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_DOCTORS.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-8">
         <button className='bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] duration-300 transition-color
         cursor-pointer hover:scale-105 text-white py-2 px-4 rounded-lg dark:text-background-dark'
         onClick={() => navigate("/doctors")}
         >ดูข้อมูลเพิ่มเติม</button>
      </div>
     
    </div>
  );
};

export default Homedoctor;