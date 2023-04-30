import { getAddress } from '@ethersproject/address';
import { ApolloClient } from 'apollo-client';
import { Contract } from '@ethersproject/contracts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { blockClient, client, txClient } from 'apollo/client';
import {
  GET_BLOCK,
  GLOBAL_DATA,
  GLOBAL_CHART,
  GET_BLOCKS,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  TOKEN_CHART,
  TOKEN_DATA1,
  TOKEN_DATA2,
  PAIR_CHART,
  PAIR_DATA,
  PAIRS_BULK1,
  PAIRS_HISTORICAL_BULK,
  PRICES_BY_BLOCK,
  PAIRS_CURRENT,
  ALL_PAIRS,
  ALL_TOKENS,
  TOKEN_INFO,
  TOKEN_INFO_OLD,
  FILTERED_TRANSACTIONS,
  SWAP_TRANSACTIONS,
  HOURLY_PAIR_RATES,
  GLOBAL_ALLDATA,
  ETH_PRICE,
  PAIR_ID,
} from 'apollo/queries';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import {
  CurrencyAmount,
  ChainId,
  Percent,
  JSBI,
  Currency,
  ETHER,
  Token,
  TokenAmount,
  Pair,
} from '@uniswap/sdk';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from 'ethers/lib/utils';
import { AddressZero } from '@ethersproject/constants';
import { GlobalConst, GlobalValue, SUPPORTED_WALLETS } from 'constants/index';
import { TokenAddressMap } from 'state/lists/hooks';
import {
  DualStakingInfo,
  LairInfo,
  StakingInfo,
  SyrupBasic,
  SyrupInfo,
} from 'types';
import { unwrappedToken } from './wrappedCurrency';
import { useUSDCPriceToken } from './useUSDCPrice';
import { CallState } from 'state/multicall/hooks';
import { DualStakingBasic, StakingBasic } from 'types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from 'connectors';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export { default as addMaticToMetamask } from './addMaticToMetamask';

interface BasicData {
  token0?: {
    id: string;
    name: string;
    symbol: string;
  };
  token1?: {
    id: string;
    name: string;
    symbol: string;
  };
}

const TOKEN_OVERRIDES: {
  [address: string]: { name: string; symbol: string };
} = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    name: 'Ether (Wrapped)',
    symbol: 'ETH',
  },
  '0x1416946162b1c2c871a73b07e932d2fb6c932069': {
    name: 'Energi',
    symbol: 'NRGE',
  },
};

export async function getBlockFromTimestamp(timestamp: number): Promise<any> {
  const result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: 'network-only',
  });
  return result?.data?.blocks?.[0]?.number;
}

export function formatCompact(
  unformatted: number | string | BigNumber | BigNumberish | undefined | null,
  decimals = 18,
  maximumFractionDigits: number | undefined = 3,
  maxPrecision: number | undefined = 4,
): string {
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits,
  });

  if (!unformatted) return '0';

  if (unformatted === Infinity) return '∞';

  let formatted: string | number = Number(unformatted);

  if (unformatted instanceof BigNumber) {
    formatted = Number(formatUnits(unformatted.toString(), decimals));
  }

  return formatter.format(Number(formatted.toPrecision(maxPrecision)));
}

export const getPercentChange = (valueNow: number, value24HoursAgo: number) => {
  const adjustedPercentChange =
    ((valueNow - value24HoursAgo) / value24HoursAgo) * 100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

export async function splitQuery(
  query: any,
  localClient: ApolloClient<any>,
  vars: any[],
  list: any[],
  skipCount = 100,
): Promise<any> {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    const sliced = list.slice(skip, end);
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'network-only',
    });
    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
    if (
      Object.keys(result.data).length < skipCount ||
      skip + skipCount > list.length
    ) {
      allFound = true;
    } else {
      skip += skipCount;
    }
  }

  return fetchedData;
}

export async function getBlocksFromTimestamps(
  timestamps: number[],
  skipCount = 500,
): Promise<
  {
    timestamp: string;
    number: any;
  }[]
> {
  if (timestamps?.length === 0) {
    return [];
  }

  const fetchedData: any = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount,
  );

  const blocks = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        });
      }
    }
  }
  return blocks;
}

export const get2DayPercentChange = (
  valueNow: number,
  value24HoursAgo: number,
  value48HoursAgo: number,
) => {
  // get volume info for both 24 hour periods
  const currentChange = valueNow - value24HoursAgo;
  const previousChange = value24HoursAgo - value48HoursAgo;

  const adjustedPercentChange =
    ((currentChange - previousChange) / previousChange) * 100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

export const getEthPrice: () => Promise<number[]> = async () => {
  const utcCurrentTime = dayjs();

  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    const result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'network-only',
    });
    const resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'network-only',
    });
    const currentPrice = Number(result?.data?.bundles[0]?.ethPrice ?? 0);
    const oneDayBackPrice = Number(
      resultOneDay?.data?.bundles[0]?.ethPrice ?? 0,
    );

    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
    ethPrice = currentPrice;
    ethPriceOneDay = oneDayBackPrice;
  } catch (e) {
    console.log(e);
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};

