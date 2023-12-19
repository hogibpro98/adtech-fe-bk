import { HTTP_CODE_422 } from "~/constants/code";
import { responseErrorToString } from "~/util/array";

export const httpError = (code: string): string => {
  switch (parseInt(code, 10)) {
    case 401:
      return "Đã hết phiên làm việc, vui lòng đăng nhập lại.";
    case 402:
      return "Tài khoản không đủ tiền, vui lòng nạp thêm.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tồn tại trang này.";
    case 413:
      return "File tải lên quá lớn.";
    case 429:
      return "Thao tác quá nhiều lần, vui lòng thử lại sau 1 phút";
    default:
      return "Máy chủ đang bận, vui lòng thử lại sau";
  }
};

export const showMessageError = (toast, e) => {
  if (e.response && e.response.status === HTTP_CODE_422) {
    toast.global.server_error_msg(
      responseErrorToString(e.response.data.errors)
    );
  } else if (e?.response?.data?.message) {
    toast.global.server_error_msg(e?.response?.data?.message);
  } else {
    toast.global.action_fail();
  }
};
