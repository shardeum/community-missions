import { currencyEquals, Token, Currency, ETHER } from '@uniswap/sdk';
import React, { useMemo, useCallback, MutableRefObject } from 'react';
import { Box } from '@material-ui/core';
import { FixedSizeList } from 'react-window';
import { useSelectedTokenList } from 'state/lists/hooks';
import { isTokensOnList } from 'utils';
import CurrencyRow from './CurrencyRow';

interface CurrencyListProps {
  currencies: Token[];
  height: number;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Token) => void;
  otherCurrency?: Currency | null;
  showETH: boolean;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  height,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  fixedListRef,
}) => {
  const itemData = useMemo(
    () => (showETH ? [Token.ETHER, ...currencies] : currencies),
    [currencies, showETH],
  );
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = isTokensOnList(selectedTokenList, itemData);

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Token = data[index];
      const isSelected = Boolean(
        selectedCurrency && currencyEquals(selectedCurrency, currency),
      );
      const otherSelected = Boolean(
        otherCurrency && currencyEquals(otherCurrency, currency),
      );
      const handleSelect = () => onCurrencySelect(currency);
      return index < itemData.length ? (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          isOnSelectedList={isOnSelectedList[index]}
        />
      ) : (
        <Box />
      );
    },
    [
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      itemData,
      isOnSelectedList,
    ],
  );

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index];
    return currency instanceof Token
      ? currency.address
      : currency === ETHER
      ? 'ETHER'
      : '';
  }, []);

  return (
    <FixedSizeList
      ref={fixedListRef as any}
      height={height}
      width='100%'
      itemData={itemData}
      itemCount={itemData.length + 1}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  );
};

export default CurrencyList;
