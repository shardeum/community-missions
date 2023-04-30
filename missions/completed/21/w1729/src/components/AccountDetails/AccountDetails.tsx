import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch } from 'state';
import { Box } from '@material-ui/core';
import { clearAllTransactions } from 'state/transactions/actions';
import { shortenAddress, getEtherscanLink, getWalletKeys } from 'utils';
import { SUPPORTED_WALLETS } from 'constants/index';
import { ReactComponent as Close } from 'assets/images/CloseIcon.svg';
import { injected, walletlink, safeApp } from 'connectors';
import { ExternalLink as LinkIcon } from 'react-feather';
import 'components/styles/AccountDetails.scss';
import StatusIcon from './StatusIcon';
import Copy from './CopyHelper';
import Transaction from './Transaction';
import { useTranslation } from 'react-i18next';

function renderTransactions(transactions: string[]) {
  return (
    <>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />;
      })}
    </>
  );
}

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}) => {
  const { chainId, account, connector } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  function formatConnectorName() {
    const name = getWalletKeys(connector).map(
      (k) => SUPPORTED_WALLETS[k].name,
    )[0];
    return (
      <small>
        {t('connectedWith')} {name}
      </small>
    );
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <Box paddingX={3} paddingY={4}>
      <Box className='flex justify-between'>
        <h5 className='text-bold'>{t('account')}</h5>
        <Close className='cursor-pointer' onClick={toggleWalletModal} />
      </Box>
      <Box mt={2} padding={2} borderRadius={10} className='bg-secondary2'>
        <Box className='flex justify-between items-center'>
          {formatConnectorName()}
          <Box className='flex items-center'>
            {connector !== injected &&
              connector !== walletlink &&
              connector !== safeApp && (
                <small
                  style={{ cursor: 'pointer', marginRight: 8 }}
                  onClick={() => {
                    (connector as any).close();
                  }}
                >
                  {t('disconnect')}
                </small>
              )}
            {connector !== safeApp && (
              <small
                className='cursor-pointer'
                onClick={() => {
                  openOptions();
                }}
              >
                {t('change')}
              </small>
            )}
          </Box>
        </Box>
        <Box className='flex items-center' my={1.5}>
          <StatusIcon />
          <h5 style={{ marginLeft: 8 }} id='web3-account-identifier-row'>
            {ENSName ? ENSName : account && shortenAddress(account)}
          </h5>
        </Box>
        <Box className='flex justify-between items-center'>
          {account && (
            <Copy toCopy={account}>
              <small>{t('copyAddress')}</small>
            </Copy>
          )}
          {chainId && account && (
            <a
              className='addressLink'
              href={
                chainId &&
                getEtherscanLink(
                  chainId,
                  ENSName ? ENSName : account,
                  'address',
                )
              }
              target='_blank'
              rel='noopener noreferrer'
            >
              <LinkIcon size={16} />
              <small>{t('viewonBlockExplorer')}</small>
            </a>
          )}
        </Box>
      </Box>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <>
          <Box
            className='flex justify-between items-center'
            px={2}
            pt={2}
            mb={1}
          >
            <small>{t('recentTransactions')}</small>
            <small
              className='cursor-pointer'
              onClick={clearAllTransactionsCallback}
            >
              {t('clearAll')}
            </small>
          </Box>
          <Box paddingX={2} flex={1} overflow='auto'>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </Box>
        </>
      ) : (
        <Box paddingX={2} pt={2}>
          <p>{t('transactionsWillAppear')}...</p>
        </Box>
      )}
    </Box>
  );
};

export default AccountDetails;
