// CreateMessagePage.tsx
import React, { useState, useRef } from "react";
import { UploadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./createMessagePage.css"
const CreateMessagePage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    author: "",
    no_of_like: 0,
    date: "",
    source: "",
    photo: "",
    contentType: "url" as "url" | "file",
    contentUrl: "",
    articleFile: null as File | null,
  });

  const [preview, setPreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const articleFileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "photo" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
      return;
    }

    if (name === "articleFile" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, articleFile: file }));
      setPreview("");
      return;
    }

    if (name === "contentUrl") {
      setFormData((prev) => ({ ...prev, contentUrl: value }));
      setPreview(value);
      return;
    }

    if (name === "contentType") {
      setFormData((prev) => ({
        ...prev,
        contentType: value as "url" | "file",
        contentUrl: value === "url" ? prev.contentUrl : "",
        articleFile: value === "file" ? prev.articleFile : null,
      }));
      setPreview("");
      return;
    }

    if (name === "no_of_like") {
      setFormData((prev) => ({
        ...prev,
        no_of_like: parseInt(value) || 0,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting WordHealingContent:", formData);
    // TODO: ส่งข้อมูลไป backend
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerArticleFileInput = () => articleFileInputRef.current?.click();

  return (
    <div className="createMessage-container">
      <div className="createMessage-header">
        <div className="createMessage-title">สร้างบทความเยียวยาหัวใจ</div>
      </div>

      <form onSubmit={handleSubmit} className="message-form split-form" noValidate>
        <div className="form-left">
          <div>
            <label htmlFor="name">ชื่อบทความ:</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="author">ผู้เขียน:</label>
            <input id="author" name="author" type="text" value={formData.author} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="no_of_like">จำนวนการกดถูกใจ:</label>
            <input id="no_of_like" name="no_of_like" type="number" value={formData.no_of_like} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="date">วันที่เผยแพร่:</label>
            <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="source">ที่มา / แหล่งที่มา:</label>
            <input id="source" name="source" type="text" value={formData.source} onChange={handleChange} />
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-back" onClick={() => navigate('/admin/messagePage')}>ย้อนกลับ</button>
            <button type="submit" className="btn-submit">บันทึกบทความ</button>
          </div>
        </div>

        <div className="form-right">
          <div>
            <label>เลือกประเภทบทความ:</label>
            <label>
              <input
                type="radio"
                name="contentType"
                value="url"
                checked={formData.contentType === "url"}
                onChange={handleChange}
              /> ใช้ URL
            </label>
            <label>
              <input
                type="radio"
                name="contentType"
                value="file"
                checked={formData.contentType === "file"}
                onChange={handleChange}
              /> อัพโหลดไฟล์
            </label>
          </div>

          {formData.contentType === "url" && (
            <div>
              <label htmlFor="contentUrl">ใส่ URL บทความ:</label>
              <input id="contentUrl" name="contentUrl" type="text" value={formData.contentUrl} onChange={handleChange} />
            </div>
          )}

          {formData.contentType === "file" && (
            <div>
              <label>อัพโหลดไฟล์บทความ (PDF, DOCX, TXT):</label>
              <div className="upload-icon-wrapper" onClick={triggerArticleFileInput}>
                <FilePdfOutlined />
              </div>
              <input
                type="file"
                name="articleFile"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleChange}
                ref={articleFileInputRef}
                style={{ display: "none" }}
              />
              {formData.articleFile && (
                <>
                  <div className="file-name-display">{formData.articleFile.name}</div>
                  <button
                    type="button"
                    className="btn-clear-file"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, articleFile: null }));
                      if (articleFileInputRef.current) articleFileInputRef.current.value = "";
                    }}
                  >
                    ลบไฟล์บทความ
                  </button>
                </>
              )}
            </div>
          )}

          <div>
            <label>อัพโหลดรูปภาพประกอบบทความ</label>
            <div className="upload-icon-wrapper" onClick={triggerFileInput}>
              <UploadOutlined />
            </div>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />

            {preview && (
              <div className="preview-wrapper">
                <img src={preview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="btn-clear-image"
                  onClick={() => {
                    setPreview("");
                    setFormData((prev) => ({ ...prev, photo: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateMessagePage;
