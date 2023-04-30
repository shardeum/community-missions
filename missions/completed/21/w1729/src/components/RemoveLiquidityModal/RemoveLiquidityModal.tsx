import React, { useState, useMemo, useCallback } from 'react';
import { Contract } from '@ethersproject/contracts';
import { ArrowLeft, ArrowDown } from 'react-feather';
import { Box, Button } from '@material-ui/core';
import { Currency, ETHER, JSBI, Percent } from '@uniswap/sdk';
import ReactGA from 'react-ga';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { GlobalConst } from 'constants/index';
import {
  CustomModal,
  DoubleCurrencyLogo,
  ColoredSlider,
  CurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
  ConfirmationModalContent,
  NumericalInput,
} from 'components';
import {
  useDerivedBurnInfo,
  useBurnState,
  useBurnActionHandlers,
} from 'state/burn/hooks';
import { Field } from 'state/burn/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { usePairContract } from 'hooks/useContract';
import {
  calculateGasMargin,
  calculateSlippageAmount,
  formatTokenAmount,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useRouterContract } from 'hooks/useContract';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useTotalSupply } from 'data/TotalSupply';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import 'components/styles/RemoveLiquidityModal.scss';
import { useTranslation } from 'react-i18next';

interface RemoveLiquidityModalProps {
  currency0: Currency;
  currency1: Currency;
  open: boolean;
  onClose: () => void;
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  currency0,
  currency1,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [removeErrorMessage, setRemoveErrorMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState('');
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const { chainId, account, library } = useActiveWeb3React();
  const [tokenA, tokenB] = useMemo(
    () => [
      wrappedCurrency(currency0, chainId),
      wrappedCurrency(currency1, chainId),
    ],
    [currency0, currency1, chainId],
  );

  const { independentField, typedValue } = useBurnState();
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(
    currency0,
    currency1,
  );
  const deadline = useTransactionDeadline();
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const [allowedSlippage] = useUserSlippageTolerance();

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue);
    },
    [_onUserInput],
  );

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput],
  );

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString());
    },
    [onUserInput],
  );

  const [
    innerLiquidityPercentage,
    setInnerLiquidityPercentage,
  ] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  );
  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken);
  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo(
      '0',
    )
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY
        ? typedValue
        : parsedAmounts[Field.LIQUIDITY]?.toExact() ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A
        ? typedValue
        : parsedAmounts[Field.CURRENCY_A]?.toExact() ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B
        ? typedValue
        : parsedAmounts[Field.CURRENCY_B]?.toExact() ?? '',
  };

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  const pairContract: Contract | null = usePairContract(
    pair?.liquidityToken?.address,
  );
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    chainId ? GlobalConst.addresses.ROUTER_ADDRESS[chainId] : undefined,
  );
  const onAttemptToApprove = async () => {
    if (!pairContract || !pair || !library || !deadline) {
      setErrorMsg(t('missingdependencies'));
      return;
    }
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) {
      setErrorMsg(t('missingliquidity'));
      return;
    }
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setTxHash('');
  }, []);

  const router = useRouterContract();

  const onRemove = async () => {
    if (!chainId || !library || !account || !deadline || !router)
      throw new Error(t('missingdependencies'));
    const {
      [Field.CURRENCY_A]: currencyAmountA,
      [Field.CURRENCY_B]: currencyAmountB,
    } = parsedAmounts;
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error(t('noInputAmounts'));
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        currencyAmountA,
        allowedSlippage,
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        currencyAmountB,
        allowedSlippage,
      )[0],
    };

    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error(t('noLiquidity'));

    const currencyBIsETH = currency1 === ETHER;
    const oneCurrencyIsETH = currency0 === ETHER || currencyBIsETH;

    if (!tokenA || !tokenB) throw new Error(t('cannotWrap'));

    let methodNames: string[],
      args: Array<string | string[] | number | boolean>;
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = [
          'removeLiquidityETH',
          'removeLiquidityETHSupportingFeeOnTransferTokens',
        ];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[
            currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
          ].toString(),
          amountsMin[
            currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
          ].toString(),
          account,
          deadline.toHexString(),
        ];
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ];
      }
    } else {
      throw new Error(t('confirmWithoutApproval'));
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error);
            return undefined;
          }),
      ),
    );

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
      (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate),
    );

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      throw new Error(t('transactionWouldFail'));
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

      setAttemptingTxn(true);
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then(async (response: TransactionResponse) => {
          setAttemptingTxn(false);
          setTxPending(true);
          const summary = t('removeLiquidityMsg', {
            amount1: formatTokenAmount(parsedAmounts[Field.CURRENCY_A]),
            symbol1: currency0.symbol,
            amount2: formatTokenAmount(parsedAmounts[Field.CURRENCY_B]),
            symbol2: currency1.symbol,
          });

          addTransaction(response, {
            summary,
          });

          setTxHash(response.hash);

          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary,
            });
            setTxPending(false);
          } catch (error) {
            setTxPending(false);
            setRemoveErrorMessage(t('errorInTx'));
          }

          ReactGA.event({
            category: 'Liquidity',
            action: 'Remove',
            label: [currency0.symbol, currency1.symbol].join('/'),
          });
        })
        .catch((error: Error) => {
          setAttemptingTxn(false);
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error);
        });
    }
  };

  const modalHeader = () => {
    return (
      <Box>
        <Box className='flex justify-center' mt={10} mb={3}>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={48}
          />
        </Box>
        <Box mb={6} textAlign='center'>
          <p className='weight-600'>
            {t('removingLP', {
              amount: formattedAmounts[Field.LIQUIDITY],
              symbol1: currency0.symbol,
              symbol2: currency1.symbol,
            })}
            <br />
            {t('youwillreceive')}{' '}
            {formatTokenAmount(parsedAmounts[Field.CURRENCY_A])}{' '}
            {currency0.symbol} {t('and')}{' '}
            {formatTokenAmount(parsedAmounts[Field.CURRENCY_B])}{' '}
            {currency1.symbol}
          </p>
        </Box>
        <Box mb={3} textAlign='center'>
          <small className='text-secondary'>
            {t('outputEstimated', { slippage: allowedSlippage / 100 })}
          </small>
        </Box>
        <Box mt={2}>
          <Button fullWidth className='removeButton' onClick={onRemove}>
            {t('confirm')}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        {showConfirm && (
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            txPending={txPending}
            hash={txHash}
            content={() =>
              removeErrorMessage ? (
                <TransactionErrorContent
                  onDismiss={handleDismissConfirmation}
                  message={removeErrorMessage}
                />
              ) : (
                <ConfirmationModalContent
                  title={t('removingLiquidity')}
                  onDismiss={handleDismissConfirmation}
                  content={modalHeader}
                />
              )
            }
            pendingText=''
            modalContent={
              txPending
                ? t('submittedTxRemoveLiquidity')
                : t('successRemovedLiquidity')
            }
          />
        )}
        <Box className='flex items-center justify-between'>
          <ArrowLeft
            className='text-secondary cursor-pointer'
            onClick={onClose}
          />
          <h6>{t('removeLiquidity')}</h6>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box className='removeLiquidityInput'>
          <Box className='flex items-center justify-between'>
            <small>
              {currency0.symbol} / {currency1.symbol} LP
            </small>
            <small>
              {t('balance')}: {formatTokenAmount(userPoolBalance)}
            </small>
          </Box>
          <Box mt={2}>
            <NumericalInput
              placeholder='0'
              value={formattedAmounts[Field.LIQUIDITY]}
              fontSize={28}
              onUserInput={(value) => {
                onLiquidityInput(value);
              }}
            />
          </Box>
          <Box className='flex items-center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={innerLiquidityPercentage}
                handleChange={(event, value) =>
                  setInnerLiquidityPercentage(value as number)
                }
              />
            </Box>
            <small>{formattedAmounts[Field.LIQUIDITY_PERCENT]}%</small>
          </Box>
        </Box>
        <Box className='flex justify-center' my={3}>
          <ArrowDown className='text-secondary' />
        </Box>
        <Box className='removeLiquidityInfo bg-secondary1'>
          <Box>
            <p>
              {t('pooled')} {currency0.symbol}
            </p>
            <Box>
              <p>{formatTokenAmount(token0Deposited)}</p>
              <CurrencyLogo currency={currency0} />
            </Box>
          </Box>
          <Box>
            <p className='text-blue7'>
              - {t('withdraw')} {currency0.symbol}
            </p>
            <p className='text-blue7'>{formattedAmounts[Field.CURRENCY_A]}</p>
          </Box>
          <Box>
            <p>
              {t('pooled')} {currency1.symbol}
            </p>
            <Box>
              <p>{formatTokenAmount(token1Deposited)}</p>
              <CurrencyLogo currency={currency1} />
            </Box>
          </Box>
          <Box>
            <p className='text-blue7'>
              - {t('withdraw')} {currency1.symbol}
            </p>
            <p className='text-blue7'>{formattedAmounts[Field.CURRENCY_B]}</p>
          </Box>
          <Box>
            <p>{t('yourPoolShare')}</p>
            <p>
              {poolTokenPercentage
                ? poolTokenPercentage.toSignificant() + '%'
                : '-'}
            </p>
          </Box>
        </Box>
        {pair && (
          <Box className='flex justify-between items-center' mt={2} px={2}>
            <small>
              1 {currency0.symbol} ={' '}
              {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
              {currency1.symbol}
            </small>
            <small>
              1 {currency1.symbol} ={' '}
              {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
              {currency0.symbol}
            </small>
          </Box>
        )}
        <Box mt={2} className='flex justify-between items-center'>
          <Button
            className='removeButton'
            onClick={onAttemptToApprove}
            disabled={approving || approval !== ApprovalState.NOT_APPROVED}
          >
            {approving
              ? `${t('approving')}...`
              : approval === ApprovalState.APPROVED
              ? t('approved')
              : t('approve')}
          </Button>
          <Button
            className='removeButton'
            onClick={() => {
              setShowConfirm(true);
            }}
            disabled={Boolean(error) || approval !== ApprovalState.APPROVED}
          >
            {error || t('remove')}
          </Button>
        </Box>
        <Box mt={2}>
          <p className='text-error'>{errorMsg}</p>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default RemoveLiquidityModal;
