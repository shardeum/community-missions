import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch, Link } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getPairTransactions,
  getBulkPairData,
  formatNumber,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  CurrencyLogo,
  DoubleCurrencyLogo,
  TransactionsTable,
} from 'components';
import { getAddress } from '@ethersproject/address';
import { GlobalConst, TxnType } from 'constants/index';
import 'pages/styles/analytics.scss';
import AnalyticsHeader from 'pages/AnalyticsPage/AnalyticsHeader';
import AnalyticsPairChart from './AnalyticsPairChart';
import { useTranslation } from 'react-i18next';
import { useEthPrice } from 'state/application/hooks';

const AnalyticsPairDetails: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const pairAddress = match.params.id;
  const [pairData, setPairData] = useState<any>(null);
  const [pairTransactions, setPairTransactions] = useState<any>(null);
  const pairTransactionsList = useMemo(() => {
    if (pairTransactions) {
      const mints = pairTransactions.mints.map((item: any) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = pairTransactions.swaps.map((item: any) => {
        const amount0 = item.amount0Out > 0 ? item.amount0Out : item.amount1Out;
        const amount1 = item.amount0In > 0 ? item.amount0In : item.amount1In;
        const token0 =
          item.amount0Out > 0 ? item.pair.token0 : item.pair.token1;
        const token1 =
          item.amount0Out > 0 ? item.pair.token1 : item.pair.token0;
        return {
          ...item,
          amount0,
          amount1,
          pair: { token0, token1 },
          type: TxnType.SWAP,
        };
      });
      const burns = pairTransactions.burns.map((item: any) => {
        return { ...item, type: TxnType.REMOVE };
      });
      return mints.concat(swaps).concat(burns);
    } else {
      return null;
    }
  }, [pairTransactions]);
  const { chainId } = useActiveWeb3React();
  const currency0 = pairData
    ? new Token(
        ChainId.MATIC,
        getAddress(pairData.token0.id),
        pairData.token0.decimals,
      )
    : undefined;
  const currency1 = pairData
    ? new Token(
        ChainId.MATIC,
        getAddress(pairData.token1.id),
        pairData.token1.decimals,
      )
    : undefined;

  const token0Rate =
    pairData && pairData.reserve0 && pairData.reserve1
      ? Number(pairData.reserve1) / Number(pairData.reserve0) >= 0.0001
        ? (Number(pairData.reserve1) / Number(pairData.reserve0)).toFixed(
            Number(pairData.reserve1) / Number(pairData.reserve0) > 1 ? 2 : 4,
          )
        : '< 0.0001'
      : '-';
  const token1Rate =
    pairData && pairData.reserve0 && pairData.reserve1
      ? Number(pairData.reserve0) / Number(pairData.reserve1) >= 0.0001
        ? (Number(pairData.reserve0) / Number(pairData.reserve1)).toFixed(
            Number(pairData.reserve0) / Number(pairData.reserve1) > 1 ? 2 : 4,
          )
        : '< 0.0001'
      : '-';
  const usingUtVolume =
    pairData &&
    pairData.oneDayVolumeUSD === 0 &&
    !!pairData.oneDayVolumeUntracked;
  const fees =
    pairData && (pairData.oneDayVolumeUSD || pairData.oneDayVolumeUSD === 0)
      ? usingUtVolume
        ? formatNumber(
            Number(pairData.oneDayVolumeUntracked) *
              GlobalConst.utils.FEEPERCENT,
          )
        : formatNumber(
            Number(pairData.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT,
          )
      : '-';
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    async function checkEthPrice() {
      if (ethPrice.price) {
        const pairInfo = await getBulkPairData([pairAddress], ethPrice.price);
        if (pairInfo && pairInfo.length > 0) {
          setPairData(pairInfo[0]);
        }
      }
    }
    async function fetchTransctions() {
      const transactions = await getPairTransactions(pairAddress);
      if (transactions) {
        setPairTransactions(transactions);
      }
    }
    checkEthPrice();
    fetchTransctions();
  }, [pairAddress, ethPrice.price]);

  useEffect(() => {
    setPairData(null);
    setPairTransactions(null);
  }, [pairAddress]);

  return (
    <>
      <AnalyticsHeader type='pair' data={pairData} />
      {pairData ? (
        <>
          <Box width={1} className='flex flex-wrap justify-between'>
            <Box>
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  size={32}
                />
                <Box ml={1}>
                  <p className='heading1'>
                    <Link to={`/analytics/token/${pairData.token0.id}`}>
                      {pairData.token0.symbol}
                    </Link>{' '}
                    /{' '}
                    <Link to={`/analytics/token/${pairData.token1.id}`}>
                      {pairData.token1.symbol}
                    </Link>
                  </p>
                </Box>
              </Box>
              <Box mt={2} display='flex'>
                <Box className='analyticsPairRate'>
                  <CurrencyLogo currency={currency0} size='16px' />
                  <small style={{ marginLeft: 6 }}>
                    1 {pairData.token0.symbol} = {token0Rate}{' '}
                    {pairData.token1.symbol}
                  </small>
                </Box>
                <Box ml={1} className='analyticsPairRate'>
                  <CurrencyLogo currency={currency1} size='16px' />
                  <small style={{ marginLeft: 6 }}>
                    1 {pairData.token1.symbol} = {token1Rate}{' '}
                    {pairData.token0.symbol}
                  </small>
                </Box>
              </Box>
            </Box>
            <Box my={2} display='flex'>
              <Box
                className='button border-primary'
                mr={1.5}
                onClick={() => {
                  history.push(
                    `/pools?currency0=${pairData.token0.id}&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>{t('addLiquidity')}</small>
              </Box>
              <Box
                className='button filledButton'
                onClick={() => {
                  history.push(
                    `/swap?currency0=${pairData.token0.id}&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>{t('swap')}</small>
              </Box>
            </Box>
          </Box>
          <Box width={1} className='panel' mt={4}>
            <Grid container>
              <Grid item xs={12} sm={12} md={6}>
                <AnalyticsPairChart pairData={pairData} />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <Box className='analyticsDetailsInfo'>
                  <Box>
                    <Box width={212}>
                      <Box>
                        <span className='text-disabled'>
                          {t('totalTokensLocked')}
                        </span>
                        <Box
                          mt={1.5}
                          className='bg-gray2'
                          borderRadius={8}
                          padding={1.5}
                        >
                          <Box className='flex items-center justify-between'>
                            <Box className='flex items-center'>
                              <CurrencyLogo currency={currency0} size='16px' />
                              <span style={{ marginLeft: 6 }}>
                                {pairData.token0.symbol} :
                              </span>
                            </Box>
                            <span>{formatNumber(pairData.reserve0)}</span>
                          </Box>
                          <Box
                            mt={1}
                            className='flex items-center justify-between'
                          >
                            <Box className='flex items-center'>
                              <CurrencyLogo currency={currency1} size='16px' />
                              <span style={{ marginLeft: 6 }}>
                                {pairData.token1.symbol} :
                              </span>
                            </Box>
                            <span>{formatNumber(pairData.reserve1)}</span>
                          </Box>
                        </Box>
                      </Box>
                      <Box mt={4}>
                        <span className='text-disabled'>
                          {t('7dTradingVol')}
                        </span>
                        <h5>${formatNumber(pairData.oneWeekVolumeUSD)}</h5>
                      </Box>
                      <Box mt={4}>
                        <span className='text-disabled'>{t('24hFees')}</span>
                        <h5>${fees}</h5>
                      </Box>
                    </Box>
                    <Box width={140}>
                      <span className='text-disabled'>
                        {t('totalLiquidity')}
                      </span>
                      <h5>
                        $
                        {formatNumber(
                          pairData.reserveUSD
                            ? pairData.reserveUSD
                            : pairData.trackedReserveUSD,
                        )}
                      </h5>
                      <Box mt={4}>
                        <span className='text-disabled'>
                          {t('24hTradingVol1')}
                        </span>
                        <h5>${formatNumber(pairData.oneDayVolumeUSD)}</h5>
                      </Box>
                      <Box mt={4}>
                        <span className='text-disabled'>
                          {t('contractAddress')}
                        </span>
                        <h5 className='text-primary'>
                          {chainId ? (
                            <a
                              href={getEtherscanLink(
                                chainId,
                                pairData.id,
                                'address',
                              )}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-primary no-decoration'
                            >
                              {shortenAddress(pairData.id)}
                            </a>
                          ) : (
                            shortenAddress(pairData.id)
                          )}
                        </h5>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box width={1} mt={5}>
            <p>{t('transactions')}</p>
          </Box>
          <Box width={1} className='panel' mt={4}>
            {pairTransactionsList ? (
              <TransactionsTable data={pairTransactionsList} />
            ) : (
              <Skeleton variant='rect' width='100%' height={150} />
            )}
          </Box>
        </>
      ) : (
        <Skeleton width='100%' height={100} />
      )}
    </>
  );
};

export default AnalyticsPairDetails;
