import axios from "axios";
import { Question } from '../../../interfaces/IQuestion';
import { AnswerOption } from '../../../interfaces/IAnswerOption';
import { QuestionnaireGroup } from '../../../interfaces/IQuestionnaireGroup';
import { AssessmentAnswer } from '../../../interfaces/IAssessmentAnswer';
import { ITransaction } from "../../../interfaces/ITransaction";
import type { Questionnaire } from "../../../interfaces/IQuestionnaire";
import { EmotionChoice } from "../../../interfaces/IEmotionChoices";


// ✅ Inline axiosInstance พร้อมแนบ token
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // แก้เป็น env ก็ได้ถ้ามี .env.local
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



//User
// ดึงแบบสอบถามตาม ID
export const getQuestionnaireByID = async (id: number): Promise<Questionnaire> => {
  const res = await axiosInstance.get(`/assessment/Questionnaires/${id}`);
  return res.data as Questionnaire;
};

// ฟังก์ชัน: ดึงคำถามทั้งหมด
export const fetchQuestions = async (): Promise<Question[]> => {
  const res = await axiosInstance.get("/assessment/Questions");
  return res.data;
};

// ฟังก์ชัน: ดึงคำตอบทั้งหมด
export const fetchAnswerOptions = async (): Promise<AnswerOption[]> => {
  const res = await axiosInstance.get("/assessment/AnswerOptions");
  return res.data;
};

// ฟังก์ชัน: ส่งคำตอบ
export const submitAnswer = async (
  answer: AssessmentAnswer
): Promise<void> => {
  await axiosInstance.post("/assessment/answer", {
    arid: answer.arid,
    qid: answer.qid,
    aoid: answer.answerOptionID,
    point: answer.point,
    question_number: answer.question_number, // ✅ ต้องใช้แบบนี้
  });
};

// ✅ ฟังก์ชันใหม่: สรุปผล
export const finishAssessment = async (ARID: number): Promise<any> => {
  const res = await axiosInstance.post(`/assessment/finish/${ARID}`);
  return res.data.transaction; // ✅ ส่งกลับเฉพาะ transaction
};

// ฟังก์ชัน: สร้างผลการประเมิน
export const createAssessmentResult = async (
  quID: number,
  uid: number,
  qgID?: number
): Promise<number> => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const payload: any = { QuID: quID, UID: uid, Date: today };
  if (typeof qgID === "number") payload.QGID = qgID;

  const res = await axiosInstance.post("/assessment/result", payload);

  // รองรับกรณี backend ส่ง { ID } หรือส่ง object เต็ม { ID, Date, ... }
  const id =
    res.data?.ID ?? res.data?.id ?? res.data?.Id ?? res.data?.data?.ID;
  if (!id) {
    // เผื่อ backend เปลี่ยนรูปแบบในอนาคต
    throw new Error("Cannot read created AssessmentResult ID from response");
  }
  return Number(id);
};

// ฟังก์ชัน: ดึงกลุ่มแบบสอบถามทั้งหมด
export const getAllQuestionnaireGroups = async (): Promise<QuestionnaireGroup[]> => {
  try {
    const res = await axiosInstance.get("/questionnaire-groups");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch questionnaire groups", error);
    return [];
  }
};

// ฟังก์ชัน: ดึงเกณฑ์ทั้งหมด
export const getAllCriteria = async (): Promise<any[]> => {
  try {
    const res = await axiosInstance.get("/assessment/Criteria");
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch criteria", err);
    return [];
  }
};


// ฟังก์ชัน: ดึงรายการธุรกรรมทั้งหมด
export async function getAllTransactions(): Promise<ITransaction[]> {
  try {
    const res = await axiosInstance.get("/assessment/Transaction");
    return res.data as ITransaction[];
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    throw err;
  }
}

// ฟังก์ชัน: ดึงธุรกรรมตาม ID
export const getTransactionByID = async (id: number): Promise<any> => {
  const res = await axiosInstance.get(`/assessment/Transaction/${id}`);
  return res.data;
};

