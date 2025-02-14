import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { useSwitchChain } from 'wagmi';

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

  return (
    <div className="relative flex flex-col justify-center items-center bg-white">
      <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-md mt-12 mb-6">
        <h1 className="text-xl font-semibold mb-4 text-gray-600">Bridge Route</h1>

        <div
          style={{
            display: 'flex',
            flexDirection: isDeposit ? 'column' : 'column-reverse',
          }}
        >
          <div className="mb-4">
            <label className="flex flex-wrap items-center justify-between text-gray-700 mb-2">
              <span className="text-sm">
                <span className="font-medium">{ isDeposit ? 'From' : 'To' } </span>
                <span className="font-normal">Hub Layer</span>
              </span>
              <span>
                { l1Balance } { tokenInfo.symbol }
              </span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white">
              <Image
                src="/images/oasys_icon.png"
                alt="Oasys Mainnet"
                width={ 24 }
                height={ 24 }
                className="mr-2"
              />
              <label className="ml-2 font-medium text-gray-600 w-full border-none focus:outline-none">
								Oasys Mainnet
              </label>
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
              />
            </button>
          </div>
          { /* Verse */ }
          <div className="mb-4">
            <label className="flex flex-wrap items-center justify-between text-gray-700 mb-2">
              <span className="text-sm">
                <span className="font-medium">{ isDeposit ? 'To' : 'From' } </span>
                <span className="font-normal">Verse</span>
              </span>
              <span>
                { l2Balance } { tokenInfo.symbol }
              </span>
            </label>
            <div className="flex items-center border-gray-200 border rounded-lg p-3 bg-white">
              <Image
                src={ l2ChainImageUrl }
                alt="Verse image"
                width={ 24 }
                height={ 24 }
                className="mr-2"
              />
              <label className="ml-2 font-medium text-gray-600 w-full border-none focus:outline-none">
                { CHAINS[l2ChainId].name }
              </label>
            </div>
          </div>
        </div>
        <div className="mb-4">
          { /* Asset */ }
          <label className="block text-gray-700 mb-2 mt-4 font-medium">Asset</label>
          <div className="flex items-center border border-gray-200 rounded-lg p-3 bg-white">
            <span className="text-gray-600 font-medium">Send Token (ERC-20)</span>
          </div>
          <br/>
          { /* Token select */ }
          <div className="flex flex-col border-gray-200 items-center border rounded-lg p-2 bg-white">
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
              <label className="ml-2 w-full font-medium border-none focus:outline-none text-gray-600 cursor-pointer">
                { tokenInfo.symbol }
              </label>
              <FaAngleDown className="text-gray-800"/>
              <br/>
            </div>
            <hr className="w-full border-gray-200"/>
            <div className="w-full relative flex items-center">
              <input
                value={ value }
                type="text"
                placeholder="0.0"
                className="w-full bg-white p-2 font-medium focus:outline-none text-gray-600"
                onChange={ (e) => setValue(e.target.value) }
              />
              <button
                type="button"
                className="absolute right-0 text-gray-900 bg-slate-100 border border-gray-300 focus:outline-none hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-2 py-1"
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
