import { all } from "redux-saga/effects";

import { homeSagas } from "./home";

export default function* rootSaga() {
  yield all([
    ...homeSagas,
  ]);
}
