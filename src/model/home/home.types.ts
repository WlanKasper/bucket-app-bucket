export interface Bucket {
    id: string;
    label: string;
    data: BucketItem[];
}

export interface BucketItem {
    id: string;
    data: string;
    isChecked: boolean;
}
