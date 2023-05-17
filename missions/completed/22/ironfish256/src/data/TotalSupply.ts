import { BigNumber } from '@ethersproject/bignumber';
import { Token, TokenAmount } from '@uniswap/sdk';
import { Interface } from '@ethersproject/abi';
import { useTokenContract } from 'hooks/useContract';
import {
  useSingleCallResult,
  useMultipleContractSingleData,
} from 'state/multicall/hooks';
import ERC20_ABI from 'constants/abis/erc20.json';

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const totalSupply: BigNumber = useSingleCallResult(contract, 'totalSupply')
    ?.result?.[0];

  return token && totalSupply
    ? new TokenAmount(token, totalSupply.toString())
    : undefined;
}

export function useTotalSupplys(tokens: Token[]): (TokenAmount | undefined)[] {
  const tokenAddresses = tokens.map((token) => token.address);
  const tokenInterface = new Interface(ERC20_ABI);
  const results = useMultipleContractSingleData(
    tokenAddresses,
    tokenInterface,
    'totalSupply',
  );
  return results.map((result, i) => {
    const { result: reserves } = result;
    const totalSupply: BigNumber = reserves?.[0];
    return totalSupply
      ? new TokenAmount(tokens[i], totalSupply.toString())
      : undefined;
  });
}
