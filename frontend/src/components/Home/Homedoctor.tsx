
import { useNavigate } from 'react-router-dom';

import n6 from "../../assets/nurse/n6.jpg"
import n1  from "../../assets/nurse/n1.jpg"
import n2  from "../../assets/nurse/n2.jpg"
type Doctor = {
  id: string;
  name: string;
  photo?: string;

 
};

const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "อ.พี่โอ",
    photo: n6,

  
  },
  {
    id: "d2",
    name: "อ.พี่นก",
    photo: n1,
  
  },
  {
    id: "d3",
    name: "อ.พี่ปุ้ม",
    photo: n2,
  
  },
];

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {



  return (
    <div className="bg-white rounded-2xl shadow-sm border-t-8 border-button-blue  p-6 text-center hover:shadow-md transition-shadow">
      {/* Doctor Photo */}
      <div className="relative w-30 h-30 mx-auto mb-4">
        <div className="w-30 h-30 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            {doctor.photo ? (
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-full h-full object-cover "
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

  
    </div>
  );
};

function Homedoctor() {
    const navigate = useNavigate();
  return (
    <div className="  py-8 mt-4 font-ibmthai 
    text-basic-text dark:text-text-dark">
        <div>
            <p className='text-2xl font-bold text-center '>Frinds Corner SUT</p>
            <p className='text-lg text-center mt-4'>คณาจารย์สาขาการพยาบาลสุขภาพิจตและจิตเวช สำนักวิชาพยาบาลศาสตร์ มทส. </p>
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