export const getTokenInfo = async (
  ethPrice: number,
  ethPriceOld: number,
  address: string,
) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
  const utcOneWeekBack = utcCurrentTime.subtract(7, 'day').unix();
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
  const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack);
  const oneWeekBlock = await getBlockFromTimestamp(utcOneWeekBack);

  try {
    const current = await client.query({
      query: TOKEN_INFO(address),
      fetchPolicy: 'network-only',
    });

    const oneDayResult = await client.query({
      query: TOKEN_INFO_OLD(oneDayBlock, address),
      fetchPolicy: 'network-only',
    });

    const twoDayResult = await client.query({
      query: TOKEN_INFO_OLD(twoDayBlock, address),
      fetchPolicy: 'network-only',
    });

    const oneWeekResult = await client.query({
      query: TOKEN_INFO_OLD(oneWeekBlock, address),
      fetchPolicy: 'network-only',
    });

    const oneDayData = oneDayResult?.data?.tokens.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const twoDayData = twoDayResult?.data?.tokens.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const oneWeekData = oneWeekResult?.data?.tokens.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens?.map(async (token: any) => {
          const data = token;

          let oneDayHistory = oneDayData?.[token.id];
          let twoDayHistory = twoDayData?.[token.id];
          let oneWeekHistory = oneWeekData?.[token.id];

          // this is because old history data returns exact same data as current data when the old data does not exist
          if (
            Number(oneDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(oneDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(oneDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            oneDayHistory = null;
          }

          if (
            Number(twoDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(twoDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(twoDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            twoDayHistory = null;
          }
          if (
            Number(oneWeekHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(oneWeekHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(oneWeekHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            oneWeekHistory = null;
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0,
          );

          const oneWeekVolumeUSD =
            data.tradeVolumeUSD - (oneWeekHistory?.tradeVolumeUSD ?? 0);

          const currentLiquidityUSD =
            data?.totalLiquidity * ethPrice * data?.derivedETH;
          const oldLiquidityUSD =
            (oneDayHistory?.totalLiquidity ?? 0) *
            ethPriceOld *
            (oneDayHistory?.derivedETH ?? 0);

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH
              ? oneDayHistory?.derivedETH * ethPriceOld
              : 0,
          );

          // set data
          data.priceUSD = data?.derivedETH * ethPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = oneDayVolumeUSD;
          data.oneWeekVolumeUSD = oneWeekVolumeUSD;
          data.volumeChangeUSD = volumeChangeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(
            currentLiquidityUSD ?? 0,
            oldLiquidityUSD ?? 0,
          );

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD;
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH;
          }

          // update name data for
          updateNameData({
            token0: data,
          });

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await client.query({
              query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
              fetchPolicy: 'network-only',
            });
            const result = aaveData.data.pairs[0];
            data.totalLiquidityUSD = Number(result.reserveUSD) / 2;
            data.liquidityChangeUSD = 0;
            data.priceChangeUSD = 0;
          }
          return data;
        }),
    );
    return bulkResults;
  } catch (e) {
    console.log(e);
  }
};

export const getTopTokens = async (
  ethPrice: number,
  ethPriceOld: number,
  count = 500,
) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
  const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack);

  try {
    const current = await client.query({
      query: TOKENS_CURRENT(count),
      fetchPolicy: 'network-only',
    });

    const oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock, count),
      fetchPolicy: 'network-only',
    });

    const twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock, count),
      fetchPolicy: 'network-only',
    });

    const oneDayData = oneDayResult?.data?.tokens.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const twoDayData = twoDayResult?.data?.tokens.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens?.map(async (token: any) => {
          const data = token;

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id];
          let twoDayHistory = twoDayData?.[token.id];

          // this is because old history data returns exact same data as current data when the old data does not exist
          if (
            Number(oneDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(oneDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(oneDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            oneDayHistory = null;
          }

          if (
            Number(twoDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(twoDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(twoDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            twoDayHistory = null;
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0,
          );

          const currentLiquidityUSD =
            data?.totalLiquidity * ethPrice * data?.derivedETH;
          const oldLiquidityUSD =
            (oneDayHistory?.totalLiquidity ?? 0) *
            ethPriceOld *
            (oneDayHistory?.derivedETH ?? 0);

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH
              ? oneDayHistory?.derivedETH * ethPriceOld
              : 0,
          );

          // set data
          data.priceUSD = data?.derivedETH * ethPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = oneDayVolumeUSD;
          data.volumeChangeUSD = volumeChangeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(
            currentLiquidityUSD ?? 0,
            oldLiquidityUSD ?? 0,
          );

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD;
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH;
          }

          // update name data for
          updateNameData({
            token0: data,
          });

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await client.query({
              query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
              fetchPolicy: 'network-only',
            });
            const result = aaveData.data.pairs[0];
            data.totalLiquidityUSD = Number(result.reserveUSD) / 2;
            data.liquidityChangeUSD = 0;
            data.priceChangeUSD = 0;
          }
          return data;
        }),
    );
    return bulkResults;
  } catch (e) {
    console.log(e);
  }
};

export const getTimestampsForChanges: () => number[] = () => {
  const utcCurrentTime = dayjs();
  //utcCurrentTime = utcCurrentTime.subtract(0.3,  'day');
  const t1 = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix();
  const t2 = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix();
  const tWeek = utcCurrentTime
    .subtract(1, 'week')
    .startOf('minute')
    .unix();
  return [t1, t2, tWeek];
};

export const getTokenPairs = async (
  tokenAddress: string,
  tokenAddress1: string,
) => {
  try {
    // fetch all current and historical data
    const result = await client.query({
      query: TOKEN_DATA1(tokenAddress, tokenAddress1),
      fetchPolicy: 'network-only',
    });
    return result.data?.['pairs0']
      .concat(result.data?.['pairs1'])
      .concat(result.data?.['pairs2'])
      .concat(result.data?.['pairs3'])
      .concat(result.data?.['pairs4']);
  } catch (e) {
    console.log(e);
  }
};

export const getTokenPairs2 = async (tokenAddress: string) => {
  try {
    // fetch all current and historical data
    const result = await client.query({
      query: TOKEN_DATA2(tokenAddress),
      fetchPolicy: 'network-only',
    });
    return result.data?.['pairs0'].concat(result.data?.['pairs1']);
  } catch (e) {
    console.log(e);
  }
};

