import React from 'react';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import HeroBkg from 'assets/images/heroBkg.png';
import defaultHeroBkg from 'assets/images/heroBkg.svg';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const { pathname } = useLocation();
  const showDefaultBG = fallback || pathname !== '/';
  return (
    <Box className='heroBkg'>
      <img
        className={showDefaultBG ? 'hidden' : ''}
        src={HeroBkg}
        alt='Hero Background'
      />
      <img
        className={showDefaultBG ? '' : 'hidden'}
        src={HeroBkg}
        alt='Hero Background'
      />
    </Box>
  );
};

export default React.memo(Background);
