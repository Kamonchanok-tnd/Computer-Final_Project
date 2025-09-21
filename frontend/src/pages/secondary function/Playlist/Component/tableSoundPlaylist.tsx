import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CustomSoundPlaylist } from "../Playlist";
import {EllipsisVertical, Play,  Star, Trash2 } from "lucide-react";
import { Dropdown, MenuProps, message, Modal } from "antd";
import { useEffect, useState } from "react";
import "./table.css"
import StarRating from "./starrating";
import { CheckReview, CreateReview, UpdateReview } from "../../../../services/https/review";
import { IReview } from "../../../../interfaces/IReview";


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
  const uid = localStorage.getItem("id");
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [selectedSong, setSelectedSong] = useState<CustomSoundPlaylist | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(0);

  const [editRating, setEditRating] = useState<boolean>(false);
  const [exitRating, setExitRating] = useState<number>(0);
  // const videoID = extractYouTubeID(selectedSong?.sound || "");

    async function checkReview(song: CustomSoundPlaylist) {
      try {
        const result = await CheckReview(Number(uid), Number(song?.ID));
        if (result.exists && typeof result.point === "number") {
          setCurrentRating(result.point);
          setExitRating(result.point);
          setEditRating(true);
      
        }
      } catch (error) {
        console.error('Error sending rating:', error);
    }
  }

  async function updateReview(review : IReview){
     
    try {
      await UpdateReview(review);
      message.success(`แก้ไขคะแนน "${selectedSong?.name}" ${currentRating} ดาว`);
  }catch (error) {
      console.error('Error sending rating:', error);
      message.error('เกิดข้อผิดพลาดในการส่งคะแนน กรุณาลองอีกครั้ง');
  }
  }
 

  // review section
  const getRatingLabel = (rating: number): string => {
    switch(rating) {
      case 1: return 'แย่มาก';
      case 2: return 'แย่';
      case 3: return 'ปานกลาง';
      case 4: return 'ดี';
      case 5: return 'ดีเยี่ยม';
      default: return 'เลือกคะแนน';
    }
  };
   const handleRatingSubmit = async () => {
    if (currentRating === 0) {
      message.warning('กรุณาเลือกคะแนนก่อนส่ง');
     
      return;
    }
    const data: IReview = { sid: selectedSong?.ID, point: currentRating , uid: Number(uid) };
    try {
          if (editRating) {
            updateReview(data)
            setEditRating(false);
          }else{
             const res = await CreateReview(data)
          //console.log(res);
          message.success(`ให้คะแนน "${selectedSong?.name}" ${currentRating} ดาว`);
          }
         
    } catch (error) {
      console.error('Error sending rating:', error);
      message.error('เกิดข้อผิดพลาดในการส่งคะแนน');
    }
    // ส่งคะแนนไปยัง API หรือ function ที่ต้องการ
  
    // รีเซ็ตและปิด Modal
    setRatingModalOpen(false);
    setSelectedSong(null);
    setCurrentRating(0);
  };

  const openRatingModal = (song: CustomSoundPlaylist) => {
    setSelectedSong(song);
    console.log("selectedSong:", selectedSong);

      checkReview(song);
    
    // setCurrentRating(0); // รีเซ็ตคะแนน
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedSong(null);
    setCurrentRating(0);
  };
  
  useEffect(() => {
    console.log("select row IDs:", selectedSong);
    console.log("extractYouTubeID:", extractYouTubeID(selectedSong?.sound || ""));
  }

  , [selectedSong]);

  const [tableData, setTableData] = useState<CustomSoundPlaylist[]>(data);

useEffect(() => {
  setTableData(data); // Sync กับ prop เผื่อ data จาก parent เปลี่ยน
}, [data]);
  
  
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
            className="bg-background-button dark:bg-midnight-blue/20 h-7 w-7 rounded-full  flex justify-center items-center"
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
            <div className="lg:w-[200px] w-[100px]">
              <h1 className="lg:text-lg text-sm truncate">{name}</h1>
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
              className="text-gray-400 dark:text-blue-word dark:bg-midnight-blue/20  
              hover:text-gray-600 transition-all duration-300 bg-gray-100 hover:bg-gray-200 dark:hover:text-midnight-blue p-2
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
    data: tableData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(), 
  });

  const getDropdownItems = (rowData: CustomSoundPlaylist): MenuProps['items'] => [
    {
      key: 'review',
      label: 'ให้คะแนน',
      icon: <Star size={16} />,
      onClick: () => {
        openRatingModal(rowData);
      },
    },
    {
      key: 'delete',
      label: 'ลบ',
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'ยืนยันการลบ',
          content: `คุณต้องการลบ "${rowData.name}" ออกจากเพลย์ลิสต์ใช่หรือไม่?`,
          okText: 'นำออก',
          cancelText: 'ยกเลิก',
          className: 'custom-modal',
          onOk: async () => {
            await DeleteSoundPlaylist(rowData.ID!); 
            setTableData(prev => prev.filter(item => item.ID !== rowData.ID));
          },
        });
      },
    },
  ];
  return (
    
    <div className="overflow-y-auto max-h-[500px]">
      <div className=" md:block">
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[400px] scrollbar-hide lg:rounded-lg ">
            <table className="min-w-full bg-white dark:bg-background-dark">
              <thead className="bg-white dark:bg-background-dark sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-dark uppercase tracking-wider
                         border-b border-gray-200 dark:border-gray-700"
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
              <tbody className="bg-white dark:bg-background-dark divide-y  divide-gray-100 dark:divide-gray-700">
                {table.getRowModel().rows.map((row) => {
                  const isDeleting = deletedRowIds.includes(Number(row.original.ID));
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 dark:hover:bg-background-dark transition-all duration-300 ${
                        isDeleting ? "animate-fadeOutLeft" : "opacity-100"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-1 text-sm text-basic-text dark:text-text-dark whitespace-nowrap"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
         {/* review */}
            <Modal
        title="ให้คะแนนเพลง"
        open={ratingModalOpen}
        onCancel={closeRatingModal}
        footer={null}
        className="custom-modal"
       
        centered
      >
        {selectedSong && (
          <div className="text-center space-y-6 py-4">
            {/* Song Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-background-dark rounded-lg ">
             
              <div className="flex flex-col text-left w-full ">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-text-dark truncate ">
                  {selectedSong.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-text-dark">
                  {selectedSong.owner || 'ไม่ระบุผู้สร้าง'}
                </p>
              </div>
            </div>

            {/* Rating Section */}
            <div className="space-y-4">
              <h4 className="text-xl font-medium text-gray-700 dark:text-text-dark">
                คุณให้คะแนนบทสวดนี้เท่าไหร่?
              </h4>
              
              <div className="flex justify-center">
                <StarRating 
                  rating={currentRating} 
                  onRatingChange={setCurrentRating} 
                  size="lg"
                />
              </div>

              <p className="text-lg font-medium text-gray-700 dark:text-text-dark">
                {getRatingLabel(currentRating)}
              </p>
              
              {currentRating > 0 && (
                <p className="text-sm text-gray-600 dark:text-text-dark">
                  {currentRating}/5 ดาว
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={closeRatingModal}
                className="px-6 py-2  text-gray-700 dark:text-text-dark rounded-lg hover:bg-gray-300/20 transition-colors duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={currentRating === 0 || exitRating === currentRating}
                className="px-6 py-2 bg-button-blue text-white rounded-lg  disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                ส่งคะแนน
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TableSoundPlaylist