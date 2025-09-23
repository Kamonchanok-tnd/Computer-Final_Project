import React, { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { ChevronUp, ChevronDown,  RotateCcw, Play } from "lucide-react";

interface TimeSettingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (h: number, m: number, s: number) => void;
  handleStart: (h: number, m: number, s: number) => void;
  initialHours: number;
  initialMinutes: number;
  initialSeconds: number;
}

const TimeSettingModal: React.FC<TimeSettingModalProps> = ({
  open,
  onClose,
  onConfirm,
  handleStart,
  initialHours,
  initialMinutes,
  initialSeconds,
}) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [editingUnit, setEditingUnit] = useState<"hours" | "minutes" | "seconds" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  

  // ซิงค์ค่าเมื่อ modal เปิด
  useEffect(() => {
    if (open) {
      setHours(initialHours);
      setMinutes(initialMinutes);
      setSeconds(initialSeconds);
    }
  }, [open, initialHours, initialMinutes, initialSeconds]);

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  const adjustTime = (unit: "hours" | "minutes" | "seconds", delta: number) => {
    switch (unit) {
      case "hours":
        setHours((prev) => Math.max(0, Math.min(23, prev + delta)));
        break;
      case "minutes":
        setMinutes((prev) => Math.max(0, Math.min(59, prev + delta)));
        break;
      case "seconds":
        setSeconds((prev) => Math.max(0, Math.min(59, prev + delta)));
        break;
    }
  };

  const handleReset = () => {
    setHours(initialHours);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  const handleInputChange = (unit: "hours" | "minutes" | "seconds", value: string) => {
    const numValue = parseInt(value) || 0;
    switch (unit) {
      case "hours":
        setHours(Math.max(0, Math.min(23, numValue)));
        break;
      case "minutes":
        setMinutes(Math.max(0, Math.min(59, numValue)));
        break;
      case "seconds":
        setSeconds(Math.max(0, Math.min(59, numValue)));
        break;
    }
  };

  const TimeInput = ({
    unit,
    value,
    label,
  }: {
    unit: "hours" | "minutes" | "seconds";
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center p-2 font-ibmthai">
      <button
        className="p-2 text-gray-700 dark:text-text-dark hover:bg-gray-100 rounded-lg"
        onClick={() => adjustTime(unit, 1)}
      >
        <ChevronUp size={20} />
      </button>

      <div className="text-center my-2 ">
        {editingUnit === unit ? (
          <input
          ref={inputRef}
          type="text"
          inputMode="numeric" // ช่วยเรียกคีย์บอร์ดตัวเลขบนมือถือ
          value={value.toString().padStart(2, "0")}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
            handleInputChange(unit, onlyNums);
          }}
          onBlur={() => setEditingUnit(null)}
          className="w-16 text-2xl font-mono text-center border-b-2 border-gray-400 focus:outline-none"
        />
        ) : (
          <div
            className="text-2xl font-ibmthai  cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
            onClick={() => {
              setEditingUnit(unit);
              setTimeout(() => inputRef.current?.select(), 0);
            }}
          >
            {formatTime(value)}
          </div>
        )}
        <div className="text-xs text-gray-500">{label}</div>
      </div>

      <button
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-text-dark"
        onClick={() => adjustTime(unit, -1)}
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );

  const isTimeZero = hours === 0 && minutes === 0 && seconds === 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          
          <span className="font-ibmthai text-xl">เวลาเป้าหมายการฝึกหายใจ</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="custom-modal"
    >
      <div className="grid grid-cols-3 gap-4 text-center mb-6 font-ibmthai dark:text-text-dark">
        <TimeInput unit="hours" value={hours} label="ชั่วโมง" />
        <TimeInput unit="minutes" value={minutes} label="นาที" />
        <TimeInput unit="seconds" value={seconds} label="วินาที" />
      </div>

      <div className="flex justify-center mt-4 gap-4">
        <button
          onClick={handleReset}
          className="text-subtitle hover:text-basic-text dark:text-text-dark hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          รีเซ็ต
        </button>

        <button
          onClick={() => {
            onConfirm(hours, minutes, seconds); // ส่งเวลาไป BreathingCard
            handleStart(hours, minutes, seconds) // เริ่มเล่น
            onClose(); // ปิด modal
          }}
          disabled={isTimeZero}
          className="py-2 px-4 rounded-lg bg-button-blue text-white hover:bg-button-blue-hv flex items-center gap-2 transition-colors duration-300 cursor-pointer"
        >
          <Play className="w-5 h-5" />
          เริ่ม
        </button>
      </div>
    </Modal>
  );
};

export default TimeSettingModal;
