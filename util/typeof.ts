import { AxiosResponse } from "axios";
import { ResponseInterface } from "~/interface/plugin/repository";

export function isObject(value: any): boolean {
  return value && typeof value === "object" && value.constructor === Object;
}

export function isArray(value: any): boolean {
  return value && typeof value === "object" && value.constructor === Array;
}

export function isString(value: any): boolean {
  return typeof value === "string" || value instanceof String;
}

export function isEmpty(value: any): boolean {
  if (isString(value)) {
    return value === "" || value === undefined || value === null;
  } else if (isObject(value)) {
    return (
      value === null || value === undefined || Object.keys(value).length === 0
    );
  } else if (isArray(value)) {
    return value === null || value === undefined || value.length === 0;
  }
  return value === null || value === undefined;
}

export function isNumber(value: any): boolean {
  // eslint-disable-next-line no-restricted-globals
  return typeof value === "number" && isFinite(value);
}

export function isFunction(value: any): boolean {
  return typeof value === "function";
}

// Returns if a value is null
export function isNull(value: any): boolean {
  return value === null;
}

// Returns if a value is undefined
export function isUndefined(value: any): boolean {
  return typeof value === "undefined";
}

export function isBoolean(value: any): boolean {
  return typeof value === "boolean";
}

export function isRegExp(value: any): boolean {
  return value && typeof value === "object" && value.constructor === RegExp;
}

export function isError(value: any): boolean {
  return value instanceof Error && typeof value.message !== "undefined";
}

export function isDate(value: any): boolean {
  return value instanceof Date;
}

export function isSymbol(value: any): boolean {
  return typeof value === "symbol";
}

export function isExistKey(object: any, key: string | number): boolean {
  // eslint-disable-next-line no-prototype-builtins
  return isObject(object) && object.hasOwnProperty(key);
}

export function isErrorResponse(response: any): boolean {
  return !response || isError(response);
}

export function isAsyncFunction(value: any): boolean {
  return isFunction(value) && value.constructor.name === "AsyncFunction";
}

export function isPromise(value: any): boolean {
  return value instanceof Promise;
}

export function isUrl(str: any): boolean {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

export const getResult = (response: ResponseInterface | AxiosResponse): any => {
  if (isErrorResponse(response)) {
    return {};
  } else if (isExistKey(response, "data")) {
    return response.data;
  } else {
    return response;
  }
};
