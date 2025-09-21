
import { WordHealingContent } from "../../../interfaces/IWordHealingContent";
import axios from "axios";
const apiUrl = "http://localhost:8000";

// ฟังก์ชันสำหรับดึงบทความ WordHealingMessages ทั้งหมดสำหรับแสดงใน admin
export const getAllWordHealingMessages = async (): Promise<WordHealingContent[]> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/getallwordhealingmessage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const rawData = await response.json();
    
    const data: WordHealingContent[] = rawData.map((message: any) => {
      const id = message.ID ?? message.id ?? 0;
      const dateIso = message.date
        ? new Date(message.date).toISOString()
        : "";

      return {
        id,
        name: message.name ?? "ไม่มีชื่อ",
        author: message.author ?? "ไม่ระบุ",
        content: message.content ?? "",                                   
        articleType: message.article_type ?? message.articleType ?? "",   
        photo: message.photo ?? "/default-image.png",
        no_of_like: message.no_of_like ?? 0,
        viewCount: message.view_count ?? message.viewCount ?? 0,
        date: dateIso || "ไม่มีวันที่",
        // หน้านี้ไม่ใช้ error แต่ interface บังคับ → ทำ no-op
        error: () => {},
      };
    });

    return data;
  } catch (error) {
    console.error("Error fetching word healing messages:", error);
    return [];
  }
};


// ฟังก์ชันสำหรับดึงบทความ WordHealingMessages ทั้งหมดสำหรับแสดงใน  user
export const getAllWordHealingMessagesForUser = async (): Promise<WordHealingContent[]> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/getallwordhealingmessageforuser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const rawData = await response.json();
    
    const data: WordHealingContent[] = rawData.map((m: any) => {
      // id จาก GORM อาจเป็น ID หรือ id
      const id = m.ID ?? m.id ?? 0;

      // date -> แสดงแบบ yyyy-mm-dd เพื่อความสวยงาม; หรือจะ .toLocaleDateString() ตอน render ก็ได้
      const dateStr = m.date ? new Date(m.date).toISOString().slice(0, 10) : "ไม่มีวันที่";

      // photo -> ถ้าเป็น base64 แบบไม่พรีฟิกซ์ ให้เติม data URI ให้ครบ
      let photo = m.photo ?? "/default-image.png";
      if (photo && typeof photo === "string" && photo !== "/default-image.png") {
        if (!photo.startsWith("data:")) {
          photo = `data:image/jpeg;base64,${photo}`;
        }
      }

      return {
        id,
        name: m.name ?? "ไม่มีชื่อ",
        author: m.author ?? "ไม่ระบุ",
        content: m.content ?? "",                                       
        articleType: m.article_type ?? m.articleType ?? "",              
        photo,
        no_of_like: m.no_of_like ?? 0,
        viewCount: m.view_count ?? m.viewCount ?? 0,
        date: dateStr,
        // ให้ตรงกับ interface (แม้หน้านี้จะไม่ใช้)
        error: () => {},
      };
    });

    return data;
  } catch (error) {
    console.error("Error fetching word healing messages:", error);
    return [];
  }
};


export interface ArticleTypeDTO {
  name: string;
  description: string;
}

// ฟังก์ชันสำหรับดึงประเภทบทความ (Article Types) พร้อมรายละเอียด
export const getArticleTypesDetailed = async (): Promise<ArticleTypeDTO[]> => {
  try {
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`${apiUrl}/getarticletype`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.status === 204) return [];
    if (!res.ok) throw new Error(`Error: ${res.status}`);

    const raw = await res.json();

    // คาดหวังรูปแบบ: [{ name, description }, ...]
    if (Array.isArray(raw)) {
      return raw
        .filter((x) => x && typeof x.name === "string")
        .map((x) => ({
          name: String(x.name),
          description: typeof x.description === "string" ? x.description : "",
        }));
    }

    return [];
  } catch (err) {
    console.error("Error fetching article types (detailed):", err);
    return [];
  }
};

