import smaile from "../../assets/smile.png";
import normal from "../../assets/normal.png";
import sad from "../../assets/sad.png";

const Emoji = [
  {
    name: "smile",
    image: smaile,
  },
  {
    name: "normal",
    image: normal,
  },
  {
    name: "sad",
    image: sad,
  },
];

function How() {
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="flex flex-col justify-center gap-4 max-h-[200px] w-full py-4 px-20 bg-white/50 backdrop-blur-lg rounded-2xl">
        <p className="font-ibmthai text-2xl">วันนี้คุณรู้สึกอย่างไร ?</p>
        <div className="flex justify-center gap-10">
          {Emoji.map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-6">
              <img
                src={item.image}
                alt={item.name}
                className="max-w-16 max-h-16 w-10 h-10 sm:w-16 sm:h-16 duration-300 transform hover:scale-110"
              />
              <p className="font-ibmthai">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default How;
