import { chakra } from '@chakra-ui/react';
import React from 'react';

import type { TokenInfo } from 'types/api/token';

import config from 'configs/app';
import getCurrencyValue from 'lib/getCurrencyValue';
import TokenEntity from 'ui/shared/entities/token/TokenEntity';

interface Props {
  token: TokenInfo;
  value: string;
  decimals: string | null;
}
const FtTokenTransferSnippet = ({ token, value, decimals }: Props) => {
  const { valueStr, usd } = getCurrencyValue({
    value: value,
    exchangeRate: token.exchange_rate,
    accuracyUsd: 2,
    decimals: decimals,
  });

  let symbol = token.symbol;
  let tokenName = token.name;
  // in case tokens is updated name
  const updatedAddress = config.verse.tokens.updatedAddress.toLowerCase();
  if (updatedAddress.length > 0 && token.address.toLowerCase().includes(updatedAddress)) {
    tokenName = config.verse.tokens.updatedName;
    symbol = config.verse.tokens.updatedSymbol;
  }

  return (
    <>
      <chakra.span color="text_secondary">for</chakra.span>
      <span>{ valueStr }</span>
      <TokenEntity
        token={{ ...token, name: symbol || tokenName }}
        noCopy
        noSymbol
        w="auto"
      />
      { usd && <chakra.span color="text_secondary">(${ usd })</chakra.span> }
    </>
  );
};

export default React.memo(FtTokenTransferSnippet);
