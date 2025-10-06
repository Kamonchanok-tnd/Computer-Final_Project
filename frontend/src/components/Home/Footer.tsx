import lightlogo from "../../assets/logo/lightlogo.png"
import darklogo from "../../assets/logo/darklogo.png"
import { useDarkMode } from "../Darkmode/toggleDarkmode";

function Footer(){
  const {isDarkMode} = useDarkMode();
    return(
        <footer className="bg-white   dark:bg-gray-900 transition-colors duration-300">
  <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
    <div className="sm:flex sm:items-center sm:justify-between">
      <div className="text-teal-600">
        <img src={isDarkMode ? darklogo : lightlogo} alt="" className="w-25 " />
        <p className="text-sm text-gray-600 dark:text-text-dark">
  SUT Heal Jai – พื้นที่แบ่งปันและเยียวยาใจด้วย AI Chatbot
</p>
      </div>

     
    </div>

  

    <p className="text-xs text-gray-500">Team SUT Heal Jai</p>
  </div>
</footer>
    )
}
export default Footer