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
            page-name="log-sms-distribution"
            calculate-widths
            :default-pagination="pagination"
            v-on="$listeners"
          >
            <template slot="header.errcode" slot-scope="{ item }">
              Mã lỗi
              <v-icon small>info</v-icon>
            </template>
            <template slot="item.content" slot-scope="{ item }">
              <a
                v-if="item.content"
                href="javascript:;"
                class="truncate"
                @click="showContent(item)"
                >{{ item.content || "Xem chi tiết" }}</a
              >
              <span v-else>Không có nội dung</span>
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
                >{{ statusMap[item.status].text }}</v-chip
              >
            </template>
            <template slot="item.message_type" slot-scope="{ item }">
              {{
                messageTypeMap[item.message_type]
                  ? messageTypeMap[item.message_type]
                  : ""
              }}
            </template>
            <template slot="item.sms_type" slot-scope="{ item }">{{
              typeMap[item.sms_type]
            }}</template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | timestamp
            }}</template>
            <template slot="item.receive_time" slot-scope="{ item }">{{
              item.receive_time | timestamp
            }}</template>
            <template slot="item.sent_at" slot-scope="{ item }">{{
              item.sent_at | timestamp
            }}</template>
            <template slot="item.cdr_deliver_time" slot-scope="{ item }">{{
              item.cdr_deliver_time | timestamp
            }}</template>
          </api-data-table>
        </v-card>
      </v-flex>
    </v-layout>
    <preview-banner-mms-dialog ref="contentDialog" />
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import { DATE, RESOURCE, SELECT, TEXT } from "@/constants/filterType";
import { USER_STATUS } from "@/constants/code";
import { SELECT_MMS_TYPE, USER_STATUS_MAP } from "@/constants/dataSelect";
import CompareDialog from "@/components/common/CompareDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY } from "@/constants/role";
import PreviewBannerMmsDialog from "@/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef,
  PaginationInterface
} from "~/components/table/ApiDataTable.vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

import { CompareDialogRef } from "~/components/common/CompareDialog.vue";
import { MMSDistributionInterface } from "~/interface/data/log";
import { PreviewBannerMmsDialogRef } from "~/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import CampaignSelect from "~/components/select/CampaignSelect.vue";
import BrandnameSelect from "~/components/select/BrandnameSelect.vue";
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
  };
}

interface ComponentMethod {
  showDetail(item: MMSDistributionInterface): void;

  showAds(item: MMSDistributionInterface): void;

  showContent(item: MMSDistributionInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    PreviewBannerMmsDialog,
    NewCustomFilter,
    ApiDataTable
  },
  permission: false,
  layout: "dashboard",
  props: {
    resource: {
      type: String,
      default: "/log/sms-vendor-distribution"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false,
        isDownload: true,
        exportResource: "/log/sms-vendor-distribution"
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
        sortBy: ["sent_at"],
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
    messageTypeMap() {
      return {
        sms: "Tin nhắn SMS",
        data_sms: "Tin quảng cáo data",
        data_sms_confirm: "Tin xác nhận data",
        mms_backup: "Tin dự phòng MMS"
      };
    },
    filters() {
      return [
        {
          type: DATE,
          name: "sent_at",
          label: "Thời gian gửi",
          configProps: {
            maxDate: Date.now()
          }
        },
        {
          type: DATE,
          name: "receive_time",
          label: "Thời gian nhận CP",
          configProps: {
            maxDate: Date.now()
          }
        },
        {
          type: TEXT,
          name: "ads_name",
          label: "Tên tin nhắn"
        },
        {
          type: SELECT,
          name: "sms_type",
          label: "Loại tin nhắn",
          items: SELECT_MMS_TYPE
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
          type: RESOURCE,
          name: "cat_id",
          label: "Lĩnh vực hoạt động",
          itemValue: "name",
          itemText: "name",
          props: {
            multiple: false,
            type: "sms"
          },
          component: BusinessActivitySelect
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
          text: "Tên tin nhắn",
          value: "ads_name",
          width: 240
        },

        {
          text: "Nội dung tin",
          value: "content",
          width: 240
          // cellClass: "truncate"
        },
        {
          text: "Vendor",
          value: "vendor_name",
          width: 160
        },
        {
          text: "Loại tin",
          value: "sms_type",
          width: 100
        },
        {
          text: "Chiến dịch",
          value: "campaign_name",
          width: 200
        },
        {
          text: "Thời gian nhận từ CP",
          value: "receive_time",
          width: 200,
          align: "center"
        },
        {
          text: "Thời gian gửi sang VENDOR",
          value: "sent_at",
          width: 200,
          align: "center"
        },
        {
          text: "Thời gian nhận trên thiết bị",
          value: "cdr_deliver_time",
          width: 200,
          align: "center"
        },
        {
          text: "Trạng thái nhận trên thiết bị",
          value: "cdr_state",
          width: 160
        },
        {
          text: "Mã transaction",
          value: "transid",
          width: 180
        },
        {
          text: "Giá",
          value: "price",
          width: 120,
          align: "right"
        },
        {
          text: "Mã template",
          value: "temp_id",
          width: 120
        },
        {
          text: "Lĩnh vực",
          value: "business_activity",
          width: 120
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 120
        },
        {
          text: "Trạng thái gửi sang VENDOR",
          value: "status",
          align: "center",
          width: 160
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
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    showAds(item) {
      this.$router.push(`/manage-ads/list-ads-sms-vendor/${item.ads_id}`);
    },
    showContent(item) {
      this.$refs.contentDialog.show({
        mms_header: item.content
      });
    }
  }
});
</script>
