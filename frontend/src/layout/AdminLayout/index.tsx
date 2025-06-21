import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd"; // เพิ่ม Button
const { Header, Content, Footer, Sider } = Layout;
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation(); // ใช้ useLocation เพื่อให้เมนูถูกเลือกตามเส้นทางที่กำลังใช้งาน
  const selectedKey = location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.clear();
    
    // นำทางไปที่หน้า Login
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" style={{ color: "white", fontSize: 20 }}>Suk Jai</div>
        <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px", float: 'right' }}>
          ออกจากระบบ
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: "#fff" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}  // เลือกเมนูตามเส้นทางปัจจุบัน
            style={{ height: "100%", borderRight: 0 }}
          >
            <Menu.Item key="/admin">
              <Link to="/admin/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/admin/edityourself">
              <Link to="/admin/edityourself">Settings</Link>
            </Menu.Item>
            {/* <Menu.Item key="/user">
              <Link to="/user">User Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/user/profile">
              <Link to="/user/profile">User Profile</Link>
            </Menu.Item> */}
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

export default AdminLayout;
