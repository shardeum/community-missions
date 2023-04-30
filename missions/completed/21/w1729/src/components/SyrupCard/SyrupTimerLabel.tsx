import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

const SyrupTimerLabel: React.FC<{ exactEnd: number; isEnded: boolean }> = ({
  exactEnd,
  isEnded,
}) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  let timeRemaining = exactEnd - currentTime;

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY;
  timeRemaining -= days * DAY;
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR;
  timeRemaining -= hours * HOUR;
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE;
  timeRemaining -= minutes * MINUTE;

  useEffect(() => {
    if (isEnded) {
      return;
    }
    const timeInterval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [isEnded]);

  return (
    <>
      {!isEnded && Number.isFinite(timeRemaining) && (
        <Box
          className={
            isMobile ? 'flex flex-wrap items-center justify-between' : ''
          }
        >
          <p className={`text-secondary ${isMobile ? 'small' : 'caption'}`}>
            {t('timeRemaining')}
          </p>
          <small className={isMobile ? '' : 'text-secondary'}>
            {`${days}d ${hours
              .toString()
              .padStart(2, '0')}h ${minutes
              .toString()
              .padStart(2, '0')}m ${timeRemaining}s`}
          </small>
        </Box>
      )}
      {(isEnded || !Number.isFinite(timeRemaining)) && (
        <small className='text-secondary'>{t('rewardsEnded')}</small>
      )}
    </>
  );
};

export default SyrupTimerLabel;
