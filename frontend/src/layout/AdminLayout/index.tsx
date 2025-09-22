import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Drawer, Dropdown } from "antd";
import {
  MenuOutlined,
  DashboardOutlined,
  CommentOutlined,
  CustomerServiceOutlined,
  QuestionOutlined,
  MailOutlined,
  ScheduleOutlined,
  FundOutlined,
} from "@ant-design/icons";
const { Header, Content, Sider } = Layout;
import "./index.css";
import { useUser } from "../HeaderLayout/UserContext";
import lightlogo from "../../assets/logo/lightlogo.png";

const AdminLayout = () => {
  const location = useLocation();
  const selectedKey = location.pathname;
  const navigate = useNavigate();
  const { avatarUrl } = useUser();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleEditProfile = () => {
    navigate("/admin/edityourself");
  };

  const showDrawer = () => setDrawerVisible(true);
  const onClose = () => setDrawerVisible(false);

  // เมนูหลัก
  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/admin">แดชบอร์ด</Link>,
    },
    {
      key: "/admin/questionnairePage",
      icon: <QuestionOutlined />,
      label: <Link to="/admin/questionnairePage">แบบสอบถาม</Link>,
    },
    {
      key: "/admin/prompt",
      icon: <CommentOutlined />,
      label: <Link to="/admin/prompt">การจัดการ Prompt AI</Link>,
    },
    {
      key: "/admin/sounds",
      icon: <CustomerServiceOutlined />,
      label: <Link to="/admin/sounds">การจัดการวิดีโอ</Link>,
    },
    {
      key: "/admin/messagePage",
      icon: <MailOutlined />,
      label: <Link to="/admin/messagePage">ข้อความให้กำลังใจ</Link>,
    },
    {
      key: "/admin/dashboard/contents",
      icon: <ScheduleOutlined />,
      label: <Link to="/admin/dashboard/contents">ข้อมูลคอนเทนต์</Link>,
    },
    {
      key: "/admin/activity",
      icon: <FundOutlined />,
      label: <Link to="/admin/activity">ข้อมูลผู้เข้าใช้</Link>,
    },
  ];

  // เมนู Dropdown สำหรับ Avatar
  const userMenu = {
  items: [
    {
      key: "editProfile",
      label: <Link to="/admin/edityourself">แก้ไขข้อมูลส่วนตัว</Link>,
      onClick: handleEditProfile,
    },
    {
      key: "logout",
      label: <span style={{ color: "red" }}>ออกจากระบบ</span>,
      onClick: handleLogout,
    },
  ],
};


  return (
    <Layout className="layout admin-layout !font-ibmthai" style={{ minHeight: "100vh" }}>
      <Header className="layout-header flex justify-between items-center">
  <div className="layout-header-left flex items-center gap-3">
    {/* ปุ่มแฮมเบอร์เกอร์ (มือถือ) */}
    <Button
  type="primary"
  icon={<MenuOutlined />}
  onClick={showDrawer}
  className="layout-hamburger-button lg:hidden hover:!bg-transparent hover:!text-white"
/>

    {/* โลโก้: แสดงเฉพาะ Desktop (lg ขึ้นไป) */}
    <div className="flex-1 flex justify-start">
      <img
        src={lightlogo}
        alt="Logo"
        className="h-10 object-contain hidden lg:block"
      />
    </div>
  </div>

  {/* Avatar Dropdown */}
  {/* Avatar Dropdown */}
<Dropdown
  menu={{
    ...userMenu,
    className: "!font-ibmthai", // ✅ บังคับฟอนต์เฉพาะ Dropdown
  }}
  trigger={["click"]}
>
  <img
    src={avatarUrl}
    alt="Profile"
    className="w-10 h-10 rounded-full object-cover cursor-pointer"
  />
</Dropdown>

</Header>


      <Layout>
        {/* Sidebar (Desktop) */}
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
            items={menuItems}
            className="layout-menu"
          />
        </Sider>

        {/* Drawer (Mobile) */}
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={onClose}
          open={drawerVisible} // ✅ ใช้ open แทน visible
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            className="layout-menu"
          />
        </Drawer>

        {/* Content */}
        <Layout className="layout-content-layout">
          <Content className="layout-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
