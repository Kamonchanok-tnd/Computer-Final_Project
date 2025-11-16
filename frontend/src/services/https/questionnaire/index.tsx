import { Questionnaire } from "../../../interfaces/IQuestionnaire";
import { Question } from "../../../interfaces/IQuestion";
import { AnswerOption } from "../../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../../interfaces/IEmotionChoices";
import { Criteria } from "../../../interfaces/ICriteria";
// const apiUrl = "http://localhost:8003";
const apiUrl = import.meta.env.VITE_API_URL as string;

// ฟังก์ชันสำหรับดึงแบบทดสอบทั้งหมด
export const getAllQuestionnaires = async (): Promise<Questionnaire[]> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${apiUrl}/questionnaires`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`Error: ${res.status}`);

    const body = await res.json();
    // เผื่อมีรูปแบบ { data: [...] } หรือเป็น array ตรง ๆ
    const rawList: any[] = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : []);

    const data: Questionnaire[] = rawList.map((q: any) => ({
      id: q.id ?? q.ID,
      nameQuestionnaire: q.nameQuestionnaire ?? q.NameQuestionnaire ?? "",
      description: q.description ?? q.Description ?? "",
      quantity: Number(q.quantity ?? q.Quantity ?? 0),
      uid: q.uid ?? q.UID ?? 0,
      // ใส่ฟิลด์อื่น ๆ ถ้าต้องใช้ต่อ
      priority: q.priority ?? q.Priority,
      testType: q.testType ?? q.TestType,
      conditionOnID: q.conditionOnID ?? q.ConditionOnID,
      conditionScore: q.conditionScore ?? q.ConditionScore,
      conditionType: q.conditionType ?? q.ConditionType,
      picture: q.picture ?? q.Picture,
      questions: q.questions ?? q.Questions ?? [],
      groups: q.groups ?? q.Groups ?? [],
    }));

    return data;
  } catch (err) {
    console.error("Error fetching questionnaires:", err);
    return [];
  }
};


// ฟังก์ชันสำหรับดึงตัวเลือกอารมณ์ทั้งหมด
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
            name: e.name, //  ใช้ตัวเล็กให้ตรงกับ JSON
            picture: e.picture, //  ใช้ตัวเล็กให้ตรงกับ JSON
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

// สร้างคำถามพร้อมคำตอบ
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

// ฟังก์ชันสำหรับสร้างเกณฑ์การให้คะแนน
export const createCriteria = async (
  criteriaList: Array<{ description: string; minScore: number; maxScore: number }>,questionnaireId: number): Promise<any> => {
  try {
    const response = await fetch(`${apiUrl}/createCriterias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        questionnaireId,
        criterias: criteriaList
      }), // ส่งทั้ง questionnaireId และ criterias
    });

    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const resJson = await response.json();
    return resJson; // ส่งข้อมูลที่ได้กลับ
  } catch (error) {
    console.error("Error creating criterias:", error);
    throw error;
  }
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


// ฟังก์ชันสำหรับดึงแบบทดสอบตาม ID
export const getQuestionnaireById = async (id: number): Promise<Questionnaire> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${apiUrl}/getquestionnaire/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(" Server Response:", res.status, errText);
      throw new Error(`Error: ${res.status}`);
    }

    const raw = await res.json();

    // helper: รองรับทั้ง camelCase และ PascalCase จาก backend
    const pick = (o: any, camel: string, pascal: string) =>
      o?.[camel] ?? o?.[pascal];

    const questionnaire: Questionnaire = {
      id: pick(raw, "id", "ID"),
      nameQuestionnaire: pick(raw, "nameQuestionnaire", "NameQuestionnaire"),
      description: pick(raw, "description", "Description"),
      quantity: pick(raw, "quantity", "Quantity"),
      uid: pick(raw, "uid", "UID"),
      priority: pick(raw, "priority", "Priority") ?? 0,
      testType: pick(raw, "testType", "TestType") ?? null,
      conditionOnID: pick(raw, "conditionOnID", "ConditionOnID") ?? null,
      conditionScore: pick(raw, "conditionScore", "ConditionScore") ?? null,
      conditionType: pick(raw, "conditionType", "ConditionType") ?? null,
      picture: pick(raw, "picture", "Picture") ?? null,

      //  ไม่แมป Questions/Answers
      questions: [],   // ถ้า type บังคับ ให้คงเป็น [] ไว้พอ
      groups: [],      // เช่นเดียวกัน
    };

    return questionnaire;
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    throw error;
  }
};


// ฟังก์ชันสำหรับอัปเดตแบบทดสอบ
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


// ฟังก์ชันสำหรับดึงคำถามพร้อมคำตอบตามไอดีแบบทดสอบ
export interface QAItem {
  question: Question;        // ถ้า IQuestion ของคุณมี priority อยู่แล้วจะยิ่งพอดี
  answers: AnswerOption[];
}

