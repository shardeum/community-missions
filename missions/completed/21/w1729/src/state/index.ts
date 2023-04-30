import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import {
  gelatoReducers,
  GELATO_PERSISTED_KEYS,
} from '@gelatonetwork/limit-orders-react';

import application from 'state/application/reducer';
import { updateVersion } from './global/actions';
import user from './user/reducer';
import transactions from './transactions/reducer';
import swap from './swap/reducer';
import mint from './mint/reducer';
import lists from './lists/reducer';
import farms from './farms/reducer';
import dualFarms from './dualfarms/reducer';
import syrups from './syrups/reducer';
import burn from './burn/reducer';
import multicall from './multicall/reducer';

const PERSISTED_KEYS: string[] = [
  'user',
  'transactions',
  'lists',
  'farms',
  'dualFarms',
  'syrups',
  ...GELATO_PERSISTED_KEYS,
];

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    mint,
    burn,
    multicall,
    lists,
    farms,
    dualFarms,
    syrups,
    ...gelatoReducers,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false, thunk: false }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
});

store.dispatch(updateVersion());

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
