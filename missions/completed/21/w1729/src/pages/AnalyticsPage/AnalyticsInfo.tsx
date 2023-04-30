import React from 'react';
import { Box } from '@material-ui/core';
import { GlobalConst } from 'constants/index';
import { useTranslation } from 'react-i18next';

interface AnalyticsInfoProps {
  data: any;
}

const AnalyticsInfo: React.FC<AnalyticsInfoProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <>
      <Box mr={5}>
        <small>
          {t('pairs')}: {data.pairCount.toLocaleString()}
        </small>
      </Box>
      <Box mr={5}>
        <small>
          {t('24hTxs')}: {data.oneDayTxns.toLocaleString()}
        </small>
      </Box>
      <Box>
        <small>
          {t('24hFees')}: $
          {(
            data.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT
          ).toLocaleString()}
        </small>
      </Box>
    </>
  );
};

export default AnalyticsInfo;
