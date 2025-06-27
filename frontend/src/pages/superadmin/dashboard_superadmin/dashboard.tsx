import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { getAllAdmins } from "../../../services/https/admin";
import { AdminInterface } from "../../../interfaces/IAdmin";  // นำเข้า AdminInterface
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { deleteAdminById } from "../../../services/https/admin";
import './DashboardAdmin.css';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminInterface[]>([]); // ใช้ AdminInterface
  const [messageApi, contextHolder] = message.useMessage();
  const myId = localStorage.getItem("id");

  useEffect(() => {
    getUsers();
  }, []);

  const columns: ColumnsType<AdminInterface> = [
    
    {
      title: "",
      render: (record) => (
        <>
          {myId === record?.ID ? null : (
            <Button
              type="dashed"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteUserById(record.ID)}
            ></Button>
          )}
        </>
      ),
    },
    {
      title: "ลำดับ",
      render: (_, __, index) => index + 1, // Adds sequential order starting from 1
      key: "index",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "หมายเลขโทรศัพท์",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "อายุ",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "เพศ",
      key: "gender",
      render: (record) => <>{record.gender}</>,
    },
    {
      title: "",
      render: (record) => (
        <>
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => navigate(`/superadmin/edit/${record.ID}`)}
          >
            แก้ไขข้อมูล
          </Button>
        </>
      ),
    },
  ];

  const deleteUserById = async (id: string) => {
    let res = await deleteAdminById(id);
    if (res.status === 200) {
      messageApi.open({
        type: "success",
        content: res.data.message,
      });
      await getUsers();
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getUsers = async () => {
    try {
      let res = await getAllAdmins();
      console.log("Response from getAllAdmins:", res);

      // Directly check if res is an array, because it's already returned as an array
      if (Array.isArray(res) && res.length > 0) {
        setUsers(res);
        console.log("Users data set successfully:", res);
      } else {
        setUsers([]);
        messageApi.open({
          type: "error",
          content: "No data received from server",
        });
        console.log("No data received from server");
      }
    } catch (error) {
      setUsers([]);
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "An error occurred while fetching users.",
      });
    }
  };

  return (
     <div className="dashboard-admin-container"> {/* เพิ่ม className ครอบทั้งหมด */}
      {contextHolder}
      <Row className="header-container">
        <Col span={12}>
          <h2 className="page-title">จัดการข้อมูลผู้ดูแลระบบ</h2>
        </Col>
        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space className="space-container">
            <Link to="/superadmin/create">
              <Button className="create-button" icon={<PlusOutlined />}>
                สร้างข้อมูล
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>
      <Divider className="ant-divider" />
      <div className="layout-container">
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={users}
          style={{ width: "100%", overflow: "scroll" }}
        />
      </div>
    </div>
  );
}

export default DashboardAdmin;
