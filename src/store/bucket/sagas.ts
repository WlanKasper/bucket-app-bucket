import { PayloadAction } from "@reduxjs/toolkit";
import {
  call,
  delay,
  fork,
  put,
  SagaReturnType,
  takeLatest,
} from "redux-saga/effects";
import { actions as bucketActions } from "./slice";
import axios from "axios";
import { safe } from "@/helpers/saga";
import {
  createBucket,
  deleteBucketById,
  getBuckets,
  patchBucketById,
  shareBucket,
  unshareBucket,
} from "@/service/bucket/bucket";
import { registerUser } from "@/service/user/user";
import {
  Bucket,
  BucketCreateRequest,
  BucketPatchRequest,
  BucketShareRequest,
  BucketUnshareRequest,
} from "@/model/bucket";

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

function* getBucketsFlow({
  payload,
}: {
  payload: { userId: string; username?: string };
}) {
  console.debug("[👀] getBucketsFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket[]>> = yield safe<
      Bucket[]
    >(call(getBuckets, cancelSource, payload.userId, payload.username));

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

function* patchBucketByIdFlow({ payload }: { payload: BucketPatchRequest }) {
  yield delay(500);

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
    const { result, error }: SagaReturnType<typeof safe<Bucket>> =
      yield safe<Bucket>(call(deleteBucketById, cancelSource, payload));

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

// Sharing flows
function* shareBucketFlow({
  payload,
}: {
  payload: { bucketId: string } & BucketShareRequest;
}) {
  console.debug("[👀] shareBucketFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket>> =
      yield safe<Bucket>(
        call(shareBucket, cancelSource, payload.bucketId, {
          userId: payload.userId,
          shareWithUsername: payload.shareWithUsername,
        })
      );

    if (error) {
      console.error("[❌] Share bucket error:", error.message);
      return;
    }

    if (result) {
      yield put(bucketActions.patchBucket(result));
    }
  } finally {
    console.debug("[👀] shareBucketFlow - end");
    yield put(bucketActions.setLoading(false));
  }
}

function* unshareBucketFlow({
  payload,
}: {
  payload: { bucketId: string } & BucketUnshareRequest;
}) {
  console.debug("[👀] unshareBucketFlow - start");
  yield put(bucketActions.setLoading(true));

  const cancelSource = axios.CancelToken.source();

  try {
    const { result, error }: SagaReturnType<typeof safe<Bucket>> =
      yield safe<Bucket>(
        call(unshareBucket, cancelSource, payload.bucketId, {
          userId: payload.userId,
          targetUserId: payload.targetUserId,
        })
      );

    if (error) {
      console.error("[❌] Unshare bucket error:", error.message);
      return;
    }

    if (result) {
      yield put(bucketActions.patchBucket(result));
    }
  } finally {
    console.debug("[👀] unshareBucketFlow - end");
    yield put(bucketActions.setLoading(false));
  }
}

// User registration flow
function* registerUserFlow({
  payload,
}: {
  payload: {
    telegramUserId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}) {
  console.debug("[👀] registerUserFlow - start");

  const cancelSource = axios.CancelToken.source();

  try {
    const { error } = yield safe(call(registerUser, cancelSource, payload));

    if (error) {
      console.error("[❌] Register user error:", error.message);
      return;
    }

    console.debug("[✅] User registered successfully");
  } finally {
    console.debug("[👀] registerUserFlow - end");
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
  yield takeLatest<PayloadAction<{ userId: string; username?: string }>>(
    bucketActions.sagaGetBuckets.type,
    getBucketsFlow
  );
}

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

function* watchShareBucket() {
  yield takeLatest<
    PayloadAction<{ bucketId: string } & BucketShareRequest>
  >(bucketActions.sagaShareBucket.type, shareBucketFlow);
}

function* watchUnshareBucket() {
  yield takeLatest<
    PayloadAction<{ bucketId: string } & BucketUnshareRequest>
  >(bucketActions.sagaUnshareBucket.type, unshareBucketFlow);
}

function* watchRegisterUser() {
  yield takeLatest<
    PayloadAction<{
      telegramUserId: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    }>
  >(bucketActions.sagaRegisterUser.type, registerUserFlow);
}

//=====================================
//  SAGAS
//-------------------------------------

export const bucketSagas = [
  fork(watchCreateBucket),
  fork(watchGetBuckets),
  fork(watchPatchBucketById),
  fork(watchDeleteBucketById),
  fork(watchShareBucket),
  fork(watchUnshareBucket),
  fork(watchRegisterUser),
];
