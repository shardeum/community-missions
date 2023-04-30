import { ChainId, Token } from '@uniswap/sdk';
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists';
import { GlobalConst } from 'constants/index';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
const { DEFAULT_TOKEN_LIST_URL } = GlobalConst.utils;

const data: any = {
  name: 'Quickswap Token List',
  timestamp: '2022-08-31T08:10:00.831Z',
  version: {
    major: 1,
    minor: 2,
    patch: 46,
  },
  tags: {},
  logoURI: 'ipfs://QmQ9GCVmLQkbPohxKeCYkbpmwfTvHXrY64TmBsPQAZdbqZ',
  keywords: ['uniswap', 'default'],
  tokens: [
    //  {
    //    "name": "Luttappi",
    //    "address": "0x3333fACbD5430955fD3991d8eED0F12875553b98",
    //    "symbol": "Lp",
    //    "decimals": 18,
    //    "chainId": 80001,
    //    "logoURI": "https://i.postimg.cc/TP8VR904/3004.jpg"
    //  },
    //  {
    //    "name": "Mayavi",
    //    "address": "0xb59610E622A9bB846c78DB89C14542D79680c43F",
    //    "symbol": "Mi",
    //    "decimals": 18,
    //    "chainId": 80001,
    //    "logoURI": "https://i.postimg.cc/HLjqgTS2/thumbnail-250x250.png"
    //  },
    //  {
    //   "name": "Bujji the Explorer",
    //   "address": "0x33Fc2B7b9b72365cAcAF2B4DA27820f263B7d93c",
    //   "symbol": "Bujji",
    //   "decimals": 18,
    //   "chainId": 80001,
    //   "logoURI": "https://i.postimg.cc/y8xLF2Lm/unnamed-1.jpg"
    // },
    // {
    //   "name": "Dora the Explorer",
    //   "address": "0x2E831B4720e739EED513b30fa45C2A37f50ADcc7",
    //   "symbol": "Dora",
    //   "decimals": 18,
    //   "chainId": 80001,
    //   "logoURI": "https://i.postimg.cc/Fs3Lwp1M/Dora-vector-logo.png"
    // },
    // {
    //   name: 'BUSD',
    //   address: '0xcE50cec8e9BfF9244E4EE70E2a279e7e204CD015',
    //   symbol: 'BUSD',
    //   decimals: 18,
    //   chainId: 11155111,
    //   logoURI: 'https://i.postimg.cc/3whqzcRb/62da512ff192d82df80012bb.png',
    // },
    {
      name: 'USDC',
      address: '0xd3c35d5a27af0c153d8a5e6d349ed7df514d3549',
      symbol: 'USDC',
      decimals: 18,
      chainId: 8081,
      logoURI: 'https://i.postimg.cc/7h191x1H/3408.png',
    },
  ],
};

type TagDetails = Tags[keyof Tags];
export interface TagInfo extends TagDetails {
  id: string;
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo;
  public readonly tags: TagInfo[];
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(
      tokenInfo.chainId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name,
    );
    this.tokenInfo = tokenInfo;
    this.tags = tags;
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }
}

export type TokenAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [tokenAddress: string]: WrappedTokenInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<TokenList, TokenAddressMap>()
    : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map((tagId) => {
            if (!list.tags?.[tagId]) return undefined;
            return { ...list.tags[tagId], id: tagId };
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? [];
      const token = new WrappedTokenInfo(tokenInfo, tags);
      if (tokenMap[token.chainId][token.address] !== undefined)
        throw Error('Duplicate tokens.');
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token,
        },
      };
    },
    { ...EMPTY_LIST },
  );
  listCache?.set(list, map);
  return map;
}

export function useTokenList(url: string | undefined): TokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  return useMemo(() => {
    if (!url) return EMPTY_LIST;
    const current1 = lists[url]?.current;
    console.log('current', url);
    // console.log("current2",data);
    const current = data;
    if (!current) return EMPTY_LIST;
    try {
      return listToTokenMap(current);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [lists, url]);
}

export function useSelectedListUrl(): string | undefined {
  return useSelector<AppState, AppState['lists']['selectedListUrl']>(
    (state) => state.lists.selectedListUrl,
  );
}

export function useSelectedTokenList(): TokenAddressMap {
  // return useTokenList(useSelectedListUrl());
  //TODO: Add support for selected list when @latest doesn't store the redirected url
  return useTokenList(DEFAULT_TOKEN_LIST_URL);
}

export function useSelectedListInfo(): {
  current: TokenList | null;
  pending: TokenList | null;
  loading: boolean;
} {
  const selectedUrl = useSelectedListUrl();
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  const list = selectedUrl ? listsByUrl[selectedUrl] : undefined;

  return {
    current: list?.current ?? null,
    pending: list?.pendingUpdate ?? null,
    loading: list?.loadingRequestId !== null,
  };
}

// returns all downloaded current lists
export function useAllLists(): TokenList[] {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(lists)
        .map((url) => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists],
  );
}
