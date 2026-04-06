export interface SessionUser {
  telegramUserId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  isDev?: boolean;
}

export interface BucketItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Bucket {
  id: string;
  name: string;
  description: string;
  items: BucketItem[];
  ownerTelegramId: string;
  ownerUsername: string;
  sharedWith: string[];
  updatedAt: string;
}
