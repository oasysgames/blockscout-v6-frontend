import Image from 'next/image';
import React from 'react';

import { getEnvValue } from 'configs/app/utils';

const Banner: React.FC = () => {
  const bannerImageUrl = getEnvValue('NEXT_PUBLIC_BANNER_IMAGE_URL');

  if (!bannerImageUrl) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 9999,
      pointerEvents: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <Image
        src={ bannerImageUrl }
        alt="Banner"
        width={ 200 }
        height={ 100 }
        style={{
          maxWidth: '200px',
          maxHeight: '100px',
          display: 'block',
        }}
      />
    </div>
  );
};

export default Banner;
