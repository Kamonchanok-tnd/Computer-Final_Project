import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminInterface, AdminResponse } from "../../../interfaces/IAdmin";
import { getAdminById, updateAdminYourselfById } from "../../../services/https/admin";
import { Spin } from "antd";

function EditYourself() {
  const [admin, setAdmin] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (userId) fetchAdminData(userId);
  }, []);

  const fetchAdminData = async (id: string) => {
    setFormLoading(true);
    try {
    const response: AdminResponse = await getAdminById(id);
      if (response.data) setAdmin(response);
      else alert("ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้");
    } catch (error) {
      console.error("Error fetching admin:", error);
      alert("ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!admin) return;

    const formData = new FormData(e.currentTarget);
    const updatedAdmin: AdminInterface = {
      ...admin.data,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      phone_number: formData.get("phone_number") as string,
      age: parseInt(formData.get("age") as string, 10),
      gender: formData.get("gender") as string,
    };

    setLoading(true);
    try {
      const response = await updateAdminYourselfById(admin.data.ID, updatedAdmin);
      if (response.status === 200 || response.status === "success") {
        setTimeout(() => navigate("/admin"), 1000);
      } else alert(`เกิดข้อผิดพลาด: ${response.status}`);
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        <h3 className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</h3>
      </div>
    );
  }

  if (!admin) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
          แก้ไขข้อมูลผู้ดูแลระบบ
        </h1>
      </header>

      {/* Divider responsive */}
      <div className="h-px bg-gray-300 w-[calc(100%-20px)] sm:w-[calc(100%-50px)] mx-auto mb-4 sm:mb-6" />

      {/* Card form */}
      <div className="flex justify-center px-4 sm:px-6 mt-2 sm:mt-6">
        <div className="bg-white p-4 sm:p-10 rounded-xl shadow-md w-full max-w-4xl ">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-600">ชื่อผู้ใช้</label>
              <input
                type="text"
                name="username"
                defaultValue={admin.data.username}
                required
                className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-600">อีเมล</label>
              <input
                type="email"
                name="email"
                defaultValue={admin.data.email}
                required
                className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-600">เบอร์โทรศัพท์</label>
              <input
                type="text"
                name="phone_number"
                defaultValue={admin.data.phone_number}
                required
                className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-600">อายุ</label>
              <input
                type="number"
                name="age"
                defaultValue={admin.data.age}
                required
                className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block mb-1 sm:mb-2 font-medium text-gray-600">เพศ</label>
              <select
                name="gender"
                defaultValue={admin.data.gender}
                required
                className="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">เลือกเพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="LGBTQ+">LGBTQ+</option>
                <option value="ไม่ระบุ">ไม่ระบุ</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-center sm:space-x-6 mt-4 sm:mt-8 space-y-2 sm:space-y-0">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-400 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-blue-500 transition"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="bg-gray-300 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditYourself;
