import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { getAllAdmins, deleteAdminById } from "../../../services/https/admin";
import { AdminInterface } from "../../../interfaces/IAdmin";
import { Link, useNavigate } from "react-router-dom";

function DashboardAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const myId = localStorage.getItem("id");

  useEffect(() => {
    getUsers();
  }, []);

  const columns: ColumnsType<AdminInterface> = [
    {
      title: "",
      render: (record) =>
        myId === record?.ID ? null : (
          <Button
            type="dashed"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteUserById(record.ID)}
          />
        ),
    },
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
    {
      title: "",
      render: (record) => (
        <Button
          type="primary"
          icon={<DeleteOutlined />}
          onClick={() => navigate(`/superadmin/edit/${record.ID}`)}
          className="!bg-blue-300 !hover:bg-blue-600 !text-white !px-3 !py-1 !text-sm"
        >
          แก้ไขข้อมูล
        </Button>
      ),
    },
  ];

  const deleteUserById = async (id: string) => {
    let res = await deleteAdminById(id);
    if (res.status === 200) {
      messageApi.success(res.data.message);
      await getUsers();
    } else {
      messageApi.error(res.data.error);
    }
  };

  const getUsers = async () => {
    try {
      let res = await getAllAdmins();
      if (Array.isArray(res) && res.length > 0) {
        setUsers(res);
      } else {
        setUsers([]);
        messageApi.error("No data received from server");
      }
    } catch (error) {
      setUsers([]);
      messageApi.error("An error occurred while fetching users.");
    }
  };

  return (
  <div className="min-h-screen w-full bg-blue-50 p-6"> {/* พื้นหลังเต็มจอ */}
    <div className="bg-white rounded-lg shadow-md p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          จัดการข้อมูลผู้ดูแลระบบ
        </h2>
        <Link to="/superadmin/create">
  <Button
    className="!bg-blue-500 !hover:bg-blue-600 !text-white !px-3 !py-1 !text-sm"
    icon={<PlusOutlined />}
  >
    สร้างข้อมูล
  </Button>
</Link>

      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-4"></div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={users}
          className="w-full"
          pagination={{ pageSize: 10 }}
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
  </div>
);

}

export default DashboardAdmin;
