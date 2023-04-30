import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { isSupportedNetwork, addMaticToMetamask } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';

export const HeroSection: React.FC<{ globalData: any }> = ({ globalData }) => {
  const history = useHistory();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();
  const { t } = useTranslation();

  return (
    <Box className='heroSection'>
      <small className='text-bold'>{t('totalValueLocked')}</small>
      {globalData ? (
        <Box display='flex' pt='5px'>
          <h3>$</h3>
          <h1>
            {Number(globalData.totalLiquidityUSD).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h1>
        </Box>
      ) : (
        <Box my={1}>
          <Skeleton variant='rect' width={400} height={72} />
        </Box>
      )}
      <h5>{t('topAssetExchange')}</h5>
      <Box mt={2} width={200} height={48}>
        <Button
          fullWidth
          className='bg-blue1 p'
          style={{
            borderRadius: '30px',
            height: '100%',
          }}
          onClick={() => {
            ethereum && !isSupportedNetwork(ethereum)
              ? addMaticToMetamask()
              : account
              ? history.push('/swap')
              : toggleWalletModal();
          }}
        >
          {ethereum && !isSupportedNetwork(ethereum)
            ? t('switchPolygon')
            : account
            ? t('enterApp')
            : t('connectWallet')}
        </Button>
      </Box>
    </Box>
  );
};
