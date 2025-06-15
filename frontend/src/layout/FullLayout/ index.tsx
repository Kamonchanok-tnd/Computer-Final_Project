import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom"; // เพิ่ม useLocation
import { Layout, Menu } from "antd";
const { Header, Content, Footer, Sider } = Layout;

const FullLayout = () => {
  const location = useLocation(); // ใช้ useLocation เพื่อให้เมนูถูกเลือกตามเส้นทางที่กำลังใช้งาน
  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <div className="logo" style={{ color: "white", fontSize: 20 }}>My App</div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: "#fff" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}  // เลือกเมนูตามเส้นทางปัจจุบัน
            style={{ height: "100%", borderRight: 0 }}
          >
            <Menu.Item key="/admin">
              <Link to="/admin">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/admin/settings">
              <Link to="/admin/settings">Settings</Link>
            </Menu.Item>
            <Menu.Item key="/user">
              <Link to="/user">User Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/user/profile">
              <Link to="/user/profile">User Profile</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet /> {/* ช่องว่างที่จะแสดงเนื้อหาย่อย */}
          </Content>
          <Footer style={{ textAlign: "center" }}>My App ©2025</Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default FullLayout;
