import SagService from "@/service/sagService";
import type { CancelTokenSource } from "axios";

import { Bucket, BucketCreateRequest, BucketPatchRequest } from "@/model/bucket";

export const createBucket = async (cancelSource: CancelTokenSource, createRequest: BucketCreateRequest): Promise<Bucket> =>
  await SagService.patch(cancelSource, `api/bucket`, createRequest);

export const getBuckets = async (cancelSource: CancelTokenSource): Promise<Bucket[]> =>
  await SagService.get(cancelSource, `api/bucket`);

// export const getBucketById = async (cancelSource: CancelTokenSource, bucketId: string): Promise<Bucket> =>
//   await SagService.get(cancelSource, `api/bucket/${bucketId}`);

export const patchBucketById = async (cancelSource: CancelTokenSource, patchRequest: BucketPatchRequest): Promise<Bucket> =>
  await SagService.patch(cancelSource, `api/bucket/${patchRequest.id}`, patchRequest);

export const deleteBucketById = async (cancelSource: CancelTokenSource, bucketId: string): Promise<Bucket> => 
  await SagService.delete(cancelSource, `api/bucket/${bucketId}`);
