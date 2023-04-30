import React from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';

const CustomTooltip: React.FC<TooltipProps> = (props: TooltipProps) => {
  return <Tooltip arrow {...props} />;
};

export default CustomTooltip;
