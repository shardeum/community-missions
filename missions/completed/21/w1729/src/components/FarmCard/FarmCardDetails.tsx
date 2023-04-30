import React, { useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { StakingInfo, DualStakingInfo } from 'types';
import { TokenAmount, Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { usePairContract, useStakingContract } from 'hooks/useContract';
import { useDerivedStakeInfo } from 'state/stake/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { CurrencyLogo, NumericalInput } from 'components';
import { Link } from 'react-router-dom';
import { GlobalConst } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import {
  getAPYWithFee,
  getRewardRate,
  getTokenAddress,
  getTVLStaking,
  getStakedAmountStakingInfo,
  getUSDString,
  getEarnedUSDLPFarm,
  formatMulDivTokenAmount,
  formatTokenAmount,
  formatAPY,
  getEarnedUSDDualFarm,
  getExactTokenAmount,
  formatNumber,
} from 'utils';
import CircleInfoIcon from 'assets/images/circleinfo.svg';

const FarmCardDetails: React.FC<{
  stakingInfo: StakingInfo | DualStakingInfo;
  stakingAPY: number;
  isLPFarm?: boolean;
}> = ({ stakingInfo, stakingAPY, isLPFarm }) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [stakeAmount, setStakeAmount] = useState('');
  const [attemptStaking, setAttemptStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptClaiming, setAttemptClaiming] = useState(false);
  const [approving, setApproving] = useState(false);
  const [unstakeAmount, setUnStakeAmount] = useState('');

  const lpStakingInfo = stakingInfo as StakingInfo;
  const dualStakingInfo = stakingInfo as DualStakingInfo;

  const token0 = stakingInfo ? stakingInfo.tokens[0] : undefined;
  const token1 = stakingInfo ? stakingInfo.tokens[1] : undefined;

  const { account, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    stakingInfo.stakedAmount?.token,
  );

  const stakedAmounts = getStakedAmountStakingInfo(
    stakingInfo,
    userLiquidityUnstaked,
  );

  let apyWithFee: number | string = 0;

  if (
    stakingInfo &&
    stakingInfo.perMonthReturnInRewards &&
    stakingAPY &&
    stakingAPY > 0
  ) {
    apyWithFee = formatAPY(
      getAPYWithFee(stakingInfo.perMonthReturnInRewards, stakingAPY),
    );
  }

  const stakingContract = useStakingContract(stakingInfo?.stakingRewardAddress);

  const { parsedAmount: unstakeParsedAmount } = useDerivedStakeInfo(
    unstakeAmount,
    stakingInfo.stakedAmount?.token,
    stakingInfo.stakedAmount,
  );

  const onWithdraw = async () => {
    if (stakingInfo && stakingContract && unstakeParsedAmount) {
      setAttemptUnstaking(true);
      await stakingContract
        .withdraw(`0x${unstakeParsedAmount.raw.toString(16)}`, {
          gasLimit: 300000,
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: t('withdrawliquidity'),
          });
          try {
            await response.wait();
            setAttemptUnstaking(false);
          } catch (error) {
            setAttemptUnstaking(false);
          }
        })
        .catch((error: any) => {
          setAttemptUnstaking(false);
          console.log(error);
        });
    }
  };

  const onClaimReward = async () => {
    if (stakingContract && stakingInfo && stakingInfo.stakedAmount) {
      setAttemptClaiming(true);
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: t('claimrewards'),
          });
          try {
            await response.wait();
            setAttemptClaiming(false);
          } catch (error) {
            setAttemptClaiming(false);
          }
        })
        .catch((error: any) => {
          setAttemptClaiming(false);
          console.log(error);
        });
    }
  };

  const { parsedAmount } = useDerivedStakeInfo(
    stakeAmount,
    stakingInfo.stakedAmount?.token,
    userLiquidityUnstaked,
  );
  const deadline = useTransactionDeadline();
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    stakingInfo?.stakingRewardAddress,
  );

  const dummyPair = stakingInfo
    ? new Pair(
        new TokenAmount(stakingInfo.tokens[0], '0'),
        new TokenAmount(stakingInfo.tokens[1], '0'),
      )
    : null;
  const pairContract = usePairContract(
    stakingInfo && stakingInfo.lp && stakingInfo.lp !== ''
      ? stakingInfo.lp
      : dummyPair?.liquidityToken.address,
  );

  const onStake = async () => {
    if (stakingContract && parsedAmount && deadline) {
      setAttemptStaking(true);
      stakingContract
        .stake(`0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: 350000,
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: t('depositliquidity'),
          });
          try {
            await response.wait();
            setAttemptStaking(false);
          } catch (error) {
            setAttemptStaking(false);
          }
        })
        .catch((error: any) => {
          setAttemptStaking(false);
          console.log(error);
        });
    } else {
      throw new Error(t('stakewithoutapproval'));
    }
  };

  const onAttemptToApprove = async () => {
    if (!pairContract || !library || !deadline)
      throw new Error(t('missingdependencies'));
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('missingliquidity'));
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const earnedUSDStr = isLPFarm
    ? getEarnedUSDLPFarm(lpStakingInfo)
    : getEarnedUSDDualFarm(dualStakingInfo);

  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const lpRewards = lpStakingInfo.rate * lpStakingInfo.rewardTokenPrice;

  const lpPoolRate = getRewardRate(
    lpStakingInfo.totalRewardRate,
    lpStakingInfo.rewardToken,
  );

  const dualRewards =
    dualStakingInfo.rateA * dualStakingInfo.rewardTokenAPrice +
    dualStakingInfo.rateB * Number(dualStakingInfo.rewardTokenBPrice);

  const dualPoolRateA = getRewardRate(
    dualStakingInfo.totalRewardRateA,
    dualStakingInfo.rewardTokenA,
  );
  const dualPoolRateB = getRewardRate(
    dualStakingInfo.totalRewardRateB,
    dualStakingInfo.rewardTokenB,
  );

  const mainRewardRate = isLPFarm
    ? lpStakingInfo.rewardRate
    : dualStakingInfo.rewardRateA;

  const stakeEnabled =
    !approving &&
    !attemptStaking &&
    Number(stakeAmount) > 0 &&
    Number(stakeAmount) <= getExactTokenAmount(userLiquidityUnstaked);

  const unstakeEnabled =
    !attemptUnstaking &&
    Number(unstakeAmount) > 0 &&
    Number(unstakeAmount) <= getExactTokenAmount(stakingInfo.stakedAmount);

  const claimEnabled =
    !attemptClaiming &&
    (isLPFarm
      ? lpStakingInfo.earnedAmount &&
        lpStakingInfo.earnedAmount.greaterThan('0')
      : dualStakingInfo.earnedAmountA &&
        dualStakingInfo.earnedAmountA.greaterThan('0'));

  return (
    <>
      <Box
        className={`farmCardDetails ${
          stakingInfo?.ended ? 'justify-end' : 'justify-between'
        }`}
      >
        {stakingInfo && (
          <>
            {isMobile && (
              <>
                <Box className='farmCardMobileRow'>
                  <small className='text-secondary'>{t('tvl')}</small>
                  <small>{tvl}</small>
                </Box>
                <Box className='farmCardMobileRow'>
                  <small className='text-secondary'>{t('rewards')}</small>
                  <Box textAlign='right'>
                    <small>
                      ${(isLPFarm ? lpRewards : dualRewards).toLocaleString()} /
                      {t('day')}
                    </small>
                    <br />
                    {isLPFarm ? (
                      <small>{lpPoolRate}</small>
                    ) : (
                      <>
                        <small>{dualPoolRateA}</small>
                        <br />
                        <small>{dualPoolRateB}</small>
                      </>
                    )}
                  </Box>
                </Box>
                <Box className='farmCardMobileRow'>
                  <Box className='flex items-center'>
                    <small className='text-secondary'>{t('apy')}</small>
                    <Box ml={0.5} height={16}>
                      <img src={CircleInfoIcon} alt={'arrow up'} />
                    </Box>
                  </Box>
                  <small className='text-success'>{apyWithFee}%</small>
                </Box>
              </>
            )}
            {!stakingInfo.ended && (
              <Box className='buttonWrapper'>
                <Box className='flex justify-between'>
                  <small>{t('inwallet')}:</small>
                  <Box className='flex flex-col items-end'>
                    <small>
                      {formatTokenAmount(userLiquidityUnstaked)} {t('lp')} (
                      {getUSDString(stakedAmounts?.unStakedUSD)})
                    </small>
                    <Link
                      to={`/pools?currency0=${getTokenAddress(
                        token0,
                      )}&currency1=${getTokenAddress(token1)}`}
                      className='text-primary'
                    >
                      {t('get')} {currency0?.symbol} / {currency1?.symbol}{' '}
                      {t('lp')}
                    </Link>
                  </Box>
                </Box>
                <Box className='inputVal' mb={2} mt={2} p={2}>
                  <NumericalInput
                    placeholder='0.00'
                    value={stakeAmount}
                    fontSize={16}
                    onUserInput={(value) => {
                      setStakeAmount(value);
                    }}
                  />
                  <small
                    className={
                      userLiquidityUnstaked &&
                      userLiquidityUnstaked.greaterThan('0')
                        ? 'text-primary'
                        : 'text-hint'
                    }
                    onClick={() => {
                      if (
                        userLiquidityUnstaked &&
                        userLiquidityUnstaked.greaterThan('0')
                      ) {
                        setStakeAmount(userLiquidityUnstaked.toExact());
                      } else {
                        setStakeAmount('');
                      }
                    }}
                  >
                    {t('max')}
                  </small>
                </Box>
                <Box
                  className={stakeEnabled ? 'buttonClaim' : 'buttonToken'}
                  mt={2}
                  p={2}
                  onClick={async () => {
                    if (stakeEnabled) {
                      if (approval === ApprovalState.APPROVED) {
                        onStake();
                      } else {
                        onAttemptToApprove();
                      }
                    }
                  }}
                >
                  <p>
                    {attemptStaking
                      ? t('stakingLPTokens')
                      : approval === ApprovalState.APPROVED
                      ? t('stakeLPTokens')
                      : approving
                      ? t('approving')
                      : t('approve')}
                  </p>
                </Box>
              </Box>
            )}
            <Box className='buttonWrapper' mx={isMobile ? 0 : 2} my={2}>
              <Box className='flex justify-between'>
                <small>{t('mydeposits')}:</small>
                <small>
                  {formatTokenAmount(stakingInfo.stakedAmount)} {t('lp')} (
                  {getUSDString(stakedAmounts?.myStakedUSD)})
                </small>
              </Box>
              <Box className='inputVal' mb={2} mt={4.5} p={2}>
                <NumericalInput
                  placeholder='0.00'
                  value={unstakeAmount}
                  fontSize={16}
                  onUserInput={(value) => {
                    setUnStakeAmount(value);
                  }}
                />
                <small
                  className={
                    stakingInfo.stakedAmount &&
                    stakingInfo.stakedAmount.greaterThan('0')
                      ? 'text-primary'
                      : 'text-hint'
                  }
                  onClick={() => {
                    if (
                      stakingInfo.stakedAmount &&
                      stakingInfo.stakedAmount.greaterThan('0')
                    ) {
                      setUnStakeAmount(stakingInfo.stakedAmount.toExact());
                    } else {
                      setUnStakeAmount('');
                    }
                  }}
                >
                  {t('max')}
                </small>
              </Box>
              <Box
                className={unstakeEnabled ? 'buttonClaim' : 'buttonToken'}
                mt={2}
                p={2}
                onClick={() => {
                  if (unstakeEnabled) {
                    onWithdraw();
                  }
                }}
              >
                <p>
                  {attemptUnstaking
                    ? t('unstakingLPTokens')
                    : t('unstakeLPTokens')}
                </p>
              </Box>
            </Box>
            <Box className='buttonWrapper'>
              <Box className='flex flex-col items-center justify-between'>
                <Box mb={1}>
                  <small>{t('unclaimedRewards')}:</small>
                </Box>
                {isLPFarm ? (
                  <>
                    <Box mb={1}>
                      <CurrencyLogo currency={lpStakingInfo.rewardToken} />
                    </Box>
                    <Box mb={1} textAlign='center'>
                      <p className='text-secondary'>
                        {formatTokenAmount(lpStakingInfo.earnedAmount)}
                        &nbsp;{lpStakingInfo.rewardToken.symbol}
                      </p>
                      <small>{earnedUSDStr}</small>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box mb={1} display='flex'>
                      <CurrencyLogo
                        currency={unwrappedToken(dualStakingInfo.rewardTokenA)}
                      />
                      <CurrencyLogo
                        currency={unwrappedToken(dualStakingInfo.rewardTokenB)}
                      />
                    </Box>
                    <Box mb={1} textAlign='center'>
                      <p>{earnedUSDStr}</p>
                      <p className='text-secondary'>
                        {formatTokenAmount(dualStakingInfo.earnedAmountA)}
                        <span>&nbsp;{dualStakingInfo.rewardTokenA.symbol}</span>
                      </p>
                      <p className='text-secondary'>
                        {formatTokenAmount(dualStakingInfo.earnedAmountB)}
                        <span>&nbsp;{dualStakingInfo.rewardTokenB.symbol}</span>
                      </p>
                    </Box>
                  </>
                )}
              </Box>
              <Box
                className={claimEnabled ? 'buttonClaim' : 'buttonToken'}
                p={2}
                onClick={() => {
                  if (claimEnabled) {
                    onClaimReward();
                  }
                }}
              >
                <p>{attemptClaiming ? t('claiming') : t('claim')}</p>
              </Box>
            </Box>
          </>
        )}
      </Box>
      {mainRewardRate?.greaterThan('0') && (
        <Box className='dailyRateWrapper'>
          <Box>
            <Box>
              <small className='text-secondary'>
                {t('yourRate', {
                  symbol: isLPFarm ? '' : dualStakingInfo.rewardTokenA.symbol,
                })}
                :
              </small>
            </Box>
            <small>
              {formatMulDivTokenAmount(
                mainRewardRate,
                GlobalConst.utils.ONEDAYSECONDS,
              )}{' '}
              {isLPFarm
                ? lpStakingInfo.rewardToken.symbol
                : dualStakingInfo.rewardTokenA.symbol}{' '}
              / {t('day')}
            </small>
          </Box>
          {!isLPFarm && (
            <Box>
              <Box>
                <small className='text-secondary'>
                  {t('yourRate', {
                    symbol: dualStakingInfo.rewardTokenB.symbol,
                  })}
                  :
                </small>
              </Box>
              <small>
                {formatMulDivTokenAmount(
                  dualStakingInfo.rewardRateB,
                  GlobalConst.utils.ONEDAYSECONDS,
                )}{' '}
                {dualStakingInfo.rewardTokenB.symbol} / {t('day')}
              </small>
            </Box>
          )}
          <Box>
            <Box>
              <small className='text-secondary'>{t('yourFees')}:</small>
            </Box>
            <small>
              ${formatNumber(stakingInfo.accountFee)} / {t('day')}
            </small>
          </Box>
        </Box>
      )}
    </>
  );
};

export default FarmCardDetails;
