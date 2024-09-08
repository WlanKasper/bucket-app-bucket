import { Bucket, BucketCreateRequest, BucketPatchRequest } from "@/model/bucket";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import uuid from 'react-native-uuid';

export interface bucketSliceState {
  loading: boolean;
  buckets: Bucket[];
}

const initialState: bucketSliceState = {
  loading: true,
  buckets: [],
};

const slice = createSlice({
  name: "bucket",
  initialState,
  reducers: {
    // saga actions used by saga watchers
    sagaCreateBucket: (_state, _action: PayloadAction<BucketCreateRequest>) => {},
    sagaGetBuckets: (_state) => {},
    // sagaGetBucketById: (_state, _action: PayloadAction<string>) => {},
    sagaPatchBucketById: (_state, _action: PayloadAction<BucketPatchRequest>) => {},
    sagaDeteleBucketById: (_state, _action: PayloadAction<string>) => {},

    // redux actions for current module
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBuckets: (state, action) => {
      state.buckets = action.payload;
    },
    patchBucket: (state, action) => {
      state.buckets = state.buckets.map((bucket) =>
        bucket._id === action.payload._id ? action.payload : bucket
      );
    },    
    reset: () => initialState,
  },

  selectors: {
    isLoading: (bucket) => bucket.loading,
    buckets: (bucket) => bucket.buckets,
  },
});

export const { actions, reducer, selectors } = slice;
