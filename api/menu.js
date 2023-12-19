const Menu = [
  {
    title: "Dashboard",
    group: "apps",
    icon: "dashboard",
    href: "/dashboard",
    permission: true
  },
  {
    header: "Quản lý chiến dịch đa kênh",
    name: "campaign"
  },
  {
    title: "Thống kê",
    groupHeader: "manager",
    icon: "mdi-chart-bell-curve",
    items: [
      {
        title: "Doanh thu MMS",
        href: "/report/revenue-mms",
        permission: true
      },
      {
        title: "Doanh thu SMS",
        href: "/report/revenue-sms",
        permission: true
      },
      {
        title: "Tài trợ data",
        href: "/report/revenue-data",
        permission: true
      },
      {
        title: "QC hiển thị đối tác",
        href: "/report/revenue-redirect-partner",
        permission: true
      },
      {
        title: "Doanh thu ngoại mạng",
        href: "/report/revenue-sms-vendor",
        permission: true
      },
      {
        title: "Tin nhắn ngoại mạng theo nhà mạng",
        href: "/report/revenue-sms-vendor-telco",
        permission: true
      },
      {
        title: "Publisher",
        groupHeader: "manager",
        permission: true,
        items: [
          {
            title: "Doanh thu theo thiết bị",
            permission: true,
            href: "/report/publisher/revenue-device"
          },
          // {
          //   title: "Danh sách top inventory",
          //   permission: true,
          //   href: "/report/publisher/revenue-top-inventory"
          // },
          // {
          //   title: "Danh sách top zone",
          //   permission: true,
          //   href: "/report/publisher/revenue-top-zone"
          // },
          // {
          //   title: "Danh sách top sub inventory",
          //   permission: true,
          //   href: "/report/publisher/revenue-top-channel"
          // }
        ]
      }
    ]
  },
  {
    title: "Báo cáo",
    groupHeader: "Report",
    icon: "mdi-table",
    items: [
      {
        title: "Báo cáo tổng hợp",
        groupHeader: "manager",
        permission: true,
        items: [
          {
            title: "Báo cáo theo ngày",
            permission: true,
            href: "/synthesis-report/daily"
          },
          {
            title: "Báo cáo theo tháng",
            permission: true,
            href: "/synthesis-report/monthly"
          }
        ]
      },
      {
        title: "Chi tiết brandname",
        groupHeader: "manager",
        permission: true,
        items: [
          {
            title: "Báo cáo theo ngày",
            permission: true,
            href: "/brandname-detail-report/daily"
          },
          {
            title: "Báo cáo theo tháng",
            permission: true,
            href: "/brandname-detail-report/monthly"
          }
        ]
      },
      {
        title: "Báo cáo tồn kênh",
        groupHeader: "manager",
        permission: true,
        href: "/report-detail-user"
      },
      {
        title: "Cấu hình thời gian tổng hợp",
        groupHeader: "manager",
        permission: true,
        href: "/manage-time"
      },
      {
        title: "Báo cáo doanh thu agency theo ngày",
        groupHeader: "manager",
        permission: true,
        href: "/manual-summary-day"
      }
    ]
  },
  {
    name: "manage-campagin-list",
    groupHeader: "campaign",
    group: "campagin",
    icon: "flag",
    title: "Quản lý chiến dịch",
    href: "/manage-campaign/list",
    permission: true
  },
  {
    title: "Quản lý quảng cáo",
    groupHeader: "manage-ads",
    // group: /(?!.*template)\/manage-ads\/.*/,
    icon: "featured_video",
    items: [
      {
        name: "manage-ads-data",
        title: "Chương trình tài trợ data",
        href: "/manage-ads/data",
        permission: true,
        service: "data"
      },
      {
        name: "manage-ads-sms",
        title: "Tin nhắn SMS",
        href: "/manage-ads/list-ads-sms",
        permission: true,
        service: "sms"
      },
      {
        name: "manage-ads-vendor",
        title: "Tin nhắn ngoại mạng",
        href: "/manage-ads/list-ads-sms-vendor",
        permission: true
        // service: "sms"
      },
      {
        name: "list-ads-mms",
        title: "Tin nhắn MMS",
        href: "/manage-ads/list-ads-mms",
        permission: true,
        service: "mms"
      },
      {
        name: "list-ads-redirect",
        title: "Quảng cáo Redirect",
        href: "/manage-ads/list-ads-redirect",
        permission: true,
        service: "redirect"
      },
      {
        name: "manage-ads-report",
        title: "Người dùng báo cáo",
        href: "/manage-ads/report",
        service: "redirect"
      },

    ]
  },
  {
    title: "Quản lý template",
    groupHeader: "campaign",
    // group: /\/manage-ads\/.*\/template.*/,
    icon: "mdi-library",
    items: [
      {
        name: "mms-template",
        title: "Mẫu tin MMS",
        href: "/manage-ads/mms/template",
        permission: true,
        service: "mms"
      },
      {
        name: "sms-template",
        title: "Mẫu tin SMS",
        href: "/manage-ads/sms/template",
        permission: true,
        service: ["sms", "redirect", "data"]
      },
      {
        name: "sms-vendor-template",
        title: "Mẫu tin ngoại mạng",
        href: "/manage-ads/sms-vendor/template",
        permission: true
      }
    ]
  },
  {
    title: "Quản lý số dư",
    groupHeader: "campaign",
    icon: "mdi-currency-usd",
    items: [
      {
        name: "finance-agency-wallet",
        title: "Quản lý ví dịch vụ",
        href: "/finance/agency-wallet",
        permission: true
      },
      {
        name: "finance-wallet-detail",
        title: "Quản lý ví",
        href: "/finance/wallet-detail",
        permission: true
      },
      {
        name: "expense-ads-data-balance",
        title: "Số dư tài trợ data",
        permission: true,
        href: "/expense-ads/data/balance",
        service: ["data", "redirect"]
      },
      {
        name: "sms-balance",
        title: "Số dư SMS",
        permission: true,
        href: "/expense-ads/sms/balance"
      },
      {
        name: "mms-balance",
        title: "Số dư MMS",
        permission: true,
        href: "/expense-ads/mms-balance",
        service: "mms"
      },
      {
        name: "redirect-balance",
        title: "Số dư Redirect",
        permission: true,
        href: "/expense-ads/redirect/balance",
        service: "redirect"
      },
      {
        name: "sms-vendor-balance",
        title: "Số dư ngoại mạng",
        permission: true,
        href: "/expense-ads/sms-vendor/balance"
      }
    ]
  },
  {
    title: "Lịch sử giao dịch",
    groupHeader: "campaign",
    icon: "mdi-swap-horizontal",
    items: [
      {
        name: "expense-ads-data",
        title: "Tài trợ data",
        permission: true,
        href: "/expense-ads/data",
        service: ["redirect", "data"]
      },
      {
        name: "history-sms",
        title: "Tin nhắn SMS",
        permission: true,
        href: "/expense-ads/sms/history-sms"
      },
      {
        name: "history-mms",
        title: "Tin nhắn MMS",
        permission: true,
        href: "/expense-ads/history-mms",
        service: "mms"
      },
      {
        name: "history-redirect",
        title: "Quảng cáo Redirect",
        permission: true,
        href: "/expense-ads/history-redirect",
        service: "redirect"
      },
      {
        name: "history-sms-vendor",
        title: "Tin nhắn ngoại mạng",
        permission: true,
        href: "/expense-ads/sms-vendor/history-sms-vendor"
      }
    ]
  },
  {
    title: "Lịch sử chạy QC",
    groupHeader: "campaign",
    icon: "mdi-phone-log",
    items: [
      {
        title: "Tài trợ data",
        href: "/log/data-distribution",
        permission: true,
        service: ["redirect", "data"]
      },
      {
        title: "Tin nhắn SMS",
        href: "/log/sms-distribution",
        permission: true
      },
      {
        title: "Tin nhắn MMS",
        href: "/log/mms-distribution",
        permission: true,
        service: "mms"
      },
      {
        title: "Tin nhắn ngoại mạng",
        href: "/log/sms-vendor-distribution",
        permission: true
      },
      {
        title: "Quảng cáo đối tác",
        href: "/log/partner-ads-distribution",
        permission: true
      }
    ]
  },
  {
    title: "Log người dùng",
    groupHeader: "campaign",
    icon: "mdi-history",
    items: [
      {
        title: "Log chiến dịch",
        href: "/log/campaign",
        permission: true
      },
      {
        title: "Log tài trợ data",
        href: "/log/detail/data",
        permission: true,
        service: "data"
      },
      {
        title: "Log tin nhắn SMS",
        href: "/log/detail/sms",
        permission: true,
        service: "sms"
      },
      {
        title: "Log tin nhắn MMS",
        href: "/log/detail/mms",
        permission: true,
        service: "mms"
      },
      {
        title: "Log quảng cáo Redirect",
        href: "/log/detail/redirect",
        permission: true,
        service: "redirect"
      },
      {
        title: "Log tin nhắn ngoại mạng",
        href: "/log/detail/sms-vendor",
        permission: true
        // service: "sms-vendor"
      }
    ]
  },
  {
    title: "Quản lý brandname",
    groupHeader: "campaign",
    icon: "local_offer",
    items: [
      {
        title: "Danh sách brandname",
        href: "/manager-brandname/list",
        permission: true
      },
      {
        title: "Danh sách brandname chờ duyệt",
        href: "/manager-brandname/created",
        permission: true
      },
      {
        title: "Lĩnh vực hoạt động",
        href: "/setting-system/business-activity",
        permission: true
      },
      {
        title: "Log Brandname",
        href: "/manager-brandname/log",
        permission: true
      }
    ]
  },
  {
    title: "Dữ liệu hệ thống khác",
    groupHeader: "campaign",
    icon: "sync",
    items: [
      {
        title: "Dữ liệu đồng bộ",
        permission: true,
        href: "/manage-sync-ads/ads"
      },
      // {
      //   title: "Cấu hình đồng bộ",
      //   permission: true,
      //   href: "/manage-sync-ads/config"
      // },
      {
        title: "Cấu hình Brandname",
        permission: true,
        href: "/manage-sync-ads/brandname_config"
      },
      {
        title: "Cấu hình Agency",
        permission: true,
        href: "/manage-sync-ads/agency_config"
      },
      {
        title: "Cấu hình Lĩnh vực hoạt động",
        permission: true,
        href: "/manage-sync-ads/catid_config"
      }
    ]
  },
  {
    title: "Cấu hình quảng cáo",
    groupHeader: "campaign",
    icon: "mdi-cellphone-cog",
    items: [
      {
        title: "Dịch vụ tin nhắn",
        items: [
          {
            title: "Cấu hình gửi tin nhắn",
            href: "/setting-system/ads-mms",
            permission: true,
            service: ["mms", "sms", "data"]
          },
          {
            title: "Quản lý giá dịch vụ",
            href: "/finance/price-service",
            permission: true,
            service: ["mms", "sms", "data"]
          },
          {
            title: "Nhóm thuê bao",
            href: "/targeting/phone-group",
            permission: true,
            service: ["mms", "sms"]
          },
          {
            title: "Quản lý Vendor",
            href: "/sms-vendor",
            permission: true
          },
          {
            title: "Quản lý nhà mạng",
            href: "/telco",
            permission: true
          },
          {
            title: "Cấu hình Quota nhà mạng",
            href: "/manage-quota",
            permission: true
          }
        ]
      },
      {
        title: "Dịch vụ tài trợ data",
        items: [
          {
            title: "Quản lý gói cước",
            href: "/data-package",
            permission: true,
            service: ["data", "redirect"]
          }
        ]
      },
      {
        title: "Dịch vụ Redirect",
        items: [
          {
            title: "Tag",
            href: "/setting-display-ads/tag",
            permission: true,
            service: "redirect"
          },
          {
            title: "Loại hiển thị quảng cáo",
            href: "/setting-display-ads/type",
            permission: true,
            service: "redirect"
          },
          {
            title: "Quản lý đối tác redirect",
            href: "/setting-system/redirect-partner",
            permission: true
            // service: ["mms", "sms", "data"]
          },
          {
            title: "Quản lý lý do report",
            href: "/setting-display-ads/report-reason",
            service: "redirect"
          },
          {
            title: "Macro",
            href: "/setting-display-ads/macro",
            service: "redirect"
          },
          {
            title: "Quản lý danh mục",
            href: "/setting-display-ads/action-category",
            service: "redirect"
          },
          {
            title: "Quản lý tracking",
            href: "/setting-display-ads/event-tracking",
            service: "redirect"
          },
          {
            title: "Quản lý hiển thị ghi logs tracking",
            href: "/setting-display-ads/event-tracking-log",
            service: "redirect"
          },
          {
            title: "Quản lý gói mua khoán",
            href: "/setting-display-ads/constract",
            service: "redirect"
          },
          {
            title: "Quản lý nhóm tuổi",
            href: "/manage-age-group",
            permission: true
          }
        ]
      },
      {
        title: "Tin nhắn ngoại mạng",
        items: [
          {
            title: "Cấu hình tài khoản vendor",
            href: "/sms-vendor/vendor-account",
            permission: true
          },
          {
            title: "Quản lý lĩnh vực hoạt động",
            href: "/sms-vendor/manager-business-cat",
            permission: true
          },
          {
            title: "Quản lý lĩnh vực kinh doanh",
            href: "/sms-vendor/manager-business-type",
            permission: true
          }
        ]
      }
    ]
  },
  {
    header: "Chức năng publisher",
    name: "publisher"
  },
  {
    title: "Quản lý hiển thị quảng cáo",
    groupHeader: "publisher",
    icon: "mdi-newspaper-variant-outline",
    items: [
      {
        title: "Inventory",
        href: "/setting-display-ads/inventory",
        permission: true,
        service: "redirect"
      },
      {
        title: "Sub-inventory",
        href: "/setting-display-ads/channel",
        permission: true,
        service: "redirect"
      },
      {
        title: "Khu vực hiển thị",
        href: "/setting-display-ads/zone",
        permission: true,
        service: "redirect"
      },
      {
        title: "Quản lý layout",
        href: "/manage-layout/list",
        permission: true,
        service: "redirect"
      }
    ]
  },
  {
    title: "Chính sách bảo vệ",
    groupHeader: "publisher",
    icon: "mdi-shield-alert",
    items: [
      {
        title: "Quản lý chính sách",
        href: "/publisher/policy",
        permission: true,
        service: "redirect"
      },
      {
        title: "Chính sách công khai",
        href: "/publisher/policy-public",
        permission: true,
        service: "redirect"
      },
      {
        title: "Vi phạm chính sách",
        href: "/publisher/policy-violation",
        permission: true,
        service: "redirect"
      }
    ]
  },
  {
    title: "Thanh toán",
    groupHeader: "publisher",
    icon: "mdi-currency-usd",
    items: [
      {
        title: "Tỷ lệ chia doanh thu",
        href: "/publisher/share-rate",
        permission: false
      }
    ]
  },
  {
    header: "Sự an toàn cho thương hiêu",
    name: "brand-safety"
  },
  {
    title: "Nội dung quảng cáo",
    groupHeader: "brand-safety",
    icon: "featured_video",
    permission: true,
    items: [
      {
        name: "brand-safety-content-ads-preview",
        title: "Trung tâm xem xét quảng cáo",
        href: "/brand-safety-content/ads-preview",
        permission: true
      },
      {
        name: "brand-safety-content-ads-preview",
        title: "Chặn URL nhà quảng cáo",
        href: "/brand-safety-content/block-url",
        permission: true
      },
      {
        name: "brand-safety-content-ads-preview",
        title: "Chặn danh mục nhạy cảm",
        href: "/brand-safety-content/block-category",
        permission: true
      }
    ]
  },
  {
    name: "manager",
    header: "Quản lý hệ thống"
  },
  {
    title: "Quản lý tài khoản",
    groupHeader: "manager",
    icon: "account_circle",
    name: "admin",
    items: [
      {
        title: "Danh sách tài khoản",
        href: "/admin/user",
        permission: true
      },
      {
        title: "Danh sách advertiser",
        href: "/admin/advertiser",
        permission: true
      },
      {
        title: "Quản lý nhóm người dùng",
        href: "/admin/role",
        permission: true
      },
      {
        title: "Quản lý IP whitelist",
        href: "/admin/whitelist-ip",
        permission: true
      },
      {
        title: "Quản lý IP truy cập API",
        href: "/admin/api-ip",
        permission: true
      },
      {
        title: "Quản lý IP cho API gửi tin động",
        href: "/dynamic-api-ip",
        permission: true
      }
    ]
  },
  {
    title: "Tài chính",
    groupHeader: "manager",
    icon: "mdi-currency-usd",
    items: [
      {
        name: "finance-invoice-service",
        title: "Quản lý hóa đơn",
        href: "/finance/invoice-service",
        permission: true
      },
      {
        name: "finance-recharge-order",
        title: "Đơn hàng nạp tiền",
        href: "/finance/recharge-order",
        permission: true
      },
      {
        name: "discount-profile",
        title: "Chính sách chiết khấu",
        href: "/discount-profile",
        permission: true
      }
    ]
  },
  {
    title: "Đối tượng mục tiêu",
    groupHeader: "manager",
    icon: "camera",
    items: [
      {
        name: "location",
        title: "Vị trí",
        href: "/targeting/location",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },
      {
        name: "os",
        title: "Hệ điều hành",
        href: "/targeting/os",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },
      {
        name: "device",
        title: "Thiết bị sử dụng",
        href: "/targeting/device",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },
      {
        name: "phone-name",
        title: "Tên điện thoại",
        href: "/targeting/phone-name",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },

      {
        name: "gender",
        title: "Giới tính",
        href: "/targeting/gender",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },
      {
        name: "network-data",
        title: "Gói dữ liệu",
        href: "/targeting/network-data",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },
      {
        name: "relationship",
        title: "Tình trạng hôn nhân",
        href: "/targeting/relationship",
        permission: true,
        service: ["mms", "sms", "redirect"]
      },
      {
        name: "service-package",
        title: "Gói cước",
        href: "/targeting/service-package",
        permission: true,
        service: ["mms", "sms", "redirect"]
      }
    ]
  },
  {
    title: "Cấu hình chung",
    groupHeader: "manager",
    icon: "settings",
    href: "/system/config",
    permission: true
  },
  {
    title: "Người dùng phản hồi",
    groupHeader: "manager",
    icon: "report",
    href: "/system/user-report",
    permission: false
  },
  {
    title: "Quản lý báo cáo tự động",
    groupHeader: "manager",
    icon: "mdi-file-clock-outline",
    items: [
      {
        title: "Mẫu báo cáo",
        href: "/system/file-report",
        permission: true
      },
      {
        title: "Lịch gửi báo cáo tự động",
        href: "/system/email-report",
        permission: true
      }
    ]
  },
  {
    title: "Định dạng thông báo",
    icon: "notifications",
    href: "/setting-system/notification-pattern",
    permission: true
  },
  {
    title: "Quản lý dịch vụ",
    icon: "mdi-arrow-expand-all",
    href: "/system/service",
    permission: true
  },
  {
    title: "Phản hồi",
    icon: "announcement",
    href: "/system/create-report",
    type: "report",
    permission: false
  }

  // {
  //   name: "survey",
  //   header: "Quản lý survey"
  // },
  // {
  //   title: "Quản lý khảo sát",
  //   groupHeader: "survey",
  //   group: "survey",
  //   icon: "mdi-clipboard-text",
  //   name: "survey",
  //   items: [
  //     {
  //       name: "survey-question",
  //       title: "Quản lý câu hỏi",
  //       href: "/survey/survey-question",
  //       permission: false
  //     },
  //     {
  //       name: "survey-answer",
  //       title: "Quản lý câu trả lời",
  //       href: "/survey/survey-answer",
  //       permission: false
  //     }
  //   ]
  // }
];

export default Menu;
