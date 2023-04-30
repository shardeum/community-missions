import React, { useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { SyrupInfo } from 'types';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { CurrencyLogo } from 'components';
import { formatCompact, formatTokenAmount, getEarnedUSDSyrup } from 'utils';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import SyrupAPR from './SyrupAPR';
import SyrupCardDetails from './SyrupCardDetails';
import 'components/styles/SyrupCard.scss';
import { useTranslation } from 'react-i18next';

const SyrupCard: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [expanded, setExpanded] = useState(false);

  const currency = unwrappedToken(syrup.token);

  const depositAmount = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${syrup.valueOfTotalStakedAmountInUSDC.toLocaleString()}`
    : `${formatTokenAmount(syrup.totalStakedAmount)} ${
        syrup.stakingToken.symbol
      }`;

  return (
    <Box className='syrupCard'>
      <Box className='syrupCardContent' onClick={() => setExpanded(!expanded)}>
        {isMobile ? (
          <>
            <Box className='flex items-center' width={expanded ? 0.95 : 0.5}>
              <CurrencyLogo currency={currency} size='32px' />
              <Box ml={1.5}>
                <small>{currency.symbol}</small>
              </Box>
            </Box>
            {!expanded && (
              <Box width={0.45}>
                <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
              </Box>
            )}
            <Box width={0.05} className='text-primary flex justify-end'>
              {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </Box>
          </>
        ) : (
          <>
            <Box width={0.3} className='flex items-center'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box ml={1.5}>
                <small>{currency.symbol}</small>
                <Box mt={0.25}>
                  <span>
                    {syrup.rate >= 1000000
                      ? formatCompact(syrup.rate)
                      : syrup.rate.toLocaleString()}
                    <span className='text-secondary'> / {t('day')}</span>
                  </span>
                </Box>
                <Box mt={0.25}>
                  <span>
                    $
                    {syrup.rewardTokenPriceinUSD
                      ? (
                          syrup.rate * syrup.rewardTokenPriceinUSD
                        ).toLocaleString()
                      : '-'}{' '}
                    <span className='text-secondary'>/ {t('day')}</span>
                  </span>
                </Box>
              </Box>
            </Box>
            <Box width={0.3}>
              <small>{depositAmount}</small>
            </Box>
            <Box width={0.2} textAlign='left'>
              <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
            </Box>
            <Box width={0.2} textAlign='right'>
              <Box className='flex items-center justify-end' mb={0.25}>
                <CurrencyLogo currency={currency} size='16px' />
                <small style={{ marginLeft: 5 }}>
                  {formatTokenAmount(syrup.earnedAmount)}
                </small>
              </Box>
              <small className='text-secondary'>
                {getEarnedUSDSyrup(syrup)}
              </small>
            </Box>
          </>
        )}
      </Box>
      {expanded && syrup && (
        <SyrupCardDetails syrup={syrup} dQUICKAPY={dQUICKAPY} />
      )}
    </Box>
  );
};

export default React.memo(SyrupCard);
