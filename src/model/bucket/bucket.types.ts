// Shared user info
export interface SharedUser {
  userId?: string; // Optional - might not exist if user hasn't opened app yet
  username: string; // Required - we always have the username
}

// Presence user (who's currently viewing)
export interface PresenceUser {
  userId: string;
  username: string;
  isEditing?: boolean;
}

export interface Bucket {
  _id: string;
  userId: string;
  ownerName?: string;
  name: string;
  description: string;
  data: BucketItem[];
  sharedWith?: SharedUser[];
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
  ownerName?: string;
  data?: BucketItem[];
}

export interface BucketPatchRequest {
  id: string;
  userId: string;
  username?: string; // For access check by username
  name?: string;
  description?: string;
  data?: BucketItem[];
}

export interface BucketShareRequest {
  userId: string;
  shareWithUsername: string;
}

export interface BucketUnshareRequest {
  userId: string;
  targetUserId: string;
}
