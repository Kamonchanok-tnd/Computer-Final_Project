import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Drawer, Dropdown, Avatar } from "antd";
import { MenuOutlined, DashboardOutlined, SettingOutlined, CommentOutlined, UserOutlined,CustomerServiceOutlined,QuestionOutlined,MailOutlined,ScheduleOutlined} from '@ant-design/icons';
const { Header, Content, Sider } = Layout;
import './index.css';

const AdminLayout = () => {
  const location = useLocation();
  const selectedKey = location.pathname;
  const navigate = useNavigate();

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

  // เมนู Dropdown สำหรับ Avatar
  const userMenu = (
    <Menu>
      <Menu.Item key="editProfile" onClick={handleEditProfile} >
        <Link to="/admin/edityourself">แก้ไขข้อมูลส่วนตัว</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout} danger >
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="layout admin-layout" style={{ minHeight: "100vh" }}>
      <Header className="layout-header">
  <div className="layout-header-left">
  <Button 
    type="primary" 
    icon={<MenuOutlined />}  
    onClick={showDrawer} 
    className="layout-hamburger-button"
  />
  <div className="layout-logo">SUT SUKJAI</div>
</div>


  <Dropdown overlay={userMenu} trigger={['click']}>
    <Avatar size="large" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
  </Dropdown>
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
            <Menu.Item key="/admin" icon={<DashboardOutlined />}>
              <Link to="/admin">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/admin/questionnairePage" icon={<QuestionOutlined/>}>
              <Link to="/admin/questionnairePage">Questionnaire</Link>
            </Menu.Item>
            <Menu.Item key="/admin/prompt" icon={<CommentOutlined />}>
              <Link to="/admin/prompt">Prompt AI</Link>
            </Menu.Item>
            <Menu.Item key="/admin/sounds" icon={<CustomerServiceOutlined/>}> 
              <Link to="/admin/sounds">Sounds</Link>
            </Menu.Item>
            <Menu.Item key="/admin/messagePage" icon={<MailOutlined />}> 
              <Link to="/admin/messagePage">Message</Link> 
            </Menu.Item>
            <Menu.Item key="/admin/dashboard/contents" icon={<ScheduleOutlined/>}> 
              <Link to="/admin/dashboard/contents">Contents</Link> 
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
            selectedKeys={[selectedKey]}
            className="layout-menu"
          >
            <Menu.Item key="/admin" icon={<DashboardOutlined />}>
              <Link to="/admin">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/admin/questionnairePage" icon={<SettingOutlined />}>
              <Link to="/admin/questionnairePage">Questionnaire</Link>
            </Menu.Item>
            <Menu.Item key="/admin/prompt" icon={<CommentOutlined />}>
              <Link to="/admin/prompt">Prompt AI</Link>
            </Menu.Item>
            <Menu.Item key="/admin/sounds" icon={<CustomerServiceOutlined/>}> 
              <Link to="/admin/sounds">Sounds</Link>
            </Menu.Item>
          </Menu>
        </Drawer>

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
