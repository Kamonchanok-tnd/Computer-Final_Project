import { useEffect, useState } from "react";
import {
  GetUserassessment,
  UserSummary,
} from "../../../../services/https/dashboardcontents";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FileSearch2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROFILE_BASE_URL = import.meta.env.VITE_PF_URL;

function TableUseAsses() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const navigate = useNavigate();
  async function fetchDataUser() {
    const res = await GetUserassessment();
    setUsers(res);
    console.log("user data is: ", res);
  }

  useEffect(() => {
    fetchDataUser();
  }, []);

  const columns: ColumnDef<UserSummary>[] = [
    { header: "#", cell: ({ row }) => row.index + 1 },
    {
        header: "รูปโปรไฟล์",
        cell: ({ row }) => (
          <img
            src={`${PROFILE_BASE_URL}${row.original.avatar}`}
            alt={row.original.username}
            className="w-10 h-10 rounded-full object-cover "
          />
        ),
      },
    {
      header: "ผู้ทำแบบสอบถาม",
      accessorKey: "username",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "เพศ",
      accessorKey: "gender",
    },
    {
        header: "ดูเพิ่มเติม",
        cell: ({ row }) => (
          <button
            className="text-[#7CEDC6] hover:text-[#6ed3af] duration-300 transition-colors cursor-pointer"
            onClick={() => {
              navigate(`/admin/dashboard/contents/summary/user/${row.original.id}`);
            }}
          >
            <FileSearch2 size={25} />
          </button>
        ),
      }
   
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white p-6 rounded-2xl w-full shadow-sm font-ibmthai">
      <div className="overflow-y-auto max-h-[400px] scrollbar-hide lg:rounded-lg">
        <table className="min-w-full bg-white dark:bg-background-dark font-ibmthai">
          <thead className="bg-[#DBFFFF] dark:bg-background-dark sticky top-0 z-10 font-ibmthai">
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
  );
}
export default TableUseAsses;
