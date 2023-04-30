import React, { useMemo, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Box, Button, CircularProgress } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import QUICKIcon from 'assets/images/quickIcon.svg';
import { ReactComponent as QUICKV2Icon } from 'assets/images/QUICKV2.svg';
import { ArrowForward, ArrowDownward } from '@material-ui/icons';
import {
  NumericalInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
} from 'components';
import { formatTokenAmount } from 'utils';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { GlobalConst, GlobalValue } from 'constants/index';
import { useQUICKConversionContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { tryParseAmount } from 'state/swap/hooks';
import 'pages/styles/convertQUICK.scss';

const ConvertQUICKPage: React.FC = () => {
  const { t } = useTranslation();
  const { account, library } = useActiveWeb3React();
  const [quickAmount, setQUICKAmount] = useState('');
  const [quickV2Amount, setQUICKV2Amount] = useState('');
  const [approving, setApproving] = useState(false);
  const [attemptConverting, setAttemptConverting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');

  const quickToken = GlobalValue.tokens.COMMON.OLD_QUICK;
  const quickBalance = useTokenBalance(account ?? undefined, quickToken);
  const quickConvertContract = useQUICKConversionContract();
  const parsedAmount = tryParseAmount(quickAmount, quickToken);
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    quickConvertContract?.address,
  );

  const quickConvertingText = t('convertingQUICKtoQUICKV2', {
    quickAmount,
    quickV2Amount,
  });
  const quickConvertedText = t('convertedQUICKtoQUICKV2', {
    quickAmount,
    quickV2Amount,
  });
  const txSubmittedQuickConvertText = t('submittedTxQUICKConvert', {
    quickAmount,
    quickV2Amount,
  });
  const successQuickConvertedText = t('successConvertedQUICKtoQUICKV2', {
    quickAmount,
    quickV2Amount,
  });

  const isInsufficientQUICK =
    Number(quickAmount) > Number(quickBalance?.toExact() ?? 0);
  const buttonText = useMemo(() => {
    if (!quickAmount || !Number(quickAmount)) {
      return t('enterAmount');
    } else if (approval !== ApprovalState.APPROVED) {
      return t('approve');
    } else if (isInsufficientQUICK) {
      return t('insufficientBalance');
    } else {
      return t('convert');
    }
  }, [isInsufficientQUICK, quickAmount, t, approval]);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const handleDismissConfirmation = () => {
    setShowConfirm(false);
  };

  const attemptToApprove = async () => {
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const convertQUICK = async () => {
    if (quickConvertContract && library && parsedAmount) {
      setAttemptConverting(true);
      setShowConfirm(true);
      await quickConvertContract
        .quickToQuickX(parsedAmount.raw.toString(), {
          gasLimit: 300000,
        })
        .then(async (response: TransactionResponse) => {
          setAttemptConverting(false);
          setTxPending(true);
          setTxError('');
          setTxHash('');
          addTransaction(response, {
            summary: quickConvertingText,
          });
          try {
            const tx = await response.wait();
            finalizedTransaction(tx, {
              summary: quickConvertedText,
            });
            setTxPending(false);
            setTxHash(tx.transactionHash);
          } catch (err) {
            setTxPending(false);
            setTxError(t('errorInTx'));
          }
        })
        .catch(() => {
          setAttemptConverting(false);
          setTxPending(false);
          setTxHash('');
          setTxError(t('txRejected'));
        });
    }
  };

  return (
    <Box width='100%' maxWidth={488} id='convertQUICKPage'>
      <h4>{t('convert')} QUICK</h4>
      <Box className='convertQUICKWrapper'>
        <Box className='flex items-center' mb={3}>
          <Box className='iconWrapper'>
            <img src={QUICKIcon} alt='QUICK' />
          </Box>
          <p className='weight-600'>QUICK(OLD)</p>
          <Box mx={1.5} className='convertArrow'>
            <ArrowForward />
          </Box>
          <Box className='iconWrapper'>
            <QUICKV2Icon />
          </Box>
          <p className='weight-600'>QUICK(NEW)</p>
        </Box>
        <small className='text-secondary'>
          <Trans
            i18nKey='convertQUICK'
            components={{
              alink: (
                <a
                  href='https://quickswap-layer2.medium.com/you-voted-for-a-1-1000-token-split-to-make-quick-more-appealing-9c25c2a2dd7e'
                  rel='noreferrer'
                  target='_blank'
                />
              ),
            }}
          />
        </small>
        <Box className='conversionRate'>
          <span>
            {t('conversionRate')}: 1 QUICK(OLD) ={' '}
            {GlobalConst.utils.QUICK_CONVERSION_RATE} QUICK(NEW)
          </span>
        </Box>
        <Box mt={4} mb={2}>
          <small className='text-secondary'>
            {t('yourbalance')}: {formatTokenAmount(quickBalance)}
          </small>
          <Box
            className={`currencyInput${
              isInsufficientQUICK ? ' errorInput' : ''
            }`}
          >
            <NumericalInput
              placeholder='0.00'
              value={quickAmount}
              fontSize={18}
              onUserInput={(value) => {
                const digits =
                  value.indexOf('.') > -1 ? value.split('.')[1].length : 0;
                let fixedVal = value;
                if (digits > quickToken.decimals) {
                  fixedVal = Number(value).toFixed(quickToken.decimals);
                }
                setQUICKAmount(fixedVal);
                setQUICKV2Amount(
                  (
                    Number(fixedVal) * GlobalConst.utils.QUICK_CONVERSION_RATE
                  ).toLocaleString('fullwide', {
                    useGrouping: false,
                    maximumFractionDigits: quickToken.decimals,
                  }),
                );
              }}
            />
            <Box
              mr={1}
              className='maxButton'
              onClick={() => {
                if (quickBalance) {
                  setQUICKAmount(quickBalance.toExact());
                  setQUICKV2Amount(
                    (
                      Number(quickBalance.toExact()) *
                      GlobalConst.utils.QUICK_CONVERSION_RATE
                    ).toString(),
                  );
                }
              }}
            >
              {t('max')}
            </Box>
            <p className='weight-600'>QUICK(OLD)</p>
          </Box>
          {isInsufficientQUICK && (
            <small className='text-error'>
              {t('insufficientBalance', { symbol: 'QUICK' })}
            </small>
          )}
        </Box>
        <Box ml={2} className='convertArrow'>
          <ArrowDownward />
        </Box>
        <Box mt={2} mb={4}>
          <small className='text-secondary'>{t('youwillreceive')}:</small>
          <Box className='currencyInput'>
            <NumericalInput
              placeholder='0.00'
              value={quickV2Amount}
              fontSize={18}
              onUserInput={(value) => {
                setQUICKV2Amount(value);
                const quickAmount = (
                  Number(value) / GlobalConst.utils.QUICK_CONVERSION_RATE
                ).toLocaleString('fullwide', {
                  useGrouping: false,
                  maximumFractionDigits: quickToken.decimals,
                });
                setQUICKAmount(quickAmount);
              }}
            />
            <p className='weight-600'>QUICK(NEW)</p>
          </Box>
        </Box>
        <Box className='flex justify-center'>
          <Button
            disabled={
              approving ||
              attemptConverting ||
              isInsufficientQUICK ||
              !quickAmount ||
              !Number(quickAmount)
            }
            className='convertButton'
            onClick={() => {
              if (approval === ApprovalState.APPROVED) {
                convertQUICK();
              } else {
                attemptToApprove();
              }
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptConverting}
          txPending={txPending}
          hash={txHash}
          content={() =>
            txError ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={txError}
              />
            ) : (
              <ConfirmationModalContent
                title={t('convertingQUICK')}
                onDismiss={handleDismissConfirmation}
                content={() => (
                  <Box textAlign='center'>
                    <Box mt={6} mb={5}>
                      <CircularProgress size={80} />
                    </Box>
                    <p>{quickConvertingText}</p>
                  </Box>
                )}
              />
            )
          }
          pendingText={quickConvertingText}
          modalContent={
            txPending ? txSubmittedQuickConvertText : successQuickConvertedText
          }
        />
      )}
    </Box>
  );
};

export default ConvertQUICKPage;
