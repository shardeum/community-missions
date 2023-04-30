import gql from 'graphql-tag';
import { GlobalConst } from 'constants/index';

export const SUBGRAPH_HEALTH = gql`
  query health {
    indexingStatusForCurrentVersion(subgraphName: "sameepsi/quickswap06") {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`;

export const TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(
      where: { symbol_contains: $value }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
    asName: tokens(
      where: { name_contains: $value }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
    asAddress: tokens(
      where: { id: $id }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
  }
`;

export const PAIR_SEARCH = gql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pairs(where: { token0_in: $tokens }) {
      id
      trackedReserveETH
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
    as1: pairs(where: { token1_in: $tokens }) {
      id
      trackedReserveETH
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
    asAddress: pairs(where: { id: $id }) {
      id
      trackedReserveETH
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
  }
`;

export const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!, $startTime: Int!) {
    tokenDayDatas(
      first: 1000
      orderBy: date
      orderDirection: desc
      where: { token: $tokenAddr, date_gt: $startTime }
    ) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

export const PAIR_CHART = gql`
  query pairDayDatas($pairAddress: Bytes!, $skip: Int!, $startTime: Int!) {
    pairDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { pairAddress: $pairAddress, date_gt: $startTime }
    ) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`;

export const HOURLY_PAIR_RATES = (pairAddress: string, blocks: any[]) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pair(id:"${pairAddress}", block: { number: ${block.number} }) { 
        token0Price
        token1Price
      }
    `,
  );

  queryString += '}';
  return gql(queryString);
};

const PairFields = `
  fragment PairFields on Pair {
    id
    trackedReserveETH
    reserve0
    reserve1
    volumeUSD
    reserveUSD
    totalSupply
    token0 {
      symbol
      id
      decimals
      derivedETH
    }
    token1 {
      symbol
      id
      decimals
      derivedETH
    }
  }
`;

export const PAIRS_CURRENT: any = (count: number) => {
  const queryString = `
  query pairs {
    pairs(first: ${count}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
    }
  }`;
  return gql(queryString);
};

export const PAIRS_BULK: any = (pairs: any[]) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair.toLowerCase()}"`);
  });
  pairsString += ']';
  const queryString = `
  ${PairFields}
  query pairs {
    pairs(first: ${pairs.length}, where: { id_in: ${pairsString} }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
  `;
  return gql(queryString);
};

export const ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(first: 10, skip: $skip) {
      id
      name
      symbol
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
  }
`;

export const ALL_PAIRS = gql`
  query pairs($skip: Int!) {
    pairs(
      first: 10
      skip: $skip
      orderBy: trackedReserveETH
      orderDirection: desc
    ) {
      id
      trackedReserveETH
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
    }
  }
`;

export const PAIRS_BULK1 = gql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(
      first: 500
      where: { id_in: $allPairs }
      orderBy: trackedReserveETH
      orderDirection: desc
    ) {
      ...PairFields
    }
  }
`;

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    decimals
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
  }
`;

export const TOKENS_CURRENT: any = (count: number) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(first: ${count}, orderBy: tradeVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_INFO: any = (address: string) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(first: 1, where: {id: "${address}"}) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_INFO_OLD: any = (block: number, address: string) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: 1, where: {id: "${address}"}) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

export const TOKENS_DYNAMIC: any = (block: number, count: number) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: ${count}, orderBy: tradeVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_DATA: any = (tokenAddress: string, block: number) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${
        block ? `block : {number: ${block}}` : ``
      } where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pairs(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `;
  return gql(queryString);
};

export const PAIR_ID: any = (tokenAddress0: string, tokenAddress1: string) => {
  const queryString = `
    query tokens {
      pairs0: pairs(where: {token0: "${tokenAddress0}", token1: "${tokenAddress1}"}){
        id
      }
      pairs1: pairs(where: {token0: "${tokenAddress1}", token1: "${tokenAddress0}"}){
        id
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_DATA1: any = (
  tokenAddress: string,
  tokenAddress1: string,
) => {
  const queryString = `
    query tokens {
      pairs0: pairs(where: {token0: "${tokenAddress}", token1: "${tokenAddress1}"}){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pairs1: pairs(where: {token0: "${tokenAddress}", token1_not: "${tokenAddress1}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pairs2: pairs(where: {token1: "${tokenAddress}", token0_not: "${tokenAddress1}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pairs3: pairs(where: {token0: "${tokenAddress1}", token1_not: "${tokenAddress}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pairs4: pairs(where: {token1: "${tokenAddress1}", token0_not: "${tokenAddress}"}, first: 2, orderBy: reserveUSD, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_DATA2: any = (tokenAddress: string) => {
  const queryString = `
    query tokens {
      pairs0: pairs(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `;
  return gql(queryString);
};

export const PAIR_DATA: any = (pairAddress: string, block?: number) => {
  const queryString = `
    ${PairFields}
    query pairs {
      pairs(${
        block ? `block: {number: ${block}}` : ``
      } where: { id: "${pairAddress}"} ) {
        ...PairFields
      }
    }`;
  return gql(queryString);
};

export const ETH_PRICE: any = (block?: number) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${GlobalConst.utils.BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${GlobalConst.utils.BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `;
  return gql(queryString);
};

export const PAIRS_HISTORICAL_BULK: any = (block: number, pairs: any[]) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair.toLowerCase()}"`);
  });
  pairsString += ']';
  const queryString = `
  query pairs {
    pairs(first: ${pairs.length}, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
      totalSupply
    }
  }
  `;
  return gql(queryString);
};

export const PRICES_BY_BLOCK: any = (tokenAddress: string, blocks: any[]) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        derivedETH
      }
    `,
  );
  queryString += ',';
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        ethPrice
      }
    `,
  );

  queryString += '}';
  return gql(queryString);
};

export const GLOBAL_DATA: any = (block?: number) => {
  const queryString = ` query uniswapFactories {
      uniswapFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       where: { id: "${GlobalConst.addresses.FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        untrackedVolumeUSD
        totalLiquidityUSD
        totalLiquidityETH
        txCount
        pairCount
      }
    }`;
  return gql(queryString);
};

export const GLOBAL_ALLDATA: any = (reqData: any) => {
  const queryString = reqData.map((each: any, index: any) => {
    return `${each.index}: uniswapFactories(
    ${each.block ? `block: { number: ${each.block} }` : ``}   
    where: { id: "${GlobalConst.addresses.FACTORY_ADDRESS}" }) {
      id
      totalVolumeUSD
      totalVolumeETH
      untrackedVolumeUSD
      totalLiquidityUSD
      totalLiquidityETH
      txCount
      pairCount
    }`;
  });
  return gql(`query uniswapFactories {${queryString.join(' ')}}`);
};

export const GLOBAL_CHART = gql`
  query uniswapDayDatas($startTime: Int!, $skip: Int!) {
    uniswapDayDatas(
      first: 500
      skip: $skip
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`;

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

export const GET_BLOCKS: any = (timestamps: number[]) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp +
      600} }) {
      number
    }`;
  });
  queryString += '}';
  return gql(queryString);
};

export const FILTERED_TRANSACTIONS = gql`
  query($allPairs: [Bytes]!) {
    mints(
      first: 20
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(
      first: 20
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(
      first: 30
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      id
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`;

export const SWAP_TRANSACTIONS = gql`
  query($allPairs: [Bytes]!, $lastTime: Int!) {
    swaps(
      first: 1000
      where: { pair_in: $allPairs, timestamp_gte: $lastTime }
      orderBy: timestamp
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`;
