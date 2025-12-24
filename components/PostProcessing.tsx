
import React from 'react';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

const PostProcessing: React.FC = () => {
  return (
    // Fixed: disableNormalPass does not exist on EffectComposer, using enableNormalPass={false} instead.
    <EffectComposer enableNormalPass={false}>
      <Bloom 
        luminanceThreshold={0.8} 
        intensity={1.2} 
        levels={9} 
        mipmapBlur 
      />
      <Noise opacity={0.02} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
};

export default PostProcessing;
