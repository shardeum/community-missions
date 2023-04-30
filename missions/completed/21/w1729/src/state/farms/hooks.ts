import { ChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { FarmListInfo, StakingRaw, StakingBasic } from 'types';
import { Token } from '@uniswap/sdk';
import { TokenAddressMap, useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';
import { useTokens } from 'hooks/Tokens';
import { GlobalValue } from 'constants/index';

export class WrappedStakingInfo implements StakingBasic {
  public readonly stakingInfo: StakingRaw;
  public readonly chainId: ChainId;
  public readonly stakingRewardAddress: string;
  public readonly pair: string;
  public readonly rate: number;
  public readonly tokens: [Token, Token];
  public readonly ended: boolean;
  public readonly lp: string;
  public readonly name: string;
  public readonly baseToken: Token;
  public readonly rewardToken: Token;

  constructor(
    stakingInfo: StakingRaw,
    tokenAddressMap: TokenAddressMap,
    farmTokens: Token[],
    chainId: ChainId,
  ) {
    this.stakingInfo = stakingInfo;
    //TODO: Support Multichain
    this.chainId = chainId;
    this.stakingRewardAddress = stakingInfo.stakingRewardAddress;
    this.rate = stakingInfo.rate;
    this.ended = stakingInfo.ended;
    this.pair = stakingInfo.pair;
    this.lp = stakingInfo.lp;
    this.name = stakingInfo.name;

    this.baseToken = getTokenFromAddress(
      stakingInfo.baseToken,
      chainId,
      tokenAddressMap,
      farmTokens,
    );
    this.tokens = [
      getTokenFromAddress(
        stakingInfo.tokens[0],
        chainId,
        tokenAddressMap,
        farmTokens,
      ),
      getTokenFromAddress(
        stakingInfo.tokens[1],
        chainId,
        tokenAddressMap,
        farmTokens,
      ),
    ];
    this.rewardToken = stakingInfo.rewardToken
      ? getTokenFromAddress(
          stakingInfo.rewardToken,
          chainId,
          tokenAddressMap,
          farmTokens,
        )
      : GlobalValue.tokens.COMMON.OLD_DQUICK;
  }
}

export type StakingInfoAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [stakingInfoAddress: string]: WrappedStakingInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: StakingInfoAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const farmCache: WeakMap<FarmListInfo, StakingInfoAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<FarmListInfo, StakingInfoAddressMap>()
    : null;

export function listToFarmMap(
  list: FarmListInfo,
  tokenAddressMap: TokenAddressMap,
  farmTokens: Token[],
): StakingInfoAddressMap {
  const result = farmCache?.get(list);
  if (result) return result;

  const map = list.active.concat(list.closed).reduce<StakingInfoAddressMap>(
    (stakingInfoMap, stakingInfo) => {
      const wrappedStakingInfo = new WrappedStakingInfo(
        stakingInfo,
        tokenAddressMap,
        farmTokens,
        ChainId.MUMBAI,
      );
      if (
        stakingInfoMap[wrappedStakingInfo.chainId][
          wrappedStakingInfo.stakingRewardAddress
        ] !== undefined
      )
        throw Error('Duplicate farms.');
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
  farmCache?.set(list, map);
  return map;
}

export function useFarmList(url: string | undefined): StakingInfoAddressMap {
  const farms = useSelector<AppState, AppState['farms']['byUrl']>(
    (state) => state.farms.byUrl,
  );
  const data={
    "name": "Quickswap LP Farms",
    "timestamp": "2022-08-31T16:35:55.488Z",
    "version": {
      "major": 1,
      "minor": 0,
      "patch": 16
    },
    "tags": {},
    "logoURI": "ipfs://QmQ9GCVmLQkbPohxKeCYkbpmwfTvHXrY64TmBsPQAZdbqZ",
    "keywords": [
      "quickswap",
      "default"
    ],
    "active": [
      {
        "tokens": ["0x3333fACbD5430955fD3991d8eED0F12875553b98",
          "0xb59610E622A9bB846c78DB89C14542D79680c43F"
          
        ],
        "stakingRewardAddress": "0x8CE3A231564C7c923A595Cd531fbfce73e0A1Ca2",
        "ended": false,
        "lp": "",
        "name": "",
        "baseToken": "0xb59610E622A9bB846c78DB89C14542D79680c43F",
        "rate": 4285,
        "pair": "0xff86Ae8F6F6dc83c0a5e5CA4e00FD92c49371317",
        "rewardToken":"0x36EC556a94C0bd6a0c3489a09fB4AF40f0De7733"
      },
      {
        "tokens": ["0x2E831B4720e739EED513b30fa45C2A37f50ADcc7",
          "0x33Fc2B7b9b72365cAcAF2B4DA27820f263B7d93c"
          
        ],
        "stakingRewardAddress": "0x13792EF14564bC39635B3239aCaB0aAa70f79C18",
        "ended": false,
        "lp": "",
        "name": "",
        "baseToken": "0x33Fc2B7b9b72365cAcAF2B4DA27820f263B7d93c",
        "rate": 714,
        "pair": "0x9Ca80461091364FB323bbDb623a368A066C5b44f",
        "rewardToken":"0x36EC556a94C0bd6a0c3489a09fB4AF40f0De7733"
      }

    ],
    "closed": [
       
      
    ]
    
    };

  const tokenMap = useSelectedTokenList();
  const current= data;
  console.log("current farm",data,current,tokenMap);
  const farmTokenAddresses =
    current && tokenMap
      ? current.active
          .concat(current.closed)
          .map((item) => [
            item.baseToken,
            item.tokens[0],
            item.tokens[1],
            item.rewardToken,
          ])
          .flat()
          .filter((item) => !!item)
          .filter((address) => !tokenMap[ChainId.MUMBAI][address])
          .filter(
            (address) =>
              !Object.values(GlobalValue.tokens.COMMON).find(
                (token) =>
                  token.address.toLowerCase() === address.toLowerCase(),
              ),
          )
          .filter(
            (addr, ind, self) =>
              self.findIndex(
                (address) => address.toLowerCase() === addr.toLowerCase(),
              ) === ind,
          )
      : [];

  console.log('bbb', current.active.concat(current.closed).map((item) => [
    item.baseToken,
    item.tokens[0],
    item.tokens[1],
    item.rewardToken,
  ]).flat().filter((item) => !!item)
  .filter((address) => !tokenMap[ChainId.MUMBAI][address]));

  const farmTokens = useTokens(farmTokenAddresses);
  console.log('bbb1',farmTokens)
  return useMemo(() => {
    if (
      !current ||
      !tokenMap ||
      farmTokens?.length !== farmTokenAddresses.length
    )
      return EMPTY_LIST;
    try {
      return listToFarmMap(current, tokenMap, farmTokens ?? []);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [current, farmTokens, farmTokenAddresses.length, tokenMap]);
}

export function useDefaultFarmList(): StakingInfoAddressMap {
  return useFarmList(process.env.REACT_APP_STAKING_LIST_DEFAULT_URL);
}

// returns all downloaded current lists
export function useAllFarms(): FarmListInfo[] {
  const farms = useSelector<AppState, AppState['farms']['byUrl']>(
    (state) => state.farms.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(farms)
        .map((url) => farms[url].current)
        .filter((l): l is FarmListInfo => Boolean(l)),
    [farms],
  );
}
