import { useEffect, useState } from "react";
import {
  downloadExcelFile,
  GetUserassessment,
  UserSummary,
} from "../../../../services/https/dashboardcontents";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileSearch2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";

const PROFILE_BASE_URL = import.meta.env.VITE_PF_URL;

function TableUseAsses() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const navigate = useNavigate();
  async function fetchDataUser() {
    const res = await GetUserassessment();
    setUsers(res);

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
              const role = localStorage.getItem("role");
              const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
              navigate(`/${rolePrefix}/dashboard/contents/summary/user/${row.original.id}`);
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
    getPaginationRowModel: getPaginationRowModel(),
        initialState: {
          pagination: {
            pageSize: 10,
          },
        },
  });

  const handleClick = () => {
    downloadExcelFile();
  };

  return (
    <div className="bg-white p-6 rounded-2xl w-full shadow-sm font-ibmthai">
      <div className="flex justify-between m-2">
        <div className="text-[#3D2C2C] text-xl font-semibold">
          รายการผู้ที่ทําแบบสอบถาม
        </div>
      <Tooltip title="ดาวน์โหลดข้อมูล" color="#5DE2FF">
          <Download className="text-gray-400 hover:text-gray-700 duration-300 transition-colors cursor-pointer" size={25} onClick={handleClick}/>
        </Tooltip>
        
      </div>
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

          {table.getFilteredRowModel().rows.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                  </div>
                )}
        
                  {/* Pagination */}
                  <div className="bg-white px-4 py-3 flex items-center justify-between sm:px-6 rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className=" relative inline-flex items-center px-4 py-2  text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="ml-3 relative inline-flex items-center px-4 py-2  text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          หน้า{" "}
                          <span className="font-medium">
                            {table.getState().pagination.pageIndex + 1}
                          </span>{" "}
                          จาก{" "}
                          <span className="font-medium">{table.getPageCount()}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                          className="px-2 py-1  rounded text-sm disabled:opacity-50 
                          hover:bg-background-button hover:text-blue-word hover:border-blue-word
                          transition-colors duration-500"
                        >
                          <ChevronsLeft size={20}/>
                        </button>
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="px-2 py-1 rounded text-sm disabled:opacity-50 
                          hover:bg-background-button hover:text-blue-word hover:border-blue-word
                          transition-colors duration-500"
                        >
                          <ChevronLeft size={20}/>
                        </button>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="px-2 py-1 rounded text-sm disabled:opacity-50 
                          hover:bg-background-button hover:text-blue-word hover:border-blue-word
                          transition-colors duration-500"
                        >
                          <ChevronRight size={20}/>
                        </button>
                        <button
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                          className="px-2 py-1 text-sm disabled:opacity-50 
                          hover:bg-background-button hover:text-blue-word hover:border-blue-word
                          transition-colors duration-500"
                        >
                          <ChevronsRight size={20}/>
                        </button>
                      </div>
                    </div>
                  </div>
      </div>
    </div>
  );
}
export default TableUseAsses;
