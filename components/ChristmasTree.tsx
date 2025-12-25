import React, { useState } from 'react';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Polaroid from './Polaroid';
import Star from './Star';
import { COLORS, PHOTO_RESOURCES } from '../constants';

interface ChristmasTreeProps {
  progress: number;
}

const ChristmasTree: React.FC<ChristmasTreeProps> = ({ progress }) => {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // 处理点击背景取消选中
  const handleMissed = () => {
    if (selectedPhotoId !== null) {
      setSelectedPhotoId(null);
    }
  };

  return (
    // onPointerMissed 会在点击未命中任何物体时触发
    <group onPointerMissed={handleMissed}>
      <Star progress={progress} />

      <Foliage progress={progress} />
      
      <Ornaments progress={progress} />
      
      {PHOTO_RESOURCES.map((url, i) => (
        <Polaroid 
          key={i} 
          id={`photo-${i}`}
          url={url}
          index={i}
          total={PHOTO_RESOURCES.length}
          progress={progress}
          isZoomed={selectedPhotoId === `photo-${i}`}
          // onSelect 现在只负责“选中”这个动作，关闭由 onPointerMissed 处理
          onSelect={() => setSelectedPhotoId(`photo-${i}`)}
        />
      ))}
    </group>
  );
};

export default ChristmasTree;