// ดึงคำถามพร้อมคำตอบตามไอดีแบบทดสอบ
export const getQuestionsWithAnswersByQuestionnaireID = async (
  id: number
): Promise<QAItem[]> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${apiUrl}/getquestionandanswerbyquestionnaireid/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(" Server Response:", res.status, errText);
      throw new Error(`Error: ${res.status}`);
    }

    const raw = await res.json();

    // helper: รองรับทั้ง camelCase และ PascalCase จาก backend
    const pick = (o: any, camel: string, pascal: string) =>
      o?.[camel] ?? o?.[pascal];

    // list ของรายการคำถาม+คำตอบ
    const list: any[] =
      Array.isArray(raw)
        ? raw
        : pick(raw, "questions", "Questions") ??
          pick(raw, "data", "Data") ??
          pick(raw, "items", "Items") ??
          [];

    // --- mappers ---
    const toQuestion = (q: any): Question => {
      const qq: any = {
        id: pick(q, "id", "ID") ?? 0,
        nameQuestion:
          pick(q, "nameQuestion", "NameQuestion") ??
          q?.name_question ??
          "",
        quID:
          pick(q, "quID", "QuID") ??
          q?.quid ??
          id,
        picture: pick(q, "picture", "Picture") ?? null,
      };

      // ถ้า backend ส่ง priority มา และ IQuestion ยังไม่มี field นี้
      // จะใส่ให้แบบหลวม ๆ เพื่อให้หน้า UI ใช้งานได้
      const pr = pick(q, "priority", "Priority");
      if (pr !== undefined) qq.priority = Number(pr) || 0;

      return qq as Question;
    };

    const toAnswer = (a: any): AnswerOption => ({
      id: pick(a, "id", "ID") ?? 0,
      description: pick(a, "description", "Description") ?? "",
      point: Number(pick(a, "point", "Point") ?? 0) || 0,
      qid: pick(a, "qid", "QID"),
      EmotionChoiceID:
        Number(
          pick(a, "EmotionChoiceID", "EmotionChoiceID") ??
            a?.emotionChoiceID ??
            a?.emotion_choice_id ??
            0
        ) || 0,
    });

    // normalize เป็น { question, answers }[]
    const items: QAItem[] = list.map((item: any, idx: number) => {
      const qRaw = item?.question ?? item;
      const ansRaw =
        item?.answers ??
        pick(item, "answerOptions", "AnswerOptions") ??
        [];

      const question = toQuestion(qRaw);
      // กรณีไม่มี priority เลย ให้กำหนดจากลำดับ
      if ((question as any).priority == null) {
        (question as any).priority = idx + 1;
      }

      const answers: AnswerOption[] = Array.isArray(ansRaw)
        ? ansRaw.map(toAnswer)
        : [];

      return { question, answers };
    });

    // เรียงตาม priority ถ้ามี และทำให้ต่อเนื่อง 1..n
    items.sort(
      (a, b) =>
        (Number((a.question as any).priority) || 0) -
        (Number((b.question as any).priority) || 0)
    );
    items.forEach((it, i) => ((it.question as any).priority = i + 1));

    return items;
  } catch (error) {
    console.error("Error fetching questions+answers:", error);
    throw error;
  }
};




export interface UpdateAnswerDto {
  id?: number | null;
  description: string;
  point: number;
  EmotionChoiceID: number;
}

export interface UpdateQuestionDto {
  id?: number | null;
  nameQuestion: string;
  quID: number;
  priority: number;
  picture?: string | null;
}

export interface UpdateQAItem {
  question: UpdateQuestionDto;
  answers: UpdateAnswerDto[];
}

// ฟังก์ชันสำหรับอัปเดตคำถามพร้อมคำตอบ
export const updateQuestionAndAnswer = async (
  id: number,
  data: UpdateQAItem[]
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/updatequestionandanswer/${id}`, {
      method: "PATCH", // ถ้า backend ใช้ PATCH ให้เปลี่ยนเป็น "PATCH"
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(" Server Response:", response.status, errText);
      throw new Error(
        `Error updating Q&A: ${response.status} ${response.statusText}`
      );
    }

    // ถ้า backend มี body ส่งกลับ
    const resJson = await response.json().catch(() => ({}));
    return resJson;
  } catch (error) {
    console.error("Error updating Q&A:", error);
    throw error;
  }
};



// ฟังก์ชันสำหรับดึงเกณฑ์การให้คะแนนตามไอดีแบบทดสอบ
export const getAllCriteriaByQuestionnaireId = async (id: number): Promise<Criteria[]> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/getallcriteria/by-questionnaire/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching criteria: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data; // หรือเปลี่ยนตามโครงสร้าง response backend
  } catch (error) {
    console.error("Error fetching criteria:", error);
    throw error;
  }
};


// ฟังก์ชันสำหรับอัปเดตเกณฑ์การให้คะแนนตามไอดีแบบทดสอบ
export const updateCriteriaByQuestionnaireId = async (
  id: number,
  body: {
    updated: Array<{ id?: number; description: string; minScore: number; maxScore: number }>;
    deleted: number[];
  }
) => {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${apiUrl}/updatecriteria/by-questionnaire/${id}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    const msg = json?.error || json?.message || res.statusText;
    throw new Error(msg);
  }
  return json; // { message: "..."} ตามฝั่ง BE
};
















