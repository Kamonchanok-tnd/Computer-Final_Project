import React from "react";

interface VolumeVisualizerProps {
    volume: number;
    isActive: boolean;
  }
  

  const VolumeVisualizer: React.FC<VolumeVisualizerProps> = ({ volume, isActive }) => {
    const scale = 1 + (volume / 100) * 0.5;
    const opacity = isActive ? 0.3 + (volume / 100) * 0.7 : 0;
    const glowIntensity = isActive ? volume / 100 : 0;
  
    return (
      <div
        className={`relative  w-64 h-64 rounded-full transition-all duration-300 ease-out ${
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-75" 
        }`}
        style={{
          transform: `scale(${scale})`,
          background: `radial-gradient(circle, 
            rgba(93, 226, 255, ${opacity}) 0%, 
            rgba(33, 150, 243, ${opacity * 0.8}) 40%, 
            rgba(154, 237, 255, ${opacity * 0.6}) 70%, 
            transparent 100%)`,
          boxShadow: `
            0 0 ${20 + glowIntensity * 60}px rgba(93, 226, 255, ${glowIntensity * 0.5}),
            0 0 ${40 + glowIntensity * 100}px rgba(33, 150, 243, ${glowIntensity * 0.3}),
            0 0 ${60 + glowIntensity * 140}px rgba(194, 244, 255, ${glowIntensity * 0.2})
          `,
        }}
      >
        {/* วงกลมด้านใน */}
        <div
          className="absolute inset-4 rounded-full transition-all duration-250"
          style={{
            background: `radial-gradient(circle, 
              rgba(93, 226, 255, ${opacity * 0.8}) 0%, 
              rgba(33, 150, 243, ${opacity * 0.6}) 50%, 
              transparent 100%)`,
            transform: `scale(${1 + (volume / 100) * 0.3})`,
          }}
        />
  
        {/* จุดกลาง */}
        <div
          className="absolute inset-1/2 w-8 h-8 -ml-4 -mt-4 rounded-full transition-all duration-200"
          style={{
            background: `rgba(194, 244, 255, ${0.8 + glowIntensity * 0.2})`,
            transform: `scale(${1 + (volume / 100) * 0.8})`,
            boxShadow: `0 0 ${10 + glowIntensity * 30}px rgba(194, 244, 255, ${glowIntensity * 0.8})`,
          }}
        />
      </div>
    );
  };
  
  export default VolumeVisualizer;