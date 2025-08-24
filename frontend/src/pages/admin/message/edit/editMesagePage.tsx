import React, { useState, useEffect } from "react";
import { Upload, message as antdMessage, Modal, Form, Select } from "antd";
import type { DefaultOptionType } from "antd/es/select";
import { UploadOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import {getWordHealingMessageById,updateWordHealingMessage,
} from "../../../../services/https/message";
import { getArticleTypeOptionsDetailed } from "../../../../services/https/message";
import { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import "./editMessagePage.css";

interface FormDataType extends Omit<WordHealingContent, "photo"> {
  photo: string | null;
  error: (message: string) => void;
  viewCount: number; // เพิ่ม viewCount
}

const EditMessagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = (location.state as { id?: number }) || {};

  const [formData, setFormData] = useState<FormDataType>({
  id: id || 0,
  name: "",
  author: "",
  no_of_like: 0,
  date: "",
  photo: null,
  content: "",
  articleType: "",
  viewCount: 0, // เริ่มต้น viewCount เป็น 0
  error: (msg: string) => {
    antdMessage.error(msg);
  },
});


  const [preview, setPreview] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<string>("");

  // article type options
  const [articleTypeOptions, setArticleTypeOptions] = useState<DefaultOptionType[]>([]);
  const [articleTypeLoading, setArticleTypeLoading] = useState<boolean>(false);

  // ------- handlers -------
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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, articleType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return formData.error("กรุณากรอกชื่อบทความ");
    if (!formData.author.trim()) return formData.error("กรุณากรอกชื่อผู้เขียน");
    if (!formData.date) return formData.error("กรุณาเลือกวันที่เผยแพร่");
    if (!formData.content.trim()) return formData.error("กรุณากรอกเนื้อหาบทความ");
    if (!formData.articleType) return formData.error("กรุณาเลือกประเภทบทความ");

    // ส่งเป็น ISO string เพื่อให้ BE parse เป็น time.Time ได้
    const d = new Date(formData.date);
    if (Number.isNaN(d.getTime())) return formData.error("วันที่ไม่ถูกต้อง");
    const dateISO = d.toISOString(); // RFC3339

    const req = {
    name: formData.name,
    author: formData.author,
    no_of_like: formData.no_of_like,
    date: dateISO,                       
    photo: formData.photo,               
    content: formData.content,           
    article_type: formData.articleType,  
    viewCount: formData.viewCount,  // ส่ง viewCount
    };


    console.log("Update payload:", req);

    try {
      const ok = await updateWordHealingMessage(String(formData.id), req as any);
      if (ok) {
        antdMessage.success("บันทึกการเเก้ไขข้อมูลบทความลงฐานข้อมูลสำเร็จ!");
        navigate("/admin/messagePage");
      } else {
        antdMessage.error("เกิดข้อผิดพลาดในการบันทึกบทความ");
      }
    } catch (err) {
      console.error(err);
      antdMessage.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  const handleUploadChange = (info: any) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj || fileList[0];
      const isImage = file.type?.startsWith("image/");
      const isPDF = file.type === "application/pdf";

      if (!isImage && !isPDF) {
        antdMessage.error("กรุณาเลือกไฟล์รูปภาพหรือ PDF เท่านั้น");
        return;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        antdMessage.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
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

  // ------- fetch initial data -------
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const messageData = await getWordHealingMessageById(String(id));
        if (messageData) {
          // console.log("Data received from backend:", messageData);
          setFormData((prev) => ({
            ...prev,
            id: messageData.id || 0,
            name: messageData.name || "",
            author: messageData.author || "",
            no_of_like: messageData.no_of_like || 0,
            date: messageData.date || "",
            photo: messageData.photo || null,
            content: messageData.content || "",           
            articleType: messageData.articleType || "",   
          }));
          setPreview(messageData.photo || "");
        }
      } catch (error) {
        console.error("Error fetching message data:", error);
        antdMessage.error("ไม่สามารถดึงข้อมูลบทความ");
      }
    };
    fetchData();
  }, [id]);

  // ------- fetch article types -------
  useEffect(() => {
    (async () => {
      setArticleTypeLoading(true);
      const detailed = await getArticleTypeOptionsDetailed();
      const opts: DefaultOptionType[] = detailed.map((o) => ({
        value: o.value,
        label: o.label,
      }));
      setArticleTypeOptions(opts);
      setArticleTypeLoading(false);

      if (!formData.articleType && opts.length > 0) {
        setFormData((prev) => ({ ...prev, articleType: String(opts[0].value) }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="createMessagePage createMessage-container">
      <div className="createMessage-header">
        <div className="createMessage-title">แก้ไขบทความให้กำลังใจ</div>
      </div>

      <form onSubmit={handleSubmit} className="message-form split-form" noValidate>
        <div className="form-left">
          <div>
            <label htmlFor="name">ชื่อบทความ: <span style={{ color: "red" }}>*</span></label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="author">ผู้เขียน: <span style={{ color: "red" }}>*</span></label>
            <input id="author" name="author" type="text" value={formData.author} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="articleType">ประเภทบทความ: <span style={{ color: "red" }}>*</span></label>
            <Select<string>
              id="articleType"
              value={formData.articleType}
              onChange={handleSelectChange}
              options={articleTypeOptions}
              loading={articleTypeLoading}
              allowClear={false}
              placeholder="เลือกประเภทบทความ"
              optionLabelProp="children"
              style={{ width: "100%", height: 60 }}
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
              style={{ width: "100%", height: 150, backgroundColor:"#fff", color:"#000", borderRadius:"8px", fontSize:"16px" }}
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
              readOnly // ล็อกไม่ให้แก้ไข
            />
          </div>

          <div>
            <label htmlFor="viewCount">จำนวนการกดเข้าชม:</label>
            <input
              id="viewCount"
              name="viewCount"
              type="number"
              min={0}
              value={formData.viewCount}
              readOnly // ล็อกไม่ให้แก้ไข
            />
          </div>

          <div>
            <label htmlFor="date">วันที่เผยแพร่: <span style={{ color: "red" }}>*</span></label>
            <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-back" onClick={() => navigate("/admin/messagePage")}>
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
                    ? [{ uid: "-1", name: "preview", status: "done" as const, url: preview || undefined }]
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

export default EditMessagePage;



