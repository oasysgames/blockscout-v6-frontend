import Image from 'next/image';
import React from 'react';

import { getEnvValue } from 'configs/app/utils';
import { useAppContext } from 'lib/contexts/app';
import * as cookies from 'lib/cookies';

const Banner: React.FC = () => {
  const appProps = useAppContext();
  const cookiesString = appProps.cookies;
  const isNavBarCollapsedCookie = cookies.get(cookies.NAMES.NAV_BAR_COLLAPSED, cookiesString);
  const isNavBarCollapsed = isNavBarCollapsedCookie === 'true';
  const bannerImageUrl = getEnvValue('NEXT_PUBLIC_BANNER_IMAGE_URL') ?? null;
  const bannerLinkUrl = getEnvValue('NEXT_PUBLIC_BANNER_LINK_URL') ?? '#';

  if (isNavBarCollapsed || !bannerImageUrl) return null;

  return (
    <div style={{
      width: '100%',
      padding: '8px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: 'transparent',
    }}>
      <a href={ bannerLinkUrl } target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        <Image
          src={ bannerImageUrl }
          alt="Banner"
          width={ 160 }
          height={ 80 }
          priority
          unoptimized
          style={{
            maxWidth: '160px',
            maxHeight: '80px',
            display: 'block',
          }}
        />
      </a>
    </div>
  );
};

export default Banner;
