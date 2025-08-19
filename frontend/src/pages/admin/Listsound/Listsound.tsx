import {  message, Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import {
  deleteSoundByID,
  getAllSounds,

} from "../../../services/https/sounds";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,  Play, Plus, SquarePen, Trash2 } from "lucide-react";
import { Sound } from "../../../interfaces/ISound";
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import SearchFilter from "../../../components/Search/SearchFilter";
import STFilter from "../../../components/Search/Sound_type_filter";
import { useNavigate } from "react-router-dom";
// const { Title, Text } = Typography;
import music from "../../../assets/music.png";


export interface SoundList extends Sound {
  sound_type_name?: string;
}


// filter
const globalFilterFn: FilterFn<SoundList> = (row,  value) => {
  const search = value.toLowerCase();

  return (
    (row.original.name ?? "").toLowerCase().includes(search) ||
    (row.original.sound ?? "").toLowerCase().includes(search) ||
    (row.original.lyric ?? "").toLowerCase().includes(search) ||
    (row.original.owner ?? "").toLowerCase().includes(search) ||
    (row.original.description ?? "").toLowerCase().includes(search) ||
    row.original.duration?.toString().includes(search) ||
    false ||
    row.original.view?.toString().includes(search) ||
    false ||
    (row.original.sound_type_name ?? "").toLowerCase().includes(search)
  );
};

