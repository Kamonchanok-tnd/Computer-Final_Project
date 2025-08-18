import React from "react";

// กำหนด props type
interface StepperProps {
  step: number;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ step, steps }) => {
  return (
    <div className="flex items-center w-full max-w-3xl mx-auto">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          {/* Step */}
          <div className="flex items-center relative">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                index <= step ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-gray-700">
              {label}
            </div>
          </div>

          {/* Line */}
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 ${
                index < step ? "bg-cyan-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;
