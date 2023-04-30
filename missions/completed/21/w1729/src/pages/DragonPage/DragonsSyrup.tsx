import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { ArrowUp, ArrowDown } from 'react-feather';
import { Box, Divider, useMediaQuery } from '@material-ui/core';
import {
  useFilteredSyrupInfo,
  useOldSyrupInfo,
  useOldLairInfo,
} from 'state/stake/hooks';
import { SyrupInfo } from 'types';
import {
  SyrupCard,
  ToggleSwitch,
  CustomMenu,
  SearchInput,
  CustomSwitch,
} from 'components';
import {
  useLairDQUICKAPY,
  getPageItemsToLoad,
  getTokenAPRSyrup,
  returnFullWidthMobile,
  getExactTokenAmount,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

const LOADSYRUP_COUNT = 10;
const TOKEN_COLUMN = 1;
const DEPOSIT_COLUMN = 2;
const APR_COLUMN = 3;
const EARNED_COLUMN = 4;

const DragonsSyrup: React.FC = () => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [isEndedSyrup, setIsEndedSyrup] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const { chainId } = useActiveWeb3React();

  const [stakedOnly, setStakeOnly] = useState(false);
  const [syrupSearch, setSyrupSearch] = useState('');
  const [syrupSearchInput, setSyrupSearchInput] = useDebouncedChangeHandler(
    syrupSearch,
    setSyrupSearch,
  );

  const lairInfo = useOldLairInfo();
  const dQUICKAPY = useLairDQUICKAPY(false, lairInfo);
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const addedStakingSyrupInfos = useFilteredSyrupInfo(
    chainIdOrDefault,
    null,
    isEndedSyrup ? 0 : undefined,
    isEndedSyrup ? 0 : undefined,
    { search: syrupSearch, isStaked: stakedOnly },
  );
  const addedOldSyrupInfos = useOldSyrupInfo(
    chainIdOrDefault,
    null,
    isEndedSyrup ? undefined : 0,
    isEndedSyrup ? undefined : 0,
    { search: syrupSearch, isStaked: stakedOnly },
  );

  const addedSyrupInfos = isEndedSyrup
    ? addedOldSyrupInfos
    : addedStakingSyrupInfos;

  const sortIndex = sortDesc ? 1 : -1;

  const sortByToken = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      const syrupStrA = a.token.symbol ?? '';
      const syrupStrB = b.token.symbol ?? '';
      return (syrupStrA > syrupStrB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByDeposit = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      const depositA =
        a.valueOfTotalStakedAmountInUSDC ??
        getExactTokenAmount(a.totalStakedAmount);
      const depositB =
        b.valueOfTotalStakedAmountInUSDC ??
        getExactTokenAmount(b.totalStakedAmount);
      return (depositA > depositB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByAPR = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      return (getTokenAPRSyrup(a) > getTokenAPRSyrup(b) ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );
  const sortByEarned = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      const earnedUSDA =
        getExactTokenAmount(a.earnedAmount) * (a.rewardTokenPriceinUSD ?? 0);
      const earnedUSDB =
        getExactTokenAmount(b.earnedAmount) * (b.rewardTokenPriceinUSD ?? 0);
      return (earnedUSDA > earnedUSDB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortedSyrupInfos = useMemo(() => {
    return addedSyrupInfos.sort((a, b) => {
      if (sortBy === TOKEN_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === DEPOSIT_COLUMN) {
        return sortByDeposit(a, b);
      } else if (sortBy === APR_COLUMN) {
        return sortByAPR(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarned(a, b);
      }
      return 1;
    });
  }, [
    addedSyrupInfos,
    sortBy,
    sortByToken,
    sortByDeposit,
    sortByAPR,
    sortByEarned,
  ]);

  const syrupRewardAddress = useMemo(
    () =>
      sortedSyrupInfos
        .map((syrupInfo) => syrupInfo.stakingRewardAddress.toLowerCase())
        .reduce((totStr, str) => totStr + str, ''),
    [sortedSyrupInfos],
  );

  useEffect(() => {
    setPageIndex(0);
  }, [syrupRewardAddress]);

  const syrupInfos = useMemo(() => {
    return sortedSyrupInfos
      ? sortedSyrupInfos.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADSYRUP_COUNT),
        )
      : null;
  }, [sortedSyrupInfos, pageIndex]);

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

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

  const syrupStatusItems = [
    {
      text: t('active'),
      onClick: () => setIsEndedSyrup(false),
      condition: !isEndedSyrup,
    },
    {
      text: t('ended'),
      onClick: () => setIsEndedSyrup(true),
      condition: isEndedSyrup,
    },
  ];

  const sortColumns = [
    {
      text: t('earn'),
      index: TOKEN_COLUMN,
      width: 0.3,
    },
    {
      text: t('deposits'),
      index: DEPOSIT_COLUMN,
      width: 0.3,
    },
    {
      text: t('apr'),
      index: APR_COLUMN,
      width: 0.2,
    },
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

  return (
    <>
      <Box className='flex flex-wrap items-center' mb={3.5}>
        <Box
          className='flex justify-between'
          width={returnFullWidthMobile(isMobile)}
          flex={isMobile ? 'unset' : 1}
        >
          <Box width={isMobile ? 'calc(100% - 150px)' : 1} mr={2} my={2}>
            <SearchInput
              placeholder={isMobile ? t('search') : t('searchPlaceHolder')}
              value={syrupSearchInput}
              setValue={setSyrupSearchInput}
            />
          </Box>
          {isMobile && renderStakedOnly()}
        </Box>
        <Box
          width={returnFullWidthMobile(isMobile)}
          className='flex flex-wrap items-center'
        >
          <Box mr={2}>
            <CustomSwitch width={160} height={40} items={syrupStatusItems} />
          </Box>
          {isMobile ? (
            <>
              <Box height={40} flex={1}>
                <CustomMenu title={t('sortBy')} menuItems={sortByMobileItems} />
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
      <Divider />
      {!isMobile && (
        <Box mt={2.5} display='flex' paddingX={2}>
          {sortByDesktopItems.map((item) => (
            <Box
              key={item.index}
              width={item.width}
              justifyContent={item.justify}
              onClick={item.onClick}
              className={`flex items-center cursor-pointer ${
                sortBy === item.index ? '' : 'text-secondary'
              }`}
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
      {syrupInfos ? (
        syrupInfos.map((syrup, ind) => (
          <SyrupCard key={ind} syrup={syrup} dQUICKAPY={dQUICKAPY} />
        ))
      ) : (
        <>
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
        </>
      )}
      <div ref={loadMoreRef} />
    </>
  );
};

export default DragonsSyrup;
