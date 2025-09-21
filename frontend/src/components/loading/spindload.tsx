import { Spin } from "antd";
function AntSpin(){
    return(
        <div className="fixed inset-0 flex items-center justify-center  z-50">
            <Spin size="large" tip="กำลังโหลด..." />
            </div>
    )
}
export default AntSpin