export const getAvailableGroupsAndNext = async (
  uid: number,
  trigger: "" | "onLogin" | "afterChat" | "interval",
  lastQid?: number
) => {
  // สร้าง params อย่างเป็นระเบียบ
  const params: Record<string, string> = {
    user_id: String(uid),
  };
  if (trigger) params.trigger_context = trigger;
  if (typeof lastQid === "number" && !Number.isNaN(lastQid)) {
    params.last_quid = String(lastQid);
  }

  // ไม่ต้องแนบ header token เอง — interceptor ทำให้แล้ว
  const { data } = await axiosInstance.get("/assessments/available-next", {
    params,
    // withCredentials: true, // ← ถ้าเซ็ต global ใน axiosInstance แล้ว ตัดบรรทัดนี้ทิ้งได้
  });

  return data;
};

// ดึง EmotionChoice ทั้งหมด
export const getAllEmotionChoices = async (): Promise<EmotionChoice[]> => {
  try {
    const res = await axiosInstance.get("/assessment/getallemotionchoices");

    // เผื่อ backend ส่งมาเป็น ID/Picture ตัวใหญ่
    const data: EmotionChoice[] = res.data.map((e: any) => ({
      id: e.id ?? e.ID,
      name: e.name ?? e.Name,
      picture: e.picture ?? e.Picture,
      answerOptions: e.answerOptions ?? e.AnswerOptions ?? [],
    }));

    return data;
  } catch (err) {
    console.error("❌ Failed to fetch emotion choices:", err);
    return [];
  }
};

// ✅ ดึงของ user ตาม id ที่ส่งมา
export async function getUserTransactions(userId: number): Promise<ITransaction[]> {
  if (!userId || Number.isNaN(userId)) {
    throw new Error("getUserTransactions: invalid userId");
  }
  try {
    const res = await axiosInstance.get("/assessments/transactions", {
      params: { user_id: userId },
    });
    return res.data as ITransaction[];
  } catch (err) {
    console.error("❌ Error fetching user transactions:", err);
    throw err;
  }
}

// ✅ ดึงของ user ปัจจุบัน (อ่านจาก localStorage) — สะดวกเรียกในหน้า Dashboard
export async function getMyTransactions(): Promise<ITransaction[]> {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const uid = Number(user?.id || localStorage.getItem("id"));
  return getUserTransactions(uid);
}


////////////////////////////////////////////Admin Finished//////////////////////////////////////////////////////////////////////////
export const getQuestionnaireGroupByID = async (id: number) => {
  try {
    const res = await axiosInstance.get(`/admin/questionnaire-groups/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch questionnaire group", error);
    return null;
  }
};

export const getAvailableQuestionnairesForGroup = async (groupID: number): Promise<{ id: number; name: string }[]> => {
  const res = await axiosInstance.get(`/admin/questionnaire-groups/${groupID}/available-questionnaires`);
  return res.data;
};

// services/https/assessment/index.ts
export type AddToGroupResponse = {
  message?: string;
  message_th?: string;
  added_ids?: { id: number; role: "parent" | "child" }[];
};

export const addQuestionnaireToGroup = async (
  groupID: number,
  questionnaireID: number
): Promise<AddToGroupResponse> => {
  const res = await axiosInstance.post(
    `/admin/questionnaire-groups/${groupID}/add-questionnaire`,
    { questionnaire_id: questionnaireID }
  );
  return res.data as AddToGroupResponse;
};

export const removeQuestionnaireFromGroup = async (groupID: number, questionnaireID: number): Promise<void> => {
  await axiosInstance.delete(`/admin/questionnaire-groups/${groupID}/remove-questionnaire/${questionnaireID}`);
};

export const updateQuestionnaireGroupOrder = async (
  groupId: number,
  orderedIds: number[]
): Promise<void> => {
  try {
    await axiosInstance.put(`/admin/questionnaire-groups/${groupId}/order`, {
      questionnaire_ids: orderedIds, // ✅ แก้ตรงนี้ให้ตรงกับ backend
    });
  } catch (error) {
    console.error("❌ Failed to update questionnaire order:", error);
    throw error;
  }
};

export const updateGroupFrequency = async (
  groupId: number,
  frequencyDays: number | null
): Promise<any> => {
  const body = {
    frequency_days: frequencyDays === null ? null : frequencyDays,
  };

  const res = await axiosInstance.patch(
    `/admin/questionnaire-groups/${groupId}/frequency`,
    body
  );

  return res.data;
};

