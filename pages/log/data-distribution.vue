<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <v-overlay v-if="loading" absolute color="#fff" class="z-1">
            <v-progress-circular
              :width="4"
              :size="25"
              indeterminate
              color="primary"
            >
            </v-progress-circular>
          </v-overlay>
          <new-custom-filter v-model="searchParams" :filters="filterShow" />
          <v-divider />
          <api-data-table
            ref="table"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbar"
            :fixed-left-count="2"
            page-name="log-data-distribution"
            calculate-widths
            :default-pagination="pagination"
            v-on="$listeners"
            @detail="showDialogDetail"
            @resend="resendData"
          >
            <template slot="header.errcode" slot-scope="{ item }">
              Mã lỗi
              <v-icon small>info</v-icon>
            </template>
            <template slot="item.ads_name" slot-scope="{ item }">
              <a href="javascript:;" @click="showAds(item)">{{
                item.ads_name
              }}</a>
            </template>
            <template slot="item.price" slot-scope="{ item }">
              <div class="text-right">{{ item.price | currency }}</div>
            </template>

            <template slot="item.errcode" slot-scope="{ item }">
              <v-tooltip :key="`tooltip-${item.id}`" offset-overflow bottom>
                <template #activator="{ on, attrs }">
                  <span v-on="on">{{ item.errcode }}</span>
                </template>
                <span>{{ item.err_desc }}</span>
              </v-tooltip>
            </template>

            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="statusMap[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ statusMap[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.resend_status" slot-scope="{ item }">
              <v-chip
                v-if="statusMap[item.resend_status]"
                :color="statusMap[item.resend_status].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ statusMap[item.resend_status].text }}
              </v-chip>
            </template>
            <template slot="item.sms_before_status" slot-scope="{ item }">
              <v-chip
                v-if="statusMap[item.sms_before_status]"
                :color="statusMap[item.sms_before_status].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ statusMap[item.sms_before_status].text }}
              </v-chip>
            </template>
            <template slot="item.sms_confirm_status" slot-scope="{ item }">
              <v-chip
                v-if="statusMap[item.sms_confirm_status]"
                :color="statusMap[item.sms_confirm_status].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ statusMap[item.sms_confirm_status].text }}
              </v-chip>
            </template>
            <template slot="item.mms_type" slot-scope="{ item }"
              >{{ typeMap[item.mms_type] }}
            </template>
            <!--            <template slot="item.transid" slot-scope="{ item }">-->
            <!--              <span v-if="item.errcode">{{ item.err_desc }}</span>-->
            <!--            </template>-->
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
            </template>
            <template slot="item.sent_at" slot-scope="{ item }">
              <span v-if="item.errcode">{{ item.sent_at | timestamp }}</span>
            </template>
            <template slot="item.cdr_send_time" slot-scope="{ item }"
              >{{ item.cdr_send_time | timestamp }}
            </template>
            <template slot="item.cdr_deliver_time" slot-scope="{ item }"
              >{{ item.cdr_deliver_time | timestamp }}
            </template>
          </api-data-table>
        </v-card>
        <data-distribution-detail-dialog ref="DataDistributionDetailDialog" />
      </v-flex>
    </v-layout>
    <preview-banner-mms-dialog ref="contentDialog" />
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import { DATE, RESOURCE, SELECT, TEXT } from "@/constants/filterType";
import { CODE_SUCCESS, USER_STATUS } from "@/constants/code";
import { USER_STATUS_MAP } from "@/constants/dataSelect";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "@/constants/role";
import PreviewBannerMmsDialog from "@/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import DataDistributionDetailDialog from "@/components/page/log/detail/data/DataDistributionDetailDialog.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef,
  PaginationInterface
} from "~/components/table/ApiDataTable.vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { DataDistributionInterface } from "~/interface/data/log";
import { PreviewBannerMmsDialogRef } from "~/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import { DataDistributionDetailDialogRef } from "~/components/page/log/detail/data/DataDistributionDetailDialog.vue";
import CampaignSelect from "~/components/select/CampaignSelect.vue";
import BrandnameSelect from "~/components/select/BrandnameSelect.vue";
import DataCodeSelect from "~/components/select/DataCodeSelect.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import BrandnameSelectSMS from "~/components/select/BrandnameSelectSMS.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId?: number | string;
  startIndex: number;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  loading: boolean;
  pagination: PaginationInterface;
  syncingId?: number | string;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  typeMap: Array<string>;
  canViewRemain: boolean;
  $refs: {
    table: ApiDataTableRef;
    contentDialog: PreviewBannerMmsDialogRef;
    DataDistributionDetailDialog: DataDistributionDetailDialogRef;
  };
}

