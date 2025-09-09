import { useEffect, useState } from "react";
import {
  getLatestRespondents,
  Respondent,
} from "../../../../services/https/dashboardcontents";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Spin } from "antd";
import { FileSearch2 } from "lucide-react";
import RespondentDetailModal from "./RespondentDetailModal";

function RecentUseQu() {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRespondent, setSelectedRespondent] = useState<Respondent | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const data = await getLatestRespondents(30);
        console.log("data output: ",data);
        setRespondents(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const columns: ColumnDef<Respondent>[] = [
    { header: "#", cell: ({ row }) => row.index + 1 },
    {
      header: "วันที่ทำ",
      accessorKey: "taken_at",
      cell: (info) => {
        const dateStr = info.getValue() as string;
        return new Date(dateStr).toLocaleString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    { header: "ผู้ทำแบบสอบถาม", accessorKey: "username" },
    { header: "แบบสอบถาม", accessorKey: "questionnaire_name" },
    {
      header: "คะแนน",
      accessorKey: "score",
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    { header: "ระดับผลลัพธ์", 
      accessorKey: "result" },
      
    {
      header: "ดูเพิ่มเติม",
      cell: ({ row }) => (
        <button
          className="text-[#7CEDC6] hover:text-[#6ed3af] duration-300 transition-colors cursor-pointer"
          onClick={() => {
            setSelectedRespondent(row.original);
            setModalOpen(true);
          }}
        >
          <FileSearch2 size={25} />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: respondents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white p-6 rounded-2xl w-full shadow-sm">
      <h1 className="font-ibmthai text-xl text-gray-900 mb-4">
        คําถามที่ใช้ล่าสุด
      </h1>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-background-dark/70 flex justify-center items-center z-20">
            <Spin tip="กำลังโหลด..." size="large" />
          </div>
        )}
        <div className="overflow-y-auto max-h-[400px] scrollbar-hide lg:rounded-lg">
          <table className="min-w-full bg-white dark:bg-background-dark">
            <thead className="bg-[#DBFFFF] dark:bg-background-dark sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-dark uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-background-dark divide-y divide-gray-100 dark:divide-gray-700">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-gray-500 dark:text-gray-400 py-4"
                  >
                    ไม่พบข้อมูลผู้ทำแบบสอบถามล่าสุด
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-background-dark transition-all duration-300"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-text-dark whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RespondentDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={selectedRespondent?.user_id || 0}
        description={selectedRespondent?.questionnaire_name || ""}
        surveyType={selectedRespondent?.q_type || "Standalone"}
        userName={selectedRespondent?.username || ""}
        result={selectedRespondent?.result || ""}
        assess_date={selectedRespondent?.taken_at || ""}
        tid={selectedRespondent?.id || 0}
      />
    </div>
  );
}

export default RecentUseQu;
