
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  Select,
  Avatar,
  Modal,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined, PictureOutlined, UserOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interfaces/IUser";
import { GetUsersById, UpdateUsersById } from "../../../services/https/login";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import "./UserEdit.css";
import { GetALllAvatar } from "../../../services/https/PF";
import { IPF } from "../../../interfaces/IPF";
import { useUser } from "../../../layout/HeaderLayout/UserContext";
//import { resetPassword } from "../../../services/https/resetpassword";

import 'dayjs/locale/th'; // นำเข้า locale ภาษาไทย
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import { DatePicker } from "antd";
dayjs.extend(customParseFormat);

dayjs.locale('th'); // ตั้งค่า locale เป็นไทย

import thTH from 'antd/es/date-picker/locale/th_TH';

const facultyOptions = [
  "สำนักวิชาสาธารณสุขศาสตร์",
  "สำนักวิชาทันตแพทยศาสตร์",
  "สำนักวิชาพยาบาลศาสตร์",
  "สำนักวิชาวิศวกรรมศาสตร์",
  "สำนักวิชาแพทยศาสตร์",
  "สำนักวิชาเทคโนโลยีการเกษตร",
  "สำนักวิชาเทคโนโลยีสังคม",
  "สำนักวิชาวิทยาศาสตร์",
  "สำนักวิชาศาสตร์และศิลป์ดิจิทัล",
];

const yearOptions = [
  { value: "ชั้นปี 1", label: "ชั้นปี 1" },
  { value: "ชั้นปี 2", label: "ชั้นปี 2" },
  { value: "ชั้นปี 3", label: "ชั้นปี 3" },
  { value: "ชั้นปี 4", label: "ชั้นปี 4" },
  { value: "ชั้นปี 5", label: "ชั้นปี 5" },
  { value: "ชั้นปี 6", label: "ชั้นปี 6" },
  { value: "6 ปีขึ้นไป", label: "6 ปีขึ้นไป" },
];
// Env variables
const PROFILE_BASE_URL = import.meta.env.VITE_PF_URL;

// ฟังก์ชันรวม path แบบปลอดภัย
export const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;

export function buildProfileUrl(picture: string): string {
  if (!picture) return "";
  return joinUrl(PROFILE_BASE_URL, picture);
}

function UserEdit() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const userId = localStorage.getItem("id");
  const [allAvatar, setAllAvatar] = useState<IPF[]>([]);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string>("");
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const { setAvatarUrl } = useUser();

  // โหลดข้อมูลผู้ใช้ตาม ID
  useEffect(() => {
    if (!userId) {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลผู้ใช้",
      });
      navigate("/");
    } else {
      getUserById(userId);
    }
  }, [userId]);

  const getUserById = async (id: string) => {
    const res = await GetUsersById(id);
    // console.log("ข้อมูลผู้ใช้", res);
    if (res?.status === 200) {
      form.setFieldsValue({
        username: res.data.username,
        email: res.data.email,
        phone_number: res.data.phone_number,
      birth_date: res.data.birth_date 
        ? dayjs(res.data.birth_date) // <-- ส่งเป็น dayjs object
        : null,
        age: res.data.age,
        Gender: res.data.gender,
        facebook: res.data.facebook,
        line: res.data.line,
        person_type: res.data.person_type,   // เพิ่ม
        year: res.data.year,                 // เพิ่ม
        faculty: res.data.faculty,           // เพิ่ม
      });

      // ตั้งรูปโปรไฟล์เดิม
      if (res.data.ProfileAvatar && res.data.ProfileAvatar.avatar) {
        setSelectedProfileImage(buildProfileUrl(res.data.ProfileAvatar.avatar));
        form.setFieldValue('pfid', res.data.ProfileAvatar.ID);
      }
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลผู้ใช้",
      });
    }
  };

  
  // โหลด avatar ทั้งหมด
  async function fetchALlAvatar() {
    try {
      const res = await GetALllAvatar();
      // console.log("รูปโปรไฟล์",res);
      setAllAvatar(res.data);
    } catch (e) {
      message.error("โหลดข้อมูลไม่สําเร็จ");
    }
  }

  useEffect(() => {
    fetchALlAvatar();
  }, []);

  const handleProfileImageSelect = (avatarId: number, imageUrl: string) => {
    const fullImageUrl = buildProfileUrl(imageUrl);
    setSelectedProfileImage(fullImageUrl);
    setProfileModalVisible(false);

    // เก็บ avatar ID ไว้ submit
    form.setFieldValue('pfid', avatarId);
  };

  const openProfileModal = () => {
    setProfileModalVisible(true);
  };

  // submit form
  const onFinish = async (values: UsersInterface) => {
    const payload = {
      ...values,
      gender: values.Gender,
      pfid: form.getFieldValue('pfid') || (values as any).pfid,
    };
    //console.log("payload is : ",payload);

    const res = await UpdateUsersById(userId as string, payload);
    if (res.status === 200) {
      messageApi.open({
        type: "success",
        content: res.data.message || "แก้ไขข้อมูลสำเร็จ",
      });

      // อัปเดตรูปใน context + localStorage
      if (payload.pfid) {
        const selectedAvatar = allAvatar.find(a => a.ID === payload.pfid);
        if (selectedAvatar?.avatar) {
          const fullImageUrl = buildProfileUrl(selectedAvatar.avatar);
          setAvatarUrl(fullImageUrl);
          localStorage.setItem("avatarUrl", fullImageUrl);
        }
      }

    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
      });
    }
  };
  const personType = Form.useWatch("person_type", form);

