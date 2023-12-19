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
            <template slot="item.action" slot-scope="{ item }">
              {{ bannerAction(item.action) }}
            </template>

            <template slot="item.time" slot-scope="{ item }">
              {{ item.time | timestamp }}
            </template>
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
import {
  SELECT_BANNER_ACTION,
  SELECT_MMS_TYPE,
  USER_STATUS_MAP
} from "@/constants/dataSelect";
import PreviewBannerMmsDialog from "@/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef,
  PaginationInterface
} from "~/components/table/ApiDataTable.vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

import { MMSDistributionInterface } from "~/interface/data/log";
import { PreviewBannerMmsDialogRef } from "~/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import { BANNER_CLICK, BANNER_VIEW } from "~/constants/banner";

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
  filters: {},
  layout: "dashboard",
  props: {
    resource: {
      type: String,
      default: "log/partner-ads-distribution"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false,
        isDownload: false,
        isSearch: false,
        exportResource: "log/partner-ads-distribution"
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
        sortBy: ["time"],
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
          name: "time",
          label: "Thời gian thực hiện",
          configProps: {
            maxDate: Date.now()
          }
        },
        // {
        //   type: SELECT,
        //   name: "partner_code",
        //   label: "Tên đối tác",
        //   items: [
        //     {
        //       value: "MGID",
        //       text: "MGID"
        //     }
        //   ]
        // },
        {
          type: TEXT,
          name: "partner_code",
          label: "Tên đối tác"
        },
        {
          type: TEXT,
          name: "zone_id",
          label: "Zone Id"
        },
        {
          type: SELECT,
          name: "action",
          label: "Hành động",
          items: SELECT_BANNER_ACTION
        }
      ];
    },
    headers() {
      return [
        {
          text: "Tên đối tác",
          value: "partner_code",
          width: 120,
          sortable: false
        },
        {
          text: "Domain",
          value: "hostname",
          width: 200,
          sortable: false
        },
        {
          text: "Zone ID",
          value: "zone_id",
          width: 240,
          sortable: false
        },
        {
          text: "Ads ID",
          value: "ads_id",
          align: "right",
          width: 160,
          sortable: false
        },
        {
          text: "IP",
          value: "ip",
          align: "right",
          width: 160,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          width: 120,
          align: "center",
          sortable: false
          // cellClass: "truncate"
        },
        {
          text: "Thời gian thực hiện",
          value: "time",
          width: 200,
          align: "center"
          // cellClass: "truncate"
        }
      ];
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
    bannerAction(value) {
      if (value === BANNER_VIEW) {
        return "view";
      } else if (value === BANNER_CLICK) {
        return "click";
      }
    },
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
