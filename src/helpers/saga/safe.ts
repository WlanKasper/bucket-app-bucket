import ServiceException from "@/exception/exception";
import { CallEffect } from "redux-saga/effects";

export type SafeReturn<T> = {
  result: T | null;
  error: ServiceException<any> | null;
};

function* safe<T>(effect: CallEffect): Generator<CallEffect, SafeReturn<T>, T> {
  try {
    const result = yield effect;
    return { result, error: null };
  } catch (error: any) {
    return { result: null, error };
  }
}

export default safe;
