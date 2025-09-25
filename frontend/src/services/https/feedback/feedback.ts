import api from "../../../interceptors/axios";
import { IAdminOverviewResponse, IUserReportResponse } from "../../../interfaces/IAdminFeedback";
import {
  FeedbackFormResponse,
  SaveFormPayload,
  MessageOnly,
} from "../../../interfaces/IFeedbackForm";
import { SubmitFeedbackPayload } from "../../../interfaces/IFeedbackUser";

export async function getFeedbackForm(): Promise<FeedbackFormResponse> {
  const res = await api.get<FeedbackFormResponse>("/admin/feedback-form");
  return res.data;
}
export async function saveFeedbackForm(payload: SaveFormPayload): Promise<MessageOnly> {
  const res = await api.put<MessageOnly>("/admin/feedback-form", payload);
  return res.data;
}

export async function getUserFeedbackForm(): Promise<FeedbackFormResponse> {
  const res = await api.get<FeedbackFormResponse>("/admin/feedback-form");
  return res.data;
}

// ส่งผลการประเมินของผู้ใช้
export async function submitUserFeedback(
  payload: SubmitFeedbackPayload
): Promise<MessageOnly> {
  const res = await api.post<MessageOnly>("/feedback/submit", payload);
  return res.data;
}


export async function getAdminFeedbackOverview(
  period: string,
  limit = 5,
  offset = 0
): Promise<IAdminOverviewResponse> {
  const { data } = await api.get<IAdminOverviewResponse>("/admin/feedback/overview", {
    params: { period, limit, offset },
  });
  return data;
}

export async function getAdminFeedbackUserReport(
  uid: string | number,
  opts?: { from?: string; to?: string }
): Promise<IUserReportResponse> {
  const { from, to } = opts ?? {};
  const { data } = await api.get<IUserReportResponse>(
    `/admin/feedback/users/${encodeURIComponent(String(uid))}`,
    { params: { from, to } }
  );
  return data;
}
