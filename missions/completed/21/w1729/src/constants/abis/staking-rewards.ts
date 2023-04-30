import { Interface } from '@ethersproject/abi';
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json';
import { abi as STAKING_REWARDS_FACTORY_ABI } from '@uniswap/liquidity-staker/build/StakingRewardsFactory.json';
import { abi as STAKING_DUAL_REWARDS_ABI } from './dual-rewards.-staking.json';

const STAKING_REWARDS_INTERFACE = new Interface(STAKING_REWARDS_ABI);

const STAKING_REWARDS_FACTORY_INTERFACE = new Interface(
  STAKING_REWARDS_FACTORY_ABI,
);

const STAKING_DUAL_REWARDS_INTERFACE = new Interface(STAKING_DUAL_REWARDS_ABI);

export {
  STAKING_REWARDS_FACTORY_INTERFACE,
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
};
