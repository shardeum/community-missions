import { createReducer } from '@reduxjs/toolkit';
import { Field, resetMintState, typeInput, selectCurrency } from './actions';

export interface MintState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly otherTypedValue: string; // for the case when there's no liquidity
  readonly [Field.CURRENCY_A]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.CURRENCY_B]: {
    readonly currencyId: string | undefined;
  };
}

const initialState: MintState = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  otherTypedValue: '',
  [Field.CURRENCY_A]: {
    currencyId: '',
  },
  [Field.CURRENCY_B]: {
    currencyId: '',
  },
};

export default createReducer<MintState>(initialState, (builder) =>
  builder
    .addCase(resetMintState, () => initialState)
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField =
        field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField:
            state.independentField === Field.CURRENCY_A
              ? Field.CURRENCY_B
              : Field.CURRENCY_A,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        };
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId },
        };
      }
    })
    .addCase(
      typeInput,
      (state, { payload: { field, typedValue, noLiquidity } }) => {
        if (noLiquidity) {
          // they're typing into the field they've last typed in
          if (field === state.independentField) {
            return {
              ...state,
              independentField: field,
              typedValue,
            };
          }
          // they're typing into a new field, store the other value
          else {
            return {
              ...state,
              independentField: field,
              typedValue,
              otherTypedValue: state.typedValue,
            };
          }
        } else {
          return {
            ...state,
            independentField: field,
            typedValue,
            otherTypedValue: '',
          };
        }
      },
    ),
);
