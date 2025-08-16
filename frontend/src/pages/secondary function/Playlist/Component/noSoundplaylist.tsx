import React from "react";
import { Empty, Button } from "antd";

interface NoDataProps {
  message?: string; // ข้อความที่จะแสดง

}

const NoData: React.FC<NoDataProps> = ({ message = "ไม่มีข้อมูล",  }) => {
  return (
    <div style={{ textAlign: "center", padding: 40 }} >
      <Empty description={message} />
  
    </div>
  );
};

export default NoData;
