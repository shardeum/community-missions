import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { ChevronDown, ChevronUp } from 'react-feather';
import { ChainId, Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import {
  useStakingInfo,
  getBulkPairData,
  useDualStakingInfo,
} from 'state/stake/hooks';
import { DoubleCurrencyLogo } from 'components';
import { formatAPY, getAPYWithFee, getOneYearFee } from 'utils';
import PoolPositionCardDetails from './PoolPositionCardDetails';
import 'components/styles/PoolPositionCard.scss';
import { Trans, useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';

const PoolPositionCard: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [bulkPairData, setBulkPairData] = useState<any>(null);
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const stakingInfos = useStakingInfo(chainIdOrDefault, pair);
  const dualStakingInfos = useDualStakingInfo(chainIdOrDefault, pair);
  const stakingInfo = useMemo(
    () =>
      stakingInfos.length > 0
        ? stakingInfos[0]
        : dualStakingInfos.length > 0
        ? dualStakingInfos[0]
        : null,
    [stakingInfos, dualStakingInfos],
  );

  const pairId = pair.liquidityToken.address;

  useEffect(() => {
    const pairLists = [pairId];
    getBulkPairData(pairLists).then((data) => setBulkPairData(data));
    return () => setBulkPairData(null);
  }, [pairId]);

  const [showMore, setShowMore] = useState(false);

  const apyWithFee = useMemo(() => {
    if (stakingInfo && bulkPairData) {
      const dayVolume = bulkPairData[stakingInfo.pair]?.oneDayVolumeUSD;
      const reserveUSD = bulkPairData[stakingInfo.pair]?.reserveUSD;
      const oneYearFee =
        dayVolume && reserveUSD ? getOneYearFee(dayVolume, reserveUSD) : 0;
      return formatAPY(
        getAPYWithFee(stakingInfo.perMonthReturnInRewards ?? 0, oneYearFee),
      );
    }
  }, [stakingInfo, bulkPairData]);

  return (
    <Box
      className={`poolPositionCard ${
        showMore ? 'bg-secondary2' : 'bg-transparent'
      }`}
    >
      <Box className='poolPositionCardTop'>
        <Box className='flex items-center'>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={28}
          />
          <p className='weight-600' style={{ marginLeft: 16 }}>
            {!currency0 || !currency1
              ? 'Loading'
              : `${currency0.symbol}/${currency1.symbol}`}
          </p>
        </Box>

        <Box
          className='flex items-center text-primary cursor-pointer'
          onClick={() => setShowMore(!showMore)}
        >
          <p style={{ marginRight: 8 }}>{t('manage')}</p>
          {showMore ? <ChevronUp size='20' /> : <ChevronDown size='20' />}
        </Box>
      </Box>

      {showMore && <PoolPositionCardDetails pair={pair} />}
      {stakingInfo && !stakingInfo.ended && apyWithFee && (
        <Box className='poolPositionAPYWrapper'>
          <small>
            <Trans
              i18nKey='poolAPYDesc'
              values={{
                apy: apyWithFee,
                symbol1: currency0.symbol?.toUpperCase(),
                symbol2: currency1.symbol?.toUpperCase(),
              }}
              components={{ pspan: <small className='text-success' /> }}
            />
          </small>
        </Box>
      )}
    </Box>
  );
};

export default PoolPositionCard;
