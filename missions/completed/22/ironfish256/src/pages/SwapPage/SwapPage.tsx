import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SwapTokenDetails, ToggleSwitch } from 'components';
import { useIsProMode } from 'state/application/hooks';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { getPairAddress, getSwapTransactions } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import SwapMain from './SwapMain';
import LiquidityPools from './LiquidityPools';
import SwapProChartTrade from './SwapProChartTrade';
import SwapProInfo from './SwapProInfo';
import SwapProFilter from './SwapProFilter';
import { useTranslation } from 'react-i18next';
import 'pages/styles/swap.scss';

const SwapPage: React.FC = () => {
  const { isProMode, updateIsProMode } = useIsProMode();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const isTablet = useMediaQuery(breakpoints.down('md'));
  const [showChart, setShowChart] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [pairId, setPairId] = useState<string | undefined>(undefined);
  const [pairTokenReversed, setPairTokenReversed] = useState(false);
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [infoPos, setInfoPos] = useState('right');

  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useActiveWeb3React();

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  // this is for refreshing data of trades table every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function getPairId(token1Address: string, token2Address: string) {
      const pairData = await getPairAddress(token1Address, token2Address);
      if (pairData) {
        setPairTokenReversed(pairData.tokenReversed);
        setPairId(pairData.pairId);
      }
    }
    if (token1?.address && token2?.address) {
      getPairId(token1?.address, token2?.address);
    }
  }, [token1?.address, token2?.address]);

  useEffect(() => {
    (async () => {
      if (pairId && transactions && transactions.length > 0) {
        const txns = await getSwapTransactions(
          pairId,
          Number(transactions[0].transaction.timestamp),
        );
        if (txns) {
          const filteredTxns = txns.filter(
            (txn) =>
              !transactions.filter(
                (tx) => tx.transaction.id === txn.transaction.id,
              ).length,
          );
          setTransactions([...filteredTxns, ...transactions]);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  useEffect(() => {
    async function getTradesData(pairId: string) {
      setTransactions(undefined);
      const transactions = await getSwapTransactions(pairId);
      setTransactions(transactions);
    }
    if (pairId && isProMode) {
      getTradesData(pairId);
    }
  }, [pairId, isProMode]);

  const { t } = useTranslation();

  return (
    <Box width='100%' mb={3} id='swap-page'>
      {!isProMode && (
        <Box>
          <h4 className='swaphead'>{t('swap')}</h4>
          {/* <Box className='helpWrapper'>
            <small>{t('help')}</small>
            <HelpIcon />
          </Box> */}
        </Box>
      )}
      {!isProMode ? (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={6} lg={12}>
            <Box className='wrapper'>
              <SwapMain />
            </Box>
          </Grid>
          {/* <Grid item xs={12} sm={12} md={6} lg={7}>
            <Box className='flex flex-wrap justify-between fullWidth'>
              {token1 && (
                <Box className='swapTokenDetails'>
                  <SwapTokenDetails token={token1} />
                </Box>
              )}
              {token2 && (
                <Box className='swapTokenDetails'>
                  <SwapTokenDetails token={token2} />
                </Box>
              )}
            </Box>
            {token1 && token2 && (
              <Box className='wrapper' marginTop='32px'>
                <LiquidityPools token1={token1} token2={token2} />
              </Box>
            )}
          </Grid> */}
        </Grid>
      ) : (
        <Box
          className='border-top border-bottom bg-palette flex flex-wrap'
          minHeight='calc(100vh - 140px)'
        >
          <Box
            width={isMobile ? 1 : '450px'}
            padding='20px 0'
            className={isMobile ? '' : 'border-right'}
          >
            <Box
              className='flex justify-between items-center'
              padding='0 24px'
              mb={3}
            >
              <h4>{t('swap')}</h4>
              <Box className='flex items-center' mr={1}>
                <span
                  className='text-secondary text-uppercase'
                  style={{ marginRight: 8 }}
                >
                  {t('proModeww')}
                </span>
                <ToggleSwitch
                  toggled={isProMode}
                  onToggle={() => updateIsProMode(!isProMode)}
                />
              </Box>
            </Box>
            <SwapMain />
          </Box>
          {infoPos === 'left' && (
            <Box
              className={isMobile ? 'border-top' : 'border-left border-right'}
              width={isMobile ? 1 : 250}
            >
              <SwapProInfo
                token1={token1}
                token2={token2}
                transactions={transactions}
              />
            </Box>
          )}
          <Box className='swapProWrapper'>
            <SwapProFilter
              infoPos={infoPos}
              setInfoPos={setInfoPos}
              showChart={showChart}
              setShowChart={setShowChart}
              showTrades={showTrades}
              setShowTrades={setShowTrades}
            />
            {token1 && token2 && pairId && (
              <SwapProChartTrade
                showChart={showChart}
                showTrades={showTrades}
                token1={token1}
                token2={token2}
                pairAddress={pairId}
                pairTokenReversed={pairTokenReversed}
                transactions={transactions}
              />
            )}
          </Box>
          {infoPos === 'right' && (
            <Box
              className={isMobile ? 'border-top' : 'border-left'}
              width={isTablet ? 1 : 250}
            >
              <SwapProInfo
                token1={token1}
                token2={token2}
                transactions={transactions}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SwapPage;
