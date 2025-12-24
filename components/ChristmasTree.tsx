
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

  return (
    <group>
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
          onSelect={() => setSelectedPhotoId(selectedPhotoId === `photo-${i}` ? null : `photo-${i}`)}
        />
      ))}
    </group>
  );
};

export default ChristmasTree;
