import {
  actions as bucketActions,
  reducer as bucketReducer,
  selectors as bucketSelectors,
} from "./slice";
import { bucketSagas } from "./sagas";

export {
  bucketSagas,
  bucketActions,
  bucketReducer,
  bucketSelectors,
};
