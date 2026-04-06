import SagService from "@/service/sagService";
import type { CancelTokenSource } from "axios";

export interface UserRegisterRequest {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const registerUser = async (
  cancelSource: CancelTokenSource,
  request: UserRegisterRequest
): Promise<User> =>
  await SagService.post(cancelSource, `api/user/register`, request);

export const lookupUser = async (
  cancelSource: CancelTokenSource,
  username: string
): Promise<User> =>
  await SagService.get(cancelSource, `api/user/lookup/${username}`);

export const getUserByTelegramId = async (
  cancelSource: CancelTokenSource,
  telegramUserId: string
): Promise<User> =>
  await SagService.get(cancelSource, `api/user/${telegramUserId}`);
