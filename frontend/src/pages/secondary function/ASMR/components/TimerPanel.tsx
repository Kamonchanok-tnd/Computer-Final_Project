// components/TimerPanel.tsx
import React, { useState, useEffect } from 'react';

const TimerPanel: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // You can add notification or sound here when timer ends
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setTimeLeft(minutes * 60 + seconds);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(minutes * 60 + seconds);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setQuickTimer = (time: number) => {
    setMinutes(time);
    setSeconds(0);
    setTimeLeft(time * 60);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        ⏳ Focus Timer
      </h3>
      
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-center mb-4">
          <div className="text-4xl font-mono text-white mb-4">
            {formatTime(timeLeft)}
          </div>
          
          {!isRunning && (
            <div className="flex space-x-4 mb-4">
              <div className="flex flex-col items-center">
                <label className="text-white/60 text-sm mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white/20 text-white rounded text-center"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-white/60 text-sm mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white/20 text-white rounded text-center"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-2">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-white/80 font-medium">⚡ Quick Timers</h4>
        <div className="grid grid-cols-3 gap-2">
          {[15, 25, 45].map(time => (
            <button
              key={time}
              onClick={() => setQuickTimer(time)}
              className="px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-sm"
            >
              {time}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerPanel;