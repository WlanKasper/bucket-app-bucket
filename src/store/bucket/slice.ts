import {
  Bucket,
  BucketCreateRequest,
  BucketPatchRequest,
  BucketShareRequest,
  BucketUnshareRequest,
  PresenceUser,
} from "@/model/bucket";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface bucketSliceState {
  loading: boolean;
  user_id?: string;
  username?: string;
  buckets: Bucket[];
  selectedBucket?: Bucket;
  presence: Record<string, PresenceUser[]>; // bucketId -> active users
}

const initialState: bucketSliceState = {
  loading: true,
  user_id: undefined,
  username: undefined,
  buckets: [],
  selectedBucket: undefined,
  presence: {},
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
    sagaGetBuckets: (
      _state,
      _action: PayloadAction<{ userId: string; username?: string }>
    ) => {},
    sagaPatchBucketById: (
      _state,
      _action: PayloadAction<BucketPatchRequest>
    ) => {},
    sagaDeleteBucketById: (_state, _action: PayloadAction<string>) => {},
    sagaShareBucket: (
      _state,
      _action: PayloadAction<{ bucketId: string } & BucketShareRequest>
    ) => {},
    sagaUnshareBucket: (
      _state,
      _action: PayloadAction<{ bucketId: string } & BucketUnshareRequest>
    ) => {},
    sagaRegisterUser: (
      _state,
      _action: PayloadAction<{
        telegramUserId: string;
        username?: string;
        firstName?: string;
        lastName?: string;
      }>
    ) => {},

    // redux actions for current module
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserId: (state, action) => {
      state.user_id = action.payload;
    },
    setUsername: (state, action: PayloadAction<string | undefined>) => {
      state.username = action.payload;
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
      // Also update selected bucket if it's the one being patched
      if (state.selectedBucket?._id === action.payload._id) {
        state.selectedBucket = action.payload;
      }
    },
    // Update bucket from WebSocket (real-time sync)
    updateBucketFromSocket: (state, action: PayloadAction<Bucket>) => {
      state.buckets = state.buckets.map((bucket) =>
        bucket._id === action.payload._id ? action.payload : bucket
      );
      // Also update selected bucket if it's the one being updated
      if (state.selectedBucket?._id === action.payload._id) {
        state.selectedBucket = action.payload;
      }
    },
    deleteBucket(state, action: PayloadAction<Bucket>) {
      state.buckets = state.buckets.filter(
        (bucket) => bucket._id !== action.payload._id
      );

      if (state.selectedBucket?._id === action.payload._id) {
        state.selectedBucket = state.buckets[0];
      }
    },
    // Presence actions
    setPresence: (
      state,
      action: PayloadAction<{ bucketId: string; users: PresenceUser[] }>
    ) => {
      state.presence[action.payload.bucketId] = action.payload.users;
    },
    clearPresence: (state, action: PayloadAction<string>) => {
      delete state.presence[action.payload];
    },
    reset: () => initialState,
  },

  selectors: {
    isLoading: (bucket) => bucket.loading,
    userId: (bucket) => bucket.user_id,
    username: (bucket) => bucket.username,
    buckets: (bucket) => bucket.buckets,
    selectedBucket: (bucket) => bucket.selectedBucket,
    presence: (bucket) => bucket.presence,
    presenceForBucket: (bucket, bucketId: string) =>
      bucket.presence[bucketId] || [],
  },
});

export const { actions, reducer, selectors } = slice;
