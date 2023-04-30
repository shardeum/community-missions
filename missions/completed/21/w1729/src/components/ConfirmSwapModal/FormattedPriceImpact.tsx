import { Percent } from '@uniswap/sdk';
import React from 'react';
import { GlobalConst } from '../../constants';
import { warningSeverity } from '../../utils/prices';

/**
 * Formatted version of price impact text with warning colors
 */
const FormattedPriceImpact: React.FC<{ priceImpact?: Percent }> = ({
  priceImpact,
}) => {
  const severity = warningSeverity(priceImpact);
  return (
    <small
      className={
        severity === 3 || severity === 4
          ? 'text-error'
          : severity === 2
          ? 'text-yellow'
          : severity === 1
          ? 'text-blueviolet'
          : 'text-success'
      }
    >
      {priceImpact
        ? priceImpact.lessThan(GlobalConst.utils.ONE_BIPS)
          ? '<0.01%'
          : `${priceImpact.toFixed(2)}%`
        : '-'}
    </small>
  );
};

export default FormattedPriceImpact;
