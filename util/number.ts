import numeral from "numeral";
import { isEmpty } from "~/util/typeof";

export const formatSpaceNumber = (number: number): string => {
  if (!isEmpty(number)) {
    return numeral(number).format("0,0");
  }
  return "";
};
