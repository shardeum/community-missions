import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { client } from 'apollo/client';
import { TOKEN_SEARCH, PAIR_SEARCH, TOKEN_INFO_OLD } from 'apollo/queries';
import {
  getAllTokensOnUniswap,
  getAllPairsOnUniswap,
  getBlockFromTimestamp,
} from 'utils';
import { GlobalConst, MATIC_CHAIN } from 'constants/index';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import 'components/styles/SearchWidget.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
dayjs.extend(utc);

const AnalyticsSearch: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchVal, setSearchVal] = useState('');
  const [searchValInput, setSearchValInput] = useDebouncedChangeHandler(
    searchVal,
    setSearchVal,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<any>(null);
  const wrapperRef = useRef<any>(null);
  const [searchedTokens, setSearchedTokens] = useState<any[]>([]);
  const [searchedPairs, setSearchedPairs] = useState<any[]>([]);
  const [tokensShown, setTokensShown] = useState(3);
  const [pairsShown, setPairsShown] = useState(3);

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const filteredTokens = useMemo(() => {
    const uniqueTokens: any[] = [];
    const found: any = {};
    if (searchedTokens && searchedTokens.length > 0) {
      searchedTokens.map((token) => {
        if (!found[token.id]) {
          found[token.id] = true;
          uniqueTokens.push(token);
        }
        return true;
      });
    }
    const filtered =
      uniqueTokens && uniqueTokens.length > 0
        ? uniqueTokens
            .sort((tokenA, tokenB) => {
              return tokenA.oneDayVolumeUSD > tokenB.oneDayVolumeUSD ? -1 : 1;
            })
            .filter((token) => {
              if (GlobalConst.blacklists.TOKEN_BLACKLIST.includes(token.id)) {
                return false;
              }
              const regexMatches = Object.keys(token).map((tokenEntryKey) => {
                const isAddress = searchVal.slice(0, 2) === '0x';
                if (tokenEntryKey === 'id' && isAddress) {
                  return token[tokenEntryKey].match(
                    new RegExp(escapeRegExp(searchVal), 'i'),
                  );
                }
                if (tokenEntryKey === 'symbol' && !isAddress) {
                  return token[tokenEntryKey].match(
                    new RegExp(escapeRegExp(searchVal), 'i'),
                  );
                }
                if (tokenEntryKey === 'name' && !isAddress) {
                  return token[tokenEntryKey].match(
                    new RegExp(escapeRegExp(searchVal), 'i'),
                  );
                }
                return false;
              });
              return regexMatches.some((m) => m);
            })
        : [];
    return filtered;
  }, [searchedTokens, searchVal]);

  const filteredPairs = useMemo(() => {
    const uniquePairs: any[] = [];
    const pairsFound: any = {};
    if (searchedPairs && searchedPairs.length > 0)
      searchedPairs.map((pair) => {
        if (!pairsFound[pair.id]) {
          pairsFound[pair.id] = true;
          uniquePairs.push(pair);
        }
        return true;
      });

    const filtered = uniquePairs
      ? uniquePairs
          .sort((pairA, pairB) => {
            const pairAReserveETH = Number(pairA?.trackedReserveETH ?? 0);
            const pairBReserveETH = Number(pairB?.trackedReserveETH ?? 0);
            return pairAReserveETH > pairBReserveETH ? -1 : 1;
          })
          .filter((pair) => {
            if (GlobalConst.blacklists.PAIR_BLACKLIST.includes(pair.id)) {
              return false;
            }
            if (searchVal && searchVal.includes(' ')) {
              const pairA = searchVal.split(' ')[0]?.toUpperCase();
              const pairB = searchVal.split(' ')[1]?.toUpperCase();
              return (
                (pair.token0.symbol.includes(pairA) ||
                  pair.token0.symbol.includes(pairB)) &&
                (pair.token1.symbol.includes(pairA) ||
                  pair.token1.symbol.includes(pairB))
              );
            }
            if (searchVal && searchVal.includes('-')) {
              const pairA = searchVal.split('-')[0]?.toUpperCase();
              const pairB = searchVal.split('-')[1]?.toUpperCase();
              return (
                (pair.token0.symbol.includes(pairA) ||
                  pair.token0.symbol.includes(pairB)) &&
                (pair.token1.symbol.includes(pairA) ||
                  pair.token1.symbol.includes(pairB))
              );
            }
            const regexMatches = Object.keys(pair).map((field) => {
              const isAddress = searchVal.slice(0, 2) === '0x';
              if (field === 'id' && isAddress) {
                return pair[field].match(
                  new RegExp(escapeRegExp(searchVal), 'i'),
                );
              }
              if (field === 'token0' || field === 'token1') {
                return (
                  pair[field].symbol.match(
                    new RegExp(escapeRegExp(searchVal), 'i'),
                  ) ||
                  pair[field].name.match(
                    new RegExp(escapeRegExp(searchVal), 'i'),
                  )
                );
              }
              return false;
            });
            return regexMatches.some((m) => m);
          })
      : [];
    return filtered;
  }, [searchedPairs, searchVal]);

  useEffect(() => {
    async function fetchData() {
      try {
        const allTokensUniswap = await getAllTokensOnUniswap();
        const allPairsUniswap = await getAllPairsOnUniswap();
        let allTokens = allTokensUniswap ?? [];
        let allPairs = allPairsUniswap ?? [];
        if (searchVal.length > 0) {
          const tokens = await client.query({
            query: TOKEN_SEARCH,
            variables: {
              value: searchVal ? searchVal.toUpperCase() : '',
              id: searchVal,
            },
          });

          const pairs = await client.query({
            query: PAIR_SEARCH,
            variables: {
              tokens: tokens.data.asSymbol?.map((t: any) => t.id),
              id: searchVal,
            },
          });

          const foundPairs = pairs.data.as0
            .concat(pairs.data.as1)
            .concat(pairs.data.asAddress);

          allPairs = allPairs.concat(
            foundPairs.filter((searchedPair: any) => {
              let included = false;
              allPairs.map((pair) => {
                if (pair.id === searchedPair.id) {
                  included = true;
                }
                return true;
              });
              return !included;
            }),
          );

          const foundTokens = tokens.data.asSymbol
            .concat(tokens.data.asAddress)
            .concat(tokens.data.asName);

          allTokens = allTokens.concat(
            foundTokens.filter((searchedToken: any) => {
              let included = false;
              allTokens.map((token) => {
                if (token.id === searchedToken.id) {
                  included = true;
                }
                return true;
              });
              return !included;
            }),
          );
        }

        const foundTokensWithData = await Promise.all(
          allTokens.map(async (token: any) => {
            const utcCurrentTime = dayjs();
            const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
            const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
            const oneDayResult = await client.query({
              query: TOKEN_INFO_OLD(oneDayBlock, token.id),
              fetchPolicy: 'network-only',
            });
            if (
              oneDayResult &&
              oneDayResult.data &&
              oneDayResult.data.tokens &&
              oneDayResult.data.tokens.length > 0
            ) {
              const oneDayHistory = oneDayResult.data.tokens[0];
              const oneDayVolumeUSD =
                (token?.tradeVolumeUSD ?? 0) -
                (oneDayHistory?.tradeVolumeUSD ?? 0);
              return { ...token, oneDayVolumeUSD };
            }
            return token;
          }),
        );
        setSearchedTokens(foundTokensWithData);
        setSearchedPairs(allPairs);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [searchVal]);

  const handleClick = (e: any) => {
    if (
      !(menuRef.current && menuRef.current.contains(e.target)) &&
      !(wrapperRef.current && wrapperRef.current.contains(e.target))
    ) {
      setPairsShown(3);
      setTokensShown(3);
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <Box className='searchWidgetWrapper'>
      <Box className='searchWidgetInput'>
        <input
          placeholder={t('searchTokenPair')}
          value={searchValInput}
          ref={menuRef}
          onFocus={() => setMenuOpen(true)}
          onChange={(evt) => setSearchValInput(evt.target.value)}
        />
        <Box display='flex'>
          <SearchIcon />
        </Box>
      </Box>
      {menuOpen && (
        <div ref={wrapperRef} className='searchWidgetContent'>
          <h6>{t('pairs')}</h6>
          {filteredPairs.slice(0, pairsShown).map((val, ind) => {
            const currency0 = new Token(
              MATIC_CHAIN,
              getAddress(val.token0.id),
              val.token0.decimals,
            );
            const currency1 = new Token(
              MATIC_CHAIN,
              getAddress(val.token1.id),
              val.token1.decimals,
            );
            return (
              <Box
                key={ind}
                className='searchWidgetRow'
                onClick={() => {
                  history.push(`/analytics/pair/${val.id}`);
                  setMenuOpen(false);
                }}
              >
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  size={28}
                />
                <small>
                  {val.token0.symbol} - {val.token1.symbol} {t('pair')}
                </small>
              </Box>
            );
          })}
          <Box
            className='searchWidgetShowMore'
            onClick={() => setPairsShown(pairsShown + 5)}
          >
            <small>{t('showMore')}</small>
          </Box>
          <h6>{t('tokens')}</h6>
          {filteredTokens.slice(0, tokensShown).map((val, ind) => {
            const currency = new Token(
              MATIC_CHAIN,
              getAddress(val.id),
              val.decimals,
            );
            return (
              <Box
                key={ind}
                className='searchWidgetRow'
                onClick={() => {
                  history.push(`/analytics/token/${val.id}`);
                  setMenuOpen(false);
                }}
              >
                <CurrencyLogo currency={currency} size='28px' />
                <small>
                  {val.name} {val.symbol}
                </small>
              </Box>
            );
          })}
          <Box
            className='searchWidgetShowMore'
            onClick={() => setTokensShown(tokensShown + 5)}
          >
            <small>{t('showMore')}</small>
          </Box>
        </div>
      )}
    </Box>
  );
};

export default React.memo(AnalyticsSearch);
