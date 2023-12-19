import { DATE, NUMBER, RESOURCE, SELECT } from "~/constants/filterType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect";
import { ROLE_ADVERTISER, ROLE_AGENCY } from "~/constants/role";
import {
  STATUS_ADS_DATA_FILTER,
  STATUS_BANNER_MMS_FILTER,
  STATUS_CAMPAIGN
} from "~/constants/dataSelect";
import MmsTemplateSelect from "~/components/select/MmsTemplateSelect";
import SmsTemplateSelect from "~/components/select/SmsTemplateSelect";
import PhoneGroupSelect from "~/components/select/PhoneGroupSelect";
import CampaignSelect from "~/components/select/CampaignSelect";

export default [
  {
    model: "\\App\\Models\\AdsMmsView",
    title: "Tin nhắn MMS",
    headers: [
      {
        text: "Tên",
        value: "name"
      },
      {
        text: "Agency",
        relationship: "agency",
        type: "one",
        value: "agency_id",
        attributes: "full_name"
      },
      // with('agency:id,full_name');
      {
        text: "Advertiser",
        relationship: "advertiser",
        type: "one",
        value: "advertiser_id",
        attributes: "full_name"
      },
      {
        text: "Chiến dịch",
        value: "campaign_name"
      },
      {
        text: "Template Id",
        value: "tempid"
      },
      {
        text: "Loại quảng cáo",
        value: "mms_type"
      },
      {
        text: "Brandname",
        value: "brand_name"
      },
      {
        text: "Lĩnh vực hoạt động của brandname",
        value: "cat_id"
      },
      {
        text: "Thời gian bắt đầu",
        value: "start_time"
      },
      {
        text: "Thời gian kết thúc",
        value: "end_time"
      },
      {
        text: "Thời gian gửi tin",
        value: "schedule"
      },

      {
        text: "Trạng thái",
        value: "status"
      },
      {
        text: "Tổng số tin nhắn đã gửi",
        value: "num_sent"
      },
      {
        text: "Số tin gửi ra gateway thành công",
        value: "num_success"
      },
      {
        text: "Số tin nhắn tới thiết bị thành công",
        value: "cdr_total_success"
      },
      {
        text: "Số tin gửi ra gateway thất bại",
        value: "num_fail"
      },
      {
        text: "Số tin nhắn tới thiết bị thất bại",
        value: "cdr_total_fail"
      },
      {
        text: "Tỉ lệ tin nhắn gửi thành công",
        value: "rate_success"
      },
      {
        text: "Tổng ngân sách",
        value: "budget"
      },
      {
        text: "Số tiền refund",
        value: "total_money_refund"
      },
      {
        text: "Số tiền đã chạy",
        value: "expense"
      },
      {
        text: "Số tiền QC còn dư",
        value: "remain_budget"
      }
    ],
    filters: [
      {
        type: RESOURCE,
        name: "agency_id",
        label: "Agency",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          queryParams: {
            type: ROLE_AGENCY
          },
          label: "Agency"
        }
      },
      {
        type: RESOURCE,
        name: "advertiser_id",
        label: "Advertiser",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          queryParams: {
            type: ROLE_ADVERTISER
          },
          label: "Advertiser"
        }
      },
      {
        type: SELECT,
        multiple: false,
        name: "status",
        label: "Trạng thái",
        items: STATUS_BANNER_MMS_FILTER
      },
      // {
      //   type: DATE,
      //   name: "custom_running_time",
      //   request_name: "custom_running_time",
      //   label: "Thời gian diễn ra",
      //   renderQuery: (filter, setInnerValue) => {
      //     setInnerValue(filter.name, filter.value);
      //   }
      // },
      {
        type: NUMBER,
        name: "num_success",
        props: {
          rules: "numeric"
        },
        label: "Số tin nhắn gửi thành công"
      },
      {
        type: RESOURCE,
        name: "mms_user_template_id",
        label: "Template MMS",
        itemValue: "id",
        itemText: "name",
        component: MmsTemplateSelect
      },
      {
        type: RESOURCE,
        name: "phone_group_id",
        label: "Nhóm thuê bao",
        itemValue: "id",
        itemText: "name",
        component: PhoneGroupSelect
      },
      {
        type: NUMBER,
        name: "rate_success",
        label: "Tỉ lệ tin nhắn gửi thành công",
        props: {
          suffix: "%",
          rules: "min_value:0|max_value:100"
        },
        renderQuery: (filter, setInnerValue) => {
          if (filter.min !== undefined) {
            setInnerValue(`number_min_${filter.name}`, filter.min / 100);
          }
          if (filter.max !== undefined) {
            setInnerValue(`number_max_${filter.name}`, filter.max / 100);
          }
        },
        renderShow: filter => {
          if (filter.min !== undefined && filter.max !== undefined) {
            return `${filter.label}: ${filter.min}% <= x <= ${filter.max}%`;
          } else if (filter.min !== undefined) {
            return `${filter.label} >= ${filter.min}%`;
          } else if (filter.max !== undefined) {
            return `${filter.label} <= ${filter.max}%`;
          }
        }
      }
    ]
  },
  {
    model: "\\App\\Models\\AdsSmsView",
    title: "Tin nhắn SMS",
    headers: [
      {
        text: "Tên",
        value: "name"
      },
      {
        text: "Agency",
        relationship: "agency",
        type: "one",
        value: "agency_id",
        attributes: "full_name"
      },
      // with('agency:id,full_name');
      {
        text: "Advertiser",
        relationship: "advertiser",
        type: "one",
        value: "advertiser_id",
        attributes: "full_name"
      },

      {
        text: "Chiến dịch",
        value: "campaign_name"
      },
      {
        text: "Template Id",
        value: "tempid"
      },
      {
        text: "Loại quảng cáo",
        value: "sms_type"
      },
      {
        text: "Brandname",
        value: "brand_name"
      },
      {
        text: "Lĩnh vực hoạt động của brandname",
        value: "cat_id"
      },
      {
        text: "Thời gian bắt đầu",
        value: "start_time"
      },
      {
        text: "Thời gian kết thúc",
        value: "end_time"
      },
      {
        text: "Thời gian gửi tin",
        value: "schedule"
      },

      {
        text: "Trạng thái",
        value: "status"
      },
      {
        text: "Tổng số tin nhắn đã gửi",
        value: "num_sent"
      },
      {
        text: "Số tin gửi ra gateway thành công",
        value: "num_success"
      },
      {
        text: "Số tin nhắn tới thiết bị thành công",
        value: "cdr_total_success"
      },
      {
        text: "Số tin gửi ra gateway thất bại",
        value: "num_fail"
      },
      {
        text: "Số tin nhắn tới thiết bị thất bại",
        value: "cdr_total_fail"
      },
      {
        text: "Tỉ lệ tin nhắn gửi thành công",
        value: "rate_success"
      },
      {
        text: "Tổng ngân sách",
        value: "budget"
      },
      {
        text: "Số tiền refund",
        value: "total_money_refund"
      },
      {
        text: "Số tiền đã chạy",
        value: "expense"
      },
      {
        text: "Số tiền QC còn dư",
        value: "remain_budget"
      }
    ],
    filters: [
      {
        type: RESOURCE,
        name: "agency_id",
        label: "Agency",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          queryParams: {
            type: ROLE_AGENCY
          },
          label: "Agency"
        }
      },
      {
        type: RESOURCE,
        name: "advertiser_id",
        label: "Advertiser",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          queryParams: {
            type: ROLE_ADVERTISER
          },
          label: "Advertiser"
        }
      },
      {
        type: SELECT,
        multiple: false,
        name: "status",
        label: "Trạng thái",
        items: STATUS_BANNER_MMS_FILTER
      },
      // {
      //   type: DATE,
      //   name: "custom_running_time",
      //   request_name: "custom_running_time",
      //   label: "Thời gian diễn ra",
      //   renderQuery: (filter, setInnerValue) => {
      //     setInnerValue(filter.name, filter.value);
      //   }
      // },
      {
        type: NUMBER,
        name: "num_success",
        props: {
          rules: "numeric"
        },
        label: "Số tin nhắn gửi thành công"
      },
      {
        type: RESOURCE,
        name: "sms_user_template_id",
        label: "Template SMS",
        itemValue: "id",
        itemText: "name",
        component: SmsTemplateSelect
      },
      {
        type: RESOURCE,
        name: "phone_group_id",
        label: "Nhóm thuê bao",
        itemValue: "id",
        itemText: "name",
        component: PhoneGroupSelect
      },
      {
        type: NUMBER,
        name: "rate_success",
        label: "Tỉ lệ tin nhắn gửi thành công",
        props: {
          suffix: "%",
          rules: "min_value:0|max_value:100"
        },
        renderQuery: (filter, setInnerValue) => {
          if (filter.min !== undefined) {
            setInnerValue(`number_min_${filter.name}`, filter.min / 100);
          }
          if (filter.max !== undefined) {
            setInnerValue(`number_max_${filter.name}`, filter.max / 100);
          }
        },
        renderShow: filter => {
          if (filter.min !== undefined && filter.max !== undefined) {
            return `${filter.label}: ${filter.min}% <= x <= ${filter.max}%`;
          } else if (filter.min !== undefined) {
            return `${filter.label} >= ${filter.min}%`;
          } else if (filter.max !== undefined) {
            return `${filter.label} <= ${filter.max}%`;
          }
        }
      }
    ]
  },
  {
    model: "\\App\\Models\\AdsDataSponsorView",
    title: "Chương trình tài trợ data",
    headers: [
      {
        text: "Tên",
        value: "name"
      },
      {
        text: "Agency",
        relationship: "agency",
        type: "one",
        value: "agency_id",
        attributes: "full_name"
      },
      // with('agency:id,full_name');
      {
        text: "Advertiser",
        relationship: "advertiser",
        type: "one",
        value: "advertiser_id",
        attributes: "full_name"
      },
      {
        text: "Chiến dịch",
        value: "campaign_name"
      },
      {
        text: "Trạng thái",
        value: "status"
      },
      {
        text: "Ghi chú",
        value: "note"
      },
      {
        text: "Hình thức gửi",
        value: "sponsor_type"
      },
      {
        text: "Phương thức chạy",
        value: "target_type"
      },
      {
        text: "Thời gian bắt đầu",
        value: "start_time"
      },
      {
        text: "Thời gian kết thúc",
        value: "end_time"
      },
      // {
      //   text: "Thời gian gửi tin",
      //   value: "schedule",
      // },
      {
        text: "File targeting",
        value: "params_file"
        // width: 180
      },
      {
        text: "Ngân sách data tối đa",
        value: "budget"
      },
      {
        text: "Ngân sách tin nhắn tối đa",
        value: "budget_msg"
      },
      {
        text: "Chi phí tạm tính",
        value: "total_price"
      },
      {
        text: "Chi phí tin nhắn tạm tính",
        value: "total_price_msg"
      },
      {
        text: "Tổng số thuê bao sẽ gửi",
        value: "total_rows"
      },
      {
        text: "Tổng tiền đã tiêu",
        value: "amount_money"
      },
      {
        text: "Số tin xác nhận gửi ra gateway thành công",
        value: "num_sms_confirm_success"
      },
      {
        text: "Số tin nhắn xác nhận tới thiết bị thành công",
        value: "cdr_num_sms_confirm_success"
      },
      {
        text: "Số tin xác nhận gửi ra gateway thất bại",
        value: "num_sms_confirm_fail"
      },
      {
        text: "Số tin xác nhận tới thiết bị thất bại",
        value: "cdr_num_sms_confirm_fail"
      },
      {
        text: "Số tin QC gửi ra gateway thành công",
        value: "num_sms_success"
      },
      {
        text: "Số tin QC tới thiết bị thành công",
        value: "cdr_num_sms_success"
      },
      {
        text: "Số tin QC gửi ra gateway thất bại",
        value: "num_sms_fail"
      },
      {
        text: "Số tin QC tới thiết bị thất bại",
        value: "cdr_num_sms_fail"
      }
    ],
    filters: [
      {
        type: RESOURCE,
        name: "campaign_id",
        label: "Chiến dịch",
        itemValue: "id",
        itemText: "name",
        component: CampaignSelect,
        props: {
          multiple: false
        }
      },
      {
        type: SELECT,
        multiple: false,
        name: "id",
        label: "ID",
        visible: false,
        items: []
      },
      {
        type: RESOURCE,
        name: "agency_id",
        label: "Agency",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          queryParams: {
            type: ROLE_AGENCY
          },
          label: "Agency"
        }
      },
      {
        type: RESOURCE,
        name: "advertiser_id",
        label: "Advertiser",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          queryParams: {
            type: ROLE_ADVERTISER
          },
          label: "Advertiser"
        }
      },
      {
        type: SELECT,
        multiple: false,
        name: "status",
        label: "Trạng thái",
        items: STATUS_ADS_DATA_FILTER
      },
      {
        type: DATE,
        name: "created_at",
        label: "Thời gian tạo"
      }
    ]
  },
  {
    model: "\\App\\Models\\CampaignView",
    title: "Chiến dịch",
    headers: [
      {
        text: "Chiến dịch",
        value: "name"
      },
      {
        text: "Agency",
        relationship: "agency",
        type: "one",
        value: "agency_id",
        attributes: "full_name"
      },
      // with('agency:id,full_name');
      {
        text: "Advertiser",
        relationship: "advertiser",
        type: "one",
        value: "advertiser_id",
        attributes: "full_name"
      },
      {
        text: "Ngày bắt đầu",
        value: "start_time"
      },
      {
        text: "Ngày kết thúc",
        value: "end_time"
      },
      {
        text: "Trạng thái",
        value: "status"
      },
      {
        text: "Tổng ngân sách",
        value: "budget"
      },
      {
        text: "Số tiền QC đã chạy",
        value: "expense"
      },
      {
        text: "Số tiền QC còn dư",
        value: "remain_budget"
      }
    ],
    filters: [
      {
        type: RESOURCE,
        name: "agency_id",
        label: "Agency",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          label: "Agency",
          queryParams: {
            type: ROLE_AGENCY
          }
        }
      },
      {
        type: RESOURCE,
        name: "advertiser_id",
        label: "Advertiser",
        itemValue: "id",
        itemText: "full_name",
        component: AgencyAdvertiserSelect,
        props: {
          multiple: false,
          label: "Advertiser",
          queryParams: {
            type: ROLE_ADVERTISER
          }
        }
      },
      {
        type: SELECT,
        multiple: false,
        name: "status",
        label: "Trạng thái",
        items: STATUS_CAMPAIGN
      },
      // {
      //   type: DATE,
      //   name: "custom_running_time",
      //   request_name: "custom_running_time",
      //   label: "Thời gian diễn ra",
      //   renderQuery: (filter, setInnerValue) => {
      //     setInnerValue(filter.name, filter.value);
      //   }
      // },
      {
        type: SELECT,
        multiple: false,
        name: "pending_ads_count",
        request_name: "custom_pending_ads_count",
        label: "Chiến dịch chờ duyệt",
        itemValue: "value",
        selected: "has_pending",
        items: [
          {
            text: "Chiến dịch có quảng cáo chờ duyệt",
            value: "has_pending"
          },
          {
            text: "Chiến dịch không có quảng cáo chờ duyệt",
            value: "has_no_pending"
          }
        ]
      }
    ]
  }
];
