import { all } from "redux-saga/effects";

import { bucketSagas } from "./bucket";

export default function* rootSaga() {
  yield all([
    ...bucketSagas,
  ]);
}
