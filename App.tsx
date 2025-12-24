import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import ChristmasTree from './components/ChristmasTree';
import PostProcessing from './components/PostProcessing';
import Snow from './components/Snow'; // <--- 1. 导入 Snow 组件
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.FORMED);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = appState === AppState.FORMED ? 1 : 0;
    let animationFrame: number;
    
    const animate = () => {
      setProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.001) return target;
        return prev + diff * 0.05;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [appState]);

  const toggleState = () => {
    setAppState(prev => prev === AppState.FORMED ? AppState.CHAOS : AppState.FORMED);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-['Inter']">
      {/* Overlay UI */}
      <div className="absolute top-0.5 left-0 w-full p-8 z-1000 pointer-events-none flex flex-col items-center">
        <h1 
          className="relative text-5xl md:text-7xl font-['Great_Vibes'] mb-6"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-[length:200%] bg-left animate-bg-scroll">
            Merry Christmas 
          </span>
          <span className="absolute inset-0 text-yellow-200/30 filter blur-md -z-10">
            Merry Christmas 
          </span>
        </h1>

        <p className=" font-['Pacifico'] text-yellow-200/60 tracking-[0.3em] uppercase text-xs mb-8">
          TO WENDY
        </p>
      </div>

      <div className="absolute bottom-12 left-0 w-full z-10 flex justify-center">
        <button 
          onClick={toggleState}
          className={`group relative px-12 py-4 rounded-full border border-yellow-500/40 transition-all duration-700 overflow-hidden ${appState === AppState.FORMED ? 'bg-yellow-600/90 text-black shadow-[0_0_30px_rgba(202,138,4,0.5)]' : 'bg-black/60 text-yellow-500 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:border-yellow-500'}`}
        >
          <span className="relative z-10 font-bold tracking-widest text-sm uppercase">
            {appState === AppState.FORMED ? '✨ Release Chaos ✨' : '🎄 Form the Tree 🎄'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-8 left-8 border-l border-t border-yellow-500/30 w-16 h-16 pointer-events-none" />
      <div className="absolute bottom-8 right-8 border-r border-b border-yellow-500/30 w-16 h-16 pointer-events-none" />

      {/* 3D Scene */}
      <Canvas 
        shadows 
        dpr={[1, 2]}
        style={{ position: 'relative', zIndex: 0 }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 22]} fov={60} />
          <OrbitControls 
            enablePan={false} 
            minDistance={10} 
            maxDistance={40} 
            autoRotate={appState === AppState.CHAOS} 
            autoRotateSpeed={0.5}
          />
          
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ffd700" />
          <pointLight position={[-10, 5, -10]} intensity={1} color="#ffffff" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="lobby" />
          
          <ChristmasTree progress={progress} />
          <Snow /> {/* <--- 2. 添加 Snow 组件到场景中 */}
          
          <PostProcessing />
        </Suspense>
      </Canvas>

      {/* Bottom status text */}
      <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-yellow-500/30 uppercase tracking-[0.2em] pointer-events-none">
        Exquisite Craftsmanship &bull; Interactive 3D Experience &bull; &copy; 2024
      </div>
    </div>
  );
};

export default App;