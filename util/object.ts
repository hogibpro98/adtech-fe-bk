import { isObject, isNumber } from "~/util/typeof";

export const objectToStyle = (obj: object): object => {
  if (isObject(obj)) {
    Object.keys(obj).forEach(key => {
      if (isNumber(obj[key])) {
        obj[key] = `${obj[key]}px`;
      }
    });
    return obj;
    // return Object.entries(obj)
    //   .map(([property, value]) => {
    //     if (isNumber(value)) {
    //       return `${property}: ${value}px`;
    //     }
    //     return `${property}: ${value}`;
    //   })
    //   .join(", ");
  }
  return {};
};
