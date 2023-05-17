import { ChainId } from '@uniswap/sdk';
import MULTICALL_ABI from './abi.json';

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MUMBAI]: '0xffF0C223Bc420c6488D71435fb94a4EEA41BbDa8', //TODO: CHANGE THIS
  [ChainId.MATIC]: '0x9A9f2AD16ABDDe7e76D60332b53DdFb99d967Cd5',
};

export { MULTICALL_ABI, MULTICALL_NETWORKS };
