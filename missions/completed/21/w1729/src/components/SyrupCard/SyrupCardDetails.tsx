import React, { useState } from 'react';
import { Box, Divider, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { TransactionResponse } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { SyrupInfo } from 'types';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { CurrencyLogo, StakeSyrupModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useStakingContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import {
  formatCompact,
  formatMulDivTokenAmount,
  formatTokenAmount,
  getEarnedUSDSyrup,
} from 'utils';
import SyrupTimerLabel from './SyrupTimerLabel';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import SyrupAPR from './SyrupAPR';
import { useUSDCPriceToken } from 'utils/useUSDCPrice';
import { GlobalConst } from 'constants/index';

const SyrupCardDetails: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const syrupCurrency = unwrappedToken(syrup.token);
  const { breakpoints } = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [attemptingClaim, setAttemptingClaim] = useState(false);
  const [attemptingUnstake, setAttemptingUnstake] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);

  const stakingTokenPrice = useUSDCPriceToken(syrup.stakingToken);
  const stakingContract = useStakingContract(syrup?.stakingRewardAddress);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const { account } = useActiveWeb3React();
  const currency = syrup ? unwrappedToken(syrup.token) : undefined;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup.stakedAmount?.token,
  );

  const exactEnd = syrup ? syrup.periodFinish : 0;

  const depositAmount =
    syrup && syrup.valueOfTotalStakedAmountInUSDC
      ? `$${Number(syrup.valueOfTotalStakedAmountInUSDC).toLocaleString()}`
      : `${formatTokenAmount(syrup?.totalStakedAmount)} ${
          syrup?.stakingToken.symbol
        }`;

  const onClaimReward = async () => {
    if (syrup && stakingContract && syrup.stakedAmount) {
      setAttemptingClaim(true);
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: t('claimrewards1', { symbol: syrup.token.symbol }),
          });
          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary: t('claimrewards1', { symbol: syrup.token.symbol }),
            });
            setAttemptingClaim(false);
          } catch (e) {
            setAttemptingClaim(false);
          }
        })
        .catch((error: any) => {
          setAttemptingClaim(false);
          console.log(error);
        });
    }
  };

  const onWithdraw = async () => {
    if (syrup && stakingContract && syrup.stakedAmount) {
      setAttemptingUnstake(true);
      await stakingContract
        .exit({ gasLimit: 300000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: t('withdrawliquidity'),
          });
          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary: t('withdrawliquidity'),
            });
            setAttemptingUnstake(false);
          } catch (e) {
            setAttemptingUnstake(false);
          }
        })
        .catch((error: any) => {
          setAttemptingUnstake(false);
          console.log(error);
        });
    }
  };

  const StakeButton = () => (
    <Box className='syrupButton' onClick={() => setOpenStakeModal(true)}>
      <small>{t('stake')}</small>
    </Box>
  );

  const UnstakeButton = () => (
    <Box
      className={`syrupButton${attemptingUnstake ? ' opacity-disabled' : ''}`}
      onClick={() => {
        if (!attemptingUnstake) {
          onWithdraw();
        }
      }}
    >
      <small>{attemptingUnstake ? `${t('unstaking')}...` : t('unstake')}</small>
    </Box>
  );

  const ClaimButton = () => (
    <Box
      className={`syrupButton${attemptingClaim ? ' opacity-disabled' : ''}`}
      onClick={() => {
        if (!attemptingClaim) {
          onClaimReward();
        }
      }}
    >
      <small>{attemptingClaim ? `${t('claiming')}...` : t('claim')}</small>
    </Box>
  );

  return (
    <>
      {openStakeModal && syrup && (
        <StakeSyrupModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
          syrup={syrup}
        />
      )}
      {syrup && (
        <>
          <Divider />
          <Box padding={isMobile ? 2 : 3}>
            {isMobile && (
              <Box mb={2}>
                <Box className='flex justify-between' mb={1.5}>
                  <small className='text-secondary'>
                    {syrup.stakingToken.symbol} {t('deposits')}:
                  </small>
                  <small>{depositAmount}</small>
                </Box>
                <Box className='flex justify-between' mb={1.5}>
                  <small className='text-secondary'>{t('dailyRewards')}:</small>
                  <small>
                    {syrup.rate >= 1000000
                      ? formatCompact(syrup.rate)
                      : syrup.rate.toLocaleString()}{' '}
                    {syrup.token.symbol}
                    <span className='text-secondary'> / {t('day')}</span>
                  </small>
                </Box>
                <Box mb={1.5}>
                  <SyrupTimerLabel exactEnd={exactEnd} isEnded={syrup?.ended} />
                </Box>
                <Box className='flex justify-between' mb={2}>
                  <Box className='flex items-center'>
                    <small className='text-secondary'>{t('apr')}:</small>
                    <Box ml={0.5} height={16}>
                      <img src={CircleInfoIcon} alt={'arrow up'} />
                    </Box>
                  </Box>
                  <Box textAlign='right'>
                    <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
                  </Box>
                </Box>
                <Divider />
              </Box>
            )}
            <Box className='flex items-center justify-between' mb={1.5}>
              <small className='text-secondary'>{t('inwallet')}</small>
              <small>
                {userLiquidityUnstaked
                  ? formatTokenAmount(userLiquidityUnstaked)
                  : 0}{' '}
                {syrup.stakingToken.symbol}
                <small className='text-secondary' style={{ marginLeft: 4 }}>
                  $
                  {userLiquidityUnstaked
                    ? (
                        stakingTokenPrice *
                        Number(userLiquidityUnstaked.toExact())
                      ).toLocaleString()
                    : 0}
                </small>
              </small>
            </Box>
            <Box className='flex items-center justify-between' mb={1.5}>
              <small className='text-secondary'>{t('staked')}</small>
              <small>
                {formatTokenAmount(syrup.stakedAmount)}{' '}
                {syrup.stakingToken.symbol}
                <small className='text-secondary' style={{ marginLeft: 4 }}>
                  {syrup.stakedAmount
                    ? `$${(
                        stakingTokenPrice * Number(syrup.stakedAmount.toExact())
                      ).toLocaleString()}`
                    : '-'}
                </small>
              </small>
            </Box>
            <Box className='flex items-center justify-between' mb={2}>
              <small className='text-secondary'>
                {t('earned')} {currency?.symbol}
              </small>
              <Box className='flex items-center'>
                <CurrencyLogo currency={currency} size='16px' />
                <small style={{ marginLeft: 4 }}>
                  {formatTokenAmount(syrup.earnedAmount)}
                  <small className='text-secondary' style={{ marginLeft: 4 }}>
                    {getEarnedUSDSyrup(syrup)}
                  </small>
                </small>
              </Box>
            </Box>
            <Box className='flex flex-wrap items-center justify-between'>
              {!isMobile && (
                <SyrupTimerLabel exactEnd={exactEnd} isEnded={syrup?.ended} />
              )}
              {isMobile ? (
                <>
                  {syrup.earnedAmount && syrup.earnedAmount.greaterThan('0') && (
                    <Box width={1} mb={1.5} className='flex justify-end'>
                      <ClaimButton />
                    </Box>
                  )}
                  <Box
                    width={1}
                    mb={1.5}
                    className={`flex ${
                      syrup.stakedAmount && syrup.stakedAmount.greaterThan('0')
                        ? 'justify-between'
                        : 'justify-end'
                    }`}
                  >
                    {!syrup.ended && <StakeButton />}
                    {syrup.stakedAmount &&
                      syrup.stakedAmount.greaterThan('0') && <UnstakeButton />}
                  </Box>
                </>
              ) : (
                <Box className='flex flex-wrap' my={1}>
                  {!syrup.ended && <StakeButton />}
                  {syrup.stakedAmount && syrup.stakedAmount.greaterThan('0') && (
                    <Box ml={1}>
                      <UnstakeButton />
                    </Box>
                  )}
                  {syrup.earnedAmount && syrup.earnedAmount.greaterThan('0') && (
                    <Box ml={1}>
                      <ClaimButton />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            {syrup.rewardRate?.greaterThan('0') && (
              <Box className='dailyRateWrapper'>
                <Box>
                  <Box display='flex' mr={1}>
                    <small className='text-secondary'>{t('yourRate')}:</small>
                  </Box>
                  <small>
                    {formatMulDivTokenAmount(
                      syrup.rewardRate,
                      GlobalConst.utils.ONEDAYSECONDS,
                    )}{' '}
                    {syrupCurrency.symbol} / {t('day')}
                  </small>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default React.memo(SyrupCardDetails);