return (
  <div className="user-edit-container">
    {contextHolder}
    <Card className="user-edit-card" title={<h2 className="user-edit-title">แก้ไขข้อมูล</h2>}>

      {/* Profile Picture */}
      <div className="profile-section" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '32px',
        flexDirection: 'column'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            size={120}
            src={selectedProfileImage}
            icon={!selectedProfileImage && <UserOutlined />}
            style={{
              border: '4px solid #f0f0f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            }}
            onClick={openProfileModal}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<PictureOutlined />}
            size="small"
            onClick={openProfileModal}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              zIndex: 1,
              width: '32px',
              height: '32px',
              border: '1px solid white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
            title="เลือกรูปโปรไฟล์"
          />
        </div>
        <p style={{
          marginTop: '12px',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          คลิกเพื่อเปลี่ยนรูปโปรไฟล์
        </p>
      </div>

      {/* Modal เลือกรูป */}
      <Modal
        title="เลือกรูปโปรไฟล์"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={700}
        centered
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px',
          padding: '20px 0',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {allAvatar.map((avatar, index) => (
            <div
              key={avatar.ID || index}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
                overflow: 'hidden',
                border: selectedProfileImage === buildProfileUrl(avatar.avatar ?? '') ? '2px solid #5DE2FF' : '1px solid #f0f0f0',
                boxShadow: selectedProfileImage === buildProfileUrl(avatar.avatar ?? '') ? '0 2px 8px rgba(24, 144, 255, 0.1)' : 'none',
              }}
              onClick={() => handleProfileImageSelect(avatar.ID ?? 0, avatar.avatar ?? '')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Avatar
                size={120}
                src={buildProfileUrl(avatar.avatar ?? '')}
                icon={<UserOutlined />}
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '12px'
                }}
              />
              {avatar.name && (
                <div style={{
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#666',
                  backgroundColor: 'white'
                }}>
                  {avatar.name}
                </div>
              )}
            </div>
          ))}
        </div>

        {allAvatar.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#999'
          }}>
            <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>ไม่พบรูปโปรไฟล์ในระบบ</p>
          </div>
        )}
      </Modal>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        className="user-edit-form"
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="ชื่อผู้ใช้งาน" name="username" rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน !" }]}>
              <Input placeholder="ระบุชื่อผู้ใช้งาน" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="อีเมล" name="email" rules={[
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง !" },
              { required: true, message: "กรุณากรอกอีเมล !" },
            ]}>
              <Input placeholder="example@email.com" />
            </Form.Item>
          </Col>

          {/* PersonType */}
          <Col xs={24} md={12}>
            <Form.Item
              label="ประเภทบุคคล"
              name="person_type"
              rules={[{ required: true, message: "กรุณาเลือกประเภทบุคคล !" }]}
            >
              <Select placeholder="เลือกประเภทบุคคล">
                <Select.Option value="นักศึกษามทส">นักศึกษามทส</Select.Option>
                <Select.Option value="อาจารย์">อาจารย์</Select.Option>
                <Select.Option value="บุคคลภายนอก">บุคคลภายนอก</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Year & Faculty เฉพาะนักศึกษามทส */}
          {personType === "นักศึกษามทส" && (
  <>
    <Col xs={24} md={12}>
      <Form.Item
        label="ชั้นปี"
        name="year"
        rules={[{ required: true, message: "กรุณาเลือกชั้นปี !" }]}
      >
        <Select placeholder="เลือกชั้นปี">
          {yearOptions.map((year) => (
            <Select.Option key={year.value} value={year.value}>
              {year.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Col>
    <Col xs={24} md={12}>
      <Form.Item
        label="คณะ"
        name="faculty"
        rules={[{ required: true, message: "กรุณาเลือกคณะ !" }]}
      >
        <Select placeholder="เลือกคณะ">
          {facultyOptions.map((fac) => (
            <Select.Option key={fac} value={fac}>
              {fac}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Col>
  </>
)}


          <Col xs={24} md={12}>
  <Form.Item
    label="เบอร์โทรศัพท์"
    name="phone_number"
    rules={[
      {message: "กรุณากรอกเบอร์โทรศัพท์ !" },
      {
        pattern: /^0[0-9]{9}$/, // ต้องขึ้นต้นด้วย 0 และตามด้วยตัวเลขอีก 9 ตัว (รวม 10 หลัก)
        message: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก เริ่มต้นด้วย 0)",
      },
    ]}
  >
    <Input placeholder="0812345678" maxLength={10} />
  </Form.Item>
</Col>

          <Col xs={24} md={12}>
  <Form.Item
    label="เดือนและปีเกิด"
    name="birth_date"
    rules={[{ required: true, message: "กรุณาเลือกเดือนและปีเกิด !" }]}
  >
    <DatePicker
      picker="month"
      format="MMMM YYYY"       // แสดงเป็น เดือน-ปี ภาษาไทย
      locale={thTH}           // ใส่ locale เป็น object
      placeholder="เลือกเดือนและปีเกิด"
      style={{ width: "100%" }}
      disabledDate={(current) => current && current > dayjs().endOf("month")} // ไม่เลือกวันในอนาคต
    />
  </Form.Item>
</Col>

          <Col xs={24} md={12}>
            <Form.Item label="เพศ" name="Gender" rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}>
              <Select placeholder="เลือกเพศ">
                <Select.Option value="Male">ชาย</Select.Option>
                <Select.Option value="Female">หญิง</Select.Option>
                <Select.Option value="Other">LGBTQ+</Select.Option>
                <Select.Option value="Other">ไม่ระบุ</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Facebook (ไม่จำเป็น)" name="facebook">
              <Input placeholder="ระบุ Facebook (ถ้ามี)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Line (ไม่จำเป็น)" name="line">
              <Input placeholder="ระบุ Line ID (ถ้ามี)" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />
        <div className="user-edit-btn-group">
          <Link to="/user">
            <Button icon={<ArrowLeftOutlined />} className="btn-back">ย้อนกลับ</Button>
          </Link>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="btn-save">
            บันทึกข้อมูล
          </Button>
        </div>
      </Form>
    </Card>
  </div>
);
}


export default UserEdit;
