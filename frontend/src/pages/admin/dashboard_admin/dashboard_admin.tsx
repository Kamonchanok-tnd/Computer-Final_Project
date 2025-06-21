import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { getAllAdmins } from "../../../services/https/admin";
import { AdminInterface } from "../../../interfaces/IAdmin";  // นำเข้า AdminInterface
import { Link } from "react-router-dom";

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
      <Row>
        <Col span={12}>
          <h2>จัดการข้อมูลสมาชิก</h2>
        </Col>
       
      </Row>
      <Divider />
      <div style={{ marginTop: 20 }}>
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={users}
          style={{ width: "100%", overflow: "scroll" }}
        />
      </div>
    </>
  );
}

export default DashboardAdmin;
