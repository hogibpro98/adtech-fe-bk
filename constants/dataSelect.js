// @ts-ignore
import moment from 'moment/src/moment';

export const SELECT_USER_STATUS = [
  {
    value: "PENDING",
    text: "Chờ phê duyệt"
  },
  {
    value: "VERIFIED",
    text: "Chưa kích hoạt"
  },
  {
    value: "ACTIVE",
    text: "Đang sử dụng"
  },
  {
    value: "LOCKED",
    text: "Đã khóa"
  }
];

export const SELECT_MMS_TYPE = [
  {
    value: 0,
    text: "Chăm sóc khách hàng"
  },
  {
    value: 1,
    text: "Quảng cáo"
  }
];

export const SELECT_BANNER_ACTION = [
  {
    value: "banner_view",
    text: "view"
  },
  {
    value: "banner_click",
    text: "click"
  }
];

export const MEDIA_TYPES = [
  {
    text: "Hình ảnh",
    value: "image"
  },
  {
    text: "Video",
    value: "video"
  },
  {
    text: "Audio",
    value: "audio"
  },
  {
    text: "Văn bản",
    value: "text"
  },
  {
    text: "Nhúng",
    value: "embed"
  }
];

export const SELECT_ADVERTISER_STATUS = [
  {
    value: "VERIFIED",
    text: "Chưa kích hoạt"
  },
  {
    value: "ACTIVE",
    text: "Đang sử dụng"
  },
  {
    value: "DELETED",
    text: "Đã khóa"
  }
];

export const DEVICES = [
  {
    value: "smart-phone",
    text: "Điện thoại"
  },
  {
    value: "computer",
    text: "Máy tính"
  }
];

export const PLATFORM = [
  {
    value: "web",
    text: "Trình duyệt"
  },
  {
    value: "app",
    text: "Ứng dụng"
  }
];

export const BANNER_MMS_CONTENT_TYPE = [
  {
    value: "header",
    text: "Header"
  },
  {
    value: "text",
    text: "Nội dung chữ"
  },
  {
    value: "image",
    text: "Hình ảnh"
  },
  {
    value: "video",
    text: "Video"
  }
];

