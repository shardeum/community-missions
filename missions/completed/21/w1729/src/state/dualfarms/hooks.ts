import { ChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { DualFarmListInfo, DualStakingRaw, DualStakingBasic } from 'types';
import { Token } from '@uniswap/sdk';
import { getTokenFromAddress } from 'utils';
import { TokenAddressMap, useSelectedTokenList } from 'state/lists/hooks';
import { useTokens } from 'hooks/Tokens';
import { GlobalValue } from 'constants/index';

export class WrappedDualFarmInfo implements DualStakingBasic {
  public readonly stakingInfo: DualStakingRaw;
  public readonly chainId: ChainId;
  public readonly stakingRewardAddress: string;
  public readonly pair: string;
  public readonly tokens: [Token, Token];
  public readonly ended: boolean;
  public readonly lp: string;
  public readonly name: string;
  public readonly baseToken: Token;
  public readonly rewardTokenA: Token;
  public readonly rewardTokenB: Token;
  public readonly rewardTokenBBase: Token;
  public readonly rateA: number;
  public readonly rateB: number;

  constructor(
    stakingInfo: DualStakingRaw,
    tokenAddressMap: TokenAddressMap,
    dualFarmTokens: Token[],
    chainId: ChainId,
  ) {
    this.stakingInfo = stakingInfo;
    //TODO: Support Multichain
    this.chainId = chainId;
    this.stakingRewardAddress = stakingInfo.stakingRewardAddress;
    this.ended = stakingInfo.ended;
    this.pair = stakingInfo.pair;
    this.lp = stakingInfo.lp;
    this.name = stakingInfo.name;
    this.rateA = stakingInfo.rateA;
    this.rateB = stakingInfo.rateB;

    this.baseToken = getTokenFromAddress(
      stakingInfo.baseToken,
      chainId,
      tokenAddressMap,
      dualFarmTokens,
    );
    this.tokens = [
      getTokenFromAddress(
        stakingInfo.tokens[0],
        chainId,
        tokenAddressMap,
        dualFarmTokens,
      ),
      getTokenFromAddress(
        stakingInfo.tokens[1],
        chainId,
        tokenAddressMap,
        dualFarmTokens,
      ),
    ];

    this.rewardTokenA = getTokenFromAddress(
      stakingInfo.rewardTokenA,
      chainId,
      tokenAddressMap,
      dualFarmTokens,
    );
    this.rewardTokenB = getTokenFromAddress(
      stakingInfo.rewardTokenB,
      chainId,
      tokenAddressMap,
      dualFarmTokens,
    );
    this.rewardTokenBBase = getTokenFromAddress(
      stakingInfo.rewardTokenBBase,
      chainId,
      tokenAddressMap,
      dualFarmTokens,
    );
  }
}

export type DualFarmInfoAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [stakingInfoAddress: string]: WrappedDualFarmInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: DualFarmInfoAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const dualFarmCache: WeakMap<DualFarmListInfo, DualFarmInfoAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<DualFarmListInfo, DualFarmInfoAddressMap>()
    : null;

export function listToDualFarmMap(
  list: DualFarmListInfo,
  tokenAddressMap: TokenAddressMap,
  dualFarmTokens: Token[],
): DualFarmInfoAddressMap {
  const result = dualFarmCache?.get(list);
  if (result) return result;

  const map = list.active.concat(list.closed).reduce<DualFarmInfoAddressMap>(
    (stakingInfoMap, stakingInfo) => {
      const wrappedStakingInfo = new WrappedDualFarmInfo(
        stakingInfo,
        tokenAddressMap,
        dualFarmTokens,
        ChainId.MATIC,
      );
      if (
        stakingInfoMap[wrappedStakingInfo.chainId][
          wrappedStakingInfo.stakingRewardAddress
        ] !== undefined
      )
        throw Error('Duplicate dual farms.');
      return {
        ...stakingInfoMap,
        [wrappedStakingInfo.chainId]: {
          ...stakingInfoMap[wrappedStakingInfo.chainId],
          [wrappedStakingInfo.stakingRewardAddress]: wrappedStakingInfo,
        },
      };
    },
    { ...EMPTY_LIST },
  );
  dualFarmCache?.set(list, map);
  return map;
}

export function useDualFarmList(
  url: string | undefined,
): DualFarmInfoAddressMap {
  const dualFarms = useSelector<AppState, AppState['dualFarms']['byUrl']>(
    (state) => state.dualFarms.byUrl,
  );
  const tokenMap = useSelectedTokenList();
  const current = url ? dualFarms[url]?.current : null;
  const dualTokenAddresses =
    current && tokenMap
      ? current.active
          .concat(current.closed)
          .map((item) => [
            item.baseToken,
            item.tokens[0],
            item.tokens[1],
            item.rewardTokenA,
            item.rewardTokenB,
            item.rewardTokenBBase,
          ])
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
  const dualFarmTokens = useTokens(dualTokenAddresses);
  return useMemo(() => {
    if (
      !current ||
      !tokenMap ||
      dualFarmTokens?.length !== dualTokenAddresses.length
    )
      return EMPTY_LIST;
    try {
      return listToDualFarmMap(current, tokenMap, dualFarmTokens ?? []);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [current, dualFarmTokens, dualTokenAddresses.length, tokenMap]);
}

export function useDefaultDualFarmList(): DualFarmInfoAddressMap {
  return useDualFarmList(process.env.REACT_APP_DUAL_STAKING_LIST_DEFAULT_URL);
}

// returns all downloaded current lists
export function useAllFarms(): DualFarmListInfo[] {
  const dualFarms = useSelector<AppState, AppState['dualFarms']['byUrl']>(
    (state) => state.dualFarms.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(dualFarms)
        .map((url) => dualFarms[url].current)
        .filter((l): l is DualFarmListInfo => Boolean(l)),
    [dualFarms],
  );
}
