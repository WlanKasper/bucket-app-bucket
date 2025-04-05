import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import reducer from "./reducer";
import rootSaga from "./sagas";

// Custom function to check serializability, including Date objects
export function isMyPlain(val: any) {
  return val instanceof Date || typeof val === 'object' && val !== null;
}

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        isSerializable: isMyPlain, // Add custom serializable check
      },
      immutableCheck: { warnAfter: 800 }, // Optional, can be tweaked or removed
    }).concat(sagaMiddleware); // Add sagaMiddleware
  },
});

// Run the root saga
sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
