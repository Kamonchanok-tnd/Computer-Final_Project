import React from "react";
import { Row, Col, Button } from "antd";
import emailIcon from "../../../../assets/email.png";
import { useNavigate } from "react-router-dom";
import "./messagePage.css"; 

const MessagePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="message-page-container">
      <Row justify="space-between" align="middle" className="message-page-header">
        <Col>
          <h2 className="message-page-title">
            <img
              src={emailIcon}
              alt="email icon"
              className="message-page-icon"
            />
            จัดการบทความให้กำลังใจ
          </h2>
        </Col>
        <Col>
          <Button
            type="primary"
            className="message-create-btn"
            onClick={() => navigate("/admin/createMessagePage")}
          >
            สร้างบทความ
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default MessagePage;
