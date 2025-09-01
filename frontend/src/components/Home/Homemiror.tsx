import miror from "../../assets/miror.jpg"    
function Homemiror() {
    return <div className="mt-4 bg-transparent font-ibmthai  h-65 px-30 ">
        <div className="grid grid-cols-2 h-full">
          
            {/* description */}
            <div className="bg-gradient-to-tr from-[#C2FCFF] 
    via-[#9AEDFF] to-[#FFFF] rounded-r-xl p-4">
             <p className="text-2xl font-ibmthai font-bold text-[#1F1F22]">เขียนระบายบนกระจก </p>
             <p className="text-xl font-ibmthai mt-8">สะท้อนความรู้สึกที่อยู่ในใจ ผ่านกระจกที่พร้อมรับฟังคุณเสมอ
ไม่ว่าความรู้สึกนั้นจะเป็นสุข เศร้า เหนื่อย หรือกังวล
นี่คือพื้นที่ที่คุณสามารถปลดปล่อยสิ่งที่อัดแน่นอยู่ข้างใน โดยไม่ต้องกลัวการถูกตัดสิน
ปล่อยใจให้เบาลง แล้วค้นพบความสงบที่อยู่ภายในตัวคุณเองอีกครั้ง</p>
            </div>
              {/* img */}
              <div className="flex justify-center items-center">
                <img src={miror} alt="" className="w-60" />
            </div>
        </div>

    </div>
}
export default Homemiror