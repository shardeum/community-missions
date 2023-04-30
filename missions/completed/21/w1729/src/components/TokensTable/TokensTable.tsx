import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Divider } from '@material-ui/core';
import { getAddress } from '@ethersproject/address';
import { ChainId, Token } from '@uniswap/sdk';
import { CurrencyLogo, CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import { formatNumber, getFormattedPrice, getPriceClass } from 'utils';
import { useBookmarkTokens } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import 'components/styles/TokensTable.scss';
import { useTranslation } from 'react-i18next';

interface TokensTableProps {
  data: any[];
  showPagination?: boolean;
}

const liquidityHeadCellIndex = 4;

const TokensTable: React.FC<TokensTableProps> = ({
  data,
  showPagination = true,
}) => {
  const { t } = useTranslation();
  const tokenHeadCells = [
    {
      id: 'tokenName',
      numeric: false,
      label: t('name'),
      sortKey: (item: any) => item.name,
    },
    {
      id: 'tokenPrice',
      numeric: false,
      label: t('price'),
      sortKey: (item: any) => item.priceUSD,
    },
    {
      id: 'tokenUpPercent',
      numeric: false,
      label: t('24hPer'),
      sortKey: (item: any) => item.priceChangeUSD,
    },
    {
      id: 'tokenVolume',
      numeric: false,
      label: t('24hVol'),
      sortKey: (item: any) => item.oneDayVolumeUSD,
    },
    {
      id: 'tokenLiquidity',
      numeric: false,
      label: t('liquidity'),
      align: 'right',
      sortKey: (item: any) => item.totalLiquidityUSD,
    },
  ];
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();
  const mobileHTML = (token: any, index: number) => {
    const tokenCurrency = new Token(
      ChainId.MATIC,
      getAddress(token.id),
      Number(token.decimals),
      token.symbol,
      token.name,
    );
    const priceClass = getPriceClass(Number(token.priceChangeUSD));
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box className='flex items-center' mb={1}>
          <Box
            display='flex'
            mr={1}
            onClick={() => {
              const tokenIndex = bookmarkTokens.indexOf(token.id);
              if (tokenIndex === -1) {
                addBookmarkToken(token.id);
              } else {
                removeBookmarkToken(token.id);
              }
            }}
          >
            {bookmarkTokens.indexOf(token.id) > -1 ? (
              <StarChecked />
            ) : (
              <StarUnchecked />
            )}
          </Box>
          <Link
            className='no-decoration'
            to={`/analytics/token/${tokenCurrency.address}`}
          >
            <Box className='flex items-center'>
              <CurrencyLogo currency={tokenCurrency} size='28px' />
              <Box ml={1}>
                <p className='text-gray25'>
                  {token.name}{' '}
                  <span className='text-hint'>({token.symbol})</span>
                </p>
              </Box>
            </Box>
          </Link>
        </Box>
        <Divider />
        <Box className='mobileRow'>
          <p>{t('price')}</p>
          <p>${formatNumber(token.priceUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('24hPer')}</p>
          <Box className={`priceChangeWrapper ${priceClass}`}>
            <small>{getFormattedPrice(Number(token.priceChangeUSD))}%</small>
          </Box>
        </Box>
        <Box className='mobileRow'>
          <p>{t('24hVol')}</p>
          <p>${formatNumber(token.oneDayVolumeUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('liquidity')}</p>
          <p>${formatNumber(token.totalLiquidityUSD)}</p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (token: any) => {
    const tokenCurrency = new Token(
      ChainId.MATIC,
      getAddress(token.id),
      Number(token.decimals),
      token.symbol,
      token.name,
    );
    const priceClass = getPriceClass(Number(token.priceChangeUSD));

    return [
      {
        html: (
          <Box className='flex items-center'>
            <Box
              display='flex'
              mr={1}
              onClick={() => {
                const tokenIndex = bookmarkTokens.indexOf(token.id);
                if (tokenIndex === -1) {
                  addBookmarkToken(token.id);
                } else {
                  removeBookmarkToken(token.id);
                }
              }}
            >
              {bookmarkTokens.indexOf(token.id) > -1 ? (
                <StarChecked />
              ) : (
                <StarUnchecked />
              )}
            </Box>
            <Link
              className='no-decoration'
              to={`/analytics/token/${tokenCurrency.address}`}
            >
              <Box className='flex items-center'>
                <CurrencyLogo currency={tokenCurrency} size='28px' />
                <Box ml={1}>
                  <p className='text-gray25'>
                    {token.name}{' '}
                    <span className='text-hint'>({token.symbol})</span>
                  </p>
                </Box>
              </Box>
            </Link>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <p>${formatNumber(token.priceUSD)}</p>
          </Box>
        ),
      },
      {
        html: (
          <Box className={`priceChangeWrapper ${priceClass}`} mr={2}>
            <small>{getFormattedPrice(Number(token.priceChangeUSD))}%</small>
          </Box>
        ),
      },
      {
        html: <p>${formatNumber(token.oneDayVolumeUSD)}</p>,
      },
      {
        html: <p>${formatNumber(token.totalLiquidityUSD)}</p>,
      },
    ];
  };

  return (
    <CustomTable
      defaultOrderBy={tokenHeadCells[liquidityHeadCellIndex]}
      defaultOrder='desc'
      showPagination={showPagination}
      headCells={tokenHeadCells}
      rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default TokensTable;
