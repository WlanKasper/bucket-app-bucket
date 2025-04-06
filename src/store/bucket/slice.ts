import {
  Bucket,
  BucketCreateRequest,
  BucketPatchRequest,
} from "@/model/bucket";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface bucketSliceState {
  loading: boolean;
  user_id?: string;
  buckets: Bucket[];
  selectedBucket?: Bucket;
}

const initialState: bucketSliceState = {
  loading: true,
  user_id: undefined,
  buckets: [],
  selectedBucket: undefined,
};

const slice = createSlice({
  name: "bucket",
  initialState,
  reducers: {
    // saga actions used by saga watchers
    sagaCreateBucket: (
      _state,
      _action: PayloadAction<BucketCreateRequest>
    ) => {},
    sagaGetBuckets: (_state, _action: PayloadAction<string>) => {},
    // sagaGetBucketById: (_state, _action: PayloadAction<string>) => {},
    sagaPatchBucketById: (
      _state,
      _action: PayloadAction<BucketPatchRequest>
    ) => {},
    sagaDeleteBucketById: (_state, _action: PayloadAction<string>) => {},

    // redux actions for current module
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserId: (state, action) => {
      state.user_id = action.payload;
    },
    createBucket: (state, action) => {
      state.buckets = [...state.buckets, action.payload];
      state.selectedBucket = action.payload;
    },
    setBuckets: (state, action) => {
      state.buckets = action.payload;
      if (action.payload.length > 0) {
        state.selectedBucket = action.payload[0];
      }
    },

    setSelectedBucket: (state, action) => {
      state.selectedBucket = action.payload;
    },
    patchBucket: (state, action) => {
      state.buckets = state.buckets.map((bucket) =>
        bucket._id === action.payload._id ? action.payload : bucket
      );
    },
    deleteBucket(state, action: PayloadAction<Bucket>) {
      state.buckets = state.buckets.filter(
        (bucket) => bucket._id !== action.payload._id
      );

      if (state.selectedBucket?._id === action.payload._id) {
        state.selectedBucket = state.buckets[0];
      }
    },
    reset: () => initialState,
  },

  selectors: {
    isLoading: (bucket) => bucket.loading,
    userId: (bucket) => bucket.user_id,
    buckets: (bucket) => bucket.buckets,
    selectedBucket: (bucket) => bucket.selectedBucket,
  },
});

export const { actions, reducer, selectors } = slice;
