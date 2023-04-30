import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { DualFarmListInfo } from 'types';

export const fetchDualFarmList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    dualFarmList: DualFarmListInfo;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction('lists/fetchDualFarmList/pending'),
  fulfilled: createAction('lists/fetchDualFarmList/fulfilled'),
  rejected: createAction('lists/fetchDualFarmList/rejected'),
};

export const acceptDualFarmUpdate = createAction<string>(
  'lists/acceptDualFarmListUpdate',
);
