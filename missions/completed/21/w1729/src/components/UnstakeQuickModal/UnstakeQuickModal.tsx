import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { CustomModal, ColoredSlider, NumericalInput } from 'components';
import { useOldLairInfo, useNewLairInfo } from 'state/stake/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { TransactionResponse } from '@ethersproject/providers';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useLairContract, useNewLairContract } from 'hooks/useContract';
import Web3 from 'web3';
import { formatTokenAmount } from 'utils';
import { useTranslation } from 'react-i18next';

const web3 = new Web3();

interface UnstakeQuickModalProps {
  open: boolean;
  onClose: () => void;
  isNew: boolean;
}

const UnstakeQuickModal: React.FC<UnstakeQuickModalProps> = ({
  open,
  onClose,
  isNew,
}) => {
  const { t } = useTranslation();
  const [attempting, setAttempting] = useState(false);
  const addTransaction = useTransactionAdder();
  const lairInfo = useOldLairInfo();
  const newLairInfo = useNewLairInfo();
  const laifInfoToUse = isNew ? newLairInfo : lairInfo;
  const dQuickBalance = laifInfoToUse.dQUICKBalance;
  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);

  const lairContract = useLairContract();
  const newLairContract = useNewLairContract();
  const lairContractToUse = isNew ? newLairContract : lairContract;
  const error =
    Number(typedValue) > Number(dQuickBalance.toExact()) || !typedValue;

  const onWithdraw = () => {
    if (lairContractToUse && laifInfoToUse?.dQUICKBalance) {
      setAttempting(true);
      const balance = web3.utils.toWei(typedValue, 'ether');
      lairContractToUse
        .leave(balance.toString(), { gasLimit: 300000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `${t('unstake')} dQUICK`,
          });
          await response.wait();
          setAttempting(false);
        })
        .catch((error: any) => {
          setAttempting(false);
          console.log(error);
        });
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box className='flex items-center justify-between'>
          <h5>{t('unstake')} dQUICK</h5>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          mt={3}
          className='bg-default border-gray14'
          borderRadius='10px'
          padding='16px'
        >
          <Box className='flex items-center justify-between'>
            <small>dQUICK</small>
            <small>
              {t('balance')}: {formatTokenAmount(dQuickBalance)}
            </small>
          </Box>
          <Box mt={2} className='flex items-center'>
            <NumericalInput
              placeholder='0'
              value={typedValue}
              fontSize={28}
              onUserInput={(value) => {
                const totalBalance = dQuickBalance
                  ? Number(dQuickBalance.toExact())
                  : 0;
                setTypedValue(value);
                setStakePercent(
                  totalBalance > 0 ? (Number(value) / totalBalance) * 100 : 0,
                );
              }}
            />
            <span
              className='text-primary text-bold cursor-pointer'
              onClick={() => {
                setTypedValue(dQuickBalance ? dQuickBalance.toExact() : '0');
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
                handleChange={(evt, value) => {
                  setStakePercent(value as number);
                  setTypedValue(
                    dQuickBalance
                      ? stakePercent < 100
                        ? (
                            (Number(dQuickBalance.toExact()) * stakePercent) /
                            100
                          ).toString()
                        : dQuickBalance.toExact()
                      : '0',
                  );
                }}
              />
            </Box>
            <small>{Math.min(stakePercent, 100).toLocaleString()}%</small>
          </Box>
        </Box>
        <Box mt={3}>
          <Button
            className='stakeButton'
            disabled={!!error || attempting}
            onClick={onWithdraw}
          >
            {attempting ? `${t('unstaking')}...` : t('unstake')}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default UnstakeQuickModal;
