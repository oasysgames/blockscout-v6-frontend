import { PopoverBody, PopoverContent, PopoverTrigger, useDisclosure, type ButtonProps } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { Screen } from 'ui/snippets/auth/types';

import config from 'configs/app';
import * as mixpanel from 'lib/mixpanel';
import useAccount from 'lib/web3/useAccount';
import Popover from 'ui/shared/chakra/Popover';
import AuthModal from 'ui/snippets/auth/AuthModal';
import useProfileQuery from 'ui/snippets/auth/useProfileQuery';
import useSignInWithWallet from 'ui/snippets/auth/useSignInWithWallet';

import UserProfileButton from './UserProfileButton';
import UserProfileContent from './UserProfileContent';

interface Props {
  buttonSize?: ButtonProps['size'];
  buttonVariant?: ButtonProps['variant'];
}

const UserProfileDesktop = ({ buttonSize, buttonVariant = 'header' }: Props) => {
  const [ authInitialScreen, setAuthInitialScreen ] = React.useState<Screen>({
    type: config.features.blockchainInteraction.isEnabled ? 'select_method' : 'email',
  });
  const router = useRouter();

  const authModal = useDisclosure();
  const profileMenu = useDisclosure();

  const profileQuery = useProfileQuery();
  const signInWithWallet = useSignInWithWallet({});
  const { address: web3Address } = useAccount();

  const handleProfileButtonClick = React.useCallback(() => {
    if (profileQuery.data || web3Address) {
      mixpanel.logEvent(mixpanel.EventTypes.ACCOUNT_ACCESS, { Action: 'Dropdown open' });
      profileMenu.onOpen();
      return;
    }

    // TODO @tom2drum use auth modal instead
    if (router.pathname === '/apps/[id]') {
      signInWithWallet.start();
      return;
    }

    authModal.onOpen();
  }, [ profileQuery.data, router.pathname, authModal, profileMenu, signInWithWallet, web3Address ]);

  const handleAddEmailClick = React.useCallback(() => {
    setAuthInitialScreen({ type: 'email', isAuth: true });
    authModal.onOpen();
  }, [ authModal ]);

  const handleAddAddressClick = React.useCallback(() => {
    setAuthInitialScreen({ type: 'connect_wallet', isAuth: true });
    authModal.onOpen();
  }, [ authModal ]);

  return (
    <>
      <Popover openDelay={ 300 } placement="bottom-end" isLazy isOpen={ profileMenu.isOpen } onClose={ profileMenu.onClose }>
        <PopoverTrigger>
          <UserProfileButton
            profileQuery={ profileQuery }
            size={ buttonSize }
            variant={ buttonVariant }
            onClick={ handleProfileButtonClick }
            isPending={ signInWithWallet.isPending }
          />
        </PopoverTrigger>
        { (profileQuery.data || web3Address) && (
          <PopoverContent w="280px">
            <PopoverBody>
              <UserProfileContent
                data={ profileQuery.data }
                onClose={ profileMenu.onClose }
                onLogin={ authModal.onOpen }
                onAddEmail={ handleAddEmailClick }
                onAddAddress={ handleAddAddressClick }
              />
            </PopoverBody>
          </PopoverContent>
        ) }
      </Popover>
      { authModal.isOpen && (
        <AuthModal
          onClose={ authModal.onClose }
          initialScreen={ authInitialScreen }
        />
      ) }
    </>
  );
};

export default React.memo(UserProfileDesktop);
