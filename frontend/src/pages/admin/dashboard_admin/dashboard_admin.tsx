import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { getAllAdmins } from "../../../services/https/admin";
import { AdminInterface } from "../../../interfaces/IAdmin";  // นำเข้า AdminInterface
import "./dashboard_admin.css"
function DashboardAdmin() {
  const [users, setUsers] = useState<AdminInterface[]>([]); // ใช้ AdminInterface
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getUsers();
  }, []);

  const columns: ColumnsType<AdminInterface> = [
    {
      title: "ลำดับ",
      render: (_, __, index) => index + 1, // Adds sequential order starting from 1
      key: "index",
    },
    {
      title: "ชื่อผู้ใช้",
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
  ];

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
    <>
      {contextHolder}
      <div className="dashboard-admin-container">
        <Row>
          <Col span={12}>
            <h2 className="page-title">จัดการข้อมูลสมาชิก</h2>
          </Col>
        </Row>
        <Divider />
        <div className="table-container">
          <Table
            rowKey="ID"
            columns={columns}
            dataSource={users}
            className="admin-table"
          />
        </div>
      </div>
    </>
  );
}

export default DashboardAdmin;
