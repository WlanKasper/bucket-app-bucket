export interface Bucket {
  _id: string;
  label: string;
  data: BucketItem[];
}

export interface BucketItem {
  id: string;
  data: string;
  isChecked: boolean;
}

export interface BucketCreateRequest {
  label: string;
  data?: BucketItem[];
}

export interface BucketPatchRequest {
  id: string;
  label?: string;
  data?: BucketItem[];
}
