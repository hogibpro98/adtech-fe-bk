import {
  PHONE_REGEX,
  URL_REGEX,
  BRAND_NAME_EXIST_CHARACTER_REGEX,
  BRAND_NAME_CHARACTER_APPROVE_REGEX,
  IP_REGEX,
  EMAIL_REGEX,
  IP_WITH_SUBNET_REGEX,
  TAX_NUMBER_REGEX,
  PARAMETER_NAME_REGEX,
  PARAMETER_NAME_CHECK_REGEX,
  VIETNAMESE_CHECK_REGEX,
  SPACE_REGEX,
  CODE_REDIRECT_REGEX
} from "@/constants/regex";
import { isArray, isEmpty, isObject } from "@/util/typeof";
// @ts-ignore
import moment from 'moment/src/moment';
import {
  extend,
  localize,
  setInteractionMode,
  ValidationObserver,
  ValidationProvider
} from "vee-validate";
import {
  max,
  confirmed,
  numeric,
  between,
  min,
  min_value,
  max_value,
  integer
} from "vee-validate/dist/rules";
import vi from "vee-validate/dist/locale/vi.json";
import Vue from "vue";
import { translateCron } from "~/util/cron";
import { DATE } from "~/constants/format";
import {
  PASSWORD_REGEX,
  PERMISSION_REGEX,
  USER_NAME_REGEX
} from "~/constants/regex";
import { formatSpaceNumber } from "~/util/number";
import { objectIsEmpty } from "~/helpers/ultis";
import {
  isFacebookVideoURL,
  isTiktokVideoURL,
  isYoutubeVideoURL
} from "~/util/embed";

Vue.config.performance = true;

Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);

interface Range {
  min: number;
  max: number;
}

setInteractionMode("aggressive");

const validate$o = function(value, _a) {
  const allowFalse = (_a === void 0 ? { allowFalse: true } : _a).allowFalse;
  const result = {
    valid: false,
    required: true
  };
  if (
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && objectIsEmpty(value))
  ) {
    return result;
  }
  // incase a field considers `false` as an empty value like checkboxes.
  if (value === false && !allowFalse) {
    return result;
  }
  result.valid = !!String(value).trim().length;
  return result;
};
const params$h = [
  {
    name: "allowFalse",
    default: true
  }
];
const required = {
  validate: validate$o,
  params: params$h,
  computesRequired: true
};

extend("required", required);
extend("max", max);
extend("min", min);

extend("email", {
  message: "Địa chỉ email không hợp lệ",
  validate(value) {
    return EMAIL_REGEX.test(value);
  }
});
extend("email_list", {
  message: "Một trong số các địa chỉ email không hợp lệ",
  validate(value) {
    return value.every(e => {
      return EMAIL_REGEX.test(e);
    });
  }
});
extend("confirmed", confirmed);
extend("numeric", numeric);
extend("min_value", {
  ...min_value,
  message: (field, data) => {
    return `${field} phải lớn hơn hoặc bằng ${formatSpaceNumber(data.min)}`;
  }
});
extend("max_value", {
  ...max_value,
  message: (field, data) => {
    return `${field} phải nhỏ hơn hoặc bằng ${formatSpaceNumber(data.max)}`;
  }
});

extend("integer", {
  ...integer,
  message: (field, data) => {
    return `${field} phải là số nguyên`;
  }
});

extend("between", between);
extend("ip", {
  message: "",
  validate(value) {
    return IP_REGEX.test(value);
  }
});
extend("ip_subnet", {
  message: "",
  validate(value) {
    return IP_WITH_SUBNET_REGEX.test(value);
  }
});
extend("link", value => {
  const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  const regex = new RegExp(expression);
  if (value.match(regex)) {
    return true;
  }
  return "Link không đúng định dạng";
});
extend("parameterNameCheck", {
  message:
    "Tên tham số bắt đầu bằng chữ cái, chỉ bao gồm chữ cái, chữ số và dấu gạch dưới",
  validate(value) {
    return PARAMETER_NAME_CHECK_REGEX.test(value);
  }
});

extend("isPassword", {
  message: "",
  validate(value) {
    return PASSWORD_REGEX.test(value);
  }
});
extend("phone", {
  message: "",
  validate(value) {
    return PHONE_REGEX.test(value);
  }
});

extend("url", {
  message: "",
  validate(value) {
    return URL_REGEX.test(value);
  }
});

extend("vietnameseCheck", {
  message: "Không bao gồm chữ có dấu",
  validate(value) {
    return VIETNAMESE_CHECK_REGEX.test(value);
  }
});

