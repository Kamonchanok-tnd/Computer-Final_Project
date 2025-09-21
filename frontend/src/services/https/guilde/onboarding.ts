// path: src/services/onboarding.ts
import api from "../../../interceptors/axios";

export type OnboardingMirrorStatus = { seen: boolean };

// กันโพสต์ซ้ำในหน้าเดียว
let postingSeen = false;

/** GET สถานะว่าเคยเห็นไกด์ mirror แล้วหรือยัง */
export async function getMirrorOnboarding(): Promise<OnboardingMirrorStatus> {
  const { data } = await api.get<OnboardingMirrorStatus>("/onboarding/mirror");
  return data;
}

/** POST บอกเซิร์ฟเวอร์ว่าเห็นไกด์แล้ว (idempotent) */
export async function setMirrorOnboardingSeen(): Promise<void> {
  if (postingSeen) return;
  postingSeen = true;
  try {
    await api.post("/onboarding/mirror/seen");
  } finally {
    postingSeen = false;
  }
}
