import { TokenAmount, Token, Price, Pair } from '@uniswap/sdk';
import { Version } from '@uniswap/token-lists';

export interface FarmListInfo {
  readonly name: string;
  readonly timestamp: string;
  readonly active: StakingRaw[];
  readonly closed: StakingRaw[];
  readonly version: Version;
  readonly logoURI?: string;
}

export interface SyrupListInfo {
  readonly name: string;
  readonly timestamp: string;
  readonly active: SyrupRaw[];
  readonly closed: SyrupRaw[];
  readonly version: Version;
  readonly logoURI?: string;
}

export interface DualFarmListInfo {
  readonly name: string;
  readonly timestamp: string;
  readonly active: DualStakingRaw[];
  readonly closed: DualStakingRaw[];
  readonly version: Version;
  readonly logoURI?: string;
}

export interface LairInfo {
  lairAddress: string;

  dQUICKtoQUICK: TokenAmount;

  QUICKtodQUICK: TokenAmount;

  dQUICKBalance: TokenAmount;

  QUICKBalance: TokenAmount;

  totalQuickBalance: TokenAmount;

  dQuickTotalSupply: TokenAmount;

  oneDayVol: number;
}

export interface CommonStakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the amount of token currently staked, or undefined if no account
  stakedAmount?: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount?: TokenAmount;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  pair: string;

  oneYearFeeAPY?: number;

  oneDayFee?: number;

  accountFee?: number;
  tvl?: string;
  perMonthReturnInRewards?: number;

  totalSupply?: TokenAmount;
  usdPrice?: Price;
  stakingTokenPair?: Pair | null;
}

export interface StakingRaw {
  tokens: string[];
  stakingRewardAddress: string;
  ended: boolean;
  name: string;
  lp: string;
  baseToken: string;
  rate: number;
  pair: string;
  rewardToken: string;
}

export interface StakingBasic {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  ended: boolean;
  name: string;
  lp: string;
  baseToken: Token;
  rate: number;
  pair: string;
  rewardToken: Token;
}

export interface SyrupRaw {
  token: string;
  stakingRewardAddress: string;
  ended: boolean;
  name: string;
  lp: string;
  baseToken: string;
  rate: number;
  ending: number; //DATE IN UNIX TIMESTAMP
  stakingToken: string;
}

export interface SyrupBasic {
  token: Token;
  stakingRewardAddress: string;
  ended: boolean;
  name: string;
  lp: string;
  baseToken: Token;
  rate: number;
  ending: number; //DATE IN UNIX TIMESTAMP
  stakingToken: Token;
}

export interface StakingInfo extends CommonStakingInfo {
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount?: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate?: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate?: TokenAmount;
  rewardToken: Token;
  rewardTokenPrice: number;

  rate: number;

  valueOfTotalStakedAmountInBaseToken?: TokenAmount;
}

export interface DualStakingRaw {
  tokens: string[];
  stakingRewardAddress: string;
  ended: boolean;
  name: string;
  lp: string;
  baseToken: string;
  rewardTokenA: string;
  rewardTokenB: string;
  rewardTokenBBase: string;
  rateA: number;
  rateB: number;
  pair: string;
}

export interface DualStakingBasic {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  ended: boolean;
  name: string;
  lp: string;
  baseToken: Token;
  rewardTokenA: Token;
  rewardTokenB: Token;
  rewardTokenBBase: Token;
  rateA: number;
  rateB: number;
  pair: string;
}

export interface DualStakingInfo extends CommonStakingInfo {
  rewardTokenA: Token;
  rewardTokenB: Token;
  rewardTokenBBase: Token;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountA?: TokenAmount;
  earnedAmountB?: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRateA: TokenAmount;
  totalRewardRateB: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRateA?: TokenAmount;
  rewardRateB?: TokenAmount;

  rateA: number;
  rateB: number;
  rewardTokenAPrice: number;
  rewardTokenBPrice: number;
}

export interface SyrupInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the token involved in this staking
  token: Token;
  // the amount of token currently staked, or undefined if no account
  stakedAmount?: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount?: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount?: TokenAmount;
  // the amount of token distributed per second to all stakers, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate?: TokenAmount;
  // when the period ends
  periodFinish: number;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  rate: number;

  valueOfTotalStakedAmountInUSDC?: number;

  rewards?: number;
  rewardTokenPriceinUSD?: number;

  stakingToken: Token;

  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount?: TokenAmount,
    totalStakedAmount?: TokenAmount,
  ) => TokenAmount | undefined;
}
