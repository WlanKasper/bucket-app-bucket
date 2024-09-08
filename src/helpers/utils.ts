import { BrandFilter, BrandFilterRequest } from "@/model/udc";
import * as Network from "expo-network";

const getIpAddress = async () => await Network.getIpAddressAsync();

export const toBoolean = (strVal: string) => {
  if (strVal) {
    return strVal === "true" || strVal === "TRUE";
  }
  return false;
};

export const getDomainFromURL = (url: string) => {
  if (!url) return;

  const pattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
  const matches = url.match(pattern);

  return matches && matches?.length > 0 && matches[0];
};

export const getDeviceIPAddress = async () => {
  return await getIpAddress();
};

export const isAnIPAddress = (ip: string) => {
  if (!ip) return false;

  const pattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

  const matches = ip.match(pattern);

  return matches && matches?.length > 0;
};

export const toCamelCase = (input: string) => {
  return input.replace(/\b(\w+)\b/g, (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());
};

export const orgIdToBrandId = (orgId: string | undefined) => {
  const [brandId] = `${orgId ?? ""}`.split("-");
  return brandId.toLocaleUpperCase();
};

export const transformBrandsToRequest = (arr: BrandFilter[]): BrandFilterRequest => {
  return arr.reduce((acc, curr) => {
    acc[curr.brand] = { filter: curr.filter };
    return acc;
  }, {} as BrandFilterRequest);
};