extend("spaceCheck", {
  message: "Không bao gồm dấu cách",
  validate(value) {
    return SPACE_REGEX.test(value);
  }
});

extend("isUsername", {
  message: "",
  validate(value) {
    return USER_NAME_REGEX.test(value);
  }
});

extend("parameterNameSpecial", {
  message: "",
  validate(value) {
    return PARAMETER_NAME_REGEX.test(value);
  }
});

extend("isPermissionName", {
  message: "",
  validate(value) {
    return PERMISSION_REGEX.test(value);
  }
});

extend("notEmpty", {
  message: "",
  validate(value) {
    if (isArray(value)) {
      return value.length > 0;
    } else if (isObject(value)) {
      return Object.keys(value).length > 0;
    } else {
      return !!value;
    }
  }
});

extend("confirmedTarget", {
  message: "",
  validate(value: any, target: { aid: string }) {
    if (
      value !== null &&
      value !== undefined &&
      target !== null &&
      target !== undefined &&
      target.aid !== null &&
      target.aid !== undefined
    ) {
      return value === target.aid;
    } else {
      return false;
    }
  },
  params: [
    {
      name: "aid",
      isTarget: true
    }
  ]
});

extend("timeLTE", {
  params: [
    {
      name: "value",
      isTarget: true
    },
    "min"
  ],
  validate: (value, target) => {
    const { value: valueTarget, min: minValue = 0 } = target || {};
    try {
      if (!valueTarget || !value) return true;
      const moment1 = moment(valueTarget, "HH:mm:ss");
      const moment2 = moment(value, "HH:mm:ss");
      return moment1.diff(moment2, "s") - minValue * 60 >= 0;
    } catch (e) {
      return false;
    }
  },
  message: "{_field_} phải nhỏ hơn hoặc bằng {value} ít nhất {min} phút"
});

extend("timeGTE", {
  params: [
    {
      name: "value",
      isTarget: true
    },
    "min"
  ],
  validate: (value, target) => {
    const { value: valueTarget, min: minValue = 0 } = target || {};
    try {
      if (!valueTarget || !value) return true;
      const moment1 = moment(valueTarget, "HH:mm:ss");
      const moment2 = moment(value, "HH:mm:ss");
      return moment2.diff(moment1, "s") - minValue * 60 >= 0;
    } catch (e) {
      return false;
    }
  },
  message: "{_field_} phải lớn hơn hoặc bằng {value} ít nhất {min} phút"
});

extend("dateLessOrNull", {
  params: ["valueTarget", "label"],
  validate: (valueDateRange, target) => {
    const { valueTarget = "" } = target || {};
    try {
      if (!valueTarget || !valueDateRange) return true;
      const dates = valueDateRange.split(" đến ");
      const value = dates[dates?.length - 1];
      const moment1 = moment(valueTarget, DATE);
      const moment2 = moment(value, DATE);
      return moment1.diff(moment2, "day") <= 0;
    } catch (e) {
      return false;
    }
  },
  message: (field, data) => {
    return `${field} phải bao gồm ${data.label}`;
  }
});

extend("dateInOrNull", {
  params: ["valueTarget", "label"],
  validate: (valueDateRange, target) => {
    const DATE_RANGE_REGEX = /(Từ |từ )?([0-9/]*)( đến | Đến )?([0-9/]*)/gm;
    const { valueTarget = "" } = target || {};
    try {
      if (!valueTarget || !valueDateRange) return true;

      const dateRangeExec = DATE_RANGE_REGEX.exec(valueDateRange) || [];
      const startDate = dateRangeExec[2];
      const endDate = dateRangeExec[4];
      const startDateTime = moment(startDate, DATE)
        .toDate()
        .getTime();
      const endDateTime = endDate
        ? moment(endDate, DATE)
            .toDate()
            .getTime()
        : startDateTime;
      const valueDateTime = moment(valueTarget, DATE)
        .toDate()
        .getTime();
      return startDateTime <= valueDateTime && valueDateTime <= endDateTime;
    } catch (e) {
      return false;
    }
  },
  message: (field, data) => {
    return `${field} phải bao gồm ${data.label}`;
  }
});

extend("dateInOrNullMax", {
  params: ["valueTarget", "label"],
  validate: (valueDateRange, target) => {
    const DATE_RANGE_REGEX = /(Từ |từ )?([0-9/]*)( đến | Đến )?([0-9/]*)/gm;
    const { valueTarget = "" } = target || {};
    try {
      if (!valueTarget || !valueDateRange) return true;

      const dateRangeExec = DATE_RANGE_REGEX.exec(valueDateRange) || [];
      const startDate = dateRangeExec[2];
      const endDate = dateRangeExec[4];
      const startDateTime = moment(startDate, DATE)
        .toDate()
        .getTime();
      const endDateTime = endDate
        ? moment(endDate, DATE)
            .toDate()
            .getTime()
        : startDateTime;
      const valueDateTime = moment(valueTarget, DATE)
        .toDate()
        .getTime();
      return startDateTime <= valueDateTime && valueDateTime <= endDateTime;
    } catch (e) {
      return false;
    }
  },
  message: (field, data) => {
    return `${field} phải bao gồm ${data.label}`;
  }
});

