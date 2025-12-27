import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface HandDetectorProps {
  onSnowChange: (isSnowing: boolean) => void;
}

const HandDetector: React.FC<HandDetectorProps> = ({ onSnowChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      // 简单判断是否为 iOS 设备
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      // 在 iOS 上强制使用 CPU，其他设备尝试 GPU
      const delegateType = isIOS ? "CPU" : "GPU";

      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: delegateType
        },
        runningMode: "VIDEO",
        numHands: 1 // 我们只需要检测一只手
      });

      setIsLoaded(true);
    };

    initMediaPipe();
  }, []);

  useEffect(() => {
    if (!isLoaded || !videoRef.current) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startWebcam();

    return () => {
      // 清理工作
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded]);

  const predictWebcam = () => {
    const video = videoRef.current;
    const recognizer = gestureRecognizerRef.current;

    if (!video || !recognizer) return;

    if (video.currentTime > 0) { // 确保视频有数据
      const results = recognizer.recognizeForVideo(video, Date.now());

      let isOpenPalm = false;

      if (results.gestures.length > 0) {
        // 获取第一个检测到的手势（因为我们设置了 numHands: 1）
        const categoryName = results.gestures[0][0].categoryName;
        const score = results.gestures[0][0].score;

        // 检测 "Open_Palm" 手势，且置信度大于 0.5
        if (categoryName === "Open_Palm" && score > 0.5) {
          isOpenPalm = true;
        }
      }

      onSnowChange(isOpenPalm);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-32 h-24 rounded-lg border-2 border-yellow-500/30 opacity-0 object-cover transform scale-x-[-1]" // scale-x-[-1] 用于镜像翻转
      />
      {/* {!isLoaded && <div className="text-yellow-500 text-xs text-center mt-1">Init AI...</div>}
      {isLoaded && <div className="text-green-500 text-xs text-center mt-1 font-mono">AI Ready</div>} */}
    </div>
  );
};

export default HandDetector;