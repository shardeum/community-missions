import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useGlobalData } from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  formatDateFromTimeStamp,
  getPriceClass,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { BarChart, ChartType } from 'components';
import { GlobalConst, GlobalData } from 'constants/index';
import { useTranslation } from 'react-i18next';

const DAY_VOLUME = 0;
const WEEK_VOLUME = 1;

const AnalyticsVolumeChart: React.FC = () => {
  const { t } = useTranslation();
  const volumeTypes = [DAY_VOLUME, WEEK_VOLUME];
  const volumeTypeTexts = [t('dayAbb'), t('weekAbb')];
  const [volumeIndex, setVolumeIndex] = useState(DAY_VOLUME);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );
  const [selectedVolumeIndex, setSelectedVolumeIndex] = useState(-1);
  const { globalData } = useGlobalData();
  const [globalChartData, updateGlobalChartData] = useState<any>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      updateGlobalChartData(null);
      const [newChartData, newWeeklyData] = await getChartData(
        durationIndex === GlobalConst.analyticChart.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex),
      );
      if (newChartData && newWeeklyData) {
        const dayItems = getLimitedData(
          newChartData,
          GlobalConst.analyticChart.CHART_COUNT,
        );
        const weekItems = getLimitedData(
          newWeeklyData,
          GlobalConst.analyticChart.CHART_COUNT,
        );
        updateGlobalChartData({ day: dayItems, week: weekItems });
      }
    };
    fetchChartData();
  }, [updateGlobalChartData, durationIndex]);

  const liquidityWeeks = useMemo(() => {
    if (globalChartData) {
      const dates: string[] = [];
      globalChartData.week.forEach((value: any, ind: number) => {
        const month = formatDateFromTimeStamp(Number(value.date), 'MMM');
        const monthLastDate =
          ind > 0
            ? formatDateFromTimeStamp(
                Number(globalChartData.week[ind - 1].date),
                'MMM',
              )
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        if (
          durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART ||
          durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
        ) {
          const dateStr = formatDateFromTimeStamp(Number(value.date), 'D');
          if (Number(dateStr) % 2 === 0) {
            //Select dates(one date per 2 weeks) for x axis values of volume chart on week mode
            dates.push(dateStr);
          }
        }
      });
      return dates;
    } else {
      return [];
    }
  }, [globalChartData, durationIndex]);

  const getVolumePercent = (volumeIndex: number) => {
    if (globalChartData && selectedVolumeIndex > 0) {
      const volumeDataArr = [globalChartData.day, globalChartData.week];
      const volumeData = volumeDataArr[volumeIndex];
      if (!volumeData || volumeData.length <= 1) return 0;
      const currentVolumeIndex = Math.min(
        selectedVolumeIndex,
        volumeData.length - 1,
      );
      const currentVolumeData = volumeData[currentVolumeIndex];
      const prevVolumeData = volumeData[currentVolumeIndex - 1];
      let currentVolume = 0;
      let prevVolume = 0;
      switch (volumeIndex) {
        case WEEK_VOLUME:
          currentVolume = currentVolumeData.weeklyVolumeUSD;
          prevVolume = prevVolumeData.weeklyVolumeUSD;
          break;
        case DAY_VOLUME:
          currentVolume = currentVolumeData.dailyVolumeUSD;
          prevVolume = prevVolumeData.dailyVolumeUSD;
          break;
      }
      if (prevVolume <= 0) return 0;
      return (currentVolume / prevVolume) * 100 - 100;
    } else if (globalData && selectedVolumeIndex === -1) {
      switch (volumeIndex) {
        case WEEK_VOLUME:
          return globalData.weeklyVolumeChange;
        case DAY_VOLUME:
          return globalData.volumeChangeUSD;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  };

  const volumeDates = useMemo(() => {
    if (selectedVolumeIndex > -1) {
      if (volumeIndex === DAY_VOLUME) {
        return formatDateFromTimeStamp(
          Number(globalChartData.day[selectedVolumeIndex].date),
          'MMM DD, YYYY',
        );
      } else {
        const weekStart = formatDateFromTimeStamp(
          Number(
            globalChartData.week[Math.max(0, selectedVolumeIndex - 1)].date,
          ),
          'MMM DD, YYYY',
          selectedVolumeIndex > 0 ? 1 : -6,
        );
        const weekEnd = formatDateFromTimeStamp(
          Number(globalChartData.week[selectedVolumeIndex].date),
          'MMM DD, YYYY',
        );
        return `${weekStart} - ${weekEnd}`;
      }
    }
    return '';
  }, [globalChartData, selectedVolumeIndex, volumeIndex]);

  const barChartData = useMemo(() => {
    if (globalChartData) {
      return volumeIndex === WEEK_VOLUME
        ? globalChartData.week.map((value: any) => value.weeklyVolumeUSD)
        : globalChartData.day.map((value: any) => value.dailyVolumeUSD);
    } else {
      return [];
    }
  }, [globalChartData, volumeIndex]);

  const volumePercentClass = getPriceClass(
    Number(getVolumePercent(volumeIndex)),
  );

  return (
    <>
      <Box>
        <Box className='flex justify-between'>
          <span className='text-disabled text-bold'>
            {t('volume')} {selectedVolumeIndex === -1 ? `(${t('24hr')})` : ''}
          </span>
          <ChartType
            chartTypes={volumeTypes}
            typeTexts={volumeTypeTexts}
            chartType={volumeIndex}
            setChartType={setVolumeIndex}
          />
        </Box>
        <Box mt={0.5} className='flex items-start'>
          {globalChartData && globalData ? (
            <Box flex={1} mr={2}>
              <Box className='flex items-center'>
                <h5>
                  $
                  {formatCompact(
                    selectedVolumeIndex > -1
                      ? volumeIndex === DAY_VOLUME
                        ? globalChartData.day[selectedVolumeIndex]
                            .dailyVolumeUSD
                        : globalChartData.week[selectedVolumeIndex]
                            .weeklyVolumeUSD
                      : volumeIndex === DAY_VOLUME
                      ? globalData.oneDayVolumeUSD
                      : globalData.oneWeekVolume,
                  )}
                </h5>
                <Box
                  ml={1}
                  height={23}
                  px={1}
                  borderRadius={40}
                  className={volumePercentClass}
                >
                  <span>
                    {`${getVolumePercent(volumeIndex) > 0 ? '+' : ''}
                      ${getVolumePercent(volumeIndex).toLocaleString()}`}
                    %
                  </span>
                </Box>
              </Box>
              <Box height={21}>
                <span className='text-disabled'>{volumeDates}</span>
              </Box>
            </Box>
          ) : (
            <Box mr={2} flex={1}>
              <Skeleton variant='rect' width='100%' height={24} />
            </Box>
          )}
          <ChartType
            chartTypes={GlobalData.analytics.CHART_DURATIONS}
            typeTexts={GlobalData.analytics.CHART_DURATION_TEXTS}
            chartType={durationIndex}
            setChartType={setDurationIndex}
          />
        </Box>
      </Box>
      <Box mt={2}>
        {globalChartData ? (
          <BarChart
            height={200}
            data={barChartData}
            categories={
              volumeIndex === WEEK_VOLUME
                ? liquidityWeeks
                : getChartDates(globalChartData.day, durationIndex)
            }
            onHover={(ind) => setSelectedVolumeIndex(ind)}
            onMouseLeave={() => {
              setSelectedVolumeIndex(-1);
            }}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={250} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsVolumeChart;
