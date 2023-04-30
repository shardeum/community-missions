import { ChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { SyrupListInfo, SyrupRaw, SyrupBasic } from 'types';
import { Token } from '@uniswap/sdk';
import { TokenAddressMap, useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';
import { useTokens } from 'hooks/Tokens';
import { GlobalValue } from 'constants/index';

export class WrappedSyrupInfo implements SyrupBasic {
  public readonly stakingInfo: SyrupRaw;
  public readonly chainId: ChainId;
  public readonly stakingRewardAddress: string;
  public readonly rate: number;
  public readonly ended: boolean;
  public readonly lp: string;
  public readonly name: string;
  public readonly ending: number;
  public readonly baseToken: Token;
  public readonly token: Token;
  public readonly stakingToken: Token;

  constructor(
    syrupInfo: SyrupRaw,
    tokenAddressMap: TokenAddressMap,
    syrupTokens: Token[],
    chainId: ChainId,
  ) {
    this.stakingInfo = syrupInfo;
    //TODO: Support Multichain
    this.chainId = ChainId.MATIC;
    this.stakingRewardAddress = syrupInfo.stakingRewardAddress;
    this.rate = syrupInfo.rate;
    this.ended = syrupInfo.ended;
    this.lp = syrupInfo.lp;
    this.name = syrupInfo.name;
    this.ending = syrupInfo.ending;

    this.baseToken = getTokenFromAddress(
      syrupInfo.baseToken,
      chainId,
      tokenAddressMap,
      syrupTokens,
    );
    this.stakingToken = getTokenFromAddress(
      syrupInfo.stakingToken,
      chainId,
      tokenAddressMap,
      syrupTokens,
    );
    this.token = getTokenFromAddress(
      syrupInfo.token,
      chainId,
      tokenAddressMap,
      syrupTokens,
    );
  }
}

export type SyrupInfoAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [stakingInfoAddress: string]: WrappedSyrupInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: SyrupInfoAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const syrupCache: WeakMap<SyrupListInfo, SyrupInfoAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<SyrupListInfo, SyrupInfoAddressMap>()
    : null;

export function listToSyrupMap(
  list: SyrupListInfo,
  tokenAddressMap: TokenAddressMap,
  syrupTokens: Token[],
): SyrupInfoAddressMap {
  const result = syrupCache?.get(list);
  if (result) return result;

  const map = list.active.concat(list.closed).reduce<SyrupInfoAddressMap>(
    (syrupInfoMap, syrup) => {
      const wrappedSyrupInfo = new WrappedSyrupInfo(
        syrup,
        tokenAddressMap,
        syrupTokens,
        ChainId.MATIC,
      );
      if (
        syrupInfoMap[wrappedSyrupInfo.chainId][
          wrappedSyrupInfo.stakingRewardAddress
        ] !== undefined
      )
        throw Error('Duplicate syrups.');
      return {
        ...syrupInfoMap,
        [wrappedSyrupInfo.chainId]: {
          ...syrupInfoMap[wrappedSyrupInfo.chainId],
          [wrappedSyrupInfo.stakingRewardAddress]: wrappedSyrupInfo,
        },
      };
    },
    { ...EMPTY_LIST },
  );
  syrupCache?.set(list, map);
  return map;
}

export function useSyrupList(url: string | undefined): SyrupInfoAddressMap {
  const syrups = useSelector<AppState, AppState['syrups']['byUrl']>(
    (state) => state.syrups.byUrl,
  );
  const tokenMap = useSelectedTokenList();
  const current = url ? syrups[url]?.current : null;
  const syrupTokenAddresses =
    current && tokenMap
      ? current.active
          .concat(current.closed)
          .map((item) => [item.baseToken, item.token, item.stakingToken])
          .flat()
          .filter((item) => !!item)
          .filter((address) => !tokenMap[ChainId.MATIC][address])
          .filter(
            (address) =>
              !Object.values(GlobalValue.tokens.COMMON).find(
                (token) =>
                  token.address.toLowerCase() === address.toLowerCase(),
              ),
          )
          .filter(
            (address, ind, self) =>
              self.findIndex(
                (addr) => address.toLowerCase() === addr.toLowerCase(),
              ) === ind,
          )
      : [];
  const syrupTokens = useTokens(syrupTokenAddresses);
  return useMemo(() => {
    if (
      !current ||
      !tokenMap ||
      syrupTokenAddresses.length !== syrupTokens?.length
    )
      return EMPTY_LIST;
    try {
      return listToSyrupMap(current, tokenMap, syrupTokens ?? []);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [current, tokenMap, syrupTokenAddresses.length, syrupTokens]);
}

export function useDefaultSyrupList(): SyrupInfoAddressMap {
  return useSyrupList(process.env.REACT_APP_SYRUP_LIST_DEFAULT_URL);
}

// returns all downloaded current lists
export function useAllSyrups(): SyrupListInfo[] {
  const syrups = useSelector<AppState, AppState['syrups']['byUrl']>(
    (state) => state.syrups.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(syrups)
        .map((url) => syrups[url].current)
        .filter((l): l is SyrupListInfo => Boolean(l)),
    [syrups],
  );
}
