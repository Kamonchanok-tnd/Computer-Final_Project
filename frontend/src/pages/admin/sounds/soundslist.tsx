import React, { useEffect, useState } from "react";
import { Card, Button, Typography, Row, Col, Space, Spin, message, Modal, Popconfirm } from "antd";
import { PlayCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import "./soundlist.css";

import { getSoundsByTypeID } from "../../../services/https/sounds";

const { Title, Text } = Typography;

const categories = [
  { id: 3, key: "chanting", label: "สวดมนต์" },
  { id: 2, key: "meditation", label: "สมาธิ" },
  { id: 4, key: "breathing", label: "ฝึกหายใจ" },
  { id: 1, key: "asmr", label: "ASMR" },
];

interface Sound {
  id: number;
  Name: string;
  category: string;
  Sound: string; // URL ของวิดีโอ
  Lyric: string;
}

const SoundListPage: React.FC = () => {
  const [soundsByCategory, setSoundsByCategory] = useState<Record<number, Sound[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [playingSoundUrl, setPlayingSoundUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSounds();
  }, []);

  async function fetchSounds() {
    setLoading(true);
    try {
      const results: Record<number, Sound[]> = {};
      for (const cat of categories) {
        const data = await getSoundsByTypeID(cat.id);
        results[cat.id] = data.sounds || [];
      }
      setSoundsByCategory(results);
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเสียง");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ฟังก์ชันแปลง URL YouTube ให้ embed ได้
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) {
      console.warn("YouTube URL is undefined or empty");
      return null;
    }
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    } else {
      console.warn("ไม่สามารถดึง YouTube video ID จาก URL:", url);
      return null;
    }
  };

  // ฟังก์ชันลบเพลง (สมมติว่ามี API deleteSoundByID)
  async function handleDeleteSound(catId: number, soundId: number) {
    try {
      // เรียก API ลบเสียงที่นี่ เช่น await deleteSoundByID(soundId);
      // ตัวอย่างสมมติลบสำเร็จ:
      message.success("ลบเพลงสำเร็จ");
      // อัพเดต state หลังลบสำเร็จ
      setSoundsByCategory((prev) => {
        const newList = prev[catId].filter((s) => s.id !== soundId);
        return { ...prev, [catId]: newList };
      });
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบเพลง");
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="sound-list-container">
      <Title level={2} style={{ marginBottom: 32 }}>
        🎧 หมวดเสียงทั้งหมด
      </Title>

      {categories.map((cat) => {
        const filtered = soundsByCategory[cat.id] || [];
        return (
          <div key={cat.id} className="category-section">
            <Title level={4} className="category-title">
              {cat.label}
            </Title>
            <Row gutter={[24, 24]}>
              {filtered.map((sound) => (
                <Col xs={24} sm={12} md={8} lg={6} key={sound.id}>
                  <Card hoverable className="sound-card" bodyStyle={{ padding: 0 }}>
                    <div className="sound-card-body">
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        {/* เปลี่ยนตรงนี้เป็นแนวนอน และเพิ่มปุ่มลบ */}
                        <Space
                          style={{ justifyContent: "space-between", width: "100%" }}
                          align="center"
                        >
                          <Text strong>{sound.Name}</Text>

                          <Popconfirm
                            title="คุณแน่ใจจะลบเพลงนี้หรือไม่?"
                            onConfirm={() => handleDeleteSound(cat.id, sound.id)}
                            okText="ใช่"
                            cancelText="ไม่"
                          >
                            <Button danger icon={<DeleteOutlined />} size="small" />
                          </Popconfirm>
                        </Space>

                        <Text type="secondary">{sound.Lyric}</Text>

                        <div className="sound-play-button">
                          <Button
                            shape="circle"
                            icon={<PlayCircleOutlined />}
                            size="large"
                            type="primary"
                            onClick={() => {
                              const embedUrl = getYouTubeEmbedUrl(sound.Sound);
                              if (embedUrl) {
                                setPlayingSoundUrl(embedUrl);
                              } else {
                                message.warning("ไม่พบ URL วิดีโอที่เล่นได้");
                              }
                            }}
                          />
                        </div>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );
      })}

      <Modal
        title="Preview คลิปเสียง"
        visible={!!playingSoundUrl}
        onCancel={() => setPlayingSoundUrl(null)}
        footer={null}
        width={720}
        bodyStyle={{ padding: 0, height: "405px" }}
        destroyOnClose
      >
        {playingSoundUrl && (
          <iframe
            width="100%"
            height="100%"
            src={playingSoundUrl}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Preview Sound"
          />
        )}
      </Modal>
    </div>
  );
};

export default SoundListPage;
