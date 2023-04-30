import React from 'react';
import { Box } from '@material-ui/core';
import 'components/styles/ChartType.scss';

interface ChartTypeProps {
  typeTexts: string[];
  chartTypes: number[];
  chartType: number;
  setChartType: (chartType: number) => void;
}

const ChartType: React.FC<ChartTypeProps> = ({
  typeTexts,
  chartTypes,
  chartType,
  setChartType,
}) => {
  return (
    <Box className='flex items-center'>
      {chartTypes.map((value, index) => (
        <Box
          key={index}
          className={`chartType ${
            chartType === value ? 'bg-gray2' : 'transparent'
          }`}
          onClick={() => setChartType(value)}
        >
          <span>{typeTexts[index]}</span>
        </Box>
      ))}
    </Box>
  );
};

export default ChartType;
