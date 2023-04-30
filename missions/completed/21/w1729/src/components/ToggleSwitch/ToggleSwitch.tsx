import React from 'react';
import { Box } from '@material-ui/core';
import 'components/styles/ToggleSwitch.scss';

const ToggleSwitch: React.FC<{ toggled: boolean; onToggle: () => void }> = ({
  toggled,
  onToggle,
}) => {
  return (
    <Box
      className={`toggleWrapper${toggled ? ' toggled' : ''}`}
      onClick={onToggle}
    >
      <Box className='innerCircle' />
    </Box>
  );
};

export default ToggleSwitch;