export const getTopPairs = async (count: number) => {
  try {
    // fetch all current and historical data
    const result = await client.query({
      query: PAIRS_CURRENT(count),
      fetchPolicy: 'network-only',
    });
    return result.data?.['pairs'];
  } catch (e) {
    console.log(e);
  }
};

export function getSecondsOneDay() {
  return 60 * 60 * 24;
}

export const getIntervalTokenData = async (
  tokenAddress: string,
  startTime: number,
  interval = 3600,
  latestBlock: number | undefined,
) => {
  const utcEndTime = dayjs.utc();
  let time = startTime;

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = [];
  while (time < utcEndTime.unix()) {
    timestamps.push(time);
    time += interval;
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return [];
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks;
  try {
    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return Number(b.number) <= latestBlock;
      });
    }

    const result: any = await splitQuery(
      PRICES_BY_BLOCK,
      client,
      [tokenAddress],
      blocks,
      50,
    );

    // format token ETH price results
    const values: any[] = [];
    for (const row in result) {
      const timestamp = row.split('t')[1];
      const derivedETH = Number(result[row]?.derivedETH ?? 0);
      if (timestamp) {
        values.push({
          timestamp,
          derivedETH,
        });
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0;
    for (const brow in result) {
      const timestamp = brow.split('b')[1];
      if (timestamp) {
        values[index].priceUSD =
          result[brow].ethPrice * values[index].derivedETH;
        index += 1;
      }
    }

    const formattedHistory = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: Number(values[i].priceUSD),
        close: Number(values[i + 1].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log('error fetching blocks');
    return [];
  }
};

export const getPairTransactions = async (pairAddress: string) => {
  try {
    const result = await txClient.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: [pairAddress],
      },
      fetchPolicy: 'no-cache',
    });
    return {
      mints: result.data.mints,
      burns: result.data.burns,
      swaps: result.data.swaps,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getPairAddress = async (
  token0Address: string,
  token1Address: string,
) => {
  const pairData = await client.query({
    query: PAIR_ID(token0Address, token1Address),
  });
  const pairs =
    pairData && pairData.data
      ? pairData.data.pairs0.concat(pairData.data.pairs1)
      : undefined;
  if (!pairs || pairs.length === 0) return;
  const pairId = pairs[0].id;
  const tokenReversed = pairData.data.pairs1.length > 0;
  return { pairId, tokenReversed };
};

export const getSwapTransactions = async (
  pairId: string,
  startTime?: number,
) => {
  let allFound = false;
  let swapTx: any[] = [];
  const oneDayAgo = dayjs
    .utc()
    .subtract(1, 'day')
    .unix();
  let sTimestamp = startTime ?? oneDayAgo;
  while (!allFound) {
    try {
      const result = await txClient.query({
        query: SWAP_TRANSACTIONS,
        variables: {
          allPairs: [pairId],
          lastTime: sTimestamp,
        },
      });
      if (result.data.swaps.length < 1000) {
        allFound = true;
      }
      const swaps = result.data.swaps;
      sTimestamp = Number(swaps[swaps.length - 1].transaction.timestamp);
      swapTx = swapTx.concat(swaps);
    } catch (e) {}
  }
  return swapTx
    .filter(
      (item, ind, self) =>
        ind ===
        self.findIndex((item1) => item1.transaction.id === item.transaction.id),
    )
    .reverse();
};

export const getTokenChartData = async (
  tokenAddress: string,
  startTime: number,
) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await client.query({
        query: TOKEN_CHART,
        variables: {
          startTime: startTime,
          tokenAddr: tokenAddress,
          skip,
        },
        fetchPolicy: 'network-only',
      });
      if (result.data.tokenDayDatas.length < 1000) {
        allFound = true;
      }
      skip += 1000;
      data = data.concat(result.data.tokenDayDatas);
    }

    const dayIndexSet = new Set();
    const dayIndexArray: any[] = [];
    const oneDay = getSecondsOneDay();
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = Number(dayData.dailyVolumeUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD;
    let latestPriceUSD = data[0] && data[0].priceUSD;
    //let latestPairDatas = data[0] && data[0].mostLiquidPairs
    let index = 1;
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay;
      const currentDayIndex = (nextDay / oneDay).toFixed(0);
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          //mostLiquidPairs: latestPairDatas,
        });
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
        latestPriceUSD = dayIndexArray[index].priceUSD;
        //latestPairDatas = dayIndexArray[index].mostLiquidPairs
        index = index + 1;
      }
      timestamp = nextDay;
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }
  return data;
};

export const getPairChartData = async (
  pairAddress: string,
  startTime: number,
) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await client.query({
        query: PAIR_CHART,
        variables: {
          startTime: startTime,
          pairAddress: pairAddress,
          skip,
        },
        fetchPolicy: 'cache-first',
      });
      skip += 1000;
      data = data.concat(result.data.pairDayDatas);
      if (result.data.pairDayDatas.length < 1000) {
        allFound = true;
      }
    }

    const dayIndexSet = new Set();
    const dayIndexArray: any[] = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = Number(dayData.dailyVolumeUSD);
      dayData.reserveUSD = Number(dayData.reserveUSD);
    });

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime;
      let latestLiquidityUSD = data[0].reserveUSD;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }

  return data;
};

