import api from "../../../interceptors/axios";
import {
  FeedbackFormResponse,
  SaveFormPayload,
  MessageOnly,
} from "../../../interfaces/IFeedbackForm";

// GET /admin/feedback-form
export async function getFeedbackForm(): Promise<FeedbackFormResponse> {
  const res = await api.get<FeedbackFormResponse>("/admin/feedback-form");
  return res.data;
}

// PUT /admin/feedback-form
export async function saveFeedbackForm(payload: SaveFormPayload): Promise<MessageOnly> {
  const res = await api.put<MessageOnly>("/admin/feedback-form", payload);
  return res.data;
}
