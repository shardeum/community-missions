import { Currency } from '@uniswap/sdk';
import React from 'react';
import { Box } from '@material-ui/core';
import { CurrencyLogo } from 'components';
import 'components/styles/DoubleCurrencyLogo.scss';

interface DoubleCurrencyLogoProps {
  size?: number;
  currency0?: Currency;
  currency1?: Currency;
}
const DoubleCurrencyLogo: React.FC<DoubleCurrencyLogoProps> = ({
  currency0,
  currency1,
  size = 16,
}: DoubleCurrencyLogoProps) => {
  return (
    <Box className='doubleCurrencyLogo'>
      <CurrencyLogo currency={currency0} size={size.toString() + 'px'} />
      <CurrencyLogo currency={currency1} size={size.toString() + 'px'} />
    </Box>
  );
};

export default DoubleCurrencyLogo;
