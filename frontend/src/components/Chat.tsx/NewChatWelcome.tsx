import bot from "../../assets/bot.png"

interface NewChatWelcomeProps {
    isDarkMode: boolean;
  }
function NewChatWelcome({isDarkMode} : NewChatWelcomeProps)
{

    return (
        <div className={`flex flex-col items-center justify-center h-screen bg-linear-to-t 
        
        ${isDarkMode ?  'bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]'  :'bg-linear-to-t from-[#C8F3FD] to-[#FFFF]'} transition-colors duration-300`}>
            <img src={bot} alt="" className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px]" />
            <div className={`kanit-semibold sm:text-xl text-lg duration-300 ${isDarkMode ? 'bg-chat-dark' : 'bg-white/50'} backdrop:blur-sm px-4 py-8 rounded-xl`}>
                <h1 className={`${isDarkMode ? 'text-white' : 'text-black-word'}`}>สวัสดี! 👋 เราชื่อ ฮีลใจ
                <br/>เราจะเป็นเพื่อนที่คอยอยู่ข้างๆ เธอเอง!</h1>
            </div>
            
        </div>
    )
}
export default NewChatWelcome