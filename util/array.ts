import { flatten, pick } from "lodash";
import { isArray, isEmpty } from "./typeof";
import { MACRO_REGEX } from "~/constants/regex";

export const responseErrorToString = (errors: object): string => {
  return flatten(Object.values(errors)).join("<br />");
};

export const getAvg = (arr: Array<number>): number => {
  const reducer = (total, currentValue) => total + parseFloat(currentValue);
  const sum = arr.reduce(reducer);
  return sum / arr.length;
};

export const getMax = (arr: Array<number>): number => {
  const reducer = (max, currentValue) =>
    max < parseFloat(currentValue) ? parseFloat(currentValue) : max;
  return arr.reduce(reducer);
};

export const getMin = (arr: Array<number>): number => {
  const reducer = (min, currentValue) =>
    min > parseFloat(currentValue) ? parseFloat(currentValue) : min;
  return arr.reduce(reducer);
};

export const getPropsAvg = (
  array: Array<number>,
  props: string | Array<string> = null
): number | object => {
  if (!Array.isArray(array)) {
    return undefined;
  }

  if (props === null) {
    return getAvg(array);
  }
  if (typeof props === "string") {
    return getAvg(array.map(e => e[props]));
  }
  if (Array.isArray(props)) {
    const newArr = array.map(e => pick(e, props));
    const obj = {};
    props.forEach(prop => {
      obj[prop] = getAvg(newArr.map(e => e[prop]));
    });
    return obj;
  }

  return 0;
};

export const getPropsMin = (
  array: Array<number>,
  props: string | Array<string> = null
): number | object => {
  if (!Array.isArray(array)) {
    return undefined;
  }

  if (props === null) {
    return getMin(array);
  }
  if (typeof props === "string") {
    return getMin(array.map(e => e[props]));
  }
  if (Array.isArray(props)) {
    const newArr = array.map(e => pick(e, props));
    const obj = {};
    props.forEach(prop => {
      obj[prop] = getMin(newArr.map(e => e[prop]));
    });
    return obj;
  }

  return 0;
};

export const getPropsMax = (
  array: Array<number>,
  props: string | Array<string> = null
): number | object => {
  if (!Array.isArray(array)) {
    return undefined;
  }

  if (props === null) {
    return getMax(array);
  }
  if (typeof props === "string") {
    return getMax(array.map(e => e[props]));
  }
  if (Array.isArray(props)) {
    const newArr = array.map(e => pick(e, props));
    const obj = {};
    props.forEach(prop => {
      obj[prop] = getMax(newArr.map(e => e[prop]));
    });
    return obj;
  }

  return 0;
};

export const convertArrayByField = (
  arr: Array<any>,
  field?: string
): Array<any> => {
  if (isArray(arr) && !isEmpty(arr)) {
    if (isEmpty(field)) {
      return arr.filter(value => !isEmpty(value));
    } else {
      return arr.map(item => item[field]).filter(value => !isEmpty(value));
    }
  }
  return null;
};

export const getListMacroSelectedByUrl = (url: string) => {
  const listMacro = [];
  if (url) {
    const listMacroMatch = url.matchAll(MACRO_REGEX);
    let itemMatch;
    do {
      itemMatch = listMacroMatch.next() || { done: true };
      if (itemMatch.value && itemMatch.value[1]) {
        listMacro.push(itemMatch.value[1]);
      }
    } while (itemMatch.done === false && itemMatch?.value !== undefined);
  }
  return listMacro;
};
