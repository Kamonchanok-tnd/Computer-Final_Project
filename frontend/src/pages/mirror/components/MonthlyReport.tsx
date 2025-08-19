// src/pages/mirror/components/MonthlyReport.tsx
import type { IMonthlySummary } from "../../../interfaces/IMonthlySummary";
import MonthlyReportTab from "./report/MonthlyReportTab";

type Props = { rows: IMonthlySummary[]; loading: boolean };

export default function MonthlyReport(props: Props) {
  return <MonthlyReportTab {...props} />;
}
