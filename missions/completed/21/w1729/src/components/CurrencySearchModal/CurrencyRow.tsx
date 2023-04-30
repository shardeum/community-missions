import { CurrencyAmount, ETHER, Token } from '@uniswap/sdk';
import React from 'react';
import { Box, Tooltip, CircularProgress, ListItem } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { useAddUserToken, useRemoveUserAddedToken } from 'state/user/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useIsUserAddedToken } from 'hooks/Tokens';
import { CurrencyLogo } from 'components';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { PlusHelper } from 'components/QuestionHelper';
import { ReactComponent as TokenSelectedIcon } from 'assets/images/TokenSelected.svg';
import useUSDCPrice from 'utils/useUSDCPrice';
import { formatTokenAmount } from 'utils';
import { useTranslation } from 'react-i18next';

function currencyKey(currency: Token): string {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? 'ETHER'
    : '';
}

function Balance({ balance }: { balance: CurrencyAmount }) {
  return (
    <p className='small' title={balance.toExact()}>
      {formatTokenAmount(balance)}
    </p>
  );
}

function TokenTags({ currency }: { currency: Token }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />;
  }

  const tags = currency.tags;
  if (!tags || tags.length === 0) return <span />;

  const tag = tags[0];
  return (
    <Box>
      <Tooltip title={tag.description}>
        <Box className='tag' key={tag.id}>
          {tag.name}
        </Box>
      </Tooltip>
      {tags.length > 1 ? (
        <Tooltip
          title={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Box className='tag'>...</Box>
        </Tooltip>
      ) : null}
    </Box>
  );
}

interface CurrenyRowProps {
  currency: Token;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style: any;
  isOnSelectedList?: boolean;
}

const CurrencyRow: React.FC<CurrenyRowProps> = ({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isOnSelectedList,
}) => {
  const { t } = useTranslation();

  const { ethereum } = window as any;
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency);

  const usdPrice = useUSDCPrice(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);
  const customAdded = useIsUserAddedToken(currency);

  const removeToken = useRemoveUserAddedToken();
  const addToken = useAddUserToken();
  const isMetamask =
    ethereum &&
    ethereum.isMetaMask &&
    Number(ethereum.chainId) === 137 &&
    isOnSelectedList;

  const addTokenToMetamask = (
    tokenAddress: any,
    tokenSymbol: any,
    tokenDecimals: any,
    tokenImage: any,
  ) => {
    if (ethereum) {
      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
              address: tokenAddress, // The address that the token is at.
              symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
              decimals: tokenDecimals, // The number of decimals in the token
              image: tokenImage, // A string url of the token logo
            },
          },
        })
        .catch((error: any) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log('We can encrypt anything without the key.');
          } else {
            console.error(error);
          }
        });
    }
  };

  // only show add or remove buttons if not on selected list
  return (
    <ListItem
      button
      style={style}
      key={key}
      selected={otherSelected || isSelected}
      onClick={() => {
        if (!isSelected && !otherSelected) onSelect();
      }}
    >
      <Box className='currencyRow'>
        {(otherSelected || isSelected) && <TokenSelectedIcon />}
        <CurrencyLogo currency={currency} size='32px' />
        <Box ml={1} height={32}>
          <Box className='flex items-center'>
            <small className='currencySymbol'>{currency.symbol}</small>
            {isMetamask && currency !== ETHER && (
              <Box
                className='cursor-pointer'
                ml='2px'
                onClick={(event: any) => {
                  addTokenToMetamask(
                    currency.address,
                    currency.symbol,
                    currency.decimals,
                    getTokenLogoURL(currency.address),
                  );
                  event.stopPropagation();
                }}
              >
                <PlusHelper text={t('addToMetamask')} />
              </Box>
            )}
          </Box>
          {isOnSelectedList ? (
            <span className='currencyName'>{currency.name}</span>
          ) : (
            <Box className='flex items-center'>
              <span>
                {customAdded ? t('addedByUser') : t('foundByAddress')}
              </span>
              <Box
                ml={0.5}
                className='text-primary'
                onClick={(event) => {
                  event.stopPropagation();
                  if (customAdded) {
                    if (chainId && currency instanceof Token)
                      removeToken(chainId, currency.address);
                  } else {
                    if (currency instanceof Token) addToken(currency);
                  }
                }}
              >
                <span>{customAdded ? `(${t('remove')})` : `(${t('add')}`}</span>
              </Box>
            </Box>
          )}
        </Box>

        <Box flex={1}></Box>
        <TokenTags currency={currency} />
        <Box textAlign='right'>
          {balance ? (
            <>
              <Balance balance={balance} />
              <span className='text-secondary'>
                $
                {(
                  Number(balance.toExact()) *
                  (usdPrice ? Number(usdPrice.toSignificant()) : 0)
                ).toLocaleString()}
              </span>
            </>
          ) : account ? (
            <CircularProgress size={24} color='secondary' />
          ) : null}
        </Box>
      </Box>
    </ListItem>
  );
};

export default CurrencyRow;