interface ComponentMethod {
  showDetail(item: DataDistributionInterface): void;

  showAds(item: DataDistributionInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    PreviewBannerMmsDialog,
    NewCustomFilter,
    ApiDataTable,
    DataDistributionDetailDialog
  },
  layout: "dashboard",
  props: {
    resource: {
      type: String,
      default: "/log/data-distribution"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false,
        isDownload: true,
        exportResource: "/log/data-distribution"
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    },
    headerExcludes: {
      type: Array,
      default: () => []
    },
    filterExcludes: {
      type: Array,
      default: () => []
    },
    createBannerSMS: {
      type: Boolean,
      default: false
    },
    createBannerRedirect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      USER_STATUS,
      USER_STATUS_MAP,
      syncingId: null,
      pagination: {
        sortBy: ["created_at"],
        sortDesc: [true]
      },
      statusMap: {
        success: {
          color: "success",
          text: "Thành công"
        },
        fail: {
          color: "error",
          text: "Thất bại"
        }
      },
      typeMap: ["CSKH", "Quảng cáo"]
    };
  },
  computed: {
    filters() {
      return [
        {
          type: RESOURCE,
          name: "agency_id",
          label: "Agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          visible: this.$authHasRole(ROLE_IS_ADMIN),
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
          type: TEXT,
          name: "ads_name",
          label: "Tên tài trợ data"
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: [
            {
              value: "success",
              text: "Thành công"
            },
            {
              value: "fail",
              text: "Thất bại"
            }
          ]
        },
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian nhận từ CP",
          configProps: {
            maxDate: Date.now()
          }
        },
        {
          type: DATE,
          name: "sent_at",
          label: "Thời gian cộng data",
          configProps: {
            maxDate: Date.now()
          }
        },
        {
          type: RESOURCE,
          name: "code",
          label: "Mã gói data",
          itemValue: "code",
          itemText: "code",
          component: DataCodeSelect,
          props: {
            multiple: false
          }
        },
        {
          type: SELECT,
          multiple: false,
          name: "sms_before_status",
          label: "Trạng thái gửi đến SMSC (tin QC)",
          items: [
            {
              value: "success",
              text: "Thành công"
            },
            {
              value: "fail",
              text: "Thất bại"
            }
          ]
        },
        {
          type: SELECT,
          multiple: false,
          name: "sms_before_cdr_status",
          label: "Trạng thái nhận SMS (tin QC)",
          items: [
            {
              value: "success",
              text: "Thành công"
            },
            {
              value: "fail",
              text: "Thất bại"
            }
          ]
        },
        {
          type: RESOURCE,
          name: "cat_id",
          label: "Lĩnh vực (tin QC)",
          itemValue: "id",
          itemText: "name",
          component: BusinessActivitySelect,
          props: {
            multiple: false
          }
        },
        {
          type: SELECT,
          multiple: false,
          name: "sms_confirm_status",
          label: "Trạng thái gửi đến SMSC (tin xác nhận)",
          items: [
            {
              value: "success",
              text: "Thành công"
            },
            {
              value: "fail",
              text: "Thất bại"
            }
          ]
        },
        {
          type: SELECT,
          multiple: false,
          name: "sms_confirm_cdr_status",
          label: "Trạng thái nhận SMS (tin xác nhận)",
          items: [
            {
              value: "success",
              text: "Thành công"
            },
            {
              value: "fail",
              text: "Thất bại"
            }
          ]
        },
        {
          type: RESOURCE,
          name: "brandname_id",
          label: "Brandname",
          itemValue: "id",
          itemText: "name",
          component: BrandnameSelectSMS,
          props: {
            multiple: false
          }
        }
      ];
    },
    headers() {
      return [
        {
          text: "Số thuê bao",
          value: "sub_id",
          width: 240
        },
        {
          text: "Tên CP",
          value: "agency.full_name",
          width: 240,
          sortable: false
        },
        {
          text: "Tên tài trợ data",
          value: "ads_name",
          width: 240,
          sortable: false
        },
        {
          text: "Chiến dịch",
          value: "campaign_name",
          width: 240,
          sortable: false
        },
        {
          text: "Trạng thái cộng data",
          value: "status",
          align: "center",
          width: 200
        },
        {
          text: "Thời gian nhận từ CP",
          value: "receive_time",
          width: 180,
          align: "center"
        },
        {
          text: "Mã giao dịch CP",
          value: "cp_transid",
          width: 180,
          align: "center"
        },
        {
          text: "Thời gian cộng data",
          value: "sent_at",
          width: 180,
          align: "center"
        },
        {
          text: "Mã transaction",
          value: "transid",
          width: 240
        },
        {
          text: "Mô tả lỗi",
          value: "err_desc",
          width: 200
        },

        {
          text: "Mã gói data",
          value: "code",
          width: 160
        },
        {
          text: "Đơn giá data",
          value: "price",
          align: "right",
          width: 160
        },
        {
          text: "Dung lượng data",
          value: "capacity",
          align: "right",
          width: 160
        },
        {
          text: "Thời hạn sử dụng",
          value: "duration",
          width: 180,
          align: "right"
        },
        {
          text: "Nội dung tin (tin QC)",
          value: "sms_before_content",
          width: 240,
          sortable: false
        },
        {
          text: "Trạng thái gửi đến SMSC (tin QC)",
          value: "sms_before_status",
          align: "center",
          width: 240
        },
        {
          text: "Trạng thái nhận SMS (tin QC)",
          value: "sms_before_cdr_status",
          align: "center",
          width: 240
        },
        {
          text: "Mã transaction (tin QC)",
          value: "sms_before_transid",
          width: 200
        },
        {
          text: "Giá gửi tin QC",
          value: "sms_before_price",
          align: "right",
          width: 200
        },
        {
          text: "Lĩnh vực (tin QC)",
          value: "cat_id",
          width: 200
        },
        {
          text: "Nội dung tin (tin xác nhận)",
          value: "sms_confirm_content",
          width: 240,
          sortable: false
        },
        {
          text: "Trạng thái gửi đến SMSC (tin xác nhận)",
          value: "sms_confirm_status",
          align: "center",
          width: 240
        },
        {
          text: "Trạng thái nhận SMS (tin xác nhận)",
          value: "sms_confirm_cdr_status",
          align: "center",
          width: 240
        },
        {
          text: "Mã transaction (tin xác nhận)",
          value: "sms_confirm_transid",
          width: 200
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 120
        },
        {
          text: "Trạng thái gửi lại",
          value: "resend_status",
          width: 160
        },
        {
          text: "Hành động",
          value: "action",
          width: 100,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "visibility",
              label: "Chi tiết",
              visible: this.canView,
              event: "detail"
            },
            {
              color: "success",
              icon: "mdi-reload",
              label: "Gửi lại",
              visible: this.canResend,
              event: "resend"
            }
          ]
        }
      ];
    },
    canViewRemain() {
      return this.$can("expense-ads-user-balance.view-remain");
    },
    headerShow() {
      return this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );
    },
    filterShow() {
      return this.filters.filter(f => !this.filterExcludes.includes(f.name));
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    }
  },
  methods: {
    canView(item) {
      return (
        item?.sms_before_transid != null || item?.sms_confirm_transid != null
      );
    },
    canResend(item) {
      return item?.status !== "success" && item?.resend_status !== "success";
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    showAds(item) {
      this.$router.push(`/manage-ads/data`);
    },
    showDialogDetail(item) {
      this.$refs.DataDistributionDetailDialog.show(item);
    },
    async resendData(item) {
      const endpoint = "log/data-distribution/resend";
      try {
        const { data } = await this.$axios.post(endpoint, {
          id: item.id
        });
        if (data.code === CODE_SUCCESS) {
          this.refreshTable();
          this.$toast.global.action_success("gửi lại data");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
      }
    }
  }
});
</script>
