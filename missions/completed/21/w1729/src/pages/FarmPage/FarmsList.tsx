import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Divider, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ArrowUp, ArrowDown } from 'react-feather';
import {
  useStakingInfo,
  useOldStakingInfo,
  useDualStakingInfo,
} from 'state/stake/hooks';
import { StakingInfo, DualStakingInfo, CommonStakingInfo } from 'types';
import {
  FarmCard,
  ToggleSwitch,
  CustomMenu,
  SearchInput,
  CustomSwitch,
} from 'components';
import { GlobalConst } from 'constants/index';
import {
  getAPYWithFee,
  getExactTokenAmount,
  getOneYearFee,
  getPageItemsToLoad,
  returnFullWidthMobile,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

const LOADFARM_COUNT = 10;
const POOL_COLUMN = 1;
const TVL_COLUMN = 2;
const REWARDS_COLUMN = 3;
const APY_COLUMN = 4;
const EARNED_COLUMN = 5;

interface FarmsListProps {
  bulkPairs: any;
  farmIndex: number;
}

const FarmsList: React.FC<FarmsListProps> = ({ bulkPairs, farmIndex }) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { chainId } = useActiveWeb3React();
  const [pageIndex, setPageIndex] = useState(0);
  const [isEndedFarm, setIsEndedFarm] = useState(false);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const [stakedOnly, setStakeOnly] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');
  const [farmSearchInput, setFarmSearchInput] = useDebouncedChangeHandler(
    farmSearch,
    setFarmSearch,
  );
  console.log('Bulk1',bulkPairs)
  const chainIdOrDefault = chainId ?? ChainId.MUMBAI;

  const addedLPStakingInfos = useStakingInfo(
    chainIdOrDefault,
    null,
    farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX || isEndedFarm
      ? 0
      : undefined,
    farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX || isEndedFarm
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedLPStakingOldInfos = useOldStakingInfo(
    chainIdOrDefault,
    null,
    farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX || !isEndedFarm
      ? 0
      : undefined,
    farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX || !isEndedFarm
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedDualStakingInfos = useDualStakingInfo(
    chainIdOrDefault,
    null,
    farmIndex === GlobalConst.farmIndex.LPFARM_INDEX ? 0 : undefined,
    farmIndex === GlobalConst.farmIndex.LPFARM_INDEX ? 0 : undefined,
    { search: farmSearch, isStaked: stakedOnly, isEndedFarm },
  );

  const sortIndex = sortDesc ? 1 : -1;

  const sortByToken = useCallback(
    (a: CommonStakingInfo, b: CommonStakingInfo) => {
      const tokenStrA = a.tokens[0].symbol + '/' + a.tokens[1].symbol;
      const tokenStrB = b.tokens[0].symbol + '/' + b.tokens[1].symbol;
      return (tokenStrA > tokenStrB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByTVL = useCallback(
    (a: CommonStakingInfo, b: CommonStakingInfo) => {
      return (Number(a.tvl ?? 0) > Number(b.tvl ?? 0) ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByRewardLP = useCallback(
    (a: StakingInfo, b: StakingInfo) => {
      return (
        (getExactTokenAmount(a.totalRewardRate) >
        getExactTokenAmount(b.totalRewardRate)
          ? -1
          : 1) * sortIndex
      );
    },
    [sortIndex],
  );

  const sortByRewardDual = useCallback(
    (a: DualStakingInfo, b: DualStakingInfo) => {
      const aRewards =
        a.rateA * a.rewardTokenAPrice + a.rateB * a.rewardTokenBPrice;
      const bRewards =
        b.rateA * b.rewardTokenAPrice + b.rateB * b.rewardTokenBPrice;
      return (aRewards > bRewards ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByAPY = useCallback(
    (a: CommonStakingInfo, b: CommonStakingInfo) => {
      let aYearFee = 0;
      let bYearFee = 0;
      if (bulkPairs) {
        const aDayVolume = bulkPairs[a.pair]?.oneDayVolumeUSD;
        const aReserveUSD = bulkPairs[a.pair]?.reserveUSD;
        const bDayVolume = bulkPairs[b.pair]?.oneDayVolumeUSD;
        const bReserveUSD = bulkPairs[b.pair]?.reserveUSD;
        if (aDayVolume && aReserveUSD) {
          aYearFee = getOneYearFee(aDayVolume, aReserveUSD);
        }
        if (bDayVolume && bReserveUSD) {
          bYearFee = getOneYearFee(bDayVolume, bReserveUSD);
        }
      }
      const aAPYwithFee = getAPYWithFee(
        a.perMonthReturnInRewards ?? 0,
        aYearFee,
      );
      const bAPYwithFee = getAPYWithFee(
        b.perMonthReturnInRewards ?? 0,
        bYearFee,
      );
      return (aAPYwithFee > bAPYwithFee ? -1 : 1) * sortIndex;
    },
    [sortIndex, bulkPairs],
  );

  const sortByEarnedLP = useCallback(
    (a: StakingInfo, b: StakingInfo) => {
      return (
        (getExactTokenAmount(a.earnedAmount) >
        getExactTokenAmount(b.earnedAmount)
          ? -1
          : 1) * sortIndex
      );
    },
    [sortIndex],
  );

  const sortByEarnedDual = useCallback(
    (a: DualStakingInfo, b: DualStakingInfo) => {
      const earnedA =
        getExactTokenAmount(a.earnedAmountA) * a.rewardTokenAPrice +
        getExactTokenAmount(a.earnedAmountB) * a.rewardTokenBPrice;
      const earnedB =
        getExactTokenAmount(b.earnedAmountA) * b.rewardTokenAPrice +
        getExactTokenAmount(b.earnedAmountB) * b.rewardTokenBPrice;
      return (earnedA > earnedB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortedLPStakingInfos = useMemo(() => {
    const lpStakingInfos = isEndedFarm
      ? addedLPStakingOldInfos
      : addedLPStakingInfos;
    return lpStakingInfos.sort((a, b) => {
      if (sortBy === POOL_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === TVL_COLUMN) {
        return sortByTVL(a, b);
      } else if (sortBy === REWARDS_COLUMN) {
        return sortByRewardLP(a, b);
      } else if (sortBy === APY_COLUMN) {
        return sortByAPY(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarnedLP(a, b);
      }
      return 1;
    });
  }, [
    sortBy,
    addedLPStakingOldInfos,
    addedLPStakingInfos,
    isEndedFarm,
    sortByToken,
    sortByTVL,
    sortByRewardLP,
    sortByAPY,
    sortByEarnedLP,
  ]);

  const sortedStakingDualInfos = useMemo(() => {
    const dualStakingInfos = addedDualStakingInfos.filter(
      (info) => info.ended === isEndedFarm,
    );
    return dualStakingInfos.sort((a, b) => {
      if (sortBy === POOL_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === TVL_COLUMN) {
        return sortByTVL(a, b);
      } else if (sortBy === REWARDS_COLUMN) {
        return sortByRewardDual(a, b);
      } else if (sortBy === APY_COLUMN) {
        return sortByAPY(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarnedDual(a, b);
      }
      return 1;
    });
  }, [
    addedDualStakingInfos,
    isEndedFarm,
    sortBy,
    sortByToken,
    sortByTVL,
    sortByRewardDual,
    sortByAPY,
    sortByEarnedDual,
  ]);

  const addedStakingInfos = useMemo(
    () =>
      farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX
        ? sortedStakingDualInfos
        : sortedLPStakingInfos,
    [farmIndex, sortedStakingDualInfos, sortedLPStakingInfos],
  );

  const stakingRewardAddress = addedStakingInfos
    ? addedStakingInfos
        .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
        .reduce((totStr, str) => totStr + str, '')
    : null;

  useEffect(() => {
    setPageIndex(0);
  }, [stakingRewardAddress, farmIndex]);

  const stakingInfos = useMemo(() => {
    return sortedLPStakingInfos
      ? sortedLPStakingInfos.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADFARM_COUNT),
        )
      : null;
  }, [sortedLPStakingInfos, pageIndex]);

  const stakingDualInfos = useMemo(() => {
    return sortedStakingDualInfos
      ? sortedStakingDualInfos.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADFARM_COUNT),
        )
      : null;
  }, [sortedStakingDualInfos, pageIndex]);

  const getPoolApy = (pairId: string) => {
    if (!pairId || !bulkPairs) {
      return 0;
    }

    const oneDayVolume = bulkPairs?.[pairId.toLowerCase()]?.oneDayVolumeUSD;
    const reserveUSD = bulkPairs?.[pairId.toLowerCase()]?.reserveUSD;
    const oneYearFeeAPY = getOneYearFee(
      Number(oneDayVolume),
      Number(reserveUSD),
    );
    return oneYearFeeAPY;
  };

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  const sortColumns = [
    { text: t('pool'), index: POOL_COLUMN, width: 0.3, justify: 'flex-start' },
    { text: t('tvl'), index: TVL_COLUMN, width: 0.2, justify: 'center' },
    {
      text: t('rewards'),
      index: REWARDS_COLUMN,
      width: 0.25,
      justify: 'center',
    },
    { text: t('apy'), index: APY_COLUMN, width: 0.15, justify: 'center' },
    {
      text: t('earned'),
      index: EARNED_COLUMN,
      width: 0.2,
      justify: 'flex-end',
    },
  ];

  const sortByDesktopItems = sortColumns.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBy === item.index) {
          setSortDesc(!sortDesc);
        } else {
          setSortBy(item.index);
          setSortDesc(false);
        }
      },
    };
  });

  const sortByMobileItems = sortColumns.map((item) => {
    return { text: item.text, onClick: () => setSortBy(item.index) };
  });

  const renderStakedOnly = () => (
    <Box className='flex items-center'>
      <small className='text-disabled' style={{ marginRight: 8 }}>
        {t('stakedOnly')}
      </small>
      <ToggleSwitch
        toggled={stakedOnly}
        onToggle={() => setStakeOnly(!stakedOnly)}
      />
    </Box>
  );

  const farmStatusItems = [
    {
      text: t('active'),
      onClick: () => setIsEndedFarm(false),
      condition: !isEndedFarm,
    },
    {
      text: t('ended'),
      onClick: () => setIsEndedFarm(true),
      condition: isEndedFarm,
    },
  ];

  return (
    <>
      <Box className='farmListHeader'>
        <Box>
          <h5>{t('earn dDEVIL')}</h5>
          <small>
            {t(
              farmIndex === GlobalConst.farmIndex.LPFARM_INDEX
                ? 'stakeMessageLP'
                : 'stakeMessageDual',
            )}
          </small>
        </Box>
        <Box className='flex flex-wrap'>
          <Box
            className='flex justify-between'
            width={returnFullWidthMobile(isMobile)}
          >
            <Box width={isMobile ? 'calc(100% - 150px)' : 1} mr={2} my={2}>
              <SearchInput
                placeholder={isMobile ? t('search ') : t('searchPlaceHolder')}
                value={farmSearchInput}
                setValue={setFarmSearchInput}
              />
            </Box>
            {isMobile && renderStakedOnly()}
          </Box>
          <Box
            width={returnFullWidthMobile(isMobile)}
            className='flex flex-wrap items-center'
          >
            <Box mr={2}>
              <CustomSwitch width={160} height={40} items={farmStatusItems} />
            </Box>
            {isMobile ? (
              <>
                <Box height={40} flex={1}>
                  <CustomMenu
                    title={t('sortBy')}
                    menuItems={sortByMobileItems}
                  />
                </Box>
                <Box mt={2} width={1} className='flex items-center'>
                  <small className='text-disabled' style={{ marginRight: 8 }}>
                    {sortDesc ? t('sortdesc') : t('sortasc')}
                  </small>
                  <ToggleSwitch
                    toggled={sortDesc}
                    onToggle={() => setSortDesc(!sortDesc)}
                  />
                </Box>
              </>
            ) : (
              renderStakedOnly()
            )}
          </Box>
        </Box>
      </Box>
      <Divider />
      {!isMobile && (
        <Box mt={2.5} display='flex' paddingX={2}>
          {sortByDesktopItems.map((item) => (
            <Box
              key={item.index}
              width={item.width}
              className={`flex items-center cursor-pointer ${
                sortBy === item.index ? '' : 'text-secondary'
              }`}
              justifyContent={item.justify}
              onClick={item.onClick}
            >
              <small>{item.text}</small>
              <Box display='flex' ml={0.5}>
                {sortBy === item.index && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {(farmIndex === GlobalConst.farmIndex.LPFARM_INDEX && !stakingInfos) ||
        (farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX &&
          !stakingDualInfos && (
            <>
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
            </>
          ))}
      {farmIndex === GlobalConst.farmIndex.LPFARM_INDEX &&
        stakingInfos &&
        stakingInfos.map((info: StakingInfo, index) => (
          <FarmCard
            key={index}
            stakingInfo={info}
            stakingAPY={getPoolApy(info?.pair)}
            isLPFarm={true}
          />
        ))}
      {farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX &&
        stakingDualInfos &&
        stakingDualInfos.map((info: DualStakingInfo, index) => (
          <FarmCard
            key={index}
            stakingInfo={info}
            stakingAPY={getPoolApy(info?.pair)}
          />
        ))}
      <div ref={loadMoreRef} />
    </>
  );
};

export default FarmsList;
