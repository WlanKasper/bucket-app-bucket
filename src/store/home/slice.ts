import { Bucket } from "@/model/home";
import { createSlice } from "@reduxjs/toolkit";
import uuid from 'react-native-uuid';

export interface HomeSliceState {
  loading: boolean;
  buckets: Bucket[];
}

const initialState: HomeSliceState = {
  loading: false,
  buckets: [
    {
      id: `${uuid.v4()}`,
      label: "Bucket 1",
      data: [
        {
          id: `${uuid.v4()}`,
          data: `# This heading will show with formatting`,
          isChecked: false,
        },
        {
          id: `${uuid.v4()}`,
          data: `# This heading will show with formatting`,
          isChecked: false,
        },
        {
          id: `${uuid.v4()}`,
          data: `# This heading will show with formatting`,
          isChecked: false,
        },
      ],
    },
    {
      id: `${uuid.v4()}`,
      label: "Bucket 2",
      data: [
        {
          id: `${uuid.v4()}`,
          data: `# This heading will show with formatting`,
          isChecked: false,
        },
        {
          id: `${uuid.v4()}`,
          data: `# This heading will show with formatting`,
          isChecked: false,
        },
        {
          id: `${uuid.v4()}`,
          data: `# This heading will show with formatting`,
          isChecked: false,
        },
      ],
    },
  ],
};

const slice = createSlice({
  name: "home",
  initialState,
  reducers: {
    // saga actions used by saga watchers

    // redux actions for current module
    loadingStart: (state) => {
      state.loading = true;
    },
    loadingEnd: (state) => {
      state.loading = false;
    },
    setBuckets: (state, action) => {
      state.buckets = action.payload;
    },
    reset: () => initialState,
  },

  selectors: {
    isLoading: (home) => home.loading,
    buckets: (home) => home.buckets,
  },
});

export const { actions, reducer, selectors } = slice;