// ฟังก์ชันสำหรับดึงประเภทบทความ (Article Types) พร้อมรายละเอียด เพื่อใช้ใน dropdown
export const getArticleTypeOptionsDetailed = async (): Promise<
  { value: string; label: React.ReactNode; raw: ArticleTypeDTO }[]
> => {
  const items = await getArticleTypesDetailed();

  // label เป็น ReactNode เพื่อโชว์ description ใน dropdown
  return items.map((it) => ({
    value: it.name, // เก็บค่า value = name
    raw: it,
    label: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 600 }}>{it.name}</span>
        {it.description ? (
          <span style={{ fontSize: 12, opacity: 0.8 }}>{it.description}</span>
        ) : null}
      </div>
    ),
  }));
};


// ฟังก์ชันสำหรับสร้างบทความ WordHealingMessage
export const createWordHealingMessage = async (formData: FormData): Promise<boolean> => {
    try {
        const token = localStorage.getItem("token");  // รับ token จาก localStorage

        const response = await fetch(`${apiUrl}/createwordhealingmessage`, {
            method: "POST",
            headers: {
                // ไม่ต้องกำหนด Content-Type สำหรับ FormData เพราะมันจะถูกจัดการอัตโนมัติ
                Authorization: `Bearer ${token}`,  // ส่ง Authorization header
            },
            body: formData,  // ส่งข้อมูล FormData ที่รวมทั้งไฟล์
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();  // รับข้อมูลตอบกลับจาก API

        if (data.message) {
            return true;  // คืนค่าผลลัพธ์เป็น true หากการบันทึกสำเร็จ
        }

        return false;  // คืนค่าผลลัพธ์เป็น false ถ้ามีข้อผิดพลาด
    } catch (error) {
        console.error("Error creating word healing message:", error);  // log ข้อผิดพลาด
        return false;  // คืนค่าผลลัพธ์เป็น false หากเกิดข้อผิดพลาด
    }
};

// ฟังก์ชันสำหรับลบบทความ WordHealingMessage
export const deleteWordHealingMessage = async (id: string): Promise<boolean> => {
    try {
        const token = localStorage.getItem("token");
        const numericId = parseInt(id);  // แปลง id จาก string เป็น number

        const response = await fetch(`${apiUrl}/deletewordhealingmessage/${numericId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

//  ฟังก์ชันสำหรับอัพเดตทความ WordHealingMessage
interface UpdateWordHealingRequest {
  name: string;
  author: string;
  no_of_like: number;
  date: string;              
  photo: string | null;
  content: string;           
  article_type: string;      
}

// ฟังก์ชันสำหรับอัปเดตบทความ WordHealingMessage
export const updateWordHealingMessage = async (id: string,data: UpdateWordHealingRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/updatewordhealingmessage/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating word healing message:", error);
    return false;
  }
};


// ฟังก์ชันสำหรับดึงบทความ WordHealingMessage ตาม ID 
export const getWordHealingMessageById = async (id: string): Promise<WordHealingContent | null> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/getwordhealingmessage/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const rawData = await response.json();
    const dateIso = rawData.date ? new Date(rawData.date).toISOString().slice(0, 10) : ""; // yyyy-mm-dd for input[type=date]

    const data: WordHealingContent = {
      id: rawData.id ?? rawData.ID ?? 0,
      name: rawData.name ?? "ไม่มีชื่อ",
      author: rawData.author ?? "ไม่ระบุ",
      content: rawData.content ?? "",                              
      articleType: rawData.article_type ?? rawData.articleType ?? "", 
      photo: rawData.photo
        ? rawData.photo.startsWith("data:")
          ? rawData.photo
          : `data:image/jpeg;base64,${rawData.photo}`
        : "/default-image.png",
      no_of_like: rawData.no_of_like ?? 0,
      viewCount: rawData.view_count ?? rawData.viewCount ?? 0,
      date: dateIso || "",
      error: () => {},
    };

    return data;
  } catch (error) {
    console.error("Error fetching word healing message:", error);
    return null;
  }
};


// ฟังก์ชันสำหรับกดไลค์บทความ
export const likeMessage = async (id: number, uid: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/article/${id}/like`,
      {}, // เนื้อหาของ body เป็นอ็อบเจกต์ว่าง (เนื่องจากเราใช้ query params)
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: { uid },
      }
    );
    return response.data; // คืนค่าผลลัพธ์จาก API
  } catch (error) {
    console.error("Error liking message:", error);
    return false;
  }
};

// ฟังก์ชันสำหรับยกเลิกการกดไลค์บทความ
export const unlikeMessage = async (id: number, uid: string) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/article/${id}/like`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: { uid },
      }
    );
    return response.data; // คืนค่าผลลัพธ์จาก API
  } catch (error) {
    console.error("Error unliking message:", error);
    return false;
  }
};


// ฟังก์ชันสำหรับดึงรายการ ID ของบทความที่ user กดไลค์
export const getUserLikedMessages = async (): Promise<number[]> => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/user/likedMessages`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const likedMessages: number[] = await res.json(); // คาดว่า API ส่งกลับเป็น array ของ w_id (IDs ของบทความที่ถูกใจ)
    return likedMessages;
  } else {
    throw new Error("ไม่สามารถดึงข้อมูลการถูกใจบทความได้");
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้เคยกดไลค์บทความนี้หรือไม่
export const checkIfLikedArticle = async (id: number, uid: string) => {
  try {
    const response = await axios.get(`${apiUrl}/article/${id}/liked`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: { uid },
      
    });
    return response.data; // คืนค่าผลลัพธ์ว่าเคยไลค์หรือไม่
  } catch (error) {
    console.error("Error checking liked article:", error);
    return false;
  }
};

