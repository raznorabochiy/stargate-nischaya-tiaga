import { Network } from "./types";

export const RPC_URL = {
  [Network.ARBITRUM]: "https://1rpc.io/arb",
  [Network.BASE]: "https://base.drpc.org",
  [Network.OPTIMISM]: "https://optimism-rpc.publicnode.com",
};

export const GAS_MULTIPLICATOR = 40n;

// Перемешивать ключи, чтобы запускать аккаунты в случайном порядке
export const SHUFFLE_KEYS = false;

export const DELAY_FROM_SEC = 100;
export const DELAY_TO_SEC = 200;

// Будет выбрана сеть с максимальным балансом из этого списка
export const FROM_NETWORK = [
  Network.ARBITRUM,
  Network.OPTIMISM,
  // Network.BASE,
];

export const TO_NETWORK = Network.BASE;

export const KEYS_FILENAME = "keys.txt";

export const ROUTER_ADDRESS = {
  [Network.ARBITRUM]: "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614",
  [Network.BASE]: "0x45f1a95a4d3f3836523f5c83673c797f4d4d263b",
  [Network.OPTIMISM]: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
};

export const ROUTER_ETH_ADDRESS = {
  [Network.ARBITRUM]: "0xbf22f0f184bCcbeA268dF387a49fF5238dD23E40",
  [Network.BASE]: "0x50B6EbC2103BFEc165949CC946d739d5650d7ae4",
  [Network.OPTIMISM]: "0xB49c4e680174E331CB0A7fF3Ab58afC9738d5F8b",
};

export const ROUTER_ABI = [
  "function quoteLayerZeroFee(uint16 _dstChainId, uint8 _functionType, bytes _toAddress, bytes _transferAndCallPayload, tuple(uint256 dstGasForCall, uint256 dstNativeAmount, bytes dstNativeAddr) _lzTxParams) view returns (uint256, uint256)",
  "function swap(uint16 _dstChainId, uint256 _srcPoolId, uint256 _dstPoolId, address _refundAddress, uint256 _amountLD, uint256 _minAmountLD, tuple(uint256 dstGasForCall, uint256 dstNativeAmount, bytes dstNativeAddr) _lzTxParams, bytes _to, bytes _payload) payable",
];

export const ROUTER_ETH_ABI = [
  "function swapETH(uint16 _dstChainId, address _refundAddress, bytes _toAddress, uint256 _amountLD, uint256 _minAmountLD) payable",
];

export const SLIPPAGE = {
  "0.1%": 1n,
  "0.5%": 5n,
  "1%": 10n,
};

export const DST_CHAIN_ID = {
  [Network.ARBITRUM]: 110,
  [Network.BASE]: 184,
  [Network.OPTIMISM]: 111,
};

export const TX_SCAN = {
  [Network.ARBITRUM]: "https://arbiscan.io/tx/",
  [Network.BASE]: "https://basescan.org/tx/",
  [Network.OPTIMISM]: "https://optimistic.etherscan.io/tx/",
};
