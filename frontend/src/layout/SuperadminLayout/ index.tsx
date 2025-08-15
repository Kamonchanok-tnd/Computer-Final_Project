import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import { DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import './FullLayout.css';

const { Header, Content } = Layout;

const FullLayout = () => {
  const location = useLocation();
  const selectedKey = location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header className="layout-header">
        <div className="layout-logo">SUT SUKJAI</div>
        <Button onClick={handleLogout} type="primary" className="layout-logout-button1">
          ออกจากระบบ
        </Button>
      </Header>

      <Layout className="layout-content-layout">
        <Content className="layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default FullLayout;
