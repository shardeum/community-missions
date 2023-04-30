import {
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  Pair,
  ChainId,
} from '@uniswap/sdk';
import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';
import { usePairs } from 'data/Reserves';

import { client } from 'apollo/client';
import { GLOBAL_DATA, PAIRS_BULK, PAIRS_HISTORICAL_BULK } from 'apollo/queries';
import { GlobalConst, GlobalValue } from 'constants/index';
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
} from 'constants/abis/staking-rewards';
import { useActiveWeb3React } from 'hooks';
import {
  CallState,
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
} from 'state/multicall/hooks';
import { tryParseAmount } from 'state/swap/hooks';
import Web3 from 'web3';
import {
  useLairContract,
  useNewLairContract,
  useNewQUICKContract,
  useQUICKContract,
} from 'hooks/useContract';
import { useUSDCPrices, useUSDCPricesToken } from 'utils/useUSDCPrice';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTotalSupplys } from 'data/TotalSupply';
import {
  getBlockFromTimestamp,
  getDaysCurrentYear,
  getFarmLPToken,
  getOneYearFee,
  getSyrupLPToken,
  initTokenAmountFromCallResult,
  getCallStateResult,
} from 'utils';

import {
  SyrupInfo,
  LairInfo,
  StakingInfo,
  DualStakingInfo,
  StakingBasic,
  DualStakingBasic,
} from 'types';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { useDefaultSyrupList } from 'state/syrups/hooks';
import { Contract } from '@ethersproject/contracts';

const web3 = new Web3('https://rpc-testnet.dogechain.dog');

export const STAKING_GENESIS = 1620842940;

export const REWARDS_DURATION_DAYS = 7;

let pairs: any = undefined;

let oneDayVol: any = undefined;

export function useTotalRewardsDistributed(chainId: ChainId): number {
  const syrupRewardsInfo = Object.values(useDefaultSyrupList()[chainId]);
  const dualStakingRewardsInfo = Object.values(
    useDefaultDualFarmList()[chainId],
  ).filter((x) => !x.ended);
  const stakingRewardsInfo = Object.values(
    useDefaultFarmList()[chainId],
  ).filter((x) => !x.ended);

  const syrupTokenPairs = usePairs(
    syrupRewardsInfo.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );
  const syrupUSDBaseTokenPrices = useUSDCPrices(
    syrupRewardsInfo.map((item) => unwrappedToken(item.baseToken)),
  );
  const syrupRewardsUSD = syrupRewardsInfo.reduce((total, item, index) => {
    const [, syrupTokenPair] = syrupTokenPairs[index];
    const tokenPairPrice = syrupTokenPair?.priceOf(item.token);
    const usdPriceBaseToken = syrupUSDBaseTokenPrices[index];
    const priceOfRewardTokenInUSD =
      Number(tokenPairPrice?.toSignificant()) *
      Number(usdPriceBaseToken?.toSignificant());
    return total + priceOfRewardTokenInUSD * item.rate;
  }, 0);

  const rewardTokenAPrices = useUSDCPricesToken(
    dualStakingRewardsInfo.map((item) => item.rewardTokenA),
  );
  const rewardTokenBPrices = useUSDCPricesToken(
    dualStakingRewardsInfo.map((item) => item.rewardTokenB),
  );
  const dualStakingRewardsUSD = dualStakingRewardsInfo.reduce(
    (total, item, index) =>
      total +
      item.rateA * rewardTokenAPrices[index] +
      item.rateB * rewardTokenBPrices[index],
    0,
  );

  const rewardTokenPrices = useUSDCPricesToken(
    stakingRewardsInfo.map((item) => item.rewardToken),
  );
  const stakingRewardsUSD = stakingRewardsInfo.reduce(
    (total, item, index) => total + item.rate * rewardTokenPrices[index],
    0,
  );

  return syrupRewardsUSD + dualStakingRewardsUSD + stakingRewardsUSD;
}

