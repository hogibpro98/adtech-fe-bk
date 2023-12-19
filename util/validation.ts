import { EMAIL_PATTERN } from "~/constants/regex";

export const rules = {
  required: value => !!value || "Trường này là bắt buộc.",
  email: value => {
    return EMAIL_PATTERN.test(value) || "Email không hợp lệ";
  }
};