extend("dateGreaterOrNull", {
  params: ["valueTarget", "label"],
  validate: (valueDateRange, target) => {
    const { valueTarget = "" } = target || {};
    try {
      if (!valueTarget || !valueDateRange) return true;
      const [value] = valueDateRange.split(" đến ");
      const moment1 = moment(valueTarget, DATE);
      const moment2 = moment(value, DATE);
      return moment1.diff(moment2, "day") >= 0;
    } catch (e) {
      return false;
    }
  },
  message: (field, data) => {
    return `${field} phải bao gồm ${data.label}`;
  }
});

extend("lessOrNull", {
  params: [
    {
      name: "value",
      isTarget: true
    },
    "min"
  ],
  validate: (value: any, target: { min: number; value: any }) => {
    const minValue = target.min || 0;
    return !(
      !isEmpty(value) &&
      !isEmpty(target?.value) &&
      value > target?.value - minValue
    );
  },
  message: (field, data) => {
    const minValue = data.min || 0;
    if (minValue === 0) {
      return `${field} phải nhỏ hơn hoặc bằng ${formatSpaceNumber(
        data._value_
      )}`;
    } else if (minValue === 1) {
      return `${field} phải nhỏ hơn ${formatSpaceNumber(data._value_)}`;
    } else {
      return `${field} phải nhỏ hơn ${formatSpaceNumber(
        data._value_ - minValue
      )}`;
    }
  }
});

extend("greaterOrNull", {
  params: [
    {
      name: "value",
      isTarget: true
    },
    "min"
  ],
  validate: (value: any, target: { min: number; value: any }) => {
    const minValue = target.min || 0;
    return !(
      !isEmpty(value) &&
      !isEmpty(target?.value) &&
      value < target?.value + minValue
    );
  },
  message: (field, data) => {
    const minValue = data.min || 0;
    if (minValue === 0) {
      return `${field} phải lớn hơn hoặc bằng ${formatSpaceNumber(
        data._value_
      )}`;
    } else if (minValue === 1) {
      return `${field} phải lớn hơn ${formatSpaceNumber(data._value_)}`;
    } else {
      return `${field} phải lớn hơn ${formatSpaceNumber(
        data._value_ - minValue
      )}`;
    }
  }
});

extend("rangeMinDifferent", {
  params: ["min"],
  validate: (value: Range, args: { min: number }) => {
    const minValue = args.min || 0;
    if (value?.min && value?.max) {
      if (value.max - value.min < minValue) {
        return `Khoảng cách phải lớn hơn ${minValue}`;
      }
    }
    return true;
  }
});

extend("rangeMaxDifferent", {
  params: ["max"],
  validate: (value: Range, args: { max: number }) => {
    const maxValue = args.max || 0;
    if (value?.min && value?.max) {
      if (value.max - value.min > maxValue) {
        return `Khoảng cách phải nhỏ hơn ${maxValue}`;
      }
    }
    return true;
  }
});

extend("existCharacter", {
  validate: value => {
    if (!isEmpty(value)) {
      return BRAND_NAME_EXIST_CHARACTER_REGEX.test(value);
    }
    return true;
  },
  message: "{_field_} phải bao gồm chữ"
});

extend("stringBrandName", {
  validate: value => {
    if (!isEmpty(value)) {
      const matchBrandName = value.match(BRAND_NAME_CHARACTER_APPROVE_REGEX);
      return matchBrandName && matchBrandName?.[0] === value;
    }
    return true;
  },
  message: "{_field_} chỉ chứa các ký tự Latin, chữ số hoặc (-), (_), (.), ( )"
});

extend("isTaxNumber", {
  message: "{_field_} chỉ chứa các ký tự số hoặc dấu -",
  validate(value) {
    return TAX_NUMBER_REGEX.test(value);
  }
});

extend("parameterName", {
  validate: value => {
    const pattern = /[a-zA-Z][a-zA-Z_0-9]*$/;
    return pattern.test(value);
  },
  message:
    "Tên tham số bắt đầu bằng chữ cái, chỉ bao gồm chữ cái, chữ số và dấu gạch dưới"
});

