import { JSBI, Pair, Percent } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTotalSupply } from 'data/TotalSupply';
import { useActiveWeb3React } from 'hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { formatTokenAmount } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo } from 'components';
import 'components/styles/PositionCard.scss';
import { useTranslation } from 'react-i18next';

interface PositionCardProps {
  pair: Pair;
  showUnwrapped?: boolean;
  border?: string;
}

export const MinimalPositionCard: React.FC<PositionCardProps> = ({
  pair,
  border,
  showUnwrapped = false,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0);
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1);

  const [showMore, setShowMore] = useState(false);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  return (
    <Box className='minimalCardWrapper' border={border}>
      {userPoolBalance &&
      JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <Box>
          <p>{t('yourposition')}</p>
          <Box
            className='minimalCardRow'
            onClick={() => setShowMore(!showMore)}
          >
            <Box className='flex items-center'>
              <DoubleCurrencyLogo
                currency0={currency0}
                currency1={currency1}
                size={20}
              />
              <p style={{ marginLeft: 6 }}>
                {currency0.symbol}/{currency1.symbol}
              </p>
            </Box>
            <p>{formatTokenAmount(userPoolBalance)}</p>
          </Box>
          <Box className='minimalCardRow'>
            <p>{t('yourPoolShare')}:</p>
            <p>
              {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
            </p>
          </Box>
          <Box className='minimalCardRow'>
            <p>{currency0.symbol}:</p>
            <p>{formatTokenAmount(token0Deposited)}</p>
          </Box>
          <Box className='minimalCardRow'>
            <p>{currency1.symbol}:</p>
            <p>{formatTokenAmount(token1Deposited)}</p>
          </Box>
        </Box>
      ) : (
        <p>
          <span role='img' aria-label='wizard-icon'>
            ⭐️
          </span>{' '}
          {t('addLiquidityDesc')}
        </p>
      )}
    </Box>
  );
};

export default MinimalPositionCard;
