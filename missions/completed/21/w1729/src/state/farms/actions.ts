import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { FarmListInfo } from 'types';

export const fetchFarmList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    farmList: FarmListInfo;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction('lists/fetchFarmList/pending'),
  fulfilled: createAction('lists/fetchFarmList/fulfilled'),
  rejected: createAction('lists/fetchFarmList/rejected'),
};

export const acceptFarmUpdate = createAction<string>(
  'lists/acceptFarmListUpdate',
);
