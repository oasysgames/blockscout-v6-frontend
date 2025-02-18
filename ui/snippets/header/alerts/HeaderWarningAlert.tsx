import { Alert, AlertIcon, Box, CloseButton, Link } from '@chakra-ui/react';
import React from 'react';

import { getEnvValue } from 'configs/app/utils';

const HeaderWarningAlert = () => {
  const [ isAlertClosed, setIsAlertClosed ] = React.useState(false);
  const envValue = getEnvValue('NEXT_PUBLIC_HEADER_ALERT_ENABLED');
  console.log('HeaderWarningAlert: NEXT_PUBLIC_HEADER_ALERT_ENABLED =', envValue);
  const isEnabled = envValue === 'true';
  const explorerUrl = getEnvValue('NEXT_PUBLIC_HEADER_ALERT_EXPLORER_URL') || 'https://explorer.oasys.games/';
  const discordUrl = getEnvValue('NEXT_PUBLIC_HEADER_ALERT_DISCORD_URL') || 'https://discord.gg/8hfWTbKVex';

  const handleClose = React.useCallback(() => {
    setIsAlertClosed(true);
  }, []);

  if (isAlertClosed || !isEnabled) {
    return null;
  }

  return (
    <Alert status="warning" as={Box} borderRadius="12px">
      <AlertIcon/>
      Make sure you are visiting
      <Link href={explorerUrl} isExternal color="blue.600" marginX="1">
        {explorerUrl}
      </Link>
      . Oasys Official Discord is hacked! Join our new
      <Link href={discordUrl} isExternal color="blue.600" marginX="1">
        server
      </Link>
      .
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={handleClose}
      />
    </Alert>
  );
};

export default React.memo(HeaderWarningAlert);
