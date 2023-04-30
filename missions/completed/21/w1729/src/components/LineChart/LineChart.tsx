import React from 'react';
import Chart from 'react-apexcharts';

export interface LineChartProps {
  data?: Array<any>;
  categories?: Array<string>;
  width?: number | string;
  height?: number | string;
  color: string;
}
const LineChart: React.FC<LineChartProps> = ({
  data = [],
  width = 500,
  height = 200,
  color,
}) => {
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
      width: 1,
      colors: [color],
      curve: 'straight' as any,
    },
    fill: {
      type: 'solid',
      opacity: 0,
    },
    xaxis: {
      categories: data.map(() => ''),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
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
    tooltip: {
      enabled: false,
    },
  };

  const series = [
    {
      name: 'Prices',
      data,
    },
  ];

  return (
    <Chart
      options={options}
      series={series}
      type='area'
      width={width}
      height={height}
    />
  );
};

export default LineChart;