// ฟังก์ชันสำหรับอัปเดตจำนวนการเข้าชมบทความ
export const updateViewCount = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/updateviewcountmessage/${id}`, {
      method: "PATCH",  // ใช้ PATCH สำหรับการอัปเดต
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok; // ถ้าตอบกลับสำเร็จ จะ return true
  } catch (error) {
    console.error("Error updating view count:", error); // แสดงข้อผิดพลาดใน console
    return false; // ถ้ามีข้อผิดพลาด จะ return false
  }
};



// ===================== Views Service =====================

export interface CountViewResponse {
  ok: boolean;
  already: boolean;        // true = เคยนับไปแล้ว
  view_id: number | null;  // id แถวในตารางกลาง (บางกรณี backend อาจส่ง 0 -> คืนเป็น null)
  view_count: number;      // จำนวนวิวล่าสุดของบทความ
  wordheal_id: number;
}

export interface ViewLogRow {
  id: number;
  uid: number | null;
  username?: string;
  read_ms: number;
  pct_scrolled: number;
  created_at: string;      // "YYYY-MM-DD HH:mm:ss"
}

// services/https/message.ts
export async function countViewMessage(
  whid: number,
  opts?: { readMs?: number; pctScrolled?: number }
) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/views/count`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      whid,
      read_ms: Math.max(0, Math.round(opts?.readMs ?? 0)),
      pct_scrolled: Math.min(100, Math.max(0, Math.round(opts?.pctScrolled ?? 0))),
    }),
  });
  if (!res.ok) throw new Error("countView failed");
  return res.json();
}


/* ฟังก์ชันดึงรายการผู้ที่ถูกนับวิวของบทความ (ต้อง login) */
export const getViewsByMessage = async (whid: number): Promise<ViewLogRow[]> => {
  try {
    const token = localStorage.getItem("token") || "";

    const res = await fetch(`${apiUrl}/views/by-message/${whid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 204) return [];
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(`getViewsByMessage error: ${res.status}`);

    const raw = await res.json();

    if (!Array.isArray(raw)) return [];
    return raw.map((r: any): ViewLogRow => ({
      id: Number(r.id ?? r.ID ?? 0),
      uid:
        typeof r.uid === "number"
          ? r.uid
          : r.uid == null
          ? null
          : Number(r.uid),
      username: r.username ?? "",
      read_ms: Number(r.read_ms ?? 0),
      pct_scrolled: Number(r.pct_scrolled ?? 0),
      created_at: String(r.created_at ?? ""),
    }));
  } catch (err) {
    console.error("getViewsByMessage failed:", err);
    return [];
  }
};
