import React, { useState, useEffect } from "react";

function BreathExercise() {
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");
  const [count, setCount] = useState(4);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setCount((prev) => {
          if (prev === 1) {
            setBreathPhase((phase) => (phase === "inhale" ? "exhale" : "inhale"));
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-blue-100 rounded-2xl shadow-lg text-center font-sans text-blue-900">
      <h1 className="text-3xl font-semibold mb-3">ฝึกลมหายใจ เพื่อความสงบใจ</h1>
      <p className="text-xl mb-8 text-blue-700">
        {breathPhase === "inhale" ? "หายใจเข้าช้า ๆ" : "หายใจออกช้า ๆ"}
      </p>

      <div
        className={`
          mx-auto mb-8 rounded-full w-44 h-44 flex items-center justify-center
          text-white font-extrabold text-6xl shadow-lg
          transition-transform duration-[4000ms] ease-in-out
          ${
            breathPhase === "inhale"
              ? "bg-blue-600 scale-110 shadow-[0_0_40px_#4a7bd1]"
              : "bg-blue-400 scale-90 shadow-[0_0_25px_#6297db]"
          }
        `}
      >
        <span>{count}</span>
      </div>

      <button
        onClick={() => setIsRunning(!isRunning)}
        className="bg-blue-700 hover:bg-blue-800 text-white text-xl font-medium py-3 px-12 rounded-full transition-colors duration-300"
      >
        {isRunning ? "หยุด" : "เริ่ม"}
      </button>
    </div>
  );
}

export default BreathExercise;