export function useUSDRewardsandFees(
  isLPFarm: boolean,
  bulkPairData: any,
  chainId: ChainId,
): { rewardsUSD: number; stakingFees: number | null } {
  const activeFarms = Object.values(useDefaultFarmList()[chainId]).filter(
    (x) => !x.ended,
  );
  const activeDualFarms = Object.values(
    useDefaultDualFarmList()[chainId],
  ).filter((x) => !x.ended);
  const stakingRewardsInfo = isLPFarm ? activeFarms : [];
  const dualStakingRewardsInfo = !isLPFarm ? activeDualFarms : [];
  const rewardsInfos = isLPFarm ? stakingRewardsInfo : dualStakingRewardsInfo;
  const rewardsAddresses = useMemo(
    () => rewardsInfos.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [rewardsInfos],
  );
  const stakingRewardTokens = stakingRewardsInfo.map(
    (item) => item.rewardToken,
  );
  const stakingRewardTokenPrices = useUSDCPricesToken(stakingRewardTokens);
  const dualStakingRewardTokenAPrices = useUSDCPricesToken(
    dualStakingRewardsInfo.map((item) => item.rewardTokenA),
  );
  const dualStakingRewardTokenBPrices = useUSDCPricesToken(
    dualStakingRewardsInfo.map((item) => item.rewardTokenB),
  );
  const rewardPairs = useMemo(() => rewardsInfos.map(({ pair }) => pair), [
    rewardsInfos,
  ]);
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    isLPFarm ? STAKING_REWARDS_INTERFACE : STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );
  let rewardsUSD: number | null = null;
  if (isLPFarm) {
    rewardsUSD = stakingRewardsInfo.reduce(
      (total, item, index) =>
        total + item.rate * stakingRewardTokenPrices[index],
      0,
    );
  } else {
    rewardsUSD = dualStakingRewardsInfo.reduce(
      (total, item, index) =>
        total +
        item.rateA * dualStakingRewardTokenAPrices[index] +
        item.rateB * dualStakingRewardTokenBPrices[index],
      0,
    );
  }
  const stakingFees = bulkPairData
    ? rewardPairs.reduce((total, pair, index) => {
        const oneYearFeeAPY = Number(bulkPairData[pair]?.oneDayVolumeUSD ?? 0);
        const totalSupplyState = totalSupplies[index];
        if (oneYearFeeAPY) {
          const totalSupply = web3.utils.toWei(
            pairs[pair]?.totalSupply,
            'ether',
          );
          const ratio =
            Number(totalSupplyState.result?.[0].toString()) /
            Number(totalSupply);
          const oneDayFee =
            oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
          return total + oneDayFee;
        } else {
          return total;
        }
      }, 0)
    : null;

  return { rewardsUSD, stakingFees };
}