export const getRateData = async (
  pairAddress: string,
  latestBlock: number,
  interval: number,
  startTime: number,
  pairTokenReversed: boolean,
) => {
  try {
    const utcEndTime = dayjs.utc();
    let time = startTime;

    // create an array of hour start times until we reach current hour
    const timestamps = [];
    while (time <= utcEndTime.unix()) {
      timestamps.push(time);
      time += interval;
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return [];
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks;

    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return Number(b.number) <= latestBlock;
      });
    }

    const result = await splitQuery(
      HOURLY_PAIR_RATES,
      client,
      [pairAddress],
      blocks,
      100,
    );

    // format token ETH price results
    const values = [];
    for (const row in result) {
      const timestamp = row.split('t')[1];
      if (timestamp) {
        values.push({
          timestamp,
          rate: pairTokenReversed
            ? Number(result[row]?.token0Price)
            : Number(result[row]?.token1Price),
        });
      }
    }
    return values;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getBulkPairData: (
  pairList: any,
  ethPrice: any,
) => Promise<any[] | undefined> = async (pairList: any, ethPrice: any) => {
  const [t1, t2, tWeek] = getTimestampsForChanges();
  const a = await getBlocksFromTimestamps([t1, t2, tWeek]);
  const [{ number: b1 }, { number: b2 }, { number: bWeek }] = a;
  try {
    const current = await client.query({
      query: PAIRS_BULK1,
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: 'network-only',
    });

    const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async (block) => {
        const result = await client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'network-only',
        });
        return result;
      }),
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const twoDayData = twoDayResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const oneWeekData = oneWeekResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair: any) => {
          let data = pair;
          let oneDayHistory = oneDayData?.[pair.id];
          if (!oneDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, b1),
              fetchPolicy: 'network-only',
            });
            oneDayHistory = newData.data.pairs[0];
          }
          let twoDayHistory = twoDayData?.[pair.id];
          if (!twoDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, b2),
              fetchPolicy: 'network-only',
            });
            twoDayHistory = newData.data.pairs[0];
          }
          let oneWeekHistory = oneWeekData?.[pair.id];
          if (!oneWeekHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, bWeek),
              fetchPolicy: 'network-only',
            });
            oneWeekHistory = newData.data.pairs[0];
          }

          // this is because old history data returns exact same data as current data when the old data does not exist
          if (
            Number(oneDayHistory?.reserveUSD ?? 0) ===
              Number(data?.reserveUSD ?? 0) &&
            Number(oneDayHistory?.volumeUSD ?? 0) ===
              Number(data?.volumeUSD ?? 0) &&
            Number(oneDayHistory?.totalSupply ?? 0) ===
              Number(data?.totalSupply ?? 0)
          ) {
            oneDayHistory = null;
          }

          if (
            Number(twoDayHistory?.reserveUSD ?? 0) ===
              Number(data?.reserveUSD ?? 0) &&
            Number(twoDayHistory?.volumeUSD ?? 0) ===
              Number(data?.volumeUSD ?? 0) &&
            Number(twoDayHistory?.totalSupply ?? 0) ===
              Number(data?.totalSupply ?? 0)
          ) {
            twoDayHistory = null;
          }
          if (
            Number(oneWeekHistory?.reserveUSD ?? 0) ===
              Number(data?.reserveUSD ?? 0) &&
            Number(oneWeekHistory?.volumeUSD ?? 0) ===
              Number(data?.volumeUSD ?? 0) &&
            Number(oneWeekHistory?.totalSupply ?? 0) ===
              Number(data?.totalSupply ?? 0)
          ) {
            oneWeekHistory = null;
          }

          data = parseData(
            data,
            oneDayHistory,
            twoDayHistory,
            oneWeekHistory,
            ethPrice,
            b1,
          );
          return data;
        }),
    );
    return pairData;
  } catch (e) {
    console.log(e);
  }
};

const parseData = (
  data: any,
  oneDayData: any,
  twoDayData: any,
  oneWeekData: any,
  ethPrice: any,
  oneDayBlock: any,
) => {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD ? data.volumeUSD : 0,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0,
  );
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? Number(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0,
  );

  const oneWeekVolumeUSD = Number(
    oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD,
  );

  const oneWeekVolumeUntracked = Number(
    oneWeekData
      ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD
      : data.untrackedVolumeUSD,
  );

  // set volume properties
  data.oneDayVolumeUSD = oneDayVolumeUSD;
  data.oneWeekVolumeUSD = oneWeekVolumeUSD;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;

  // set liquidity properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice;
  data.liquidityChangeUSD = getPercentChange(
    data.reserveUSD,
    oneDayData?.reserveUSD,
  );

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = Number(data.volumeUSD);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = Number(data.volumeUSD);
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = Number(data.volumeUSD);
  }

  // format incorrect names
  updateNameData(data);

  return data;
};

export function updateNameData(data: BasicData): BasicData | undefined {
  if (
    data?.token0?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token0.id)
  ) {
    data.token0.name = TOKEN_OVERRIDES[data.token0.id].name;
    data.token0.symbol = TOKEN_OVERRIDES[data.token0.id].symbol;
  }

  if (
    data?.token1?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token1.id)
  ) {
    data.token1.name = TOKEN_OVERRIDES[data.token1.id].name;
    data.token1.symbol = TOKEN_OVERRIDES[data.token1.id].symbol;
  }

  return data;
}

