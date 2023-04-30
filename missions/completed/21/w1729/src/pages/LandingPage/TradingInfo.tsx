import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { StakeQuickModal } from 'components';
import { useOldLairInfo, useTotalRewardsDistributed } from 'state/stake/hooks';
import { formatCompact, useLairDQUICKAPY } from 'utils';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';

export const TradingInfo: React.FC<{ globalData: any }> = ({ globalData }) => {
  const lairInfo = useOldLairInfo();
  const [openStakeModal, setOpenStakeModal] = useState(false);

  const dQUICKAPY = useLairDQUICKAPY(false, lairInfo);
  //TODO: Support Multichain
  const totalRewardsUSD = useTotalRewardsDistributed(ChainId.MATIC);
  const { t } = useTranslation();

  return (
    <>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      <Box className='tradingSection'>
        {globalData ? (
          <h3>{Number(globalData.oneDayTxns).toLocaleString()}</h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p className='text-uppercase'>{t('24hTxs')}</p>
      </Box>
      <Box className='tradingSection'>
        {globalData ? (
          <Box display='flex'>
            <h6>$</h6>
            <h3>{formatCompact(globalData.oneDayVolumeUSD)}</h3>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('24hTradingVol')}</p>
      </Box>
      <Box className='tradingSection'>
        {totalRewardsUSD ? (
          <Box display='flex'>
            <h6>$</h6>
            <h3>{totalRewardsUSD.toLocaleString()}</h3>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('24hRewardsDistributed')}</p>
      </Box>
      <Box className='tradingSection'>
        {globalData ? (
          <h3>
            {Number(globalData.pairCount).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('totalTradingPairs')}</p>
      </Box>
      <Box className='tradingSection' pt='20px'>
        {dQUICKAPY ? (
          <h3>{dQUICKAPY.toLocaleString()}%</h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>dQUICK {t('apy')}</p>
        <h4 onClick={() => setOpenStakeModal(true)}>
          {t('stake')} {'>'}
        </h4>
      </Box>
    </>
  );
};
