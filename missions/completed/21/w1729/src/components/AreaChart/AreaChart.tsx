import React from 'react';
import { Box } from '@material-ui/core';
import Chart from 'react-apexcharts';
import { useIsDarkMode } from 'state/user/hooks';
import { formatCompact, formatDateFromTimeStamp, formatNumber } from 'utils';
import 'components/styles/AreaChart.scss';

export interface AreaChartProps {
  backgroundColor?: string;
  data?: Array<any>;
  dates?: Array<any>;
  yAxisValues?: Array<number>;
  categories?: Array<string | null>;
  width?: number | string;
  height?: number | string;
}
const AreaChart: React.FC<AreaChartProps> = ({
  backgroundColor = '#004ce6',
  categories = [],
  data = [],
  dates = [],
  yAxisValues,
  width = 500,
  height = 200,
}) => {
  const dark = useIsDarkMode();

  const strokeColor = '#00dced';
  const gradientColor = dark ? '#64fbd3' : '#D4F8FB';

  const yMax = yAxisValues
    ? Math.max(...yAxisValues.map((val) => Number(val)))
    : 0;
  const yMin = yAxisValues
    ? Math.min(...yAxisValues.map((val) => Number(val)))
    : 0;

  const options = {
    chart: {
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      width: '100%',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: [strokeColor],
      curve: 'smooth' as any,
    },
    markers: {
      colors: [strokeColor],
      strokeWidth: 0,
    },
    fill: {
      type: 'gradient',
      colors: [gradientColor],
      gradient: {
        gradientToColors: [backgroundColor],
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.15,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: categories.map(() => ''),
      axisBorder: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: new Array(categories.length).fill(
            dark ? '#646464' : '#CACED3',
          ),
        },
      },
    },
    yaxis: {
      show: false,
      min: yAxisValues ? yMin : undefined,
      max: yAxisValues ? yMax : undefined,
      tickAmount: yAxisValues?.length,
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: dark ? 'dark' : 'light',
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        return `<div class="areaChartTooltip"><small>${formatDateFromTimeStamp(
          dates[dataPointIndex],
          'MMM DD, YYYY',
        )}</small><small><b>$${formatCompact(
          series[seriesIndex][dataPointIndex],
        )}</b></small></div>`;
      },
    },
  };

  const series = [
    {
      name: 'Prices',
      data,
    },
  ];

  return (
    <Box display='flex' mt={2.5} width={width}>
      <Box className='chartContainer'>
        <Chart
          options={options}
          series={series}
          type='area'
          width='100%'
          height={height}
        />
        <Box className='categoryValues' mt={-5}>
          {categories.map((val, ind) => (
            <p key={ind}>{val}</p>
          ))}
        </Box>
      </Box>
      {yAxisValues && (
        <Box className='yAxis'>
          {yAxisValues.map((value, index) => (
            <p key={index}>
              $
              {// this is to show small numbers less than 0.0001
              value > 0.0001 ? formatCompact(value) : formatNumber(value)}
            </p>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AreaChart;
