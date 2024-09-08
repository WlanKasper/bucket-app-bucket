import type { RawAxiosRequestHeaders, CancelTokenSource } from "axios";
import ServiceException from "@/exception/exception";
import http from "./httpService";

type HttpRequestFn = (
  cancelSource: CancelTokenSource,
  method: string,
  url: string,
  data?: any,
  params?: any,
  headers?: RawAxiosRequestHeaders,
  timeout?: number
) => Promise<any>;

export type HttpMethodFn = (
  cancelSource: CancelTokenSource,
  url: string,
  data?: any | null,
  params?: any | null,
  headers?: RawAxiosRequestHeaders,
  timeout?: number
) => Promise<any>;

const _request: HttpRequestFn = async (
  cancelSource,
  method,
  url,
  data = undefined,
  params = undefined,
  headers = undefined,
  timeout = 30000
) => {
  try {
    const response = await http.request({
      url,
      method,
      data: data ?? undefined,
      params: params ?? undefined,
      headers: headers ?? undefined,
      timeout: timeout ?? undefined,
      cancelToken: cancelSource ? cancelSource.token : undefined,
    });

    if (response) {
      return response.data;
    }

    return null;
  } catch (error: any) {
    throw new ServiceException(error);
  }
};

export const $get: HttpMethodFn = async (
  cancelSource,
  url,
  data = undefined,
  params = undefined,
  headers = undefined,
  timeout = undefined
) => await _request(cancelSource, "get", url, data, params, headers, timeout);

const $post: HttpMethodFn = async (
  cancelSource,
  url,
  data = undefined,
  params = undefined,
  headers = undefined,
  timeout = undefined
) => await _request(cancelSource, "post", url, data, params, headers, timeout);

const $put: HttpMethodFn = async (
  cancelSource: CancelTokenSource,
  url,
  data = undefined,
  params = undefined,
  headers = undefined,
  timeout = undefined
) => await _request(cancelSource, "put", url, data, params, headers, timeout);

const $delete: HttpMethodFn = async (
  cancelSource: CancelTokenSource,
  url,
  data = undefined,
  params = undefined,
  headers = undefined,
  timeout = undefined
) => await _request(cancelSource, "delete", url, data, params, headers, timeout);

const $patch: HttpMethodFn = async (
  cancelSource: CancelTokenSource,
  url,
  data = undefined,
  params = undefined,
  headers = undefined,
  timeout = undefined
) => await _request(cancelSource, "patch", url, data, params, headers, timeout);

export default {
  get: $get,
  post: $post,
  put: $put,
  patch: $patch,
  delete: $delete,
};
