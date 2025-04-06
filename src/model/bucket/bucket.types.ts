export interface Bucket {
  _id: string;
  name: string;
  description: string;
  data: BucketItem[];
}

export interface BucketItem {
  id: string;
  data: string;
  isChecked: boolean;
}

export interface BucketCreateRequest {
  userId: string;
  name: string;
  description: string;
  data?: BucketItem[];
}

export interface BucketPatchRequest {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  data?: BucketItem[];
}
