import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';
import {
  useBlockNumber,
  useEthPrice,
  useTokenDetails,
} from 'state/application/hooks';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { ReactComponent as CopyIcon } from 'assets/images/CopyIcon.svg';
import {
  shortenAddress,
  formatCompact,
  getTokenInfo,
  getIntervalTokenData,
  formatNumber,
} from 'utils';
import { LineChart } from 'components';
import { Token } from '@uniswap/sdk';
import dayjs from 'dayjs';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTranslation } from 'react-i18next';

const SwapTokenDetails: React.FC<{
  token: Token;
}> = ({ token }) => {
  const { t } = useTranslation();
  const currency = unwrappedToken(token);
  const tokenAddress = token.address;
  const { palette } = useTheme();
  const latestBlock = useBlockNumber();
  const { tokenDetails, updateTokenDetails } = useTokenDetails();
  const [tokenData, setTokenData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const [isCopied, setCopied] = useCopyClipboard();
  const prices = priceData ? priceData.map((price: any) => price.close) : [];
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    (async () => {
      const tokenDetail = tokenDetails.find(
        (item) => item.address === tokenAddress,
      );
      setTokenData(tokenDetail?.tokenData);
      setPriceData(tokenDetail?.priceData);
      const currentTime = dayjs.utc();
      const startTime = currentTime
        .subtract(1, 'day')
        .startOf('hour')
        .unix();
      const tokenPriceData = await getIntervalTokenData(
        tokenAddress,
        startTime,
        3600,
        latestBlock,
      );
      setPriceData(tokenPriceData);

      if (ethPrice.price && ethPrice.oneDayPrice) {
        const tokenInfo = await getTokenInfo(
          ethPrice.price,
          ethPrice.oneDayPrice,
          tokenAddress,
        );
        if (tokenInfo) {
          const token0 = tokenInfo[0];
          setTokenData(token0);
          const tokenDetailToUpdate = {
            address: tokenAddress,
            tokenData: token0,
            priceData: tokenPriceData,
          };
          updateTokenDetails(tokenDetailToUpdate);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, ethPrice.price, ethPrice.oneDayPrice]);

  return (
    <Box>
      <Box className='flex items-center justify-between' px={2} py={1.5}>
        <Box className='flex items-center'>
          <CurrencyLogo currency={currency} size='28px' />
          <Box ml={1}>
            <small>{currency.symbol}</small>
            {tokenData ? (
              <Box className='flex items-center'>
                <small>${formatNumber(tokenData.priceUSD)}</small>
                <Box
                  ml={0.5}
                  className={`flex items-center ${
                    priceUp ? 'text-success' : 'text-error'
                  }`}
                >
                  {priceUp ? <ArrowDropUp /> : <ArrowDropDown />}
                  <small>{priceUpPercent}%</small>
                </Box>
              </Box>
            ) : (
              <Skeleton variant='rect' width={100} height={20} />
            )}
          </Box>
        </Box>
        {tokenData && priceData ? (
          <Box width={88} height={47} position='relative'>
            <Box position='absolute' top={-30} width={1}>
              {prices.length > 0 && (
                <LineChart
                  data={prices}
                  width='100%'
                  height={120}
                  color={priceUp ? palette.success.main : palette.error.main}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Skeleton variant='rect' width={88} height={47} />
        )}
      </Box>
      <Box className='border-top-secondary1 border-bottom-secondary1' px={2}>
        <Grid container>
          <Grid item xs={6}>
            <Box className='border-right-secondary1' py={1}>
              {tokenData ? (
                <small className='text-secondary'>
                  {t('tvl')}: {formatCompact(tokenData?.totalLiquidityUSD)}
                </small>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box py={1} pl={2}>
              {tokenData ? (
                <small className='text-secondary'>
                  {t('24hVol1')}: {formatCompact(tokenData?.oneDayVolumeUSD)}
                </small>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box className='flex justify-between items-center' py={1} px={2}>
        <a
          href={`${process.env.REACT_APP_SCAN_BASE_URL}/token/${tokenAddress}`}
          target='_blank'
          rel='noopener noreferrer'
          className='no-decoration'
        >
          <small className='text-primary'>{shortenAddress(tokenAddress)}</small>
        </a>
        <Box
          className={`flex cursor-pointer${
            isCopied ? ' opacity-disabled' : ''
          }`}
          onClick={() => {
            setCopied(tokenAddress);
          }}
        >
          <CopyIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;
