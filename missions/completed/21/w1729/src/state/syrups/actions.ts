import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { SyrupListInfo } from 'types';

export const fetchSyrupList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    syrupList: SyrupListInfo;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction('lists/fetchSyrupList/pending'),
  fulfilled: createAction('lists/fetchSyrupList/fulfilled'),
  rejected: createAction('lists/fetchSyrupList/rejected'),
};

export const acceptSyrupUpdate = createAction<string>(
  'lists/acceptSyrupListUpdate',
);
