import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { useSwitchChain } from 'wagmi';
import { useColorModeValue } from '@chakra-ui/react';

import { ChainId, TokenIndex } from './constants/types';

import { CHAINS, getTokenList, getVerseVersion } from './constants/chains';
import { getTokenInfo } from './constants/tokens';
import { getChainIcon } from './constants/verseicons';
import { useBalances } from './hooks/useBalances';
import { useDepositWithdraw } from './hooks/useDepositWithdraw';
import { LoadingIcon, LoadingModal } from './LoadingModal';
import type { SelectListItem } from './SelectModal';
import { SelectModal } from './SelectModal';
import config from 'configs/app';

// Get l2ChainId from .env
const l2ChainId = Number(config.verse.bridge.l2ChainId) as ChainId;
const verseVersion = Number(config.verse.bridge.verseVersion) || getVerseVersion(l2ChainId);

// Validation Only numbers with a decimal point
const validateInput = (inputValue: string): boolean => {
  return /^\d*(?:\.\d*)?$/.test(inputValue);
};

const BridgePage = () => {
  const [ tokenIndex, setTokenIndex ] = useState(TokenIndex.OAS);
  const [ isDeposit, setIsDeposit ] = useState(true);
  const [ value, setValue ] = useState('');

  const tokenInfoItems: Array<SelectListItem> = useMemo(
    () =>
    // exclude TokenIndex.USDCeLegacy when deposit
      getTokenList(ChainId.OASYS, l2ChainId, isDeposit ? [ TokenIndex.USDCeLegacy ] : [])
        .map((t) => getTokenInfo(t))
        .map((t) => ({ id: t.ind, image: t.icon || '', text: t.symbol })),
    [ isDeposit ],
  );

  const handleSwap = () => {
    setIsDeposit((val) => !val);
  };

  // switch chain when switch between deposit/withdraw
  const { switchChainAsync } = useSwitchChain();
  useEffect(() => {
    const chainId = isDeposit ? ChainId.OASYS : l2ChainId
    switchChainAsync({ chainId })
  }, [isDeposit])

  const [ deposit, withdraw, loading, hash, error ] = useDepositWithdraw(verseVersion ? 1 : 0);

  const doBridge = useCallback(() => {
    if (isDeposit) {
      deposit(ChainId.OASYS, l2ChainId, tokenIndex, value);
    } else {
      withdraw(ChainId.OASYS, l2ChainId, tokenIndex, value);
    }
  }, [ deposit, withdraw, isDeposit, tokenIndex, value ]);

  const l1Balance = useBalances(ChainId.OASYS, tokenIndex);
  const l2Balance = useBalances(l2ChainId, tokenIndex);

  const setMax = useCallback(() => {
    const val = isDeposit ? l1Balance : l2Balance;
    setValue(val);
  }, [ isDeposit, l1Balance, l2Balance ]);

  const tokenDecimal = useMemo(() => getTokenInfo(tokenIndex).decimal || 18, [ tokenIndex ]);

  // Validation acceptable values in bridge input
  const validateNumber = useCallback((inputValue: string, tokenDecimal: number): boolean => {
    if (!validateInput(inputValue)) {
      return false;
    }

    const number = parseFloat(inputValue);
    if (isNaN(number) || number <= 0) {
      return false;
    }

    const [ integerPart, decimalPart ] = inputValue.split('.');

    // Return false if the total length of the integer and decimal parts exceeds 79 digits
    if ((integerPart?.length || 0) + (decimalPart?.length || 0) > 79) {
      return false;
    }

    // Return false if the decimal part exceeds the token's allowed decimal places
    if ((decimalPart?.length || 0) > tokenDecimal) {
      return false;
    }

    return true;
  }, []);

  // check input value
  const valid = useMemo(() => {
    return validateNumber(value, tokenDecimal);
  }, [ value, tokenDecimal, validateNumber ]);

  // l2 chain image
  const l2ChainImageUrl = getChainIcon(l2ChainId);

  // token info
  const tokenInfo = getTokenInfo(tokenIndex);

  const [ isSelectTokenOpen, setIsSelectTokenOpen ] = useState(false);

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <div className="relative flex flex-col justify-center items-center">
      <div className={`p-6 rounded-lg shadow-md w-full max-w-md mt-12 mb-6`} style={{ backgroundColor: bgColor }}>
        <h1 className="text-xl font-semibold mb-4" style={{ color: textColor }}>Bridge Route</h1>

        <div
          style={{
            display: 'flex',
            flexDirection: isDeposit ? 'column' : 'column-reverse',
          }}
        >
          <div className="mb-4">
            <label className="flex flex-wrap items-center justify-between mb-2" style={{ color: textColor }}>
              <span className="text-sm">
                <span className="font-medium">{ isDeposit ? 'From' : 'To' } </span>
                <span className="font-normal">Hub Layer</span>
              </span>
              <span>
                { l1Balance } { tokenInfo.symbol }
              </span>
            </label>
            <div className="flex items-center border rounded-lg p-3" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <Image
                src="/images/oasys_icon.png"
                alt="Oasys Mainnet"
                width={ 24 }
                height={ 24 }
                className="mr-2"
              />
              <span className="ml-2 font-medium w-full" style={{ color: textColor }}>
                Oasys Mainnet
              </span>
            </div>
          </div>
          <div className="mb-4 text-center">
            <button onClick={ handleSwap } className="focus:outline-none">
              <Image
                src="/images/move.svg"
                alt="move"
                width={ 24 }
                height={ 24 }
                className="rotate-90"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </button>
          </div>
          { /* Verse */ }
          <div className="mb-4">
            <label className="flex flex-wrap items-center justify-between mb-2" style={{ color: textColor }}>
              <span className="text-sm">
                <span className="font-medium">{ isDeposit ? 'To' : 'From' } </span>
                <span className="font-normal">Verse</span>
              </span>
              <span>
                { l2Balance } { tokenInfo.symbol }
              </span>
            </label>
            <div className="flex items-center border rounded-lg p-3" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <Image
                src={ l2ChainImageUrl }
                alt="Verse image"
                width={ 24 }
                height={ 24 }
                className="mr-2"
              />
              <label className="ml-2 font-medium w-full border-none focus:outline-none" style={{ color: textColor }}>
                { CHAINS[l2ChainId].name }
              </label>
            </div>
          </div>
        </div>
        <div className="mb-4">
          { /* Asset */ }
          <label className="block mb-2 mt-4 font-medium" style={{ color: textColor }}>Asset</label>
          <div className="flex items-center border rounded-lg p-3" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
            <span className="font-medium" style={{ color: textColor }}>Send Token (ERC-20)</span>
          </div>
          <br/>
          { /* Token select */ }
          <div className="flex flex-col items-center border rounded-lg p-2" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
            <div
              className="flex w-full items-center p-2 cursor-pointer"
              onClick={ () => setIsSelectTokenOpen(true) }
            >
              <Image
                src={ tokenInfo.icon || '' }
                alt={ tokenInfo.symbol }
                width={ 24 }
                height={ 24 }
                className="mr-2"
              />
              <label className="ml-2 w-full font-medium border-none focus:outline-none cursor-pointer" style={{ color: textColor }}>
                { tokenInfo.symbol }
              </label>
              <FaAngleDown style={{ color: textColor }}/>
              <br/>
            </div>
            <hr className="w-full" style={{ borderColor: borderColor }}/>
            <div className="w-full relative flex items-center">
              <input
                value={ value }
                type="text"
                placeholder="0.0"
                className="w-full p-2 font-medium focus:outline-none"
                style={{ backgroundColor: cardBg, color: textColor }}
                onChange={ (e) => setValue(e.target.value) }
              />
              <button
                type="button"
                className="absolute right-0 border focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-2 py-1"
                style={{ backgroundColor: bgColor, color: textColor, borderColor: borderColor }}
                onClick={ setMax }
              >
                max
              </button>
            </div>
          </div>
          { isSelectTokenOpen && (
            <SelectModal
              headerText="Select Token"
              items={ tokenInfoItems }
              onClose={ () => setIsSelectTokenOpen(false) }
              onSelect={ (id) => setTokenIndex(id) }
            />
          ) }
        </div>
        <button
          className="w-full bg-sky-700 text-white font-medium rounded-lg py-2 disabled:opacity-50"
          onClick={ doBridge }
          disabled={ loading || !valid }
        >
          { loading ? <LoadingIcon/> : '' } Bridge
        </button>
      </div>

      <LoadingModal loading={ loading } error={ error } hash={ hash }/>
    </div>
  );
};

export default BridgePage;
