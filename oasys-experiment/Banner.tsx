import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';

import { getEnvValue } from 'configs/app/utils';
import { useAppContext } from 'lib/contexts/app';
import * as cookies from 'lib/cookies';

const Banner: React.FC = () => {
  const [ isMounted, setIsMounted ] = React.useState(false);
  const appProps = useAppContext();
  const cookiesString = appProps.cookies;
  const isNavBarCollapsedCookie = cookies.get(cookies.NAMES.NAV_BAR_COLLAPSED, cookiesString);
  const isNavBarCollapsed = isNavBarCollapsedCookie === 'true';
  const bannerImageUrl = getEnvValue('NEXT_PUBLIC_BANNER_IMAGE_URL') ?? null;
  const bannerLinkUrl = getEnvValue('NEXT_PUBLIC_BANNER_LINK_URL') ?? '#';

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isNavBarCollapsed || !bannerImageUrl) return null;

  return (
    <div style={{
      margin: '0',
      padding: '0',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      backgroundColor: 'transparent',
      lineHeight: '0',
      marginTop: 'auto',
    }}>
      <a href={ bannerLinkUrl } target="_blank" rel="noopener noreferrer" style={{ display: 'block', lineHeight: '0' }}>
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
            margin: '0',
            padding: '0',
            lineHeight: '0',
          }}
        />
      </a>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Banner), { ssr: false });
