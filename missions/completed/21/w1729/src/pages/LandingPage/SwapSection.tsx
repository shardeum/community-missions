import React, { useState } from 'react';
import {
  ButtonGroup,
  Button,
  Box,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Swap, AddLiquidity } from 'components';
import { useTranslation } from 'react-i18next';

const SWAP_TAB = 0;
const LIQUIDITY_TAB = 1;

export const SwapSection: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(SWAP_TAB);
  const { t } = useTranslation();

  return (
    <>
      <Box className='buttonGroup'>
        <ButtonGroup>
          <Button
            className={tabIndex === SWAP_TAB ? 'active' : ''}
            onClick={() => setTabIndex(SWAP_TAB)}
          >
            {t('swap')}
          </Button>
          <Button
            className={tabIndex === LIQUIDITY_TAB ? 'active' : ''}
            onClick={() => setTabIndex(LIQUIDITY_TAB)}
          >
            {t('liquidity')}
          </Button>
        </ButtonGroup>
      </Box>
      <Box className='swapContainer'>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            {tabIndex === SWAP_TAB ? (
              <Swap currencyBgClass='bg-palette' />
            ) : (
              <AddLiquidity currencyBgClass='bg-palette' />
            )}
          </Grid>
          <Grid item sm={12} md={6} className='swapInfo'>
            <h4>
              {tabIndex === SWAP_TAB
                ? t('swapSectionShortDesc')
                : t('liquiditySectionShortDesc')}
            </h4>
            <p style={{ marginTop: '20px' }}>
              {tabIndex === SWAP_TAB
                ? t('swapSectionLongDesc')
                : t('liquiditySectionLongDesc')}
            </p>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
