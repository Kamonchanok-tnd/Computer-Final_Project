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
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/createQuestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify(questions), // ✅ ส่ง array ทั้งชุด
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating questions:", error);
    throw error;
  }
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


// ✅ ฟังก์ชันสำหรับอัพเดตเเบบทดสอบ
export const updateQuestionnaire = async (data: any) => {
  const token = localStorage.getItem("token");
  if (!data?.id) throw new Error("Missing questionnaire ID");

  const response = await fetch(`${apiUrl}/updatequestionnaire/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify({
      nameQuestionnaire: data.nameQuestionnaire,
      description: data.description,
      quantity: data.quantity,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update failed:", errorText);
    throw new Error("Update failed");
  }

  return await response.json();
};

// ✅ ฟังก์ชันสำหรับอัพเดตคำถาม
export const updateQuestion = async (id: number, nameQuestion: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/updatequestion/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify({ nameQuestion }), // ✅ ส่งเฉพาะชื่อคำถาม
  });

  if (!response.ok) {
    throw new Error("ไม่สามารถแก้ไขคำถามได้");
  }

  return await response.json();
};