export const STATUS_CAMPAIGN = [
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const STATUS_BRANDNAME = [
  {
    value: "approve",
    color: "warning ",
    text: "Đang chờ duyệt"
  },
  {
    value: "active",
    color: "success",
    text: "Đang hoạt động"
  },
  {
    value: "inactive",
    color: "purple",
    text: "Dừng hoạt động"
  }
  // {
  //   value: "stop",
  //   color: "default",
  //   text: "Đã dừng chạy"
  // }
];

export const STATUS_BANNER_MMS = [
  {
    value: "created",
    color: "warning",
    text: "Đang tạo Template ID"
  },
  {
    value: "created_template_success",
    color: "warning",
    text: "Chờ phê duyệt Template"
  },
  {
    value: "created_template_fail",
    color: "error",
    text: "Tạo Template ID thất bại"
  },
  {
    value: "reject_targeting",
    color: "error",
    text: "Targeting không hợp lệ"
  },
  {
    value: "reject_template",
    color: "error",
    text: "Từ chối phê duyệt template"
  },
  // {
  //   value: "approve_template",
  //   color: "primary",
  //   text: "Chờ phê duyệt nội dung"
  // },
  {
    value: "reject",
    color: "error",
    text: "Từ chối phê duyệt nội dung"
  },
  // {
  //   value: "approve",
  //   color: "info",
  //   text: "Đã phê duyệt nội dung"
  // },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const STATUS_BANNER_MMS_FILTER = [
  {
    value: "created",
    color: "warning",
    text: "Đang tạo Template ID"
  },
  {
    value: "created_template_success",
    color: "warning",
    text: "Chờ phê duyệt Template"
  },
  {
    value: "created_template_fail",
    color: "error",
    text: "Tạo Template ID thất bại"
  },
  // {
  //   value: "reject_targeting",
  //   color: "error",
  //   text: "Targeting không hợp lệ"
  // },
  {
    value: "reject_template",
    color: "error",
    text: "Từ chối phê duyệt template"
  },
  // {
  //   value: "approve_template",
  //   color: "primary",
  //   text: "Chờ phê duyệt nội dung"
  // },
  // {
  //   value: "reject",
  //   color: "error",
  //   text: "Từ chối phê duyệt nội dung"
  // },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const STATUS_BANNER_SMS_VENDOR_FILTER = [
  // {
  //   value: "created",
  //   color: "warning",
  //   text: "Đang tạo Template ID"
  // },
  {
    value: "created_template_success",
    color: "warning",
    text: "Chờ phê duyệt Template"
  },
  // {
  //   value: "created_template_fail",
  //   color: "error",
  //   text: "Tạo Template ID thất bại"
  // },
  // {
  //   value: "reject_targeting",
  //   color: "error",
  //   text: "Targeting không hợp lệ"
  // },
  {
    value: "reject_template",
    color: "error",
    text: "Từ chối phê duyệt template"
  },
  // {
  //   value: "approve_template",
  //   color: "primary",
  //   text: "Chờ phê duyệt nội dung"
  // },
  // {
  //   value: "reject",
  //   color: "error",
  //   text: "Từ chối phê duyệt nội dung"
  // },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const STATUS_ADS_DATA_FILTER = [
  {
    value: "calculating",
    color: "primary",
    text: "Đang tính toán"
  },
  {
    value: "confirming",
    color: "warning",
    text: "Chờ xác nhận"
  },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const STATUS_BANNER_REDIRECT = [
  {
    value: "created",
    color: "warning",
    text: "Chờ phê duyệt"
  },
  {
    value: "reject",
    color: "error",
    text: "Từ chối phê duyệt"
  },
  {
    value: "approve",
    color: "info",
    text: "Đã phê duyệt"
  },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const STATUS_BANNER_REDIRECT_FILTER = [
  {
    value: "created",
    color: "warning",
    text: "Chờ phê duyệt"
  },
  {
    value: "reject",
    color: "error",
    text: "Từ chối phê duyệt"
  },
  {
    value: "waiting",
    color: "warning",
    text: "Chờ chạy"
  },
  {
    value: "running",
    color: "success",
    text: "Đang chạy"
  },
  {
    value: "pause",
    color: "purple",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "default",
    text: "Đã dừng chạy"
  }
];

export const IS_DEFAULT_ADS = [
  {
    value: 0,
    text: "Không"
  },
  {
    value: 1,
    text: "Có"
  }
];

export const STATUS_BRAND_NAME = [
  {
    color: "default",
    value: "created",
    text: "Chờ phê duyệt"
  },
  {
    color: "warning",
    value: "creating",
    text: "Đang xử lý"
  },
  {
    color: "error",
    value: "reject",
    text: "Từ chối phê duyệt"
  },
  {
    color: "success",
    value: "approve",
    text: "Đã phê duyệt"
  },
  {
    color: "success",
    value: "active",
    text: "Đang sử dụng"
  },
  {
    color: "error",
    value: "inactive",
    text: "Đã khóa"
  },
  {
    color: "warning",
    value: "processing",
    text: "Đang đồng bộ"
  }
];

export const STATUS_BRAND_NAME_FILTER = [
  {
    color: "success",
    value: "active",
    text: "Đang sử dụng"
  },
  {
    color: "warning",
    value: "inactive",
    text: "Đã khóa"
  }
];

export const STATUS_BRAND_NAME_FILTER_CREATE_REQUEST = [
  {
    color: "default",
    value: "created",
    text: "Chờ phê duyệt"
  },
  {
    color: "warning",
    value: "creating",
    text: "Đang xử lý"
  },
  {
    color: "error",
    value: "reject",
    text: "Từ chối phê duyệt"
  },
  {
    color: "success",
    value: "approve",
    text: "Đã phê duyệt"
  }
];

export const INVOICE_STATUS = [
  {
    color: "error",
    value: "failed",
    text: "Tạo thất bại"
  },
  {
    color: "success",
    value: "exported",
    text: "Đã xuất"
  }
];

export const STATUS_ORDER_RECHARGE_NAME = [
  {
    color: "warning",
    value: "PENDING",
    text: "Chờ phê duyệt"
  },
  {
    color: "warning",
    value: "PROCESSING",
    text: "Đang trong quá trình thanh toán"
  },
  {
    color: "info",
    value: "WAITING",
    text: "Chờ thanh toán"
  },
  {
    color: "info",
    value: "CHECKING",
    text: "Chờ xác nhận"
  },
  {
    color: "error",
    value: "REJECTED",
    text: "Từ chối phê duyệt"
  },
  {
    color: "success",
    value: "APPROVED",
    text: "Đã phê duyệt"
  }
];

export const RUN_STATUS_BANNER = [
  {
    value: "running",
    color: "success",
    text: "Đang bật"
  },
  {
    value: "pause",
    color: "purple",
    icon: "pause_circle_filled",
    text: "Tạm dừng"
  },
  {
    value: "stop",
    color: "disabled",
    text: "Đã dừng lại"
  },
  {
    value: "pending",
    color: "warning",
    text: "Đang chờ"
  }
];

export const LEVEL_LOCATIONS = [
  {
    value: "tq",
    text: "Toàn quốc"
  },
  {
    value: "province_home",
    text: "Tỉnh, Thành phố"
  },
  {
    value: "district_home",
    text: "Quận, Huyện, Thị xã"
  }
];

export const PAYMENT_METHOD = [
  {
    value: 1,
    text: "Tiền mặt"
  },
  {
    value: 2,
    text: "Chuyển khoản"
  },
  {
    value: 3,
    text: "Thương mại điện tử - POS"
  },
  {
    value: 4,
    text: "Khuyến mại không thu tiền"
  },
  {
    value: 5,
    text: "Chứng thư bảo lãnh"
  },
  {
    value: 6,
    text: "Uỷ thác quản lý hàng (Qua ngân hàng)"
  },
  {
    value: 7,
    text: "Chuyển khoản/Tiền mặt"
  },
  {
    value: 8,
    text: "Thanh toán Online trên VTSHOP"
  },
  {
    value: 9,
    text: "Biếu tặng không thu tiền"
  },
  {
    value: 10,
    text: "Bằng TKTT"
  },
  {
    value: 11,
    text: "Hình thức khác"
  },
  {
    value: 12,
    text: "Gach no Anypay tai cua hang"
  },
  {
    value: 16,
    text: "Thanh toán qua Bankplus"
  },
  {
    value: 17,
    text: "Thanh toán qua POSEDC"
  },
  {
    value: 18,
    text: "Thanh toán qua ViettelPay"
  }
];

export const VAT_TYPES = [
  {
    value: -1,
    text: "Không chịu thuế"
  },
  {
    value: 0,
    text: "0%"
  },
  {
    value: 5,
    text: "5%"
  },
  {
    value: 8,
    text: "8%"
  },
  {
    value: 10,
    text: "10%"
  }
];

export const STEPS_BANNER = [
  {
    index: 1,
    name: "Thông tin trang đích",
    title:
      "Cho chúng tôi biết người dùng sẽ tới đâu sau khi click vào quảng cáo",
    classContent: "max-w-2xl"
  },
  {
    index: 2,
    name: "Thông tin chiến dịch",
    title: "Thêm thông tin chiến dịch cho quảng cáo của bạn",
    classContent: "max-w-2xl"
  },
  {
    index: 3,
    name: "Thông tin quảng cáo",
    title: "Nhập thông tin cho quảng cáo của bạn",
    classContent: "max-w-3xl"
  },
  {
    index: 3,
    hiddenTitle: true,
    title: "Thêm thông tin đối tượng mục tiêu cho quảng cáo",
    classContent: "max-w-2xl"
  },
  // {
  //   index: 3,
  //   hiddenTitle: true,
  //   title: "Thêm thông tin đối tượng mục tiêu cho quảng cáo",
  //   classContent: "max-w-2xl"
  // },
  // {
  //   index: 3,
  //   hiddenTitle: true,
  //   title: "Thêm thông tin đối tượng mục tiêu cho quảng cáo",
  //   classContent: "max-w-2xl"
  // },
  {
    index: 3,
    title: "Tích hợp tài trợ data",
    hiddenTitle: true,
    classContent: "max-w-2xl"
  },
  {
    index: 4,
    name: "Ngân sách quảng cáo",
    title: "Đặt ngân sách cho quảng cáo",
    classContent: "max-w-2xl"
  },
  {
    index: 5,
    name: "Xác nhận thông tin",
    title: "Xem lại quảng cáo của bạn đảm bảo rằng nó chính xác",
    classContent: "max-w-3xl"
  }
];
export const STEPS_BANNER_MMS = [
  {
    index: 1,
    name: "Thông tin chiến dịch",
    title: "Thêm thông tin chiến dịch cho quảng cáo của bạn",
    classContent: "max-w-2xl"
  },
  {
    index: 2,
    name: "Thông tin quảng cáo",
    title: "Nhập thông tin cho tin nhắn của bạn",
    classContent: "max-w-3xl"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Chọn cách thiết lập đối tượng quảng cáo",
    classContent: "max-w-2xl"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Thêm thông tin đối tượng mục tiêu cho quảng cáo",
    classContent: "max-w-2xl",
    targetingType: "targeting"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Tải lên đối tượng quảng cáo",
    classContent: "max-w-2xl",
    targetingType: "import_file"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Chọn nhóm thuê bao đối tượng quảng cáo",
    classContent: "max-w-2xl",
    targetingType: "phone_group"
  },
  {
    index: 3,
    name: "Ngân sách quảng cáo",
    title: "Đặt ngân sách cho quảng cáo",
    classContent: "max-w-2xl"
  },
  {
    index: 4,
    name: "Xác nhận thông tin",
    title: "Xem lại quảng cáo của bạn đảm bảo rằng nó chính xác",
    classContent: "max-w-3xl"
  }
];
export const STEPS_BANNER_SMS_VENDOR = [
  {
    index: 1,
    name: "Thông tin chiến dịch",
    title: "Thêm thông tin chiến dịch cho quảng cáo của bạn",
    classContent: "max-w-2xl"
  },
  {
    index: 2,
    name: "Thông tin quảng cáo",
    title: "Nhập thông tin cho tin nhắn của bạn",
    classContent: "max-w-3xl"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Chọn cách thiết lập đối tượng mục tiêu",
    classContent: "max-w-2xl"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Thêm thông tin đối tượng mục tiêu cho quảng cáo",
    classContent: "max-w-2xl",
    targetingType: "targeting"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Tải lên đối tượng quảng cáo",
    classContent: "max-w-2xl",
    targetingType: "import_file"
  },
  {
    index: 2,
    hiddenTitle: true,
    title: "Chọn nhóm thuê bao đối tượng quảng cáo",
    classContent: "max-w-2xl",
    targetingType: "phone_group"
  },
  {
    index: 3,
    name: "Ngân sách quảng cáo",
    title: "Đặt ngân sách cho quảng cáo",
    classContent: "max-w-2xl"
  },
  {
    index: 4,
    name: "Xác nhận thông tin",
    title: "Xem lại quảng cáo của bạn đảm bảo rằng nó chính xác",
    classContent: "max-w-3xl"
  }
];

export const STEPS_CLONE_CAMPAIGN = [
  {
    index: 1,
    name: "Sao chép chiến dịch",
    title: "Nhập thông tin chiến dịch của bạn",
    classContent: "max-w-2xl"
  },
  {
    index: 2,
    name: "Sao chép quảng cáo của chiến dịch",
    title: "Chọn quảng cáo mà bạn muốn sao chép",
    classContent: "max-w-full"
  }
];

export const TYPE_TRANSACTION_REDIRECT = [
  {
    color: "default",
    value: "charge",
    text: "Trừ tiền quảng cáo"
  },
  {
    color: "success",
    value: "recharge",
    text: "Chuyển tiền dịch vụ"
  }
];
export const USER_STATUS_MAP = {
  PENDING: {
    color: "warning",
    text: "Chờ phê duyệt"
  },
  VERIFIED: {
    color: "info",
    text: "Chưa kích hoạt"
  },
  ACTIVE: {
    color: "success",
    text: "Đang sử dụng"
  },
  LOCKED: {
    color: "error",
    text: "Đã khóa"
  },
  INVALID: {
    color: "error",
    text: "Từ chối phê duyệt"
  },
  DELETED: {
    color: "error",
    text: "Đã khóa"
  },
  pending: {
    color: "warning",
    text: "Chờ phê duyệt"
  },
  verified: {
    color: "info",
    text: "Chưa kích hoạt"
  },
  active: {
    color: "success",
    text: "Đang sử dụng"
  },
  locked: {
    color: "error",
    text: "Đã khóa"
  },
  invalid: {
    color: "error",
    text: "Từ chối phê duyệt"
  },
  deleted: {
    color: "error",
    text: "Đã khóa"
  }
};

export const DATE_RANGE_FUTURE = [
  {
    label: "Tuần này",
    getDateRange: () => [
      moment()
        .startOf("week")
        .toDate(),
      moment()
        .endOf("week")
        .toDate()
    ]
  },
  {
    label: "Tuần trước",
    getDateRange: () => [
      moment()
        .subtract(1, "week")
        .startOf("week")
        .toDate(),
      moment()
        .subtract(1, "week")
        .endOf("week")
        .toDate()
    ]
  },
  {
    label: "Tháng này",
    getDateRange: () => [
      moment()
        .startOf("month")
        .toDate(),
      moment()
        .endOf("month")
        .toDate()
    ]
  },
  {
    label: "Tháng trước",
    getDateRange: () => [
      moment()
        .subtract(1, "month")
        .startOf("month")
        .toDate(),
      moment()
        .subtract(1, "month")
        .endOf("month")
        .toDate()
    ]
  },
  {
    label: "Một tuần",
    getDateRange: () => [
      moment().toDate(),
      moment()
        .add(6, "days")
        .toDate()
    ]
  },
  {
    label: "Hai tuần",
    getDateRange: () => [
      moment().toDate(),
      moment()
        .add(13, "days")
        .toDate()
    ]
  },
  {
    label: "Một tháng",
    getDateRange: () => [
      moment().toDate(),
      moment()
        .add(29, "days")
        .toDate()
    ]
  },
  {
    label: "Ba tháng",
    getDateRange: () => [
      moment().toDate(),
      moment()
        .add(89, "days")
        .toDate()
    ]
  },
  {
    label: "Đến hết tuần",
    getDateRange: () => [
      moment().toDate(),
      moment()
        .endOf("week")
        .toDate()
    ]
  },
  {
    label: "Đến hết tháng",
    getDateRange: () => [
      moment().toDate(),
      moment()
        .endOf("month")
        .toDate()
    ]
  },
  {
    label: "Tuần sau",
    getDateRange: () => [
      moment()
        .add(1, "week")
        .startOf("week")
        .toDate(),
      moment()
        .add(1, "week")
        .endOf("week")
        .toDate()
    ]
  },
  {
    label: "Tháng sau",
    getDateRange: () => [
      moment()
        .add(1, "month")
        .startOf("month")
        .toDate(),
      moment()
        .add(1, "month")
        .endOf("month")
        .toDate()
    ]
  }
];

export const LAYOUT_FONTS = [
  {
    value: "Arial",
    text: "Arial"
  },
  {
    value: "Times New Roman",
    text: "Times New Roman"
  },
  {
    value: "Open Sans",
    text: "Open Sans"
  },
  {
    value: "Roboto",
    text: "Roboto"
  }
];

export const WIDTH_UNITS = [
  {
    value: "px",
    text: "px"
  },
  {
    value: "%",
    text: "%"
  }
];

export const ASPECT_RATIOS = [
  {
    value: "1.91:1",
    text: "1.91:1"
  },
  {
    value: "1:1",
    text: "1:1"
  }
];

export const DAY_SELECT = [
  {
    value: "Mon",
    text: "T2"
  },

  {
    value: "Tue",
    text: "T3"
  },
  {
    value: "Wed",
    text: "T4"
  },
  {
    value: "Thu",
    text: "T5"
  },
  {
    value: "Fri",
    text: "T6"
  },
  {
    value: "Sat",
    text: "T7"
  },
  {
    value: "Sun",
    text: "CN"
  }
];

export const FREQUENCY_SELECT = [
  {
    value: "month",
    text: "Tháng"
  },
  {
    value: "week",
    text: "Tuần"
  },
  {
    value: "day",
    text: "Ngày"
  }
];

export const TARGETING_SELECT = [
  {
    value: "location",
    text: "Vị trí"
  },
  {
    value: "age",
    text: "Độ tuổi"
  },
  {
    value: "gender",
    text: "Giới tính"
  },
  {
    value: "relationship",
    text: "Tình trạng hôn nhân"
  },
  {
    value: "os",
    text: "Hệ điều hành"
  },
  {
    value: "device",
    text: "Thiết bị sử dụng"
  },
  {
    value: "phone-name",
    text: "Điện thoại sử dụng"
  },
  {
    value: "network-data",
    text: "Gói data sử dụng"
  },
  {
    value: "service-package",
    text: "Gói cước sử dụng"
  },
  {
    value: "sim-age",
    text: "Tuổi thuê bao"
  },
  {
    value: "data-fee",
    text: "Tiêu dùng data"
  },
  {
    value: "phone-fee",
    text: "Tiêu dùng thoại"
  },
  {
    value: "arpu",
    text: "Tiêu dùng trung bình"
  }
];

export const POSITION_STICKY_TYPES = {
  FIXED: "fixed",
  ABSOLUTE: "absolute"
};

export const DISPLAY_TYPES = {
  BANNER: "banner",
  NATIVE: "native",
  STICKY: "sticky",
  POPUP: "popup",
  INTERSTITIAL: "interstitial"
};

export const DISPLAY_TYPE_SELECT = [
  {
    value: DISPLAY_TYPES.BANNER,
    text: "Banner"
  },
  {
    value: DISPLAY_TYPES.NATIVE,
    text: "Native"
  },
  {
    value: DISPLAY_TYPES.STICKY,
    text: "Sticky"
  },
  {
    value: DISPLAY_TYPES.POPUP,
    text: "Popup"
  },
  {
    value: DISPLAY_TYPES.INTERSTITIAL,
    text: "Toàn màn hình"
  }
];

export const EVEN_TRACKING_COUNTING_TYPE = [
  {
    color: "success",
    value: "1",
    text: "Tất cả sự kiện"
  },
  {
    color: "success",
    value: "2",
    text: "Chỉ tính một lần"
  },
  {
    color: "success",
    value: "3",
    text: "Chỉnh sửa"
  }
];

export const EVEN_TRACKING_STATUS = [
  {
    color: "warning",
    value: "pending",
    text: "Chờ duyệt"
  },
  {
    color: "success",
    value: "approve",
    text: "Phê duyệt"
  }
];

export const EVEN_TRACKING_TIME = [
  {
    value: "minute",
    text: "Phút"
  },
  {
    value: "hour",
    text: "Giờ"
  },
  {
    value: "day",
    text: "Ngày"
  }
];

export const EVEN_TRACKING_COUNT_TYPE = [
  {
    value: "1",
    text: "Tất cả sự kiện"
  },
  {
    value: "2",
    text: "Chỉ tính một lần"
  },
  {
    value: "3",
    text: "Chỉnh sửa"
  }
];

export const CONSTRACT_ACTION_TYPE = [
  {
    value: "click",
    text: "Click"
  },
  {
    value: "view",
    text: "View"
  }
];

export const STATUS_INVENTORY = [
  {
    color: "warning",
    value: "created",
    text: "Khởi tạo"
  },
  {
    color: "warning",
    value: "confirm",
    text: "Đang trong quá trình duyệt"
  },
  {
    color: "info",
    value: "penalize",
    text: "Xử phạt"
  },
  {
    color: "info",
    value: "locked",
    text: "Chờ xác nhận"
  },
  {
    color: "error",
    value: "reject",
    text: "Từ chối phê duyệt"
  },
  {
    color: "success",
    value: "approve",
    text: "Đã phê duyệt"
  }
];

export const STATUS_ZONE = [
  {
    color: "warning",
    value: "created",
    text: "Khởi tạo"
  },
  {
    color: "warning",
    value: "confirm",
    text: "Đang trong quá trình duyệt"
  },
  {
    color: "error",
    value: "pause",
    text: "Không hoạt động"
  },
  {
    color: "success",
    value: "running",
    text: "Đang chạy"
  }
];
