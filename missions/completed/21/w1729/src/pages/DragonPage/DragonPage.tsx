import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import DragonAlert from './DragonAlert';
import DragonsLair from './DragonsLair';
import DragonsSyrup from './DragonsSyrup';
import 'pages/styles/dragon.scss';
import { useTranslation } from 'react-i18next';
import { useNewLairInfo } from 'state/stake/hooks';

const DragonPage: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { t } = useTranslation();
  //showing old dragons lair until we're ready to deploy
  const showOld = true;
  const lairInfo = useNewLairInfo();
  const showNew =
    Number(lairInfo?.dQUICKBalance?.toFixed(0)) === 0 ? false : true;

  return (
    <Box width='100%' mb={3}>
      <DragonAlert />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          {showOld && (
            <Box className='dragonWrapper' mb='10px'>
              <Box className='dragonBg'>
                <img src={DragonBg2} alt='Dragon Lair' />
              </Box>
              <img
                src={DragonLairMask}
                alt='Dragon Mask'
                className='dragonMask'
              />
              <Box className='dragonTitle'>
                <h5>{t('dragonLair')}</h5>
                <small>{t('dragonLairTitle')}</small>
              </Box>
              <DragonsLair isNew={false} />
            </Box>
          )}
          {showNew && (
            <Box className='dragonWrapper'>
              <Box className='dragonBg'>
                <img src={DragonBg2} alt='Dragon Lair' />
              </Box>
              <img
                src={DragonLairMask}
                alt='Dragon Mask'
                className='dragonMask'
              />
              <Box className='dragonTitle'>
                <h5>{t('newDragonLair')}</h5>
                <small>{t('newDragonLairTitle')}</small>
              </Box>
              <DragonsLair isNew={true} />
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box className='dragonWrapper'>
            <Box className='dragonBg'>
              <img src={isMobile ? DragonBg2 : DragonBg1} alt='Dragon Syrup' />
            </Box>
            <Box className='dragonTitle'>
              <h5>{t('dragonSyrup')}</h5>
              <small>{t('dragonSyrupTitle')}</small>
            </Box>
            <DragonsSyrup />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DragonPage;