export function useFilteredSyrupInfo(
  chainId: ChainId,
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { account } = useActiveWeb3React();
  const currentTimestamp = dayjs().unix();
  const allSyrups = useDefaultSyrupList()[chainId];
  const info = useMemo(
    () =>
      Object.values(allSyrups)
        .slice(startIndex, endIndex)
        .filter(
          (syrupInfo) =>
            syrupInfo.ending > currentTimestamp &&
            (tokenToFilterBy === undefined || tokenToFilterBy === null
              ? getSearchFiltered(syrupInfo, filter ? filter.search : '')
              : tokenToFilterBy.equals(syrupInfo.token)),
        ),
    [
      tokenToFilterBy,
      startIndex,
      endIndex,
      filter,
      currentTimestamp,
      allSyrups,
    ],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  const stakingTokenPairs = usePairs(
    info.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );

  const usdBaseTokenPrices = useUSDCPrices(
    info.map((item) => unwrappedToken(item.baseToken)),
  );

  const stakingTokenPrices = useUSDCPricesToken(
    info.map((item) => item.stakingToken),
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];
        const stakingTokenPrice = stakingTokenPrices[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const syrupInfo = info[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading
        ) {
          // get the LP token
          const token = syrupInfo.token;
          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            tokenPairPrice && usdPriceBaseToken
              ? Number(tokenPairPrice.toSignificant()) *
                Number(usdPriceBaseToken.toSignificant())
              : undefined;

          const rewards = syrupInfo.rate * (priceOfRewardTokenInUSD ?? 0);

          // check for account, if no account set to 0
          const rate = web3.utils.toWei(syrupInfo.rate.toString());
          const syrupToken = getSyrupLPToken(syrupInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            syrupToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            syrupToken,
            totalSupplyState,
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const rewardRate = initTokenAmountFromCallResult(
            token,
            rewardRateState,
          );
          const getHypotheticalRewardRate = (
            stakedAmount?: TokenAmount,
            totalStakedAmount?: TokenAmount,
          ): TokenAmount | undefined => {
            if (!stakedAmount || !totalStakedAmount || !rewardRate) return;
            return new TokenAmount(
              token,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(rewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
          );

          const periodFinishMs = syrupInfo.ending;

          memo.push({
            stakingRewardAddress: rewardsAddress,
            token: syrupInfo.token,
            ended: syrupInfo.ended,
            name: syrupInfo.name,
            lp: syrupInfo.lp,
            periodFinish: periodFinishMs,
            earnedAmount: initTokenAmountFromCallResult(
              token,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: syrupInfo.baseToken,
            rate: syrupInfo.rate,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            rewards,
            stakingToken: syrupInfo.stakingToken,
            valueOfTotalStakedAmountInUSDC: totalStakedAmount
              ? Number(totalStakedAmount.toExact()) * stakingTokenPrice
              : undefined,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRates,
    stakingTokenPairs,
    usdBaseTokenPrices,
    stakingTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked
      ? syrupInfo.stakedAmount && syrupInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldSyrupInfo(
  chainId: ChainId,
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { account } = useActiveWeb3React();
  const currentTimestamp = dayjs().unix();
  const allOldSyrupInfos = useDefaultSyrupList()[chainId];

  const info = useMemo(() => {
    return Object.values(allOldSyrupInfos)
      .filter((x) => x.ending <= currentTimestamp)
      .slice(startIndex, endIndex)
      .filter((syrupInfo) =>
        tokenToFilterBy === undefined || tokenToFilterBy === null
          ? getSearchFiltered(syrupInfo, filter ? filter.search : '')
          : tokenToFilterBy.equals(syrupInfo.token),
      );
  }, [
    tokenToFilterBy,
    startIndex,
    endIndex,
    filter,
    currentTimestamp,
    allOldSyrupInfos,
  ]);

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  const stakingTokenPairs = usePairs(
    info.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );

  const usdBaseTokenPrices = useUSDCPrices(
    info.map((item) => unwrappedToken(item.baseToken)),
  );

  const stakingTokenPrices = useUSDCPricesToken(
    info.map((item) => item.stakingToken),
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const syrupInfo = info[index];
        const stakingTokenPrice = stakingTokenPrices[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading
        ) {
          // get the LP token
          const token = syrupInfo.token;

          // check for account, if no account set to 0
          const rate = web3.utils.toWei(syrupInfo.rate.toString());
          const stakedAmount = initTokenAmountFromCallResult(
            getSyrupLPToken(syrupInfo),
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            getSyrupLPToken(syrupInfo),
            totalSupplyState,
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const rewardRate = initTokenAmountFromCallResult(
            token,
            rewardRateState,
          );
          const getHypotheticalRewardRate = (
            stakedAmount?: TokenAmount,
            totalStakedAmount?: TokenAmount,
          ): TokenAmount | undefined => {
            if (!stakedAmount || !totalStakedAmount || !rewardRate) return;
            return new TokenAmount(
              token,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(rewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
          );

          const periodFinishMs = syrupInfo.ending;

          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            Number(tokenPairPrice?.toSignificant()) *
            Number(usdPriceBaseToken?.toSignificant());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            token: syrupInfo.token,
            ended: true,
            name: syrupInfo.name,
            lp: syrupInfo.lp,
            periodFinish: periodFinishMs,
            earnedAmount: initTokenAmountFromCallResult(
              token,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: syrupInfo.baseToken,
            rate: 0,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            stakingToken: syrupInfo.stakingToken,
            valueOfTotalStakedAmountInUSDC: totalStakedAmount
              ? Number(totalStakedAmount.toExact()) * stakingTokenPrice
              : undefined,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRates,
    stakingTokenPairs,
    usdBaseTokenPrices,
    stakingTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked
      ? syrupInfo.stakedAmount && syrupInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export const getBulkPairData = async (pairList: any) => {
  // if (pairs !== undefined) {
  //   return;
  // }
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();

  const oneDayOldBlock = await getBlockFromTimestamp(utcOneDayBack);

  try {
    const current = await client.query({
      query: PAIRS_BULK(pairList),
      fetchPolicy: 'network-only',
    });

    const [oneDayResult] = await Promise.all(
      [oneDayOldBlock].map(async (block) => {
        const cResult = await client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'network-only',
        });

        return cResult;
      }),
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce(
      (obj: any, cur: any, i: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const pairData =
      current &&
      current.data.pairs.map((pair: any) => {
        let data = pair;
        const oneDayHistory = oneDayData?.[pair.id];

        data = parseData(data, oneDayHistory);
        return data;
      });

    const object = convertArrayToObject(pairData, 'id');
    if (Object.keys(object).length > 0) {
      pairs = object;
      return object;
    }
    return object;
  } catch (e) {
    console.log(e);
    return;
  }
};

const getOneDayVolume = async () => {
  let data: any = {};
  let oneDayData: any = {};

  const current = await web3.eth.getBlockNumber();
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();

  const oneDayOldBlock = await getBlockFromTimestamp(utcOneDayBack);

  const result = await client.query({
    query: GLOBAL_DATA(current),
    fetchPolicy: 'network-only',
  });

  data = result.data.uniswapFactories[0];

  // fetch the historical data
  const oneDayResult = await client.query({
    query: GLOBAL_DATA(oneDayOldBlock),
    fetchPolicy: 'network-only',
  });
  oneDayData = oneDayResult.data.uniswapFactories[0];

  let oneDayVolumeUSD: any = 0;

  if (data && oneDayData) {
    oneDayVolumeUSD = get2DayPercentChange(
      data.totalVolumeUSD,
      oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
    );
    oneDayVol = oneDayVolumeUSD;
  }

  return oneDayVolumeUSD;
};

const convertArrayToObject = (array: any, key: any) => {
  const initialValue = {};
  return array.reduce((obj: any, item: any) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

export const get2DayPercentChange = (valueNow: any, value24HoursAgo: any) => {
  // get volume info for both 24 hour periods
  return Number(valueNow) - Number(value24HoursAgo);
};

function parseData(data: any, oneDayData: any) {
  // get volume changes
  const oneDayVolumeUSD = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
  );
  return {
    id: data.id,
    token0: data.token0,
    token1: data.token1,
    oneDayVolumeUSD,
    reserveUSD: data.reserveUSD,
    totalSupply: data.totalSupply,
  };
}

function getSearchFiltered(info: any, search: string) {
  const searchLowered = search.toLowerCase();
  if (info.tokens) {
    const infoToken0 = info.tokens[0];
    const infoToken1 = info.tokens[1];
    return (
      (infoToken0.symbol ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken0.name ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken0.address ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken1.symbol ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken1.name ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken1.address ?? '').toLowerCase().indexOf(searchLowered) > -1
    );
  } else if (info.token) {
    return (
      (info.token.symbol ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (info.token.name ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (info.token.address ?? '').toLowerCase().indexOf(searchLowered) > -1
    );
  } else {
    return false;
  }
}

export function getStakingFees(
  stakingInfo: StakingBasic | DualStakingBasic,
  balanceState?: CallState,
  totalSupplyState?: CallState,
) {
  let oneYearFeeAPY = 0;
  let oneDayFee = 0;
  let accountFee = 0;
  if (pairs !== undefined) {
    oneYearFeeAPY = pairs[stakingInfo.pair]?.oneDayVolumeUSD;
    const balanceResult = getCallStateResult(balanceState);
    const totalSupplyResult = getCallStateResult(totalSupplyState);

    if (oneYearFeeAPY && balanceResult && totalSupplyResult) {
      const totalSupply = web3.utils.toWei(
        pairs[stakingInfo.pair]?.totalSupply,
        'ether',
      );
      const ratio = Number(totalSupplyResult) / Number(totalSupply);
      const myRatio = Number(balanceResult) / Number(totalSupplyResult);
      oneDayFee = oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
      accountFee = oneDayFee * myRatio;
      oneYearFeeAPY = getOneYearFee(
        oneYearFeeAPY,
        pairs[stakingInfo.pair]?.reserveUSD,
      );
    }
  }
  return { oneYearFeeAPY, oneDayFee, accountFee };
}

const getHypotheticalRewardRate = (
  token: Token,
  stakedAmount?: TokenAmount,
  totalStakedAmount?: TokenAmount,
  totalRewardRate?: TokenAmount,
): TokenAmount | undefined => {
  if (!stakedAmount || !totalStakedAmount || !totalRewardRate) return;
  return new TokenAmount(
    token,
    JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
      ? JSBI.divide(
          JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
          totalStakedAmount.raw,
        )
      : JSBI.BigInt(0),
  );
};

// gets the dual rewards staking info from the network for the active chain id
export function useDualStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean; isEndedFarm: boolean },
): DualStakingInfo[] {
  const { account } = useActiveWeb3React();
  const dualStakingRewardsInfo = useDefaultDualFarmList();

  const info = useMemo(
    () =>
      Object.values(dualStakingRewardsInfo[chainId])
        .filter((x) => (filter?.isEndedFarm ? x.ended : !x.ended))
        .slice(startIndex, endIndex)
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        ),
    [
      chainId,
      pairToFilterBy,
      startIndex,
      endIndex,
      filter,
      dualStakingRewardsInfo,
    ],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'earnedA',
    accountArg,
  );
  const earnedBAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'earnedB',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );
  const rewardRatesA = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'rewardRateA',
    undefined,
    NEVER_RELOAD,
  );

  const rewardRatesB = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'rewardRateB',
    undefined,
    NEVER_RELOAD,
  );

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = unwrappedToken(GlobalValue.tokens.COMMON.EMPTY);
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const usdPrices = useUSDCPrices(baseTokens);
  const totalSupplys = useTotalSupplys(
    info.map((item) => getFarmLPToken(item)),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));
  const rewardTokenAPrices = useUSDCPricesToken(
    info.map((item) => item.rewardTokenA),
  );
  const rewardTokenBPrices = useUSDCPricesToken(
    info.map((item) => item.rewardTokenB),
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<DualStakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAAmountState = earnedAAmounts[index];
        const earnedBAmountState = earnedBAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateAState = rewardRatesA[index];
        const rewardRateBState = rewardRatesB[index];
        const stakingInfo = info[index];
        const rewardTokenAPrice = rewardTokenAPrices[index];
        const rewardTokenBPrice = rewardTokenBPrices[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAAmountState?.loading &&
          !earnedBAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateAState &&
          !rewardRateAState.loading &&
          rewardRateBState
        ) {
          const rateA = web3.utils.toWei(stakingInfo.rateA.toString());
          const rateB = web3.utils.toWei(stakingInfo.rateB.toString());
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = GlobalValue.tokens.COMMON.NEW_QUICK;
          const totalRewardRateA = new TokenAmount(
            dummyToken,
            JSBI.BigInt(stakingInfo.ended ? 0 : rateA),
          );
          const totalRewardRateB = new TokenAmount(
            dummyToken,
            JSBI.BigInt(stakingInfo.ended ? 0 : rateB),
          );
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRateA01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateAState,
          );
          const totalRewardRateB01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateBState,
          );

          const individualRewardRateA = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRateA01,
          );
          const individualRewardRateB = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRateB01,
          );

          const { oneDayFee, accountFee } = getStakingFees(
            stakingInfo,
            balanceState,
            totalSupplyState,
          );

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (
            totalSupply &&
            stakingTokenPair &&
            baseTokens[index] &&
            totalStakedAmount
          ) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toExact()
            : valueOfTotalStakedAmountInBaseToken?.toExact();

          const perMonthReturnInRewards =
            ((stakingInfo.rateA * rewardTokenAPrice +
              stakingInfo.rateB * rewardTokenBPrice) *
              (getDaysCurrentYear() / 12)) /
            Number(valueOfTotalStakedAmountInUSDC?.toExact());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            earnedAmountA: initTokenAmountFromCallResult(
              dummyToken,
              earnedAAmountState,
            ),
            earnedAmountB: initTokenAmountFromCallResult(
              dummyToken,
              earnedBAmountState,
            ),
            rewardRateA: individualRewardRateA,
            rewardRateB: individualRewardRateB,
            totalRewardRateA: totalRewardRateA,
            totalRewardRateB: totalRewardRateB,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rateA: stakingInfo.rateA,
            rateB: stakingInfo.rateB,
            rewardTokenA: stakingInfo.rewardTokenA,
            rewardTokenB: stakingInfo.rewardTokenB,
            rewardTokenBBase: stakingInfo.rewardTokenBBase,
            rewardTokenAPrice: stakingInfo.ended ? 0 : rewardTokenAPrice,
            rewardTokenBPrice: stakingInfo.ended ? 0 : rewardTokenBPrice,
            tvl,
            perMonthReturnInRewards: stakingInfo.ended
              ? undefined
              : perMonthReturnInRewards,
            totalSupply: stakingInfo.ended ? undefined : totalSupply,
            usdPrice,
            stakingTokenPair,
            oneDayFee: stakingInfo.ended ? 0 : oneDayFee,
            accountFee: stakingInfo.ended ? 0 : accountFee,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAAmounts,
    earnedBAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRatesA,
    rewardRatesB,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
    rewardTokenAPrices,
    rewardTokenBPrices,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldLairInfo(): LairInfo {
  const lairContract = useLairContract();
  const quickContract = useQUICKContract();
  const lairAddress = GlobalConst.addresses.LAIR_ADDRESS;
  const quickToken = GlobalValue.tokens.COMMON.OLD_QUICK;
  const dQuickToken = GlobalValue.tokens.COMMON.OLD_DQUICK;

  return useLairInfo(
    lairContract,
    quickContract,
    lairAddress,
    quickToken,
    dQuickToken,
  );
}

export function useNewLairInfo(): LairInfo {
  const lairContract = useNewLairContract();
  const quickContract = useNewQUICKContract();
  const lairAddress = GlobalConst.addresses.NEW_LAIR_ADDRESS;
  const quickToken = GlobalValue.tokens.COMMON.NEW_QUICK;
  const dQuickToken = GlobalValue.tokens.COMMON.NEW_DQUICK;

  return useLairInfo(
    lairContract,
    quickContract,
    lairAddress,
    quickToken,
    dQuickToken,
  );
}

function useLairInfo(
  lairContract: Contract | null,
  quickContract: Contract | null,
  lairAddress: string,
  quickToken: Token,
  dQuickToken: Token,
) {
  const { account } = useActiveWeb3React();

  let accountArg = useMemo(() => [account ?? undefined], [account]);
  const inputs = ['1000000000000000000'];
  const _dQuickTotalSupply = useSingleCallResult(
    lairContract,
    'totalSupply',
    [],
  );

  const quickBalance = useSingleCallResult(
    lairContract,
    'QUICKBalance',
    accountArg,
  );
  const dQuickBalance = useSingleCallResult(
    lairContract,
    'balanceOf',
    accountArg,
  );
  const dQuickToQuick = useSingleCallResult(
    lairContract,
    'dQUICKForQUICK',
    inputs,
  );
  const quickToDQuick = useSingleCallResult(
    lairContract,
    'QUICKForDQUICK',
    inputs,
  );

  accountArg = [lairAddress ?? undefined];

  const lairsQuickBalance = useSingleCallResult(
    quickContract,
    'balanceOf',
    accountArg,
  );

  useEffect(() => {
    getOneDayVolume();
  }, []);

  return useMemo(() => {
    return {
      lairAddress: lairAddress,
      dQUICKtoQUICK: new TokenAmount(
        quickToken,
        JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
      ),
      QUICKtodQUICK: new TokenAmount(
        dQuickToken,
        JSBI.BigInt(quickToDQuick?.result?.[0] ?? 0),
      ),
      dQUICKBalance: new TokenAmount(
        dQuickToken,
        JSBI.BigInt(dQuickBalance?.result?.[0] ?? 0),
      ),
      QUICKBalance: new TokenAmount(
        quickToken,
        JSBI.BigInt(quickBalance?.result?.[0] ?? 0),
      ),
      totalQuickBalance: new TokenAmount(
        quickToken,
        JSBI.BigInt(lairsQuickBalance?.result?.[0] ?? 0),
      ),
      dQuickTotalSupply: new TokenAmount(
        dQuickToken,
        JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
      ),
      oneDayVol: oneDayVol,
    };
  }, [
    lairAddress,
    quickBalance,
    dQuickBalance,
    _dQuickTotalSupply,
    lairsQuickBalance,
    dQuickToQuick,
    quickToDQuick,
    dQuickToken,
    quickToken,
  ]);
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { account } = useActiveWeb3React();
  const activeFarms = useDefaultFarmList()[chainId];
  const info = useMemo(
    () =>
      Object.values(activeFarms)
        .filter((x) => !x.ended)
        .slice(startIndex, endIndex)
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        ),
    [pairToFilterBy, startIndex, endIndex, filter, activeFarms],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = GlobalValue.tokens.COMMON.EMPTY;
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });
  const rewardTokens = info.map((item) => item.rewardToken);

  const usdPrices = useUSDCPrices(baseTokens);
  const usdPricesRewardTokens = useUSDCPricesToken(rewardTokens);
  const totalSupplys = useTotalSupplys(
    info.map((item) => {
      const lp = item.lp;
      const dummyPair = new Pair(
        new TokenAmount(item.tokens[0], '0'),
        new TokenAmount(item.tokens[1], '0'),
      );
      return lp && lp !== ''
        ? new Token(137, lp, 18, 'SLP', 'Staked LP')
        : dummyPair.liquidityToken;
    }),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const stakingInfo = info[index];
        const rewardTokenPrice = usdPricesRewardTokens[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading
        ) {
          const rate = web3.utils.toWei(stakingInfo.rate.toString());
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = GlobalValue.tokens.COMMON.NEW_QUICK;
          const totalRewardRate = new TokenAmount(
            dummyToken,
            JSBI.BigInt(rate),
          );
          const totalRewardRate01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateState,
          );

          const individualRewardRate = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRate01,
          );

          const { oneYearFeeAPY, oneDayFee, accountFee } = getStakingFees(
            stakingInfo,
            balanceState,
            totalSupplyState,
          );

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (
            totalSupply &&
            stakingTokenPair &&
            baseTokens[index] &&
            totalStakedAmount
          ) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toExact()
            : valueOfTotalStakedAmountInBaseToken?.toExact();

          const perMonthReturnInRewards =
            (Number(stakingInfo.rate) *
              rewardTokenPrice *
              (getDaysCurrentYear() / 12)) /
            Number(valueOfTotalStakedAmountInUSDC?.toExact());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            rewardToken: stakingInfo.rewardToken,
            rewardTokenPrice,
            earnedAmount: initTokenAmountFromCallResult(
              dummyToken,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rate: stakingInfo.rate,
            oneYearFeeAPY: oneYearFeeAPY,
            oneDayFee,
            accountFee,
            tvl,
            perMonthReturnInRewards,
            valueOfTotalStakedAmountInBaseToken,
            usdPrice,
            stakingTokenPair,
            totalSupply,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRates,
    usdPricesRewardTokens,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { account } = useActiveWeb3React();
  const oldFarms = useDefaultFarmList()[chainId];
  const info = useMemo(
    () =>
      Object.values(oldFarms)
        .filter((x) => x.ended)
        .slice(startIndex, endIndex)
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        ),
    [pairToFilterBy, startIndex, endIndex, filter, oldFarms],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const stakingPairs = usePairs(info.map((item) => item.tokens));

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];

        const stakingInfo = info[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading
        ) {
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = GlobalValue.tokens.COMMON.NEW_QUICK;
          const totalRewardRate = new TokenAmount(dummyToken, JSBI.BigInt(0));

          const individualRewardRate = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRate,
          );

          const [, stakingTokenPair] = stakingPairs[index];

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            rewardToken: stakingInfo.rewardToken,
            rewardTokenPrice: 0,
            earnedAmount: initTokenAmountFromCallResult(
              dummyToken,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rate: stakingInfo.rate,
            oneYearFeeAPY: 0,
            oneDayFee: 0,
            accountFee: 0,
            stakingTokenPair,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useDQUICKtoQUICK() {
  const lair = useLairContract();
  const inputs = ['1000000000000000000'];
  const dQuickToQuickState = useSingleCallResult(
    lair,
    'dQUICKForQUICK',
    inputs,
  );
  if (dQuickToQuickState.loading || dQuickToQuickState.error) return 0;
  return Number(
    new TokenAmount(
      GlobalValue.tokens.COMMON.OLD_QUICK,
      JSBI.BigInt(dQuickToQuickState?.result?.[0] ?? 0),
    ).toExact(),
  );
}

export function useDerivedSyrupInfo(
  typedValue: string,
  stakingToken: Token | undefined,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token | undefined,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

export function useDerivedLairInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingAmount.token,
  );

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeLairInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingAmount.token,
  );

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}
