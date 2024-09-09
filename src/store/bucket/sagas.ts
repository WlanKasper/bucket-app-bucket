
import { PayloadAction } from "@reduxjs/toolkit";
import {
  call,
  fork,
  put,
  SagaReturnType,
  takeLatest,
} from "redux-saga/effects";
import { actions as bucketActions } from "./slice";
import axios from "axios";
import { safe } from "@/helpers/saga";
import { createBucket, deleteBucketById, getBuckets, patchBucketById } from "@/service/bucket/bucket";
import { Bucket, BucketCreateRequest, BucketPatchRequest } from "@/model/bucket";

//=====================================
//  FLOWS
//-------------------------------------

function* createBucketFlow({ payload }: { payload: BucketCreateRequest }) {
  console.debug("[👀] createBucketFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket[]>> = yield safe<
      Bucket[]
    >(call(createBucket, cancelSource, payload));

    if (error) {
      console.error("[❌] Create bucket error:", error.message);
      return;
    }

    if (result) {
      yield put(bucketActions.createBucket(result));
    }
  } finally {
    console.debug("[👀] createBucketFlow - end");
    yield put(bucketActions.setLoading(false));
  }
}

function* getBucketsFlow() {
  console.debug("[👀] getBucketsFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket[]>> = yield safe<
      Bucket[]
    >(call(getBuckets, cancelSource));

    if (error) {
      console.error("[❌] Get buckets error:", error.message);
      return;
    }

    if (result && result.length > 0) {
      yield put(bucketActions.setBuckets(result));
    }
  } finally {
    console.debug("[👀] getBucketsFlow - end");
    yield put(bucketActions.setLoading(false));
  }
}

// function* getBucketByIdFlow({ payload }: { payload: string }) {
//   console.debug("[👀] getBucketByIdFlow - start");
//   yield put(bucketActions.setLoading(true));

//   const cancelSource = axios.CancelToken.source();

//   try {
//     const { result, error }: SagaReturnType<typeof safe<Bucket[]>> = yield safe<
//       Bucket[]
//     >(call(getBucketById, cancelSource, payload));

//     if (error) {
//       console.error("[❌] Get bucket by ID error:", error.message);
//       return;
//     }

//     if (result && result.length > 0) {
//       yield put(bucketActions.setBuckets(result));
//     }
//   } finally {
//     console.debug("[👀] getBucketByIdFlow - end");
//     yield put(bucketActions.setLoading(false));
//   }
// }

function* patchBucketByIdFlow({ payload }: { payload: BucketPatchRequest }) {
  console.debug("[👀] patchBucketByIdFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket>> =
      yield safe<Bucket>(call(patchBucketById, cancelSource, payload));

    if (error) {
      console.error("[❌] Patch bucket by ID error:", error.message);
      return;
    }

    if (result) {
      yield put(bucketActions.patchBucket(result));
    }
  } finally {
    console.debug("[👀] patchBucketByIdFlow - end");
    yield put(bucketActions.setLoading(false));
  }
}

function* deleteBucketByIdFlow({ payload }: { payload: string }) {
  console.debug("[👀] deleteBucketByIdFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket>> = yield safe<
      Bucket
    >(call(deleteBucketById, cancelSource, payload));

    if (error) {
      console.error("[❌] Delete bucket by ID error:", error.message);
      return;
    }

    if (result) {
      yield put(bucketActions.deleteBucket(result));
    }
  } finally {
    console.debug("[👀] deleteBucketByIdFlow - end");
    yield put(bucketActions.setLoading(false));
  }
}

//=====================================
//  WATCHERS
//-------------------------------------

function* watchCreateBucket() {
  yield takeLatest<PayloadAction<BucketCreateRequest>>(
    bucketActions.sagaCreateBucket.type,
    createBucketFlow
  );
}

function* watchGetBuckets() {
  yield takeLatest(bucketActions.sagaGetBuckets.type, getBucketsFlow);
}

// function* watchGetBucketById() {
//   yield takeLatest<PayloadAction<string>>(
//     bucketActions.sagaGetBucketById.type,
//     getBucketByIdFlow
//   );
// }

function* watchPatchBucketById() {
  yield takeLatest<PayloadAction<BucketPatchRequest>>(
    bucketActions.sagaPatchBucketById.type,
    patchBucketByIdFlow
  );
}

function* watchDeleteBucketById() {
  yield takeLatest<PayloadAction<string>>(
    bucketActions.sagaDeleteBucketById.type,
    deleteBucketByIdFlow
  );
}

//=====================================
//  SAGAS
//-------------------------------------

export const bucketSagas = [
  fork(watchCreateBucket),
  fork(watchGetBuckets),
//   fork(watchGetBucketById),
  fork(watchPatchBucketById),
  fork(watchDeleteBucketById),
];
