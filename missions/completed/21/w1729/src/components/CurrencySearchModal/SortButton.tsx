import React from 'react';
import { Box } from '@material-ui/core';

interface SortButtonProps {
  toggleSortOrder: () => void;
  ascending: boolean;
}

const SortButton: React.FC<SortButtonProps> = ({
  toggleSortOrder,
  ascending,
}) => {
  return (
    <Box className='filterWrapper' onClick={toggleSortOrder}>
      <p>{ascending ? '↑' : '↓'}</p>
    </Box>
  );
};

export default SortButton;