function ListSound() {
  const [loading, setLoading] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  const [AllSounds, setAllSounds] = useState<SoundList[]>([]);
  const [deletedRowIds, setDeletedRowIds] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSounds();
  }, []);

  useEffect(() => {
    
  },[AllSounds])


  //table
  const columns: ColumnDef<SoundList>[] = [
    {
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: "Preview",
      accessorKey: "sound",
      cell: (info) => {
  
        const sound = info.row.original.sound as string;
        return (
        <button className="bg-background-button h-7 w-7 rounded-full  flex justify-center items-center"
        onClick={
          () => {
            const embedUrl = getYouTubeEmbedUrl(sound);
             if (embedUrl) {
                 setPreviewVideoId(embedUrl);
             } else {
                 message.warning("ไม่พบ URL วิดีโอที่เล่นได้");
                }
          }}
        >
          <Play className="h-4 w-4 text-blue-word " />
        </button>
      )},
    },
    {
      header: "ชื่อเสียง",
      accessorKey: "name", // หรือจะไม่ใส่ก็ได้ถ้าจะใช้ข้อมูลหลายฟิลด์ใน cell
      cell: (info) => {
        const name = info.getValue() as string;
        const owner = info.row.original.owner as string;
        const sound = extractYouTubeID(info.row.original.sound as string);
        const thumbnail = `https://img.youtube.com/vi/${sound}/mqdefault.jpg`;
       
        return (
          <div className="flex gap-2 items-center w-[350px]">
            <div className="w-10 bg-background-button h-10 rounded-sm ">
              <img src={thumbnail} alt="" className="w-full h-full object-cover rounded-sm " />
            </div>
            <div>
              <h1 className="text-lg ">{name}</h1>
              <p className="text-sm text-subtitle">{owner ? owner : "ไม่ระบุ"}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "การดู",
      accessorKey: "view",
    },
    {
      header: "ถูกใจ",
      accessorKey: "like_sound",
    },
    {
      header: "หมวดหมู่",
      accessorKey: "sound_type_name",
     
      cell: (info) => {
        const stid = info.row.original.stid as number;
        return (
          <div className="w-[100px]">
            <span
              className={`
          ${
            stid === 1
              ? "bg-asmr-bg text-asmr-word "
              : stid === 2
              ? "bg-[#CDFCFE] text-[#228A8E]"
              : stid === 3
              ? "bg-pray-bg text-pray-word "
              : stid === 4
              ? "bg-blue-100 text-blue-700 "
              : "bg-blue-100 text-blue-700"
          }
         px-4 py-2 rounded-lg text-md w-[150px]`}
            >
              {info.getValue() as string}
            </span>
          </div>
        );
      },
    },
    {
      header: "เวลา",
      accessorKey: "duration",
      cell: (info) => {
        const d = info.getValue<number>();
        const min = Math.floor(d / 60);
        const sec = Math.floor(d % 60)
          .toString()
          .padStart(2, "0");
        return `${min}:${sec}`;
      },
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-gray-600  transition-all duration-500 bg-gray-100 p-2 rounded-md "
            onClick={() => navigate(`/admin/sounds/${row.original.ID}`)}>
            <SquarePen  size={20}/>
          </button>
  
          <button className="text-gray-400 hover:text-red-600 transition-all duration-500 bg-gray-100 p-2 rounded-md"
            onClick={() => deleteSound(Number(row.original.ID))}>
            <Trash2 size = {20} />
          </button>
        </div>
      ),
    },
  ];
  

  const table = useReactTable({
    data: AllSounds,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  async function fetchSounds() {
    setLoading(true);
    try {
      const res = await getAllSounds();
      console.log("Response from getAllSounds:", res.sounds);
      setAllSounds(res.sounds);
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเสียง");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ฟังก์ชันแปลง URL YouTube ให้ embed ได้
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) {
      console.warn("YouTube URL is undefined or empty");
      return null;
    }
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    } else {
      console.warn("ไม่สามารถดึง YouTube video ID จาก URL:", url);
      return null;
    }
  };

  async function deleteSound(id: number) {
    setDeletedRowIds((prev) => [...prev, id]);
    try {
      
      setTimeout(async () => {
         await deleteSoundByID(id);
        setAllSounds((prev) => prev.filter((item) => item.ID !== id)); // ลบจาก frontend
        message.success("ลบเสียงสําเร็จ");
      }, 300);
    
  
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบเสียง");
      console.error(error);
    }
  }



  const extractYouTubeID = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // ฟังก์ชันลบเพลง (สมมติว่ามี API deleteSoundByID)

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // ลบเพลง
  

  return (
    <>
      <div className="min-h-screen  px-8 pt-6">
        {/* header */}
        <div className="flex justify-between items-center mb-4 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 flex items-center gap-2">
  <img src={music} alt="Admin" className="w-15 h-15" />
  การจัดการเสียง
</h2>
          <button className="bg-button-blue text-white py-1 px-2 rounded mr-2"
            onClick={() => navigate("/admin/meditation")}
          >
            <div className="flex gap-2">
              <Plus />
              <span>สร้าง</span>
            </div>
          </button>
        </div>
        {/* search + filter */}
        <div className="bg-white p-4 rounded-md mt-4">
          <div>
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="flex gap-2 ">
                <SearchFilter
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  placeholder="ค้นหาไฟล์เสียง..."
                />
              </div>
              <STFilter column={table.getColumn("sound_type_name")} data={AllSounds} />
              
            </div>
          </div>
        </div>
        {/* table */}

        <div className="mt-4 w-full overflow-x-auto">
          <table className="min-w-full bg-transparent border-separate border-spacing-y-1">
            <thead className="bg-[#f3f6f8]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
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
            <tbody className="bg-white animate-fade-in">
              {table.getRowModel().rows.map((row) => {
              const isDeleting = deletedRowIds.includes(Number(row.original.ID));
              return(
                <tr key={row.id} className={`rounded-md   my-4 overflow-hidden hover:bg-[#f3f6f8] duration-300 
              transition-opacity  ${ isDeleting ? "animate-fadeOutLeft" : "opacity-100" } `}>
                  {row.getVisibleCells().map((cell, idx, arr) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-1 text-sm ${
                        idx === 0 ? "rounded-l-md" : ""
                      } ${idx === arr.length - 1 ? "rounded-r-md" : ""}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              )})}
            </tbody>
          </table>
          <Modal
          open={!!previewVideoId}
          onCancel={() => setPreviewVideoId(null)}
          footer={null}
          width={750}
          destroyOnClose={true}
      >
        {previewVideoId && (
          <div className="mt-6 ">
            <iframe
              height={500}
             
              className="flex-1 w-full rounded-lg"
              src={`${previewVideoId}`}
              title="YouTube Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        )}
      </Modal>

           {/* no result */}
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
                className=" relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 
                  hover:bg-background-button hover:text-blue-word hover:border-blue-word
                  transition-colors duration-500"
                >
                  <ChevronsLeft size={20}/>
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 
                  hover:bg-background-button hover:text-blue-word hover:border-blue-word
                  transition-colors duration-500"
                >
                  <ChevronLeft size={20}/>
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 
                  hover:bg-background-button hover:text-blue-word hover:border-blue-word
                  transition-colors duration-500"
                >
                  <ChevronRight size={20}/>
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 
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
    </>
  );
}
export default ListSound;
