import { Tuple, configureStore, isPlain } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
// import { type Middlewares } from "@reduxjs/toolkit/dist/configureStore";

import reducer from "./reducer";
import rootSaga from "./sagas";

export function isMyPlain(val: any) {
  return val instanceof Date || isPlain(val);
}

const defaultCustomizedMiddleware = {
  serializableCheck: false,
  immutableCheck: { warnAfter: 800 },
  thunk: true,
};

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    // const middlewares = new Tuple<Middlewares<any>>();
    const middlewares = new Tuple<any>();
    middlewares.push(...getDefaultMiddleware(defaultCustomizedMiddleware));
    middlewares.push(sagaMiddleware);

    return middlewares;
  },
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;

export default function () {
  return store;
}
