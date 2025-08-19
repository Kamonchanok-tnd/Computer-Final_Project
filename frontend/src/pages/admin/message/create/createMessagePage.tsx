import React, { useState, useEffect } from "react";
import { Upload, message, Modal, Form, Select } from "antd";
import type { DefaultOptionType } from "antd/es/select";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createWordHealingMessage } from "../../../../services/https/message";
import { getArticleTypeOptionsDetailed } from "../../../../services/https/message";
import { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import "./createMessagePage.css";

// แก้ไข interface ให้รองรับเนื้อหาบทความและประเภทบทความ
interface FormDataType extends Omit<WordHealingContent, "photo"> {
  photo: string | null;                 // เปลี่ยนจาก File เป็น string เพื่อเก็บ base64
  error: (message: string) => unknown;  // กำหนดให้เป็นฟังก์ชัน
  idts?: number;                        // เพิ่มฟิลด์ idts
  content: string;                      // ฟิลด์ใหม่สำหรับเนื้อหาบทความ
  articleType: string;                  // ฟิลด์ใหม่สำหรับประเภทบทความ (เก็บ key ที่ BE ต้องการ)
}

const CreateMessagePage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormDataType>({
    id: 0,
    name: "",
    author: "",
    no_of_like: 0,
    date: "",
    photo: null,
    content: "",           // เนื้อหาบทความเริ่มต้นเป็นค่าว่าง
    articleType: "OpinionPiece", // ค่าเริ่มต้น (key ที่ BE ต้องการ)
    error: (message: string) => { console.error(message); },
    idts: undefined,
  });

  const [preview, setPreview] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<string>("");

  // ------------ state สำหรับ options และ loading ------------
  const [articleTypeOptions, setArticleTypeOptions] = useState<DefaultOptionType[]>([]);
  const [articleTypeLoading, setArticleTypeLoading] = useState<boolean>(false);

  // โหลดประเภทบทความจาก API ตอน mount
  useEffect(() => {
    (async () => {
      setArticleTypeLoading(true);
      // ได้ [{ value, label, raw }] → map ให้เหลือ { value, label } เพื่อให้ตรง DefaultOptionType
      const detailed = await getArticleTypeOptionsDetailed();
      const opts: DefaultOptionType[] = detailed.map((o) => ({
        value: o.value,
        label: o.label,
      }));
      setArticleTypeOptions(opts);
      setArticleTypeLoading(false);

      // ถ้าค่าปัจจุบันไม่อยู่ใน options ให้ตั้งเป็นตัวแรก (ถ้ามี)
      const values = opts.map((o) => String(o.value));
      if (opts.length > 0 && !values.includes(formData.articleType)) {
        setFormData((prev) => ({ ...prev, articleType: String(opts[0].value) }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // -----------------------------------------------------------

  // รองรับทั้ง input และ textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "no_of_like") {
      setFormData((prev) => ({
        ...prev,
        no_of_like: parseInt(value, 10) || 0,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      formData.error("กรุณากรอกชื่อบทความ");
      return;
    }
    if (!formData.author.trim()) {
      formData.error("กรุณากรอกชื่อผู้เขียน");
      return;
    }
    if (!formData.date) {
      formData.error("กรุณาเลือกวันที่เผยแพร่");
      return;
    }
    if (!formData.content.trim()) {
      formData.error("กรุณากรอกเนื้อหาบทความ");
      return;
    }
    const dateString = formData.date;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      formData.error("วันที่ไม่ถูกต้อง");
      return;
    }
    const formattedDate = date.toISOString().split("T")[0];

    const form = new FormData();
    form.append("name", formData.name);
    form.append("author", formData.author);
    form.append("no_of_like", formData.no_of_like.toString());
    form.append("date", formattedDate);
    form.append("content", formData.content);
    form.append("article_type", formData.articleType);  // คีย์ให้ตรงกับ BE
    if (formData.photo) {
      form.append("photo", formData.photo);
    }

    console.log("Form data before sending:", formData);

    try {
      const success = await createWordHealingMessage(form);
      if (success) {
        message.success("บันทึกการสร้างข้อมมูลบทความลงฐานข้อมูลสำเร็จ!");
        navigate("/admin/messagePage");
      } else {
        message.error("เกิดข้อผิดพลาดในการบันทึกบทความ");
      }
    } catch (error) {
      console.error("Error creating message:", error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  const handleUploadChange = (info: any) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj || fileList[0];
      const isImage = file.type?.startsWith("image/");
      const isPDF = file.type === "application/pdf";

      if (!isImage && !isPDF) {
        message.error("กรุณาเลือกไฟล์รูปภาพหรือ PDF เท่านั้น");
        return;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        return;
      }

      setPreview("");
      setFormData((prev) => ({ ...prev, photo: null }));

      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64File = reader.result as string;
          setFormData((prev) => ({ ...prev, photo: base64File }));
          setPreview(base64File);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview("");
      }
    } else {
      setFormData((prev) => ({ ...prev, photo: null }));
      setPreview("");
    }
  };

  const handlePreview = () => {
    if (preview) {
      setPreviewFile(preview);
      setPreviewVisible(true);
    }
  };

  const handleRemoveFile = () => {
    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));
  };

  return (
    <div className="createMessagePage createMessage-container">
      <div className="createMessage-header">
        <div className="createMessage-title">สร้างบทความให้กำลังใจ</div>
      </div>

      <form onSubmit={handleSubmit} className="message-form split-form" noValidate>
        <div className="form-left">
          <div>
            <label htmlFor="name">ชื่อบทความ: <span style={{ color: "red" }}>*</span></label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
                width: "100%",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>

          <div>
            <label htmlFor="author">ผู้เขียน/เเหล่งที่มา: <span style={{ color: "red" }}>*</span></label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              required
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
                width: "100%",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>

          <div>
                          <label htmlFor="articleType">
                ประเภทบทความ: <span style={{ color: "red" }}>*</span>
              </label>

              <Select<string>
                id="articleType"
                // name="articleType"   <-- ลบออก
                value={formData.articleType}
                onChange={(v) => setFormData((prev) => ({ ...prev, articleType: v }))} // รับ string
                options={articleTypeOptions}          // DefaultOptionType[]
                loading={articleTypeLoading}
                allowClear={false}
                placeholder="เลือกประเภทบทความ"
                notFoundContent={articleTypeLoading ? "กำลังโหลด..." : "ไม่พบประเภทบทความ"}
                optionLabelProp="children"
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "14px",
                  width: "100%",
                  height: "60px",
                  transition: "border-color 0.3s ease",
                }}
                dropdownStyle={{ maxHeight: 400, overflowY: "auto" }}
                onFocus={(e) => ((e.target as any).style.borderColor = "black")}
                onBlur={(e) => ((e.target as any).style.borderColor = "#ccc")}
              />
          </div>

          <div>
            <label htmlFor="content">เนื้อหาบทความ: <span style={{ color: "red" }}>*</span></label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              style={{
                color: "#000",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px 14px",
                fontSize: "14px",
                width: "100%",
                height: "150px",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>

          <div>
              <label htmlFor="no_of_like">จำนวนการกดถูกใจ:</label>
              <input
                id="no_of_like"
                name="no_of_like"
                type="number"
                min={0}
                value={formData.no_of_like}
                readOnly //  ล็อกไม่ให้พิมพ์
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "14px",
                  width: "100%",
                  transition: "border-color 0.3s ease",
                }}
              />
            </div>

          <div>
            <label htmlFor="date">วันที่เผยแพร่: <span style={{ color: "red" }}>*</span></label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
                width: "100%",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate("/admin/messagePage")}
            >
              ย้อนกลับ
            </button>
            <button type="submit" className="btn-submit">
              บันทึกบทความ
            </button>
          </div>
        </div>

        <div className="form-right">
          <div>
            <label>อัพโหลดรูปภาพประกอบบทความ :</label>
            <Form.Item style={{ width: "100%", height: "100%" }}>
              <Upload
                className="full-upload"
                beforeUpload={() => false}
                listType="picture-card"
                style={{ width: "450px", height: "450px" }}
                onChange={handleUploadChange}
                fileList={
                  formData.photo
                    ? [
                        {
                          uid: "-1",
                          name: "preview",
                          status: "done" as const,
                          url: preview || undefined,
                        },
                      ]
                    : []
                }
                onPreview={handlePreview}
                onRemove={handleRemoveFile}
                accept="image/*,.pdf"
                maxCount={1}
              >
                {!formData.photo && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "450px",
                      height: "450px",
                    }}
                  >
                    <UploadOutlined style={{ fontSize: 32 }} />
                    <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </div>
        </div>
      </form>

      <Modal
        open={previewVisible}
        footer={null}
        centered
        onCancel={() => setPreviewVisible(false)}
        style={{ maxWidth: "90vw", padding: 0 }}
        bodyStyle={{ padding: 0 }}
        width="auto"
      >
        <img
          alt="Preview"
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            display: "block",
            margin: "0 auto",
            objectFit: "contain",
            borderRadius: "12px",
          }}
          src={previewFile}
        />
      </Modal>
    </div>
  );
};

export default CreateMessagePage;


