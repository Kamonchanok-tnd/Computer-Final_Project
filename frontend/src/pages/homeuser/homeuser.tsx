
import Activity from "../../components/Home/Activity";
import ChatBan from "../../components/Home/ChatBan";
// import Contact from "../components/Contact";
import Footer from "../../components/Home/Footer";

import Question from "../../components/Home/Question";

function Home() {
    return (
        <div className="bg-[#F4FFFF]">
            <ChatBan/> 
           <Question/>
            <Activity/>    
            {/* <Contact/> */}
             <Footer/> 
        </div>
    );
}

export default Home