import { useEffect, useState } from "react";

export const useVolumeVisualizer = (stream: MediaStream | null) => {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.fftSize);

    source.connect(analyser);

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      const rms = Math.sqrt(
        dataArray.reduce((sum, val) => sum + (val - 128) ** 2, 0) / dataArray.length
      );
      setVolume(rms);
      requestAnimationFrame(tick);
    };

    tick();

    return () => {
      audioContext.close();
    };
  }, [stream]);

  return volume;
};
