import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_API_URL,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const txClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_TX_GRAPH_API_URL,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_API_URL,
  }),
  cache: new InMemoryCache(),
});
