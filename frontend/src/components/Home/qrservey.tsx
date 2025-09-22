
function QrSurvey() {
    // URL ของ Google Form (คุณสามารถแทนที่ด้วย URL จริงของคุณได้)
    const googleFormUrl = "https://forms.gle/qvTSxueq7WAQRE9z8";
    
    // สร้าง QR Code URL โดยใช้ QR Server API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(googleFormUrl)}`;

    return (
        <div className=" flex items-center justify-center font-ibmthai  ">
            <div className="bg-transparent w-full overflow-hidden ">
                <div className="bg-gradient-to-r from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] dark:text-background-dark duration-300 transition-color p-6">
                    <h1 className="text-3xl font-bold dark:text-background-dark  text-center">
                        แบบประเมินการใช้งานเว็บแอปพลิเคชัน
                    </h1>
                </div>
                
                <div className="flex flex-col lg:flex-row  justify-center px-4 gap-4">
                    {/* ส่วนซ้าย - ข้อความขอความร่วมมือ */}
                    <div className="lg:w-1/2 p-8 flex flex-col justify-center ">
                        <div className="space-y-6">
                            <div className="text-center lg:text-left">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-text-dark">
                                    ขอความร่วมมือจากท่าน
                                </h2>
                                <p className="text-gray-600 text-lg leading-relaxed mb-4 dark:text-text-dark">
                                    เพื่อให้เราสามารถพัฒนาเว็บแอปพลิเคชันให้ดียิ่งขึ้น เราจึงขอเชิญท่านเข้าร่วมตอบแบบประเมินการใช้งาน
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 dark:bg-chat-dark p-4 rounded-lg border-l-4 border-button-blue">
                                <h3 className="font-semibold text-gray-800 mb-2 dark:text-text-dark">
                                     ความคิดเห็นของท่านมีความสำคัญ
                                </h3>
                                <ul className="text-gray-800 space-y-1 text-sm dark:text-text-dark">
                                    <li>• ช่วยให้เราเข้าใจความต้องการของผู้ใช้งาน</li>
                                    <li>• นำไปสู่การปรับปรุงประสบการณ์การใช้งาน</li>
                                    <li>• พัฒนาฟีเจอร์ใหม่ที่ตรงกับความต้องการ</li>
                                </ul>
                            </div>
                            
                            <div className="text-center dark:text-text-dark lg:text-left">
                                <p className="text-gray-500 dark:text-text-dark  text-sm mb-4">
                                    ใช้เวลาเพียง 3-5 นาที
                                </p>
                                <p className="text-gray-700 font-medium dark:text-text-dark">
                                    สแกน QR Code หรือคลิกลิงก์เพื่อเริ่มทำแบบประเมิน
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* ส่วนขวา - QR Code */}
                    <div className="p-8 bg-transparent flex flex-col items-center justify-center">
                        <div className="text-center space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-text-dark">
                                สแกน QR Code
                            </h3>
                            
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <img 
                                    src={qrCodeUrl}
                                    alt="QR Code สำหรับแบบประเมิน"
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <p className="text-gray-600 text-sm dark:text-text-dark">
                                    ใช้กล้องมือถือสแกน QR Code ด้านบน
                                </p>
                                
                                <div className="pt-2">
                                    <a
                                        href={googleFormUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-6 py-3  text-white rounded-lg 
                                        transition-colors duration-200 font-medium"
                                    >
                                      
                                        เปิดแบบประเมินในเบราว์เซอร์
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-100/20 dark:bg-chat-dark  p-4 text-center">
                    <p className="text-gray-600 text-sm dark:text-text-dark">
                        ขอบคุณสำหรับเวลาและความร่วมมือของท่าน 💖
                    </p>
                </div>
            </div>
        </div>
    );
}

export default QrSurvey;