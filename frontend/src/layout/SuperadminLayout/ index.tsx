import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Drawer } from "antd"; // เพิ่ม Drawer
import { LogoutOutlined ,MenuOutlined, DashboardOutlined, CommentOutlined,CustomerServiceOutlined,QuestionOutlined,MailOutlined,ScheduleOutlined,FundOutlined} from '@ant-design/icons'; // นำเข้าไอคอน Dashboard และ Setting
const { Header, Content, Sider } = Layout;
import { useNavigate } from "react-router-dom";
import './FullLayout.css'; // นำเข้าไฟล์ CSS
import lightlogo from "../../assets/logo/lightlogo.png";
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
        
        <div className="layout-logo"><img
                src={lightlogo}
                alt="Logo"
                className="w-18 "
              /></div>
        <Button
          onClick={handleLogout}
          type="primary"
          icon={<LogoutOutlined />} // ✅ ใช้ icon ที่นี่
          className="layout-logout-button1"
        >
          ออกจากระบบ
        </Button>
      </Header>
      <Layout>
        <Sider 
          width={200} 
          className="layout-sider" 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)} 
          breakpoint="lg"
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="layout-menu"
          >
           <Menu.Item key="/superadmin" icon={<DashboardOutlined />}>
  <Link to="/superadmin/dashboard">แดชบอร์ด</Link>
</Menu.Item>

{/* <Menu.Item key="/superadmin/settings" icon={<SettingOutlined />}>
  <Link to="/superadmin/settings">การตั้งค่า</Link>
</Menu.Item> */}

<Menu.Item key="/superadmin/questionnairePage" icon={<QuestionOutlined/>}>
  <Link to="/superadmin/questionnairePage">แบบสอบถาม</Link>
</Menu.Item>

<Menu.Item key="/superadmin/prompt" icon={<CommentOutlined />}>
  <Link to="/superadmin/prompt">การจัดการ Prompt AI</Link>
</Menu.Item>

<Menu.Item key="/superadmin/sounds" icon={<CustomerServiceOutlined/>}> 
  <Link to="/superadmin/sounds">การจัดการวิดีโอ</Link>
</Menu.Item>

<Menu.Item key="/superadmin/messagePage" icon={<MailOutlined />}> 
  <Link to="/superadmin/messagePage">ข้อความให้กำลังใจ</Link> 
</Menu.Item>

<Menu.Item key="/superadmin/dashboard/contents" icon={<ScheduleOutlined/>}> 
  <Link to="/superadmin/dashboard/contents">ข้อมูลคอนเทนต์</Link> 
</Menu.Item>

<Menu.Item key="/superadmin/activity" icon={<FundOutlined/>}> 
  <Link to="/superadmin/activity">ข้อมูลผู้เข้าชม</Link> 
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
  <Link to="/superadmin/dashboard">แดชบอร์ด</Link>
</Menu.Item>

{/* <Menu.Item key="/superadmin/settings" icon={<SettingOutlined />}>
  <Link to="/superadmin/settings">การตั้งค่า</Link>
</Menu.Item> */}

<Menu.Item key="/superadmin/questionnairePage" icon={<QuestionOutlined/>}>
  <Link to="/superadmin/questionnairePage">แบบสอบถาม</Link>
</Menu.Item>

<Menu.Item key="/superadmin/prompt" icon={<CommentOutlined />}>
  <Link to="/superadmin/prompt">การจัดการ Prompt AI</Link>
</Menu.Item>

<Menu.Item key="/superadmin/sounds" icon={<CustomerServiceOutlined/>}> 
  <Link to="/superadmin/sounds">การจัดการวิดีโอ</Link>
</Menu.Item>

<Menu.Item key="/superadmin/messagePage" icon={<MailOutlined />}> 
  <Link to="/superadmin/messagePage">ข้อความให้กำลังใจ</Link> 
</Menu.Item>

<Menu.Item key="/superadmin/dashboard/contents" icon={<ScheduleOutlined/>}> 
  <Link to="/superadmin/dashboard/contents">ข้อมูลคอนเทนต์</Link> 
</Menu.Item>

<Menu.Item key="/superadmin/activity" icon={<FundOutlined/>}> 
  <Link to="/superadmin/activity">ข้อมูลผู้เข้าชม</Link> 
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
