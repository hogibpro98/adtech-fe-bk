import { TIME, DATE_TIME, SQL_DATE } from "@/constants/format";
import Vue from "vue";
// @ts-ignore
import moment from 'moment/src/moment';
import "moment/locale/vi"; // without this line it didn't work
import numeral from "numeral";
import { formatSpaceNumber } from "~/util/number";
import { isArray, isEmpty } from "~/util/typeof";
import {
  DATE,
  DECIMAL,
  MONTH,
  SQL_TIMESTAMP,
  TIMESTAMP
} from "~/constants/format";
import { toHumanize } from "~/util/time";

Vue.filter("timestamp", function(str?: string): string {
  if (str) {
    const momentObj = moment(str);
    if (momentObj.isValid()) {
      return momentObj.format(TIMESTAMP);
    }
    return str;
  } else return "-";
});

Vue.filter("trim", function(str: string): string {
  return str.trim();
});

Vue.filter("humanize", function(duration: number): string {
  if (duration) {
    return toHumanize(duration);
  } else return "-";
});

Vue.filter("date", function(str?: string): string {
  const momentObj = moment(str);
  if (momentObj.isValid()) {
    return momentObj.format(DATE);
  }
  return str;
});

Vue.filter("datetime", function(str?: string): string {
  const momentObj = moment(str);
  if (momentObj.isValid()) {
    return momentObj.format(DATE_TIME);
  }
  return str;
});

Vue.filter("startOfDay", function(value?: string): Date {
  if (!isEmpty(value)) {
    const timestamp =
      moment(value)
        .startOf("day")
        .toDate()
        .getTime() +
      60 * 1000;
    return new Date(timestamp);
  }
  return new Date(
    moment()
      .startOf("day")
      .toDate()
      .getTime() +
      60 * 1000
  );
});

Vue.filter("endOfDay", function(value?: string): Date {
  if (!isEmpty(value)) {
    const timestamp =
      moment(value)
        .endOf("day")
        .toDate()
        .getTime() -
      60 * 1000;
    return new Date(timestamp);
  }
  return new Date(
    moment()
      .endOf("day")
      .toDate()
      .getTime() -
      60 * 1000
  );
});

Vue.filter("time", function(str?: string): string {
  const momentObj = moment(str);
  if (momentObj.isValid()) {
    return momentObj.format(TIME);
  }
  return str;
});

Vue.filter("timeDateLine", function(str?: string): string {
  const momentObj = moment(str);
  if (momentObj.isValid()) {
    return momentObj.format(SQL_DATE);
  }
  return str;
});

Vue.filter("dateObj", function(str?: string | number): moment.Moment {
  return moment(str);
});

Vue.filter("getTime", function(str?: string | number): number {
  if (str) {
    return moment(str)
      .toDate()
      .getTime();
  }
  return moment()
    .toDate()
    .getTime();
});

Vue.filter("month", function(str?: string): string {
  const momentObj = moment(str);
  if (momentObj.isValid()) {
    return momentObj.format(MONTH);
  }
  return str;
});

Vue.filter("sqlDate", function(
  val?: string | Array<string>
): Array<string> | string {
  if (isArray(val)) {
    // @ts-ignore
    const [dateFrom, dateTo] = val;
    return [
      moment(dateFrom).format("YYYY-MM-DD"),
      moment(dateTo).format("YYYY-MM-DD")
    ];
  }
  return moment(val).format("YYYY-MM-DD");
});

Vue.filter("minDate", function(arr: Array<string | number>): Date {
  if (arr) {
    const dateCompare = arr.map(item => moment(item));
    const minDate = moment.min(dateCompare);
    if (minDate) return minDate.toDate();
  }
  return null;
});

Vue.filter("maxDate", function(arr: Array<string | number>): Date {
  if (arr) {
    const dateCompare = arr.map(item => moment(item));
    const maxDate = moment.max(dateCompare);
    if (maxDate) return maxDate.toDate();
  }
  return null;
});

