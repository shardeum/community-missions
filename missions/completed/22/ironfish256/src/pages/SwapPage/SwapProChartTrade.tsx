import React from 'react';
import SwapProChart from './SwapProChart';
import { Token } from '@uniswap/sdk';
import { Box } from '@material-ui/core';
import { Height } from '@material-ui/icons';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import 'react-reflex/styles.css';
import { formatNumber, shortenTx, getEtherscanLink } from 'utils';
import dayjs from 'dayjs';
import { useActiveWeb3React } from 'hooks';
import { TableVirtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';

const SwapProChartTrade: React.FC<{
  showChart: boolean;
  showTrades: boolean;
  token1: Token;
  token2: Token;
  pairAddress: string;
  pairTokenReversed: boolean;
  transactions?: any[];
}> = ({
  showChart,
  showTrades,
  token1,
  token2,
  pairAddress,
  pairTokenReversed,
  transactions,
}) => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();

  const TradesTable = () => (
    <TableVirtuoso
      data={transactions}
      components={{
        Table: ({ ...props }) => <table className='tradeTable' {...props} />,
      }}
      fixedHeaderContent={() => (
        <tr>
          <th align='left'>{t('date')}</th>
          <th align='left'>{t('type')}</th>
          <th align='right'>{t('usd')}</th>
          <th align='right'>{token1.symbol}</th>
          <th align='right'>{token2.symbol}</th>
          <th align='right'>{t('price')}</th>
          <th align='right'>{t('txn')}</th>
        </tr>
      )}
      itemContent={(index, tx) => {
        const txType = Number(tx.amount0In) > 0 ? 'sell' : 'buy';
        const txAmount0 =
          Number(tx.amount0In) > 0 ? tx.amount0In : tx.amount0Out;
        const txAmount1 =
          Number(tx.amount1In) > 0 ? tx.amount1In : tx.amount1Out;
        const token1Amount =
          tx.pair.token0.id.toLowerCase() === token1.address.toLowerCase()
            ? txAmount0
            : txAmount1;
        const token2Amount =
          tx.pair.token0.id.toLowerCase() === token1.address.toLowerCase()
            ? txAmount1
            : txAmount0;
        const txPrice = Number(tx.amountUSD) / token1Amount;
        return (
          <>
            <td align='left'>
              {dayjs
                .unix(tx.transaction.timestamp)
                .format('MMM DD, hh:mm:ss a')}
            </td>
            <td className={txType} align='left'>
              {txType.toUpperCase()}
            </td>
            <td className={txType} align='right'>
              {formatNumber(tx.amountUSD)}
            </td>
            <td className={txType} align='right'>
              {formatNumber(token1Amount)}
            </td>
            <td className={txType} align='right'>
              {formatNumber(token2Amount)}
            </td>
            <td className={txType} align='right'>
              {formatNumber(txPrice)}
            </td>
            <td className={txType} align='right'>
              {chainId ? (
                <a
                  href={getEtherscanLink(
                    chainId,
                    tx.transaction.id,
                    'transaction',
                  )}
                  target='_blank'
                  rel='noreferrer'
                >
                  {shortenTx(tx.transaction.id)}
                </a>
              ) : (
                shortenTx(tx.transaction.id)
              )}
            </td>
          </>
        );
      }}
    />
  );

  return (
    <ReflexContainer orientation='horizontal'>
      {showChart && (
        <ReflexElement className='top-pane' minSize={200}>
          <SwapProChart
            pairName={`${token1.symbol}/${token2.symbol}`}
            pairAddress={pairAddress}
            pairTokenReversed={pairTokenReversed}
          />
        </ReflexElement>
      )}
      {showChart && showTrades && (
        <ReflexSplitter>
          <Box
            width={1}
            height='2px'
            className='flex justify-center items-center'
          >
            <Height />
          </Box>
        </ReflexSplitter>
      )}
      {showTrades && (
        <ReflexElement className='bottom-pane' minSize={200}>
          <TradesTable />
        </ReflexElement>
      )}
    </ReflexContainer>
  );
};

export default React.memo(SwapProChartTrade);
