import React, { useEffect, useState } from "react";
import { Spin } from "antd";

const Loader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // ให้ Loader อยู่บนจออย่างน้อย 1 วิ
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(255,255,255,0.6)",
        zIndex: 2000,
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default Loader;