Vue.filter("dateRange", function(
  val: string | number | Array<string | number>
): string {
  if (isArray(val)) {
    // @ts-ignore
    const [dateFrom, dateTo] = val;
    if (!dateFrom && !dateTo) return "";
    if (!dateTo) {
      return moment(dateFrom).format(SQL_DATE);
    }

    if (!dateFrom) {
      return moment(dateTo).format(SQL_DATE);
    }

    const dateFromStr = moment(dateFrom).format(DATE);
    const dateToStr = moment(dateTo).format(DATE);
    if (dateFromStr === dateToStr) {
      return dateFromStr;
    }
    return `Từ ${dateFromStr} đến ${dateToStr}`;
  } else if (val) {
    return moment(val).format(DATE);
  }

  return "";
});

Vue.filter("number", function(str: string | number): number {
  if (typeof str === "number") {
    return str;
    // @ts-ignore
  } else if (!isNaN(str)) {
    return parseInt(str);
  }
  return 0;
});
Vue.filter("vat", function(val: number): string {
  if (val === -1) {
    return "Không chịu thuế";
  } else {
    return val + "%";
  }
});
Vue.filter("numberSpace", function(number: number): string {
  if (number) {
    return numeral(number).format("0,0");
  }
  return "0";
});

Vue.filter("currency", function(number: number): string {
  if (!isEmpty(number)) {
    return `${formatSpaceNumber(number)}₫`;
  }
  return "-";
});

Vue.filter("numberCurrency", function(number: number): string {
  if (!isEmpty(number)) {
    return `${formatSpaceNumber(number)}₫`;
  }
  return "0₫";
});

Vue.filter("textNumber", function(number: number): string {
  if (!isEmpty(number)) {
    return numeral(number).format("0.[00] a");
  }
  return "0";
});

Vue.filter("spaceNumber", function(number: number): string {
  if (!isEmpty(number)) {
    return formatSpaceNumber(number);
  }
  return "";
});
Vue.filter("compareTextNumber", function(number: number): string {
  if (!isEmpty(number)) {
    if (number >= 0) {
      return "+" + numeral(number).format("0.[00] a");
    } else {
      return numeral(number).format("0.[00] a");
    }
  }
  return "+0";
});
Vue.filter("compareFormattedNumber", function(number: number | string): string {
  if (!isEmpty(number)) {
    const numValue = numeral(number);
    if (number >= 0) {
      return "+" + numValue.format(DECIMAL);
    } else {
      return numValue.format(DECIMAL);
    }
  }
  return "+0";
});

Vue.filter("formattedNumber", function(str: number | string): string {
  if (str || str === 0) {
    return numeral(str).format(DECIMAL);
  }
  return undefined;
});

Vue.filter("formattedTwoNumberRound", function(str: number | string): string {
  if (str || str === 0) {
    return numeral(str).format("0,0.[00]");
  }
  return undefined;
});

Vue.filter("readableTime", function(time: number | string): string {
  if (typeof time === "number") {
    return moment(time)
      .locale("vi")
      .fromNow();
  } else {
    return moment(time, SQL_TIMESTAMP)
      .locale("vi")
      .fromNow();
  }
});

Vue.filter("percent", function(num: number): number {
  if (num) {
    return Math.round(num * 10000 + Number.EPSILON) / 100;
  }
  return 0;
});

Vue.filter("commarize", function(num: number): string {
  if (num) {
    return numeral(num).format("0.[0] a");
  }
  return "0";
});

Vue.filter("jsonObject", function(str: string): string {
  if (typeof str === "string") {
    try {
      return JSON.parse(str);
    } catch (e) {}
  }
  return str;
});

Vue.filter("toEnglish", function(str: string): string {
  if (!str) return str;
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
});

// @ts-ignore
Vue.prototype.$filters = Vue.options.filters;