export async function getGlobalData(
  ethPrice: number,
  oldEthPrice: number,
): Promise<any> {
  // data for each day , historic data used for % changes
  let data: any = {};
  let oneDayData: any = {};
  let twoDayData: any = {};

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs();
    //utcCurrentTime = utcCurrentTime.subtract(0.3, 'day');

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix();

    // get the blocks needed for time travel queries
    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
      twoWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack,
    ]);

    // fetch the global data
    const result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'network-only',
    });
    data = result.data.uniswapFactories[0];

    const queryReq = [
      { index: 'result', block: null },
      { index: 'oneDayData', block: oneDayBlock?.number },
      { index: 'twoDayData', block: twoDayBlock?.number },
      { index: 'oneWeekData', block: oneWeekBlock?.number },
      { index: 'twoWeekData', block: twoWeekBlock?.number },
    ];
    const allData = await client.query({
      query: GLOBAL_ALLDATA(queryReq),
      fetchPolicy: 'network-only',
    });
    data = allData.data['result'][0];
    oneDayData = allData.data['oneDayData'][0];
    twoDayData = allData.data['twoDayData'][0];
    const oneWeekData = allData.data['oneWeekData'][0];
    const twoWeekData = allData.data['twoWeekData'][0];

    if (data && oneDayData && twoDayData && twoWeekData) {
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0,
      );

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD,
        twoWeekData.totalVolumeUSD,
      );

      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0,
      );

      // format the total liquidity in USD
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * ethPrice,
        oneDayData.totalLiquidityETH * oldEthPrice,
      );
      return {
        ...data,
        totalLiquidityUSD: data.totalLiquidityETH * ethPrice,
        oneDayVolumeUSD,
        oneWeekVolume,
        weeklyVolumeChange,
        volumeChangeUSD,
        liquidityChangeUSD,
        oneDayTxns,
        txnChange,
      };
    }
  } catch (e) {
    console.log(e);
  }

  return data;
}

export async function getAllPairsOnUniswap() {
  try {
    let allFound = false;
    let pairs: any[] = [];
    let skipCount = 0;
    while (!allFound) {
      const result = await client.query({
        query: ALL_PAIRS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      skipCount = skipCount + 10;
      pairs = pairs.concat(result?.data?.pairs);
      if (result?.data?.pairs.length < 10 || pairs.length > 10) {
        allFound = true;
      }
    }
    return pairs;
  } catch (e) {
    console.log(e);
  }
}

export async function getAllTokensOnUniswap() {
  try {
    let allFound = false;
    let skipCount = 0;
    let tokens: any[] = [];
    while (!allFound) {
      const result = await client.query({
        query: ALL_TOKENS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      tokens = tokens.concat(result?.data?.tokens);
      if (result?.data?.tokens?.length < 10 || tokens.length > 10) {
        allFound = true;
      }
      skipCount = skipCount += 10;
    }
    return tokens;
  } catch (e) {
    console.log(e);
  }
}

export const getChartData = async (oldestDateToFetch: number) => {
  let data: any[] = [];
  const weeklyData: any[] = [];
  const utcEndTime = dayjs.utc();
  let skip = 0;
  let allFound = false;

  try {
    while (!allFound) {
      const result = await client.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: 'network-only',
      });
      skip += 1000;
      data = data.concat(
        result.data.uniswapDayDatas.map((item: any) => {
          return { ...item, dailyVolumeUSD: Number(item.dailyVolumeUSD) };
        }),
      );
      if (result.data.uniswapDayDatas.length < 1000) {
        allFound = true;
      }
    }

    if (data) {
      const dayIndexSet = new Set();
      const dayIndexArray: any[] = [];
      const oneDay = 24 * 60 * 60;

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0));
        dayIndexArray.push(data[i]);
      });

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch;
      let latestLiquidityUSD = data[0].totalLiquidityUSD;
      let latestDayDats = data[0].mostLiquidTokens;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
          latestDayDats = dayIndexArray[index].mostLiquidTokens;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
    let startIndexWeekly = -1;
    let currentWeek = -1;
    data.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week();
      if (week !== currentWeek) {
        currentWeek = week;
        startIndexWeekly++;
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {};
      weeklyData[startIndexWeekly].date = data[i].date;
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) +
        data[i].dailyVolumeUSD;
    });
  } catch (e) {
    console.log(e);
  }
  return [data, weeklyData];
};

export function isAddress(value: string | null | undefined): string | false {
  try {
    return getAddress(value || '');
  } catch {
    return false;
  }
}

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 */
export function confirmPriceImpactWithoutFee(
  priceImpactWithoutFee: Percent,
): boolean {
  if (
    !priceImpactWithoutFee.lessThan(
      GlobalValue.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
    )
  ) {
    return (
      window.prompt(
        `This swap has a price impact of at least ${GlobalValue.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(
          0,
        )}%. Please type the word "confirm" to continue with this swap.`,
      ) === 'confirm'
    );
  } else if (
    !priceImpactWithoutFee.lessThan(
      GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH,
    )
  ) {
    return window.confirm(
      `This swap has a price impact of at least ${GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH.toFixed(
        0,
      )}%. Please confirm that you would like to continue with this swap.`,
    );
  }
  return true;
}

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ETH';
  if (currency instanceof Token) return currency.address;
  throw new Error('invalid currency');
}

export function calculateSlippageAmount(
  value: CurrencyAmount,
  slippage: number,
): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)),
      JSBI.BigInt(10000),
    ),
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)),
      JSBI.BigInt(10000),
    ),
  ];
}

export function maxAmountSpend(
  currencyAmount?: CurrencyAmount,
): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined;
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, GlobalConst.utils.MIN_ETH)) {
      return CurrencyAmount.ether(
        JSBI.subtract(currencyAmount.raw, GlobalConst.utils.MIN_ETH),
      );
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0));
    }
  }
  return currencyAmount;
}

export function isTokenOnList(
  defaultTokens: TokenAddressMap,
  currency?: Currency,
): boolean {
  if (currency === ETHER) return true;
  return Boolean(
    currency instanceof Token &&
      defaultTokens[currency.chainId]?.[currency.address],
  );
}

export function isTokensOnList(
  defaultTokens: TokenAddressMap,
  currencies: (Currency | undefined)[],
): boolean[] {
  return currencies.map((currency) => {
    if (currency === ETHER) return true;
    return Boolean(
      currency instanceof Token &&
        defaultTokens[currency.chainId]?.[currency.address],
    );
  });
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  const prefix =
    'https://' +
    (chainId === 8081 ? '' : '') +
    'explorer-liberty20.shardeum.org';

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export const shortenTx = (tx: string) => {
  if (tx.length) {
    const txLength = tx.length;
    const first = tx.slice(0, 6);
    const last = tx.slice(txLength - 4, txLength);
    return `${first}...${last}`;
  }
  return '';
};

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any');
  library.pollingInterval = 15000;
  return library;
}

