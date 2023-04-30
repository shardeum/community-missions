import React, { useState } from 'react';
import { Box, Divider, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { CustomTable } from 'components';
import { formatNumber, getEtherscanLink, shortenTx } from 'utils';
import { useActiveWeb3React } from 'hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TxnType } from 'constants/index';
import 'components/styles/TransactionsTable.scss';
dayjs.extend(relativeTime);

interface TransactionsTableProps {
  data: any[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ data }) => {
  const { t } = useTranslation();
  const [txFilter, setTxFilter] = useState(-1);
  const txHeadCells = [
    {
      id: 'description',
      numeric: false,
      label: (
        <Box className='flex items-center'>
          <small
            className={txFilter === -1 ? '' : 'text-secondary'}
            onClick={() => setTxFilter(-1)}
          >
            {t('all')}
          </small>
          <small
            className={txFilter === TxnType.SWAP ? '' : 'text-secondary'}
            onClick={() => setTxFilter(TxnType.SWAP)}
            style={{ marginLeft: 12 }}
          >
            {t('swap')}
          </small>
          <small
            className={txFilter === TxnType.ADD ? '' : 'text-secondary'}
            onClick={() => setTxFilter(TxnType.ADD)}
            style={{ marginLeft: 12 }}
          >
            {t('add')}
          </small>
          <small
            className={txFilter === TxnType.REMOVE ? '' : 'text-secondary'}
            onClick={() => setTxFilter(TxnType.REMOVE)}
            style={{ marginLeft: 12 }}
          >
            {t('remove')}
          </small>
        </Box>
      ),
      sortDisabled: true,
    },
    {
      id: 'totalvalue',
      numeric: false,
      label: t('totalValue'),
      sortKey: (item: any) => Number(item.amountUSD),
    },
    {
      id: 'tokenamount1',
      numeric: false,
      label: t('tokenAmount'),
      sortKey: (item: any) => Number(item.amount1),
    },
    {
      id: 'tokenamount2',
      numeric: false,
      label: t('tokenAmount'),
      sortKey: (item: any) => Number(item.amount0),
    },
    {
      id: 'txn',
      numeric: false,
      label: t('txn'),
      sortKey: (item: any) => item.transaction.id,
    },
    {
      id: 'time',
      numeric: false,
      label: t('time'),
      sortKey: (item: any) => Number(item.transaction.timestamp) * -1,
    },
  ];
  const { chainId } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const getTxString = (txn: any) => {
    const messageData = {
      token0Symbol: txn.pair.token1.symbol,
      token1Symbol: txn.pair.token0.symbol,
    };
    if (txn.type === TxnType.SWAP) {
      return t('txnSwapMessage', messageData);
    } else if (txn.type === TxnType.ADD) {
      return t('txnAddMessage', messageData);
    } else if (txn.type === TxnType.REMOVE) {
      return t('txnRemoveMessage', messageData);
    }
    return '';
  };
  const mobileHTML = (txn: any, index: number) => {
    return (
      <Box mt={index === 0 ? 0 : 3} key={index}>
        <Box mb={1}>
          {chainId ? (
            <a
              href={getEtherscanLink(
                chainId,
                txn.transaction.id,
                'transaction',
              )}
              target='_blank'
              rel='noopener noreferrer'
              className='no-decoration'
            >
              <p className='text-primary'>{getTxString(txn)}</p>
            </a>
          ) : (
            <p className='text-primary'>{getTxString(txn)}</p>
          )}
        </Box>
        <Divider />
        <Box className='mobileRow'>
          <p>{t('totalValue')}</p>
          <p>${Number(txn.amountUSD).toLocaleString()}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('tokenAmount')}</p>
          <p>
            {formatNumber(txn.amount0)} {txn.pair.token0.symbol}
          </p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('tokenAmount')}</p>
          <p>
            {formatNumber(txn.amount1)} {txn.pair.token1.symbol}
          </p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('txn')}</p>
          {chainId ? (
            <a
              href={getEtherscanLink(
                chainId,
                txn.transaction.id,
                'transaction',
              )}
              target='_blank'
              rel='noopener noreferrer'
              className='no-decoration'
            >
              <p className='text-primary'>{shortenTx(txn.transaction.id)}</p>
            </a>
          ) : (
            <p className='text-primary'>{shortenTx(txn.transaction.id)}</p>
          )}
        </Box>
        <Box className='mobileRow'>
          <p>{t('time')}</p>
          <p>{dayjs(Number(txn.transaction.timestamp) * 1000).fromNow()}</p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (txn: any) => {
    return [
      {
        html: chainId ? (
          <a
            href={getEtherscanLink(chainId, txn.transaction.id, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
            className='no-decoration'
          >
            <p className='text-primary'>{getTxString(txn)}</p>
          </a>
        ) : (
          <p className='text-primary'>{getTxString(txn)}</p>
        ),
      },
      {
        html: <p>${Number(txn.amountUSD).toLocaleString()}</p>,
      },
      {
        html: (
          <p>
            {formatNumber(txn.amount1)} {txn.pair.token1.symbol}
          </p>
        ),
      },
      {
        html: (
          <p>
            {formatNumber(txn.amount0)} {txn.pair.token0.symbol}
          </p>
        ),
      },
      {
        html: chainId ? (
          <a
            href={getEtherscanLink(chainId, txn.transaction.id, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
            className='no-decoration'
          >
            <p className='text-primary'>{shortenTx(txn.transaction.id)}</p>
          </a>
        ) : (
          <p className='text-primary'>{shortenTx(txn.transaction.id)}</p>
        ),
      },
      {
        html: (
          <p>{dayjs(Number(txn.transaction.timestamp) * 1000).fromNow()}</p>
        ),
      },
    ];
  };

  return (
    <Box position='relative'>
      {isMobile && (
        <Box className='txTableFilterMobile'>
          <Box onClick={() => setTxFilter(-1)}>
            <p className={txFilter === -1 ? '' : 'text-secondary'}>All</p>
          </Box>
          <Box onClick={() => setTxFilter(TxnType.SWAP)}>
            <p className={txFilter === TxnType.SWAP ? '' : 'text-secondary'}>
              {t('swap')}
            </p>
          </Box>
          <Box onClick={() => setTxFilter(TxnType.ADD)}>
            <p className={txFilter === TxnType.ADD ? '' : 'text-secondary'}>
              {t('add')}
            </p>
          </Box>
          <Box onClick={() => setTxFilter(TxnType.REMOVE)}>
            <p className={txFilter === TxnType.REMOVE ? '' : 'text-secondary'}>
              {t('remove')}
            </p>
          </Box>
        </Box>
      )}
      <CustomTable
        showPagination={data.length > 10}
        headCells={txHeadCells}
        defaultOrderBy={txHeadCells[5]}
        rowsPerPage={10}
        data={data.filter((item) =>
          txFilter === -1 ? true : item.type === txFilter,
        )}
        mobileHTML={mobileHTML}
        desktopHTML={desktopHTML}
      />
    </Box>
  );
};

export default TransactionsTable;
