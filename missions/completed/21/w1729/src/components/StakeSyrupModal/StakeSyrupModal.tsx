import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { TokenAmount } from '@uniswap/sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { CustomModal, ColoredSlider, NumericalInput } from 'components';
import { useDerivedSyrupInfo } from 'state/stake/hooks';
import { SyrupInfo } from 'types';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useStakingContract } from 'hooks/useContract';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { wrappedCurrencyAmount } from 'utils/wrappedCurrency';
import {
  formatTokenAmount,
  maxAmountSpend,
  formatNumber,
  getSecondsOneDay,
  getExactTokenAmount,
  getValueTokenDecimals,
  getPartialTokenAmount,
} from 'utils';
import { useTranslation } from 'react-i18next';

interface StakeSyrupModalProps {
  open: boolean;
  onClose: () => void;
  syrup: SyrupInfo;
}

const StakeSyrupModal: React.FC<StakeSyrupModalProps> = ({
  open,
  onClose,
  syrup,
}) => {
  const { t } = useTranslation();
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState('');
  const { account, chainId, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup.stakedAmount?.token,
  );
  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);
  const [approving, setApproving] = useState(false);
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked);
  const { parsedAmount, error } = useDerivedSyrupInfo(
    typedValue,
    syrup.stakedAmount?.token,
    userLiquidityUnstaked,
  );

  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId);

  let hypotheticalRewardRate = syrup.rewardRate
    ? new TokenAmount(syrup.rewardRate.token, '0')
    : undefined;
  if (parsedAmountWrapped && parsedAmountWrapped.greaterThan('0')) {
    hypotheticalRewardRate =
      syrup.stakedAmount && syrup.totalStakedAmount
        ? syrup.getHypotheticalRewardRate(
            syrup.stakedAmount.add(parsedAmountWrapped),
            syrup.totalStakedAmount.add(parsedAmountWrapped),
          )
        : undefined;
  }

  const deadline = useTransactionDeadline();

  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    syrup.stakingRewardAddress,
  );
  const [signatureData, setSignatureData] = useState<{
    v: number;
    r: string;
    s: string;
    deadline: number;
  } | null>(null);

  const stakingContract = useStakingContract(syrup.stakingRewardAddress);

  const onAttemptToApprove = async () => {
    if (!library || !deadline) throw new Error(t('missingdependencies'));
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('missingliquidity'));
    return approveCallback();
  };

  const onStake = async () => {
    setAttempting(true);
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        stakingContract
          .stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
          .then(async (response: TransactionResponse) => {
            addTransaction(response, {
              summary: `${t('deposit')} ${syrup.stakingToken.symbol}`,
            });
            try {
              const receipt = await response.wait();
              finalizedTransaction(receipt, {
                summary: `${t('deposit')} ${syrup.stakingToken.symbol}`,
              });
              setAttempting(false);
              setStakePercent(0);
              setTypedValue('');
            } catch (e) {
              setAttempting(false);
              setStakePercent(0);
              setTypedValue('');
            }
          })
          .catch((error: any) => {
            setAttempting(false);
            console.log(error);
          });
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 },
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: t('depositliquidity'),
            });
            setHash(response.hash);
          })
          .catch((error: any) => {
            setAttempting(false);
            console.log(error);
          });
      } else {
        setAttempting(false);
        throw new Error(t('stakewithoutapproval'));
      }
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box className='flex justify-between items-center'>
          <h5>
            {t('stake')} {syrup.stakingToken.symbol}
          </h5>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          mt={3}
          className='bg-default border-gray14'
          borderRadius='10px'
          padding='16px'
        >
          <Box className='flex items-center justify-between'>
            <small>{syrup.stakingToken.symbol}</small>
            <small>
              {t('balance')}: {formatTokenAmount(maxAmountInput)}
            </small>
          </Box>
          <Box mt={2} className='flex items-center'>
            <NumericalInput
              placeholder='0'
              value={typedValue}
              fontSize={28}
              onUserInput={(value) => {
                setSignatureData(null);
                const totalBalance = getExactTokenAmount(maxAmountInput);
                const exactTypedValue = getValueTokenDecimals(
                  value,
                  syrup.stakedAmount?.token,
                );
                // this is to avoid input amount more than balance
                if (Number(exactTypedValue) <= totalBalance) {
                  setTypedValue(exactTypedValue);
                  setStakePercent(
                    totalBalance > 0
                      ? (Number(exactTypedValue) / totalBalance) * 100
                      : 0,
                  );
                }
              }}
            />
            <span
              className='text-primary text-bold cursor-pointer'
              onClick={() => {
                setTypedValue(maxAmountInput ? maxAmountInput.toExact() : '0');
                setStakePercent(100);
              }}
            >
              {t('max')}
            </span>
          </Box>
          <Box className='flex items-center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={stakePercent}
                handleChange={(_, value) => {
                  const percent = value as number;
                  setStakePercent(percent);
                  setTypedValue(getPartialTokenAmount(percent, maxAmountInput));
                }}
              />
            </Box>
            <small>{Math.min(stakePercent, 100).toLocaleString()}%</small>
          </Box>
        </Box>
        <Box mt={2} className='flex items-center justify-between'>
          <p>{t('dailyRewards')}</p>
          <p>
            {hypotheticalRewardRate
              ? formatNumber(
                  Number(hypotheticalRewardRate.toExact()) * getSecondsOneDay(),
                )
              : '-'}{' '}
            {syrup.token.symbol} / {t('day')}
          </p>
        </Box>
        <Box mt={3} className='flex justify-between items-center'>
          <Box width='48%'>
            <Button
              className='stakeButton'
              disabled={approving || approval !== ApprovalState.NOT_APPROVED}
              onClick={async () => {
                setApproving(true);
                try {
                  await onAttemptToApprove();
                  setApproving(false);
                } catch (e) {
                  setApproving(false);
                }
              }}
            >
              {approving ? `${t('approving')}...` : t('approve')}
            </Button>
          </Box>
          <Box width='48%'>
            <Button
              className='stakeButton'
              disabled={
                !!error || attempting || approval !== ApprovalState.APPROVED
              }
              onClick={onStake}
            >
              {attempting ? `${t('staking')}...` : t('stake')}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default StakeSyrupModal;