export function isZero(hexNumberString: string): boolean {
  return /^0x0*$/.test(hexNumberString);
}

export function getSigner(
  library: Web3Provider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

export function getProviderOrSigner(
  library: Web3Provider,
  account?: string,
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any,
  );
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
}

export function formatDateFromTimeStamp(
  timestamp: number,
  format: string,
  addedDay = 0,
) {
  return dayjs
    .unix(timestamp)
    .add(addedDay, 'day')
    .utc()
    .format(format);
}

export function getFormattedPrice(price: number) {
  if (price < 0.001 && price > 0) {
    return '<0.001';
  } else if (price > -0.001 && price < 0) {
    return '>-0.001';
  } else {
    const beforeSign = price > 0 ? '+' : '';
    return beforeSign + price.toLocaleString();
  }
}

// set different bg and text colors for price percent badge according to price.
export function getPriceClass(price: number) {
  if (price > 0) {
    return 'bg-successLight text-success';
  } else if (price === 0) {
    return 'bg-gray1 text-hint';
  } else {
    return 'bg-errorLight text-error';
  }
}

export function getDaysCurrentYear() {
  const year = Number(dayjs().format('YYYY'));
  return (year % 4 === 0 && year % 100 > 0) || year % 400 == 0 ? 366 : 365;
}

export function getOneYearFee(dayVolume: number, reserveUSD: number) {
  if (!dayVolume || !reserveUSD) {
    return 0;
  }

  return (
    (dayVolume * GlobalConst.utils.FEEPERCENT * getDaysCurrentYear()) /
    reserveUSD
  );
}

export function getAPYWithFee(rewards: number, fee: number) {
  return fee > 0 ? ((1 + ((rewards + fee / 12) * 12) / 12) ** 12 - 1) * 100 : 0;
}

export function formatAPY(apy: number) {
  if (apy > 100000000) {
    return '>100000000';
  } else {
    return apy.toLocaleString();
  }
}

export function formatNumber(
  unformatted: number | string | undefined,
  showDigits = 2,
) {
  // get fraction digits for small number
  if (!unformatted) return 0;
  const absNumber = Math.abs(Number(unformatted));
  if (absNumber > 0) {
    const digits = Math.ceil(Math.log10(1 / absNumber));
    if (digits < 3) {
      return Number(unformatted).toLocaleString();
    } else {
      return Number(unformatted).toFixed(digits + showDigits);
    }
  } else {
    return 0;
  }
}

export function getTokenFromAddress(
  tokenAddress: string,
  chainId: ChainId,
  tokenMap: TokenAddressMap,
  tokens: Token[],
) {
  const wrappedTokenInfo = tokenMap[chainId][tokenAddress];
  if (!wrappedTokenInfo) {
    console.log('missing from token list:' + tokenAddress);
    const token = tokens.find(
      (item) => item.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!token) {
      const commonToken = Object.values(GlobalValue.tokens.COMMON).find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
      );
      if (!commonToken) {
        return GlobalValue.tokens.COMMON.EMPTY;
      }
      return commonToken;
    }
    return token;
  }

  return wrappedTokenInfo;
}

export function getChartDates(chartData: any[] | null, durationIndex: number) {
  if (chartData) {
    const dates: string[] = [];
    chartData.forEach((value: any, ind: number) => {
      const month = formatDateFromTimeStamp(Number(value.date), 'MMM');
      const monthLastDate =
        ind > 0
          ? formatDateFromTimeStamp(Number(chartData[ind - 1].date), 'MMM')
          : '';
      if (monthLastDate !== month) {
        dates.push(month);
      }
      if (
        durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART ||
        durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
      ) {
        const dateStr = formatDateFromTimeStamp(Number(value.date), 'D');
        if (
          Number(dateStr) %
            (durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART
              ? 3
              : 7) ===
          0
        ) {
          //Select dates(one date per 3 days for 1 month chart and 7 days for 3 month chart) for x axis values of volume chart on week mode
          dates.push(dateStr);
        }
      }
    });
    return dates;
  } else {
    return [];
  }
}

export function getChartStartTime(durationIndex: number) {
  const utcEndTime = dayjs.utc();
  const months =
    durationIndex === GlobalConst.analyticChart.SIX_MONTH_CHART
      ? 6
      : durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
      ? 3
      : 1;
  const startTime =
    utcEndTime
      .subtract(
        months,
        durationIndex === GlobalConst.analyticChart.ONE_YEAR_CHART
          ? 'year'
          : 'month',
      )
      .endOf('day')
      .unix() - 1;
  return startTime;
}

export function getLimitedData(data: any[], count: number) {
  const dataCount = data.length;
  const newArray: any[] = [];
  data.forEach((value, index) => {
    if (dataCount <= count) {
      newArray.push(value);
    } else {
      if (
        index ===
        dataCount - Math.floor((dataCount / count) * (count - newArray.length))
      ) {
        newArray.push(value);
      }
    }
  });
  return newArray;
}

export function getYAXISValuesAnalytics(chartData: any) {
  if (!chartData) return;
  // multiply 0.99 to the min value of chart values and 1.01 to the max value in order to show all data in graph. Without this, the scale of the graph is set strictly and some values may be hidden.
  const minValue = Math.min(...chartData) * 0.99;
  const maxValue = Math.max(...chartData) * 1.01;
  const step = (maxValue - minValue) / 8;
  const values = [];
  for (let i = 0; i < 9; i++) {
    values.push(maxValue - i * step);
  }
  return values;
}

