import { getEnvValue } from './utils';

export default Object.freeze({
  opNode: {
    isHiddenTxs: getEnvValue('NEXT_PUBLIC_HOMEPAGE_HIDDEN_OP_NODE_TXS') === 'true',
  },
  tokens: {
    updatedAddress: getEnvValue('NEXT_PUBLIC_TOKENS_UPDATED_ADDRESS') || '',
    updatedName: getEnvValue('NEXT_PUBLIC_TOKENS_UPDATED_NAME') || 'Oasys',
    updatedSymbol: getEnvValue('NEXT_PUBLIC_TOKENS_UPDATED_SYMBOL') || 'OAS',
  },
});
