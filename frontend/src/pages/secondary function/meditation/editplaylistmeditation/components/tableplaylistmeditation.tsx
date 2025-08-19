import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Edit, EllipsisVertical, Play, Share, Trash2 } from "lucide-react";
import { Dropdown, MenuProps, message, Modal } from "antd";
import { useState } from "react";
import "./table.css"
import { CustomSoundPlaylist } from "../../../Playlist/Playlist";

interface TableSoundPlaylistProps {
  data: CustomSoundPlaylist[];
  extractYouTubeID: (url: string) => string | null;
  deletedRowIds: number[];
  DeleteSoundPlaylist: (id: number) => Promise<void>;
}
function TableSoundPlaylist({
  data,
  extractYouTubeID,
  deletedRowIds,
  DeleteSoundPlaylist
}: TableSoundPlaylistProps) {
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) {
      console.warn("YouTube URL is undefined or empty");
      return null;
    }
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=0&showinfo=0&modestbranding=1`;
    } else {
      console.warn("ไม่สามารถดึง YouTube video ID จาก URL:", url);
      return null;
    }
  };

  const columns: ColumnDef<CustomSoundPlaylist>[] = [
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
          <button
          
            className="bg-background-button h-7 w-7 rounded-full  flex justify-center items-center"
            onClick={() => {
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
        );
      },
    },
    {
      header: "ชื่อ",
      accessorKey: "name", // หรือจะไม่ใส่ก็ได้ถ้าจะใช้ข้อมูลหลายฟิลด์ใน cell
      cell: (info) => {
        const name = info.getValue() as string;
        const owner = info.row.original.owner as string;
        const sound = extractYouTubeID(info.row.original.sound as string);
        const thumbnail = `https://img.youtube.com/vi/${sound}/mqdefault.jpg`;

        return (
          <div className="flex gap-2 items-center ">
            <div className="w-10 bg-background-button h-10 rounded-sm ">
              <img
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover rounded-sm "
              />
            </div>
            <div className="w-[200px]">
              <h1 className="text-lg truncate">{name}</h1>
              <p className="text-sm text-subtitle">
                {owner ? owner : "ไม่ระบุ"}
              </p>
            </div>
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
          <Dropdown
            menu={{ items: getDropdownItems(row.original) }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="custom-dropdown"
          >
            <button 
              className="text-gray-400 hover:text-gray-600 transition-all duration-300 bg-gray-100 hover:bg-gray-200 p-2
               rounded-md focus:outline-none "
              onClick={(e) => e.preventDefault()}
            >
              <EllipsisVertical size={20} />
            </button>
          </Dropdown>
        </div>
      ),
    },
  ];
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(), // ✅ จำเป็น
  });

  const getDropdownItems = (rowData: CustomSoundPlaylist): MenuProps['items'] => [
    {
      key: 'delete',
      label: 'ลบ',
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'ยืนยันการลบ',
          content: `คุณต้องการลบ "${rowData.name}" ออกจากเพลย์ลิสต์ใช่หรือไม่?`,
          okText: 'ลบ',
          cancelText: 'ยกเลิก',
          onOk: () => {
            DeleteSoundPlaylist(rowData.ID!); 
          },
        });
      },
    },
  ];
  return (
    
    <div>
      <table className="min-w-full bg-transparent border-separate border-spacing-y-1">
        <thead className="bg-transparent border-b-[1px]">
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
        <tbody className="bg-white animate-fade-in ">
          {table.getRowModel().rows.map((row) => {
            const isDeleting = deletedRowIds.includes(Number(row.original.ID));
            return (
              <tr
                key={row.id}
                className={`rounded-md   my-4 overflow-hidden hover:bg-[#f3f6f8] duration-300 
                                   transition-opacity  ${
                                     isDeleting
                                       ? "animate-fadeOutLeft"
                                       : "opacity-100"
                                   } `}
              >
                {row.getVisibleCells().map((cell, idx, arr) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-1 text-sm ${
                      idx === 0 ? "rounded-l-md" : ""
                    } ${idx === arr.length - 1 ? "rounded-r-md" : ""} border-b border-button-blue/50  `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
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
                    style={{ display: "none" }}
                    className="flex-1 w-full rounded-lg"
                    src={`${previewVideoId}`}
                    title="YouTube Video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
            </Modal>
    </div>
  );
}

export default TableSoundPlaylist