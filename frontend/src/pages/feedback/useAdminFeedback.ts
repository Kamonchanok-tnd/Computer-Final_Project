import { useEffect, useState } from "react";
import { getAdminFeedbackOverview,getAdminFeedbackUserReport } from "../../services/https/feedback/feedback";
import { IAdminOverviewResponse,IUserReportResponse } from "../../interfaces/IAdminFeedback";

export function useAdminOverview(period: string) {
  const [data, setData] = useState<IAdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
   
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await getAdminFeedbackOverview(period);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "โหลดภาพรวมไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [period]);

  return { data, loading, err };
}

export function useAdminUserReport(uid: number, from?: string, to?: string) {
  const [data, setData] = useState<IUserReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await getAdminFeedbackUserReport(uid, { from, to });
        if (alive) setData(res);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "โหลดรายงานผู้ใช้ไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [uid, from, to]);

  return { data, loading, err };
}