export function getTokenAPRSyrup(syrup: SyrupInfo) {
  return syrup.valueOfTotalStakedAmountInUSDC &&
    syrup.valueOfTotalStakedAmountInUSDC > 0
    ? ((syrup.rewards ?? 0) / syrup.valueOfTotalStakedAmountInUSDC) *
        getDaysCurrentYear() *
        100
    : 0;
}

export function useLairDQUICKAPY(isNew: boolean, lair?: LairInfo) {
  const daysCurrentYear = getDaysCurrentYear();
  const quickToken = isNew
    ? GlobalValue.tokens.COMMON.NEW_QUICK
    : GlobalValue.tokens.COMMON.OLD_QUICK;
  const quickPrice = useUSDCPriceToken(quickToken);

  if (!lair) return '';
  const dQUICKPrice: any = Number(lair.dQUICKtoQUICK.toExact()) * quickPrice;
  const dQUICKAPR =
    (((Number(lair.oneDayVol) *
      GlobalConst.utils.DQUICKFEE *
      GlobalConst.utils.DQUICKAPR_MULTIPLIER) /
      Number(lair.dQuickTotalSupply.toExact())) *
      daysCurrentYear) /
    dQUICKPrice;
  if (!dQUICKAPR) return '';
  const temp = Math.pow(1 + dQUICKAPR / daysCurrentYear, daysCurrentYear) - 1;
  if (temp > 100) {
    return '> 10000';
  } else {
    return Number(temp * 100).toLocaleString();
  }
}

export function returnFullWidthMobile(isMobile: boolean) {
  return isMobile ? 1 : 'unset';
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function getWalletKeys(
  connector: AbstractConnector | undefined,
): string[] {
  const { ethereum } = window as any;
  const isMetaMask = !!(ethereum && !ethereum.isBitKeep && ethereum.isMetaMask);
  const isBitkeep = !!(ethereum && ethereum.isBitKeep);
  const isBlockWallet = !!(ethereum && ethereum.isBlockWallet);
  const isCypherDWallet = !!(ethereum && ethereum.isCypherD);
  return Object.keys(SUPPORTED_WALLETS).filter(
    (k) =>
      SUPPORTED_WALLETS[k].connector === connector &&
      (connector !== injected ||
        (isCypherDWallet && k == 'CYPHERD') ||
        (isBlockWallet && k === 'BLOCKWALLET') ||
        (isBitkeep && k === 'BITKEEP') ||
        (isMetaMask && k === 'METAMASK')),
  );
}

export function getTokenAddress(token: Token | undefined) {
  if (!token) return;
  if (token.symbol?.toLowerCase() === 'wmatic') return 'ETH';
  return token.address;
}

export function getRewardRate(rate?: TokenAmount, rewardToken?: Token) {
  if (!rate || !rewardToken) return;
  return `${rate.toFixed(2, { groupSeparator: ',' }).replace(/[.,]00$/, '')} ${
    rewardToken.symbol
  }  / day`;
}

export function getStakedAmountStakingInfo(
  stakingInfo?: StakingInfo | DualStakingInfo,
  userLiquidityUnstaked?: TokenAmount,
) {
  if (!stakingInfo) return;
  const stakingTokenPair = stakingInfo.stakingTokenPair;
  const baseTokenCurrency = unwrappedToken(stakingInfo.baseToken);
  const empty = unwrappedToken(GlobalValue.tokens.COMMON.EMPTY);
  const token0 = stakingInfo.tokens[0];
  const baseToken =
    baseTokenCurrency === empty ? token0 : stakingInfo.baseToken;
  if (
    !stakingInfo.totalSupply ||
    !stakingTokenPair ||
    !stakingInfo.totalStakedAmount ||
    !stakingInfo.stakedAmount
  )
    return;
  // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
  const valueOfTotalStakedAmountInBaseToken = new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          stakingInfo.totalStakedAmount.raw,
          stakingTokenPair.reserveOf(baseToken).raw,
        ),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
      ),
      stakingInfo.totalSupply.raw,
    ),
  );

  const valueOfMyStakedAmountInBaseToken = new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          stakingInfo.stakedAmount.raw,
          stakingTokenPair.reserveOf(baseToken).raw,
        ),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
      ),
      stakingInfo.totalSupply.raw,
    ),
  );

  // get the USD value of staked WETH
  const USDPrice = stakingInfo.usdPrice;
  const valueOfTotalStakedAmountInUSDC = USDPrice?.quote(
    valueOfTotalStakedAmountInBaseToken,
  );

  const valueOfMyStakedAmountInUSDC = USDPrice?.quote(
    valueOfMyStakedAmountInBaseToken,
  );

  const stakedAmounts = {
    totalStakedBase: valueOfTotalStakedAmountInBaseToken,
    totalStakedUSD: valueOfTotalStakedAmountInUSDC,
    myStakedBase: valueOfMyStakedAmountInBaseToken,
    myStakedUSD: valueOfMyStakedAmountInUSDC,
    unStakedBase: undefined,
    unStakedUSD: undefined,
  };

  if (!userLiquidityUnstaked) return stakedAmounts;

  const valueOfUnstakedAmountInBaseToken = new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          userLiquidityUnstaked.raw,
          stakingTokenPair.reserveOf(baseToken).raw,
        ),
        JSBI.BigInt(2),
      ),
      stakingInfo.totalSupply.raw,
    ),
  );

  const valueOfUnstakedAmountInUSDC = USDPrice?.quote(
    valueOfUnstakedAmountInBaseToken,
  );
  return {
    ...stakedAmounts,
    unStakedBase: valueOfUnstakedAmountInBaseToken,
    unStakedUSD: valueOfUnstakedAmountInUSDC,
  };
}

