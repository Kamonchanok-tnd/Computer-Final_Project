import { Questionnaire } from "../../../interfaces/IQuestionnaire";
import { Question } from "../../../interfaces/IQuestion";
import { AnswerOption } from "../../../interfaces/IAnswerOption";



const apiUrl = "http://localhost:8000";

// ✅ ฟังก์ชันสำหรับดึงแบบทดสอบทั้งหมด
export const getAllQuestionnaires = async (): Promise<Questionnaire[]> => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${apiUrl}/questionnaires`, {
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

        // แปลงชื่อฟิลด์ให้ตรงกับ frontend
        const data: Questionnaire[] = rawData.map((q: any) => ({
            id: q.ID,
            nameQuestionnaire: q.NameQuestionnaire,
            description: q.Description,
            quantity: q.Quantity,
            uid: q.UID,
        }));

        return data;
    } catch (error) {
        console.error("Error fetching questionnaires:", error);
        return [];
    }
};


// ✅ ฟังก์ชันสำหรับดึงคำถามทั้งหมด
export const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const token = localStorage.getItem("token"); // ดึง token ที่เก็บไว้หลัง login

    const response = await fetch(`${apiUrl}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // แนบ token
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const rawData = await response.json();

    // แปลงข้อมูลดิบให้ตรงกับ interface ของ Frontend
    const data: Question[] = rawData.map((q: any) => ({
      id: q.id,
      nameQuestion: q.nameQuestion,
      quID: q.quID,
      questionnaire: q.questionnaire, // กรณี preload มาด้วย
    }));

    return data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};


//  ✅ ฟังก์ชันสำหรับสร้างแบบทดสอบ
export const createQuestionnaire = async (questionnaireData: Questionnaire) => {
  try {
    const response = await fetch(`${apiUrl}/createQuestionnaires`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(questionnaireData),
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const resJson = await response.json();
    return resJson; // สำคัญ ต้อง return json ที่มี id
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    throw error;
  }
};



// ✅ ฟังก์ชันสำหรับสร้างคำถามตัวเลือกของคำถาม
export interface QuestionWithAnswers {
  question: Question;
  answers: AnswerOption[];
}


export const createQuestions = async (questions: QuestionWithAnswers[]) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/createQuestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(questions), // ✅ priority จะถูกส่งมาด้วย
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return response.json();
};


// ✅ ฟังก์ชันสำหรับดึงผู้ใช้งานทั้งหมด
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/users`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });
  if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
  return await response.json();
};


// ✅ ฟังก์ชันสำหรับลบแบบทดสอบ (พร้อมคำถามทั้งหมด)
export const deleteQuestionnaire = async (id: number) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/deletequestionnaire/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error("ไม่สามารถลบแบบทดสอบได้");
  }

  return await response.json();
};


// ✅ ฟังก์ชันสำหรับลบคำถามเเละคำตอบ พร้อมอัพเดตค่าจำนวนข้อ
export const deleteQuestion = async (id: number) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${apiUrl}/deletequestion/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "ไม่สามารถลบคำถามได้");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "เกิดข้อผิดพลาดในการลบคำถาม");
  }
};

// ✅ ฟังก์ชันสำหรับลบคำตอบ
export const deleteAnswer = async (
  id: number
): Promise<any> => {
  const apiUrl = "YOUR_API_URL"; // เปลี่ยนเป็น URL ของคุณ
  try {
    const response = await fetch(`${apiUrl}/deleteanswer/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "ไม่สามารถลบคำตอบได้");
    }

    return await response.json(); // สามารถคืนค่าผลลัพธ์ที่คุณต้องการจาก backend ได้
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบคำตอบ", error);
    throw new Error("เกิดข้อผิดพลาดในการลบคำตอบ");
  }
};




// ✅ ฟังก์ชันสำหรับดึงแบบทดสอบพร้อมคำถามและตัวเลือก
export const getQuestionnaireById = async (id: number): Promise<Questionnaire> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/getquestionnaire/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Server Response:", response.status, errText);
      throw new Error(`Error: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("📦 rawData จาก backend:", rawData);

    // ✅ แปลงข้อมูลจาก backend ให้ตรงกับ interface
    const questionnaire: Questionnaire = {
      id: rawData.ID,
      nameQuestionnaire: rawData.NameQuestionnaire,
      description: rawData.Description,
      quantity: rawData.Quantity,
      uid: rawData.UID,
      questions: (rawData.Questions ?? []).map((q: any) => ({
        id: q.ID,
        nameQuestion: q.nameQuestion,          // ✅ ชื่อ field เป็นตัวเล็ก
        quID: q.quID,
        priority: q.priority,
        answers: (q.answerOptions ?? []).map((a: any) => ({  // ✅ ต้องใช้ตัวเล็ก
          id: a.ID,
          description: a.description,
          point: a.point,
        })),
      })),
    };

    return questionnaire;
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    throw error;
  }
};


// ✅ ฟังก์ชันสำหรับอัปเดตแบบทดสอบพร้อมคำถามและตัวเลือก
export const updateQuestionnaire = async (id: number, data: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/updatequestionnaire/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating questionnaire: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    throw error;
  }
};




