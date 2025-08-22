import { Questionnaire } from "../../../interfaces/IQuestionnaire";
import { Question } from "../../../interfaces/IQuestion";
import { AnswerOption } from "../../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../../interfaces/IEmotionChoices";
const apiUrl = "http://localhost:8000";

// ฟังก์ชันสำหรับดึงแบบทดสอบทั้งหมด
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

// ฟังก์ชันสำหรับดึง EmotionChoice ทั้งหมด
export const getAllEmotionChoices = async (): Promise<EmotionChoice[]> => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${apiUrl}/getallemotionchoices`, {
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

        // แปลงข้อมูลให้ตรงกับรูปแบบที่ต้องการใน frontend
        const data: EmotionChoice[] = rawData.map((e: any) => ({
            id: e.ID,
            name: e.name, // ✅ ใช้ตัวเล็กให้ตรงกับ JSON
            picture: e.picture, // ✅ ใช้ตัวเล็กให้ตรงกับ JSON
            answerOptions: e.AnswerOptions,
        }));


        return data;
    } catch (error) {
        console.error("Error fetching emotion choices:", error);
        return [];
    }
};



// ฟังก์ชันสำหรับสร้างแบบทดสอบ
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



// ฟังก์ชันสำหรับสร้างคำถามตัวเลือกของคำถาม
export interface QuestionWithAnswers {
  question: Question;
  answers: AnswerOption[];
}


export const createQuestions = async (input: QuestionWithAnswers[]) => {
  const token = localStorage.getItem("token");

  const payload = input.map(({ question, answers }) => ({
    question: {
      // *** อย่าส่ง id ***
      nameQuestion: question.nameQuestion,
      quID: question.quID,
      priority: (question as any).priority,      // ถ้าหลังบ้านรองรับ
      picture: question.picture ?? null,         // ถ้ารองรับรูป
    },
    answers: answers
      .filter(a => a.description.trim() !== "")
      .map(a => ({
        // *** อย่าส่ง id ***
        description: a.description,
        point: a.point,
        EmotionChoiceID:
          a.EmotionChoiceID === 0 || a.EmotionChoiceID === undefined
            ? null
            : a.EmotionChoiceID,
      })),
  }));

  console.log("🚀 createQuestions payload =", payload);
  console.log("🧾 JSON =", JSON.stringify(payload, null, 2));

  const res = await fetch(`${apiUrl}/createQuestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
};



// ฟังก์ชันสำหรับดึงผู้ใช้งานทั้งหมด
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


// ฟังก์ชันสำหรับลบแบบทดสอบ (พร้อมคำถามทั้งหมด)
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


// ฟังก์ชันสำหรับลบคำถามเเละคำตอบ พร้อมอัพเดตค่าจำนวนข้อ
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

// ฟังก์ชันสำหรับลบคำตอบ
export const deleteAnswer = async (
  id: number
): Promise<any> => {
  try {
   
    const token = localStorage.getItem("token");
    const response = await fetch(`${apiUrl}/deleteanswer/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
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
      console.error(" Server Response:", response.status, errText);
      throw new Error(`Error: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("📦 rawData จาก backend:", rawData);

    // แปลงข้อมูลจาก backend ให้ตรงกับ interface
    const questionnaire: Questionnaire = {
      id: rawData.ID,
      nameQuestionnaire: rawData.NameQuestionnaire,
      description: rawData.Description,
      quantity: rawData.Quantity,
      uid: rawData.UID,
      testType: rawData.TestType, // Add this line to include testType
      questions: (rawData.Questions ?? []).map((q: any) => ({
        id: q.ID,
        nameQuestion: q.nameQuestion,
        quID: q.quID,
        priority: q.priority,
        picture: q.picture || null, 
        answers: (q.answerOptions ?? []).map((a: any) => ({
          id: a.ID,
          description: a.description,
          point: a.point,
        })),
      })),
      groups: []
    };

    return questionnaire;
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    throw error;
  }
};



// ฟังก์ชันสำหรับอัปเดตแบบทดสอบพร้อมคำถามและตัวเลือก
export const updateQuestionnaire = async (id: number, data: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/updatequestionnaire/${id}`, {
      method: "PATCH",
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




