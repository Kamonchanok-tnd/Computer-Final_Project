import { Button, Dropdown, MenuProps, message, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { getSoundsByTypeID } from "../../../services/https/sounds";
import { Mic, Plus, Search } from "lucide-react";

// const { Title, Text } = Typography;

const categories = [
  { id: 3, key: "chanting", label: "สวดมนต์" },
  { id: 2, key: "meditation", label: "สมาธิ" },
  { id: 4, key: "breathing", label: "ฝึกหายใจ" },
  { id: 1, key: "asmr", label: "ASMR" },
];

const items: MenuProps["items"] = [
  {
    key: "1",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.antgroup.com"
      >
        1st menu item
      </a>
    ),
  },
  {
    key: "2",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.aliyun.com"
      >
        2nd menu item
      </a>
    ),
  },
  {
    key: "3",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.luohanacademy.com"
      >
        3rd menu item
      </a>
    ),
  },
];

interface Sound {
  id: number;
  Name: string;
  category: string;
  Sound: string; // URL ของวิดีโอ
  Lyric: string;
}
function ListSound() {
  const [soundsByCategory, setSoundsByCategory] = useState<
    Record<number, Sound[]>
  >({});
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
    <>
      <div className="min-h-screen border px-8 pt-6">
        {/* header */}
        <div className="flex justify-between">
          <h1 className="text-2xl">การจัดการเสียง</h1>
          <button className="bg-button-blue text-white py-1 px-2 rounded mr-4">
            <div className="flex gap-2">
              <Plus />
              <span>สร้าง</span>
            </div>
          </button>
        </div>
        {/* search + filter */}
        <div className="bg-white p-4 rounded-md mt-4">
          <div>
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <div className="flex gap-2 ">
                   <div className="relative gap-2">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  // value={searchTerm}
                  // onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[700px] pl-10 pr-4 py-2 bg-[#FAFAFA] rounded-lg "
                />
              </div>
              <div className="flex gap-2">
                <button className="bg-button-blue hover:bg-cyan-500 text-white px-4 py-2 rounded-md transition-colors">
                  ค้นหา
                </button>
              </div> 
                </div>
              
              <div className="flex gap-2 items-center">
                <div>
                <Dropdown menu={{ items }} placement="bottomLeft">
                  <button className="bg-transparent border border-[#D9D9D9] px-4 py-2 rounded-md">bottomLeft</button>
                </Dropdown>
              </div>
              <div className="">
                <Dropdown menu={{ items }} placement="bottomLeft">
                  <button className="bg-transparent border border-[#D9D9D9]  px-4 py-2 rounded-md">bottomLeft

                  </button>
                </Dropdown>
              </div>
              </div>
              
            </div>
          </div>


          {/* table */}
          
        </div>
      </div>
    </>
  );
}
export default ListSound;
