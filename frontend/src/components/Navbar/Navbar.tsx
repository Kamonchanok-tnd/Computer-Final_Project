import React, { useState } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
const { Header } = Layout;
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  const handleLogout = () => {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.clear();
    
    // นำทางไปที่หน้า Login
    navigate("/")
  };

  return (
    <Layout>
      <Header className='navbar-header '> {/* เปลี่ยนสีพื้นหลัง Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo" />
          {/* Desktop Menu */}
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" onClick={() => navigate('/home')}>Home</Menu.Item>
            <Menu.Item key="2" onClick={() => navigate('/user/edit-profile')}>Edit</Menu.Item>
            <Menu.Item key="3" onClick={() => navigate('/services')}>Services</Menu.Item>
            <Menu.Item key="4" onClick={() => navigate('/contact')}>Contact</Menu.Item>
            
            {/* Logout Button for Desktop */}
            <Menu.Item key="4" onClick={handleLogout} style={{ float: 'right' }}>
              Logout
            </Menu.Item>
          </Menu>

          {/* Mobile Menu Button (แสดงเฉพาะในมือถือ) */}
          <div className="mobile-menu">
            <MenuOutlined onClick={showDrawer} style={{ fontSize: '24px', color: '#fff' }} />
          </div>
        </div>
      </Header>

      {/* Drawer for Mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        visible={visible}
      >
        <Menu mode="inline">
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2">About</Menu.Item>
          <Menu.Item key="3">Services</Menu.Item>
          <Menu.Item key="4">Contact</Menu.Item>
          {/* Logout Button for Mobile */}
          <Menu.Item key="5" onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Drawer>
    </Layout>
  );
};

export default Navbar;


