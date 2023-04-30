import React, { useState, useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getFormattedPrice,
  getPriceClass,
  formatNumber,
  getTokenInfo,
  getTokenPairs2,
  getBulkPairData,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import { CurrencyLogo, PairTable } from 'components';
import { useBookmarkTokens, useEthPrice } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import { getAddress } from '@ethersproject/address';
import { GlobalConst } from 'constants/index';
import AnalyticsHeader from 'pages/AnalyticsPage/AnalyticsHeader';
import AnalyticsTokenChart from './AnalyticsTokenChart';
import { useTranslation } from 'react-i18next';

const AnalyticsTokenDetails: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const tokenAddress = match.params.id;
  const [token, setToken] = useState<any>(null);
  const { chainId } = useActiveWeb3React();
  const currency = token
    ? new Token(ChainId.MATIC, getAddress(token.id), token.decimals)
    : undefined;
  const [tokenPairs, updateTokenPairs] = useState<any>(null);
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    async function fetchTokenInfo() {
      if (ethPrice.price && ethPrice.oneDayPrice) {
        const tokenInfo = await getTokenInfo(
          ethPrice.price,
          ethPrice.oneDayPrice,
          tokenAddress,
        );
        if (tokenInfo) {
          setToken(tokenInfo[0]);
        }
        const tokenPairs = await getTokenPairs2(tokenAddress);
        const formattedPairs = tokenPairs
          ? tokenPairs.map((pair: any) => {
              return pair.id;
            })
          : [];
        const pairData = await getBulkPairData(formattedPairs, ethPrice.price);
        if (pairData) {
          updateTokenPairs(pairData);
        }
      }
    }
    fetchTokenInfo();
  }, [tokenAddress, ethPrice.price, ethPrice.oneDayPrice]);

  useEffect(() => {
    setToken(null);
    updateTokenPairs(null);
  }, [tokenAddress]);

  const tokenPercentClass = getPriceClass(
    token ? Number(token.priceChangeUSD) : 0,
  );

  return (
    <>
      <AnalyticsHeader type='token' data={token} />
      {token ? (
        <>
          <Box width={1} className='flex flex-wrap justify-between'>
            <Box display='flex'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box ml={1.5}>
                <Box className='flex items-center'>
                  <Box className='flex items-end' mr={0.5}>
                    <p className='heading1'>{token.name} </p>
                    <p className='heading2'>({token.symbol})</p>
                  </Box>
                  {bookmarkTokens.includes(token.id) ? (
                    <StarChecked
                      onClick={() => removeBookmarkToken(token.id)}
                    />
                  ) : (
                    <StarUnchecked onClick={() => addBookmarkToken(token.id)} />
                  )}
                </Box>
                <Box mt={1.25} className='flex items-center'>
                  <h5>${formatNumber(token.priceUSD)}</h5>
                  <Box
                    className={`priceChangeWrapper ${tokenPercentClass}`}
                    ml={2}
                  >
                    <small>
                      {getFormattedPrice(Number(token.priceChangeUSD))}%
                    </small>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box my={2} display='flex'>
              <Box
                className='button border-primary'
                mr={1.5}
                onClick={() => {
                  history.push(`/pools?currency0=${token.id}&currency1=ETH`);
                }}
              >
                <small>{t('addLiquidity')}</small>
              </Box>
              <Box
                className='button filledButton'
                onClick={() => {
                  history.push(`/swap?currency0=${token.id}&currency1=ETH`);
                }}
              >
                <small>{t('swap')}</small>
              </Box>
            </Box>
          </Box>
          <Box width={1} className='panel' mt={4}>
            <Grid container>
              <Grid item xs={12} sm={12} md={6}>
                <AnalyticsTokenChart token={token} />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <Box className='analyticsDetailsInfo'>
                  <Box>
                    <Box>
                      <span className='text-disabled'>
                        {t('totalLiquidity')}
                      </span>
                      <h5>${formatNumber(token.totalLiquidityUSD)}</h5>
                    </Box>
                    <Box textAlign='right'>
                      <span className='text-disabled'>{t('7dTradingVol')}</span>
                      <h5>${formatNumber(token.oneWeekVolumeUSD)}</h5>
                    </Box>
                  </Box>
                  <Box>
                    <Box>
                      <span className='text-disabled'>
                        {t('24hTradingVol1')}
                      </span>
                      <h5>${formatNumber(token.oneDayVolumeUSD)}</h5>
                    </Box>
                    <Box textAlign='right'>
                      <span className='text-disabled'>{t('24hFees')}</span>
                      <h5>
                        $
                        {formatNumber(
                          token.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT,
                        )}
                      </h5>
                    </Box>
                  </Box>
                  <Box>
                    <Box>
                      <span className='text-disabled'>
                        {t('contractAddress')}
                      </span>
                      <h5 className='text-primary'>
                        {chainId ? (
                          <a
                            href={getEtherscanLink(
                              chainId,
                              token.id,
                              'address',
                            )}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary no-decoration'
                          >
                            {shortenAddress(token.id)}
                          </a>
                        ) : (
                          shortenAddress(token.id)
                        )}
                      </h5>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box width={1} mt={5}>
            <p>
              {token.symbol} {t('pools')}
            </p>
          </Box>
          <Box width={1} className='panel' mt={4}>
            {tokenPairs ? (
              <PairTable data={tokenPairs} />
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

export default AnalyticsTokenDetails;
