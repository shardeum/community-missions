import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import YourLiquidityPools from './YourLiquidityPools';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';

const PoolsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <h4>{t('pool')}</h4>
        {/* <Box className='helpWrapper'>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box> */}
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            <SupplyLiquidity />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            <YourLiquidityPools />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
