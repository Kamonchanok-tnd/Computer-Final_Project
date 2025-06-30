import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Drawer } from "antd"; // เพิ่ม Drawer
import { MenuOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons'; // นำเข้าไอคอน Dashboard และ Setting
const { Header, Content, Footer, Sider } = Layout;
import { useNavigate } from "react-router-dom";
import './FullLayout.css'; // นำเข้าไฟล์ CSS

const FullLayout = () => {
  const location = useLocation(); // ใช้ useLocation เพื่อให้เมนูถูกเลือกตามเส้นทางที่กำลังใช้งาน
  const selectedKey = location.pathname;
  const navigate = useNavigate();
  
  const [drawerVisible, setDrawerVisible] = useState(false); // การเปิด/ปิด Drawer
  const [collapsed, setCollapsed] = useState(false); // เพื่อจัดการการยุบของ Sider

  const handleLogout = () => {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.clear();
    
    // นำทางไปที่หน้า Login
    navigate("/");
  };

  const showDrawer = () => {
    setDrawerVisible(true); // เปิด Drawer
  };

  const onClose = () => {
    setDrawerVisible(false); // ปิด Drawer
  };

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header className="layout-header">
        {/* ปุ่ม Hamburger อยู่ทางซ้ายของ Suk Jai */}
        <Button 
          type="primary" 
          icon={<MenuOutlined />}  // ใช้ MenuOutlined แสดงสามขีด
          onClick={showDrawer} 
          className="layout-hamburger-button"
          
        />
        <div className="layout-logo">SUKJAI SUT</div>
        <Button onClick={handleLogout} type="primary" className="layout-logout-button">
          ออกจากระบบ
        </Button>
      </Header>
      <Layout>
        <Sider 
          width={200} 
          className="layout-sider" 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)} // การยุบ/ขยาย Sider
          breakpoint="lg" // ใช้ breakpoint ให้ Sider ยุบในขนาดที่กำหนด
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}  // เลือกเมนูตามเส้นทางปัจจุบัน
            className="layout-menu"
          >
            <Menu.Item key="/superadmin" icon={<DashboardOutlined />}>
              <Link to="/superadmin/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/superadmin/settings" icon={<SettingOutlined />}>
              <Link to="/superadmin/settings">Settings</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={onClose}
          visible={drawerVisible}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]} // เลือกเมนูตามเส้นทางปัจจุบัน
            className="layout-menu"
          >
            <Menu.Item key="/superadmin" icon={<DashboardOutlined />}>
              <Link to="/superadmin/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/superadmin/settings" icon={<SettingOutlined />}>
              <Link to="/superadmin/settings">Settings</Link>
            </Menu.Item>
          </Menu>
        </Drawer>

        <Layout className="layout-content-layout">
          <Content className="layout-content">
            <Outlet /> {/* ช่องว่างที่จะแสดงเนื้อหาย่อย */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default FullLayout;
