import { combineReducers } from "redux";

import { bucketReducer } from "./bucket";

export default combineReducers({
  bucket: bucketReducer
});
