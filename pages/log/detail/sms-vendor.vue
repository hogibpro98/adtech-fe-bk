<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <header-select-time
      v-model="date"
      title="Chi tiết log tin nhắn ngoại mạng"
      class="sticky-header"
    />
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
          <v-divider />
          <api-data-table
            ref="table"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :default-pagination="{
              sortBy: ['date'],
              sortDesc: [true]
            }"
            :toolbar="toolbar"
            :fixed-left-count="2"
            page-name="expense-ads-user-balance"
            calculate-widths
            v-on="$listeners"
            @view-detail="showDetail"
          >
            <template slot="item.ads" slot-scope="{ item }">
              <a
                v-if="item.ads && item.ads.name"
                href="javascript:;"
                @click="showAds(item)"
                >{{ item.ads.name }}</a
              >
              <span v-else></span>
            </template>
            <template slot="item.date" slot-scope="{ item }">{{
              item.date | date
            }}</template>
          </api-data-table>
        </v-card>
      </v-flex>
    </v-layout>
    <sms-vendor-log-dialog ref="dialog" title="Chi tiết thay đổi"></sms-vendor-log-dialog>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { USER_STATUS } from "@/constants/code";
import { USER_STATUS_MAP } from "@/constants/dataSelect";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { FilterInterface } from "~/interface/data/filter";
import GlobalDataInterface from "~/interface/data/global";
import { LogCampaignInterface } from "~/interface/data/log";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import CompareDialog, {
  CompareDialogRef
} from "~/components/common/CompareDialog.vue";
import CampaignLogDialog from "~/components/page/log/campaign/CampaignLogDialog.vue";
import HeaderSelectTime from "~/components/common/HeaderSelectTime.vue";
import CampaignSelect from "~/components/select/CampaignSelect.vue";
import DataLogDialog from "~/components/page/log/detail/data/DataLogDialog.vue";
import SmsLogDialog from "~/components/page/log/detail/sms/SmsLogDialog.vue";
import SmsVendorLogDialog from "~/components/page/log/detail/sms-vendor/SmsVendorLogDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId?: number | string;
  startIndex: number;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  syncingId?: number | string;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  canViewRemain: boolean;
  $refs: {
    table: ApiDataTableRef;
    dialog: CompareDialogRef;
  };
}

interface ComponentMethod {
  showDetail(item: LogCampaignInterface): void;
  refreshTable(toFirstPage?: boolean): void;
  showCampaign(item: LogCampaignInterface): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    SmsLogDialog,
    DataLogDialog,
    HeaderSelectTime,
    CampaignLogDialog,
    NewCustomFilter,
    ApiDataTable,
    SmsVendorLogDialog
  },
  layout: "dashboard-without-header",
  permission: false,
  props: {
    resource: {
      type: String,
      default: "/log/ads-sms-vendor-log"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false,
        isDownload: true,
        exportResource: "/log/ads-sms-vendor-log"
      })
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
      date: [],
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      USER_STATUS,
      USER_STATUS_MAP,
      syncingId: null
    };
  },
  computed: {
    filters() {
      return [
        //   {
        //     type: RESOURCE,
        //     name: "campaign_id",
        //     label: "Chiến dịch",
        //     itemValue: "id",
        //     itemText: "name",
        //     component: CampaignSelect,
        //     props: {
        //       multiple: false
        //     }
        //   }
      ];
    },
    headers() {
      return [
        {
          text: "Ngày",
          value: "date",
          align: "center",
          width: 144
        },
        {
          text: "Tin nhắn ngoại mạng",
          value: "ads",
          sortable: false,
          width: 400
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "visibility",
              label: "Chi tiết",
              event: "view-detail"
            }
          ]
        }
      ];
    },
    filterCustom() {
      return {
        time_range: this.$filters.sqlDate(this.date)
      };
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
    showDetail(item) {
      this.$refs.dialog.show(item);
    },

    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    showAds(item) {
      this.$router.push(`/manage-ads/list-ads-sms-vendor/${item.ads_id}`);
    }
  }
});
</script>