localize("vi", {
  messages: {
    isPassword:
      "Mật khẩu phải bao gồm chữ hoa, chữ thường, số, kí tự đặc biệt và tối thiểu 8 kí tự",
    isUsername:
      "Tên tài khoản chỉ sử dụng chữ cái không dấu hoặc chữ số và không được bắt đầu bằng chữ số",
    ip: "Địa chỉ ip không hợp lệ",
    ip_subnet: "Địa chỉ ip không hợp lệ",
    isPermissionName: "Tên quyền không được chứa ký tự & hoặc |",
    url: "Đường dẫn không đúng định dạng",
    notEmpty: "{_field_} là bắt buộc",
    confirmedTarget: "{_field_} khác với {aid}",
    phone: "Số điện thoại không hợp lệ",
    parameterNameSpecial:
      "Tên tham số chỉ bao gồm chữ cái, chữ số và dấu gạch dưới"
  }
});
localize({
  vi
});

extend("requiredCron", {
  ...required,
  message: "Lịch gửi bắt buộc"
});

extend("minMinute", value => {
  if (value > 0) {
    return true;
  }
  return "Vui lòng nhập số phút lớn hơn 0";
});

extend("minHour", value => {
  if (value > 0) {
    return true;
  }
  return "Vui lòng nhập số giờ lớn hơn 0";
});

extend("minDay", value => {
  if (value > 0) {
    return true;
  }
  return "Vui lòng nhập số ngày lớn hơn 0";
});

extend("minMonth", value => {
  if (value > 0) {
    return true;
  }
  return "Vui lòng nhập số tháng lớn hơn 0";
});

extend("notEmpty", value => {
  if (value[0] !== "" && value[1] !== "") {
    return true;
  }
  return "Lịch gửi bắt buộc";
});

extend("max59", value => {
  if (value <= 59) {
    return true;
  }
  return "Vui lòng nhập số phút nhỏ hơn 60";
});

extend("max31", value => {
  if (value <= 31) {
    return true;
  }
  return "Vui lòng nhập số ngày nhỏ hơn 32";
});

extend("requiredAdvanced", value => {
  if (translateCron(value)) {
    return true;
  }
  return "Lịch gửi bắt buộc";
});

const cronValidator = require("cron-validator");
extend("cronValidator", value => {
  if (cronValidator.isValidCron(value)) {
    return true;
  }
  return "Vui lòng nhập đúng định dạng";
});

extend("requiredHour", value => {
  const temporary = value.split(/\s+/);
  if (temporary && temporary[1] !== "*") {
    return true;
  }
  return "Bắt buộc phải là giờ";
});

extend("requiredDay", value => {
  const temporary = value.split(/\s+/);
  if (temporary && temporary[2] !== "*") {
    return true;
  }
  return "Bắt buộc phải là ngày";
});
extend("fileUpload", (value, params) => {
  if (params[0] === "false") {
    return true;
  }
  return "Tài liệu đang được upload, vui lòng chờ !";
});
extend("requiredObject", value => {
  try {
    const data = JSON.parse(value);
    if (data && data.length > 0) {
      return true;
    } else {
      return "Mảng cần chứa object và có field: key, text, tags";
    }
  } catch (e) {
    return "Định dạng là array, mỗi object và có field: key, text, tags";
  }
});
extend("Object", value => {
  try {
    JSON.parse(value);
  } catch (e) {
    return "Định dạng là array, mỗi object và có field: key, text, tags";
  }
  return true;
});

extend("isCodeRedirect", {
  message:
    "Mã bắt đầu bằng chữ Latinh, chỉ bao gồm chữ Latinh, chữ số và dấu gạch dưới, dấu chấm, dấu gạch ngang",
  validate(value) {
    return CODE_REDIRECT_REGEX.test(value);
  }
});

extend("isEmbed", {
  message: "Đường dẫn này không hỗ trợ nhúng",
  validate(value) {
    return (
      isYoutubeVideoURL(value) ||
      isTiktokVideoURL(value) ||
      isFacebookVideoURL(value)
    );
  }
});

extend("compareGreaterValue", (value, params : any) => {
  const [max, min] = params;
  if (Number(max) >= Number(min)) {
    return true;
  } else {
    return `Độ dài content không được lớn hơn ${max} kí tự`;
  }
});

extend("XORFieldEmpty", {
  params: [
    {
      name: "valueXOR",
      isTarget: true
    }
  ],
  validate: (value, target) => {
    const { valueXOR } = target || {};
    return isEmpty(valueXOR) || isEmpty(value);
  },
  message: "Chỉ được nhập chỉ số tối đa 1 trường cho {_field_} và {valueXOR}"
});
