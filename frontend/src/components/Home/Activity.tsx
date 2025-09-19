import meditaion from "../../assets/maditaion.jpg";
import prey from "../../assets/prey.jpg";

const card = [
  {
    id: 1,
    image: meditaion,
    title: "สมาธิบำบัดและฝึกลมหายใจ",
  },
  {
    id: 2,
    image: prey,
    title: "สวดมนต์",
  },
  {
    id: 3,
    image: meditaion,
    title: "ASMR",
  },
  {
    id: 4,
    image: prey,
    title: "ฝึกลมหายใจ",
  },
  {
    id: 5,
    image: meditaion,
    title: "เขียนระบายบนกระจก",
  },
  {
    id: 6,
    image: prey,
    title: "อ่านหนังสือ",
  }
];

function Activity() {
  return (
    <div className="lg:px-30 mt-4 bg-transparent font-ibmthai">
      <div>
        <h1 className="font-ibmthai text-2xl px-2 text-gray-900">กิจกรรมต่างๆ</h1>
      </div>
      <div className="mt-4 flex justify-center w-full">
        <div className="grid grid-cols-6 gap-4 md:gap-20 duration-300 bg-transparent">
          {card.map((item) => (
            <div key={item.id} className="flex flex-col items-center">
              <img
                src={item.image}
                alt={item.title}
                className="md:w-[150px] md:h-[150px] min-w-[40px] min-h-[40px] rounded-full"
              />
              <p className="font-ibmthai md:text-xl text-md">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Activity;