export function formatTokenAmount(
  amount?: TokenAmount | CurrencyAmount,
  digits = 3,
) {
  if (!amount) return '-';
  const amountStr = amount.toExact();
  if (Math.abs(Number(amountStr)) > 1) {
    return Number(amountStr).toLocaleString();
  }
  return amount.toSignificant(digits);
}

export function formatMulDivTokenAmount(
  amount?: TokenAmount,
  otherAmount?: number | string,
  operator = 'mul',
  digits = 3,
) {
  if (!amount || otherAmount === undefined) return '-';
  if (otherAmount === 0) return 0;

  const exactAmount = Number(amount.toExact());

  let resultAmount;
  if (operator === 'mul') resultAmount = exactAmount * Number(otherAmount);
  else resultAmount = exactAmount / Number(otherAmount);

  if (Math.abs(resultAmount) > 1) return resultAmount.toLocaleString();

  if (operator === 'mul')
    return amount.multiply(otherAmount.toString()).toSignificant(digits);
  return amount.divide(otherAmount.toString()).toSignificant(digits);
}

export function getTVLStaking(
  valueOfTotalStakedAmountInUSDC?: CurrencyAmount,
  valueOfTotalStakedAmountInBaseToken?: TokenAmount,
) {
  if (!valueOfTotalStakedAmountInUSDC) {
    return `${formatTokenAmount(valueOfTotalStakedAmountInBaseToken)} ETH`;
  }
  return `$${formatTokenAmount(valueOfTotalStakedAmountInUSDC)}`;
}

export function getUSDString(usdValue?: CurrencyAmount) {
  if (!usdValue) return '$0';
  const value = Number(usdValue.toExact());
  if (value > 0 && value < 0.001) return '< $0.001';
  return `$${value.toLocaleString()}`;
}

export function getEarnedUSDSyrup(syrup?: SyrupInfo) {
  if (!syrup || !syrup.earnedAmount || !syrup.rewardTokenPriceinUSD) return '-';
  const earnedUSD =
    Number(syrup.earnedAmount.toExact()) * Number(syrup.rewardTokenPriceinUSD);
  if (earnedUSD > 0 && earnedUSD < 0.001) return '< $0.001';
  return `$${earnedUSD.toLocaleString()}`;
}

export function getEarnedUSDLPFarm(stakingInfo: StakingInfo | undefined) {
  if (!stakingInfo || !stakingInfo.earnedAmount) return;
  const earnedUSD =
    Number(stakingInfo.earnedAmount.toExact()) * stakingInfo.rewardTokenPrice;
  if (earnedUSD < 0.001 && earnedUSD > 0) {
    return '< $0.001';
  }
  return `$${earnedUSD.toLocaleString()}`;
}

export function getEarnedUSDDualFarm(stakingInfo: DualStakingInfo | undefined) {
  if (!stakingInfo || !stakingInfo.earnedAmountA || !stakingInfo.earnedAmountB)
    return;
  const earnedUSD =
    Number(stakingInfo.earnedAmountA.toExact()) *
      stakingInfo.rewardTokenAPrice +
    Number(stakingInfo.earnedAmountB.toExact()) *
      Number(stakingInfo.rewardTokenBPrice);
  if (earnedUSD < 0.001 && earnedUSD > 0) {
    return '< $0.001';
  }
  return `$${earnedUSD.toLocaleString()}`;
}

export function isSupportedNetwork(ethereum: any) {
  console.log('network data', Number(ethereum.chainId));
  return true;
}

export function getPageItemsToLoad(index: number, countsPerPage: number) {
  return index === 0 ? countsPerPage : countsPerPage * index;
}

export function getExactTokenAmount(amount?: TokenAmount | CurrencyAmount) {
  if (!amount) return 0;
  return Number(amount.toExact());
}

// this is useful when the value has more digits than token decimals
export function getValueTokenDecimals(value: string, token?: Token | Currency) {
  if (!token) return '0';
  const valueDigits = value.split('.');
  const valueDigitStr = valueDigits.length > 1 ? valueDigits[1] : '';
  const valueDigitCount = valueDigitStr.length;
  if (valueDigitCount > token.decimals) {
    return value.substring(
      0,
      value.length - (valueDigitCount - token.decimals),
    );
  }
  return value;
}

export function getPartialTokenAmount(
  percent: number,
  amount?: TokenAmount | CurrencyAmount,
) {
  if (!amount) return '0';
  if (percent === 100) return amount.toExact();
  const partialAmount = (Number(amount.toExact()) * percent) / 100;
  return getValueTokenDecimals(partialAmount.toString(), amount.currency);
}

export function getResultFromCallState(callState: CallState) {
  if (!callState || !callState.result || !callState.result[0]) {
    return;
  }

  return callState.result[0];
}

export function initTokenAmountFromCallResult(
  token: Token,
  callState?: CallState,
) {
  if (!callState || !callState.result || !callState.result[0]) return;
  return new TokenAmount(token, JSBI.BigInt(callState.result[0]));
}

export function getFarmLPToken(
  info: StakingInfo | DualStakingInfo | StakingBasic | DualStakingBasic,
) {
  const lp = info.lp;
  const dummyPair = new Pair(
    new TokenAmount(info.tokens[0], '0'),
    new TokenAmount(info.tokens[1], '0'),
  );
  if (lp && lp !== '') return new Token(137, lp, 18, 'SLP', 'Staked LP');
  return dummyPair.liquidityToken;
}

export function getSyrupLPToken(info: SyrupBasic | SyrupInfo) {
  const lp = info.lp;
  if (lp && lp !== '') return new Token(137, lp, 18, 'SLP', 'Staked LP');
  return info.stakingToken;
}

export function getCallStateResult(callState?: CallState) {
  if (callState && callState.result) return callState.result[0];
  return;
}
