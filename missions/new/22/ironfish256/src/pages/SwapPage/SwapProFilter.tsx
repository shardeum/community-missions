import React from 'react';
import { Box, Checkbox } from '@material-ui/core';
import { Replay } from '@material-ui/icons';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';

interface SwapProFilterProps {
  infoPos: string;
  setInfoPos: (pos: string) => void;
  showChart: boolean;
  setShowChart: (value: boolean) => void;
  showTrades: boolean;
  setShowTrades: (value: boolean) => void;
}

const SwapProFilter: React.FC<SwapProFilterProps> = ({
  infoPos,
  setInfoPos,
  showChart,
  setShowChart,
  showTrades,
  setShowTrades,
}) => {
  const { t } = useTranslation();
  const swapPositions = [t('left'), t('right'), t('none')];

  const infoPosItems = swapPositions.map((pos) => {
    return {
      text: pos,
      onClick: () => setInfoPos(pos),
      condition: infoPos === pos,
    };
  });

  return (
    <Box className='swapFilter'>
      <Box className='checkWrapper'>
        <Checkbox
          checked={showChart}
          disabled={!showTrades}
          onChange={(evt) => setShowChart(evt.target.checked)}
        />
        <small>{t('chart')}</small>
      </Box>
      <Box className='checkWrapper'>
        <Checkbox
          checked={showTrades}
          disabled={!showChart}
          onChange={(evt) => setShowTrades(evt.target.checked)}
        />
        <small>{t('trades')}</small>
      </Box>
      <Box className='flex items-center'>
        <small className='text-uppercase'>{t('info')}:</small>
        <Box ml={1}>
          <CustomSwitch width={190} height={30} items={infoPosItems} />
        </Box>
      </Box>
      <Box
        className='replayButton'
        onClick={() => {
          setInfoPos(t('right'));
          setShowChart(true);
          setShowTrades(true);
        }}
      >
        <Replay />
      </Box>
    </Box>
  );
};

export default SwapProFilter;
