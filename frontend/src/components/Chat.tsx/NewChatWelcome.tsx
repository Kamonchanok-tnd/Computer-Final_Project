import bot from "../../assets/bot.png"
function NewChatWelcome()
{
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-linear-to-t from-[#C8F3FD] to-[#FFFF]">
            <img src={bot} alt="" className="duration-300 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px]" />
            <div className="kanit-semibold sm:text-xl text-lg duration-300 bg-white/50 backdrop:blur-sm px-4 py-8 rounded-xl">
                <h1 className="">สวัสดี! 👋 เราชื่อ ฮีลใจ
                <br/>เราจะเป็นเพื่อนที่คอยอยู่ข้างๆ เธอเอง!</h1>
            </div>
            
        </div>
    )
}
export default NewChatWelcome