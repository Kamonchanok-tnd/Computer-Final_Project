import { useState, useEffect } from "react";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { getAllAdmins } from "../../../services/https/admin";
import { AdminInterface } from "../../../interfaces/IAdmin";

function DashboardAdmin() {
  const [users, setUsers] = useState<AdminInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getUsers();
  }, []);

  const columns: ColumnsType<AdminInterface> = [
    {
      title: "ลำดับ",
      render: (_, __, index) => index + 1,
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
      if (Array.isArray(res) && res.length > 0) {
        setUsers(res);
      } else {
        setUsers([]);
        messageApi.open({
          type: "error",
          content: "ไม่มีข้อมูลจากเซิร์ฟเวอร์",
        });
      }
    } catch (error) {
      setUsers([]);
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700">
            จัดการข้อมูลสมาชิก
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300 mb-6" />

        {/* Table */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <Table
            rowKey="ID"
            columns={columns}
            dataSource={users}
            className="custom-ant-table "
            pagination={{ pageSize: 5 }}
            components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  className="!bg-blue-100 !text-gray-700 !font-semibold"
                >
                  {props.children}
                </th>
              ),
            },
          }}
          />
        </div>
      </div>
    </>
  );
}

export default DashboardAdmin;
