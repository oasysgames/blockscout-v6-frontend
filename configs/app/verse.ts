import { getEnvValue } from './utils';

export default Object.freeze({
  opNode: {
    isHiddenTxs: getEnvValue('NEXT_PUBLIC_HOMEPAGE_HIDDEN_OP_NODE_TXS') === 'true',
  },
  bridge: {
    isVisible: getEnvValue('NEXT_PUBLIC_MENU_BRIDGE_VISIBLE') === 'true',
  },
});
