<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <new-custom-filter v-model="searchParams" :filters="filterShow" />
      <v-divider />
      <api-data-table
        ref="table"
        v-bind="$attrs"
        v-model="selectedItems"
        :resource="resource"
        :headers="headerShow"
        :filter="filterTable"
        :start-index.sync="startIndex"
        :toolbar="toolbarShow"
        page-name="manage-ads-data"
        calculate-widths
        selectable
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @copy-item="copyItem"
        @confirm-item="confirmItem"
        @delete-item="deleteItem"
        @start-item="startItem"
        @pause-item="pauseItem"
        @stop-item="stopItem"
        @delete-selected="deleteSelected"
        @show-api="openApiInstruction"
        @fetched-data="updateCurrentTime"
      >
        <template slot="item.agency" slot-scope="{ item }">
          <nuxt-link
            v-if="getAgency(item)"
            :to="`/user/${getAgency(item).id}`"
            class="truncate-2 w-full block"
            >{{ getAgency(item).full_name }}</nuxt-link
          >
        </template>
        <template slot="item.schedule" slot-scope="{ item }">
          <div v-html="displayTimeSent(item)"></div>
        </template>
        <template slot="item.sponsor_type" slot-scope="{ item }">{{
          SPONSOR_TYPES_MAP[item.sponsor_type]
            ? SPONSOR_TYPES_MAP[item.sponsor_type]
            : ""
        }}</template>
        <template slot="item.status" slot-scope="{ item }">
          <v-chip
            v-if="STATUS_MAP[item.status]"
            :color="STATUS_MAP[item.status].color"
            class="w-full justify-content-center"
            small
            label
            >{{ STATUS_MAP[item.status].text }}</v-chip
          >
        </template>
        <template slot="item.advertiser" slot-scope="{ item }">
          <span v-if="getAdvertiser(item)">{{
            getAdvertiser(item).full_name
          }}</span>
        </template>
        <template slot="item.campaign" slot-scope="props">
          <nuxt-link
            :to="
              `/manage-campaign/list/${props.item.campaign &&
                props.item.campaign.id}`
            "
            >{{ props.item.campaign && props.item.campaign.name }}</nuxt-link
          >
        </template>
        <template slot="item.confirm_sms_template" slot-scope="{ item }">
          <template
            v-if="item.confirm_sms_template && item.confirm_sms_template.name"
          >
            <nuxt-link
              :to="
                `/manage-ads/sms/template?keyword=${item.confirm_sms_template.name}`
              "
              >{{ item.confirm_sms_template.name }}</nuxt-link
            >
          </template>
        </template>
        <template slot="item.sms_user_template" slot-scope="{ item }">
          <template
            v-if="item.sms_user_template && item.sms_user_template.name"
          >
            <nuxt-link
              :to="
                `/manage-ads/sms/template?keyword=${item.sms_user_template.name}`
              "
              >{{ item.sms_user_template.name }}</nuxt-link
            >
          </template>
        </template>

        <template slot="item.params_file" slot-scope="{ item }">
          <a v-if="item.params_file" :href="item.params_file" target="_blank"
            >Xem file</a
          >
        </template>
        <template slot="item.start_time" slot-scope="props">
          <div class="text-center">
            <p>{{ props.item.start_time | date }}</p>
          </div>
        </template>
        <template slot="item.end_time" slot-scope="props">
          <div class="text-center">
            <p>{{ props.item.end_time | date }}</p>
          </div>
        </template>
        <template slot="item.total_rows" slot-scope="{ item }">{{
          item.total_rows | numberSpace
        }}</template>
        <template slot="item.num_sms_success" slot-scope="{ item }">{{
          item.num_sms_success | numberSpace
        }}</template>
        <template slot="item.num_sms_fail" slot-scope="{ item }">{{
          item.num_sms_fail | numberSpace
        }}</template>
        <template slot="item.cdr_num_sms_success" slot-scope="{ item }">{{
          item.cdr_num_sms_success | numberSpace
        }}</template>
        <template slot="item.cdr_num_sms_fail" slot-scope="{ item }">{{
          item.cdr_num_sms_fail | numberSpace
        }}</template>
        <template slot="item.num_sms_confirm_success" slot-scope="{ item }">{{
          item.num_sms_confirm_success | numberSpace
        }}</template>
        <template slot="item.num_sms_confirm_fail" slot-scope="{ item }">{{
          item.num_sms_confirm_fail | numberSpace
        }}</template>
        <template
          slot="item.cdr_num_sms_confirm_success"
          slot-scope="{ item }"
          >{{ item.cdr_num_sms_confirm_success | numberSpace }}</template
        >
        <template slot="item.cdr_num_sms_confirm_fail" slot-scope="{ item }">{{
          item.cdr_num_sms_confirm_fail | numberSpace
        }}</template>

        <template slot="item.budget" slot-scope="{ item }">{{
          item.budget | currency
        }}</template>
        <template slot="item.budget_msg" slot-scope="{ item }">{{
          item.budget_msg | currency
        }}</template>
        <template slot="item.total_price" slot-scope="{ item }">{{
          item.total_price | currency
        }}</template>
        <template slot="item.total_price_msg" slot-scope="{ item }">{{
          item.total_price_msg | currency
        }}</template>
        <template slot="item.num_sent" slot-scope="{ item }">{{
          item.num_sent | numberSpace
        }}</template>
        <template slot="item.amount_money" slot-scope="{ item }">{{
          item.amount_money | currency
        }}</template>
        <template slot="item.total_time_pause" slot-scope="props">{{
          props.item.total_time_pause | humanize
        }}</template>
        <template slot="item.total_time_running" slot-scope="{ item }">{{
          getRunDuration(item) | humanize
        }}</template>
        <template
          v-for="(_, name) in $scopedSlots"
          :slot="name"
          slot-scope="slotData"
        >
          <slot :name="name" v-bind="slotData" />
        </template>
      </api-data-table>
      <ads-data-form-dialog
        ref="dialog"
        @create-success="refreshTable(true)"
        @update-success="refreshTable"
      />
      <ads-data-form-review-dialog
        ref="confirmDialog"
        @success="refreshTable"
      />
      <ads-data-change-status-dialog
        ref="statusDialog"
        @action-success="refreshTable"
      />
      <base-mass-delete-dialog
        ref="massDeleteDialog"
        resource="/ads"
        object-name="tài trợ data"
        @confirm="deleteSelected"
        @action-success="refreshTable(false, false)"
      />
      <ads-data-delete-dialog
        ref="deleteDialog"
        @action-success="refreshTable"
      />
      <data-api-instruction-dialog ref="apiDialog" />
    </v-card>
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import {
  PLATFORM,
  STATUS_ADS_DATA_FILTER,
  STATUS_BANNER_MMS_FILTER
} from "@/constants/dataSelect";
import { DATE, NUMBER, RESOURCE, SELECT } from "@/constants/filterType";
import { DATA_SPONSOR, INVENTORY_DISPLAY } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import moment from 'moment/src/moment';
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";

import { ChannelInterface } from "~/interface/data/channel";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import AdsDataFormDialog from "~/components/page/manage-ads/data/AdsDataFormDialog.vue";
import { WEEKDAY_MAP } from "~/constants/map";
import AdsDataFormReviewDialog from "~/components/page/manage-ads/data/AdsDataFormReviewDialog.vue";
import AdsDataChangeStatusDialog from "~/components/page/manage-ads/data/AdsDataChangeStatusDialog.vue";
import AdsDataMassDeleteDialog from "~/components/page/manage-ads/data/AdsDataMassDeleteDialog.vue";
import AdsDataDeleteDialog from "~/components/page/manage-ads/data/AdsDataDeleteDialog.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_ADVERTISER, ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import CampaignSelect from "~/components/select/CampaignSelect.vue";
import DataApiInstructionDialog from "~/components/page/manage-ads/data/DataApiInstructionDialog.vue";
import { SQL_TIMESTAMP } from "~/constants/format";
import {PAUSE, RUNNING, STOP} from "~/constants/statusAds";

interface ComponentData {
  $refs: {
    table: ApiDataTableRef;
  };
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  canViewAgency: boolean;
  canViewAdvertiser: boolean;
}

interface ComponentMethods {
  renderCTR(item: ChannelInterface): string;

  addItem(): void;
  addItem(): void;

  editItem(item: ChannelInterface): void;

  deleteItem(item: ChannelInterface): void;

  refreshTable(toFirstPage?: boolean): void;

  getNamePlatform(platformId: string): string;
}

const DataSponsorTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DataSponsorTable",
  components: {
    BaseMassDeleteDialog,
    DataApiInstructionDialog,
    AdsDataDeleteDialog,
    AdsDataMassDeleteDialog,
    AdsDataChangeStatusDialog,
    AdsDataFormReviewDialog,
    AdsDataFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  props: {
    resource: {
      type: String,
      default: DATA_SPONSOR
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isDownload: true,
        exportResource: DATA_SPONSOR,
        isToggleChart: true,
        isFullScreen: true
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
    actionExcludes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      currentTime: null
    };
  },
  computed: {
    canViewAgency() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    canViewAdvertiser() {
      return this.$authHasRole(ROLE_IS_ADMIN) || this.$authHasRole(ROLE_AGENCY);
    },
    SPONSOR_TYPES_MAP() {
      return {
        msg: "Tin xác nhận + Tin quảng cáo",
        direct: "Tin nhắn xác nhận"
      };
    },
    STATUS_MAP() {
      return {
        waiting: {
          color: "warning",
          text: "Chờ chạy"
        },
        calculating: {
          color: "primary",
          text: "Đang tính toán"
        },
        confirming: {
          color: "warning",
          text: "Chờ xác nhận ngân sách"
        },
        running: {
          color: "success",
          text: "Đang chạy"
        },
        pause: {
          color: "purple",
          text: "Tạm dừng"
        },
        stop: {
          color: "default",
          text: "Đã dừng chạy"
        }
      };
    },
    filters() {
      return [
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
          visible: this.canViewAgency,
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
          visible: this.canViewAdvertiser,
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
          name: "custom_running_time",
          request_name: "custom_running_time",
          label: "Thời gian diễn ra",
          renderQuery: (filter, setInnerValue) => {
            setInnerValue(filter.name, filter.value);
          }
        }
      ];
    },

    filterShow() {
      const filterShow = this.filters.filter(
        f =>
          !this.filterExcludes.includes(f.name) &&
          !this.headerExcludes.includes(f.name)
      );
      if (this.canViewAgency) {
        return filterShow;
      } else if (this.canViewAdvertiser) {
        return filterShow.filter(f => f.name !== "agency_id");
      } else {
        return filterShow.filter(
          f => f.name !== "agency_id" && f.name !== "advertiser_id"
        );
      }
    },

    headers() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 180
        },
        {
          text: "Agency",
          value: "agency",
          sortable: false,
          width: 240,
          visible: this.canViewAgency
        },
        {
          text: "Advertiser",
          value: "advertiser",
          sortable: false,
          width: 240,
          visible: this.canViewAdvertiser
        },
        {
          text: "Chiến dịch",
          value: "campaign",
          sortable: false,
          width: 240
        },
        {
          text: "Template tin xác nhận",
          value: "confirm_sms_template",
          sortable: false,
          width: 240
        },
        {
          text: "Template tin đính kèm",
          value: "sms_user_template",
          sortable: false,
          width: 240
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },
        {
          text: "Ghi chú",
          value: "note",
          width: 200
        },
        {
          text: "Hình thức gửi",
          value: "sponsor_type",
          width: 220
        },
        {
          text: "Phương thức chạy",
          value: "target_type",
          width: 220
        },
        {
          text: "Thời gian bắt đầu",
          value: "start_time",
          width: 160,
          align: "center"
        },
        {
          text: "Thời gian kết thúc",
          value: "end_time",
          width: 160,
          align: "center"
        },
        {
          text: "Tổng thời gian tạm dừng",
          value: "total_time_pause",
          align: "right",
          sortable: false,
          width: 180
        },
        {
          text: "Thời gian đã chạy",
          value: "total_time_running",
          align: "right",
          sortable: false,
          width: 180
        },
        {
          text: "Thời gian gửi tin",
          value: "schedule",
          width: 240
        },
        {
          text: "File targeting",
          value: "params_file",
          width: 180
        },
        {
          text: "Ngân sách data tối đa",
          value: "budget",
          align: "right",
          width: 180
        },
        {
          text: "Ngân sách tin nhắn tối đa",
          value: "budget_msg",
          align: "right",
          width: 220
        },
        {
          text: "Chi phí tạm tính",
          value: "total_price",
          align: "right",
          width: 160
        },
        {
          text: "Chi phí tin nhắn tạm tính",
          value: "total_price_msg",
          align: "right",
          width: 180
        },
        {
          text: "Tổng số thuê bao sẽ gửi",
          value: "total_rows",
          align: "right",
          width: 144
        },
        {
          text: "Tổng số thuê bao đã gửi",
          value: "num_sent",
          align: "right",
          width: 144
        },
        {
          text: "Tổng tiền đã tiêu",
          value: "amount_money",
          align: "right",
          width: 144
        },
        {
          text: "Số tin xác nhận gửi ra gateway thành công",
          value: "num_sms_confirm_success",
          align: "right",
          width: 180
        },
        {
          text: "Số tin nhắn xác nhận tới thiết bị thành công",
          value: "cdr_num_sms_confirm_success",
          align: "right",
          width: 180
        },
        {
          text: "Số tin xác nhận gửi ra gateway thất bại",
          value: "num_sms_confirm_fail",
          align: "right",
          width: 180
        },
        {
          text: "Số tin xác nhận tới thiết bị thất bại",
          value: "cdr_num_sms_confirm_fail",
          align: "right",
          width: 180
        },
        {
          text: "Số tin QC gửi ra gateway thành công",
          value: "num_sms_success",
          align: "right",
          width: 180
        },
        {
          text: "Số tin QC tới thiết bị thành công",
          value: "cdr_num_sms_success",
          align: "right",
          width: 180
        },
        {
          text: "Số tin QC gửi ra gateway thất bại",
          value: "num_sms_fail",
          align: "right",
          width: 180
        },
        {
          text: "Số tin QC tới thiết bị thất bại",
          value: "cdr_num_sms_fail",
          align: "right",
          width: 180
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "purple",
              icon: "mdi-api",
              label: "Hướng dẫn API",
              event: "show-api",
              visible: this.checkHasApi
            },
            {
              color: "purple",
              icon: "visibility",
              label: "Xác nhận",
              visible: this.checkShowButtonConfirm,
              event: "confirm-item"
            },
            {
              color: "warning",
              icon: "pause",
              label: "Tạm dừng",
              visible: this.checkShowButtonPause,
              event: "pause-item"
            },
            {
              color: "success",
              icon: "play_arrow",
              label: "Chạy",
              visible: this.checkShowButtonStart,
              event: "start-item"
            },
            {
              color: "error",
              icon: "stop",
              label: "Dừng hẳn",
              visible: this.checkShowButtonStop,
              event: "stop-item"
            },
            {
              color: "primary",
              icon: "content_copy",
              label: "Nhân bản",
              event: "copy-item"
            },
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              event: "edit-item"
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa",
              event: "delete-item"
            }
          ]
        }
      ];
    },

    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    },
    headerShow() {
      let headers = [...this.headers].filter(
        header => !this.headerExcludes.includes(header.value)
      );

      if (this.$authHasRole(ROLE_AGENCY) && !this.$authHasRole(ROLE_IS_ADMIN)) {
        headers = headers.filter(h => h.value !== "agency");
      }

      if (
        this.$authHasRole(ROLE_ADVERTISER) &&
        !this.$authHasRole(ROLE_AGENCY) &&
        !this.$authHasRole(ROLE_IS_ADMIN)
      ) {
        headers = headers.filter(
          h => h.value !== "advertiser" && h.value !== "agency"
        );
      }

      return headers;
    },

    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa các bản ghi"
      };
      return toolbarShow;
    }
  },
  methods: {
    updateCurrentTime() {
      this.currentTime = moment().unix();
    },
    getRunDuration(item) {
      if (item.status === STOP || item.status === PAUSE) {
        const last_time = item.last_time_pause || item.end_time;
        return (
          moment(last_time, SQL_TIMESTAMP).unix() -
          moment(item.start_time).unix() -
          item.total_time_pause
        );
      } else if (item.status === RUNNING) {
        const currentTime = Date.now();
        return (
          moment(currentTime).unix() - moment(item.start_time).unix() - item.total_time_pause
        );
      }
      return 0;
    },
    openApiInstruction(item) {
      this.$refs.apiDialog.show(item);
    },
    checkHasApi(item) {
      return item.target_type === "api";
    },
    checkShowButtonPause(item) {
      return item.status === "running";
    },
    checkShowButtonStart(item) {
      return item.status === "pause";
    },
    checkShowButtonStop(item) {
      return item.status === "pause" || item.status === "running";
    },
    checkShowButtonConfirm(item) {
      return item.status === "confirming";
    },
    getAgency(item) {
      return item.agency || {};
    },
    getAdvertiser(item) {
      return item.advertiser || {};
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    copyItem(item) {
      this.$refs.dialog.show(item, true);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    confirmItem(item) {
      this.$refs.confirmDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    getNamePlatform(platformId) {
      const platform = PLATFORM.find(({ value }) => value === platformId);
      return platform?.text || platformId;
    },
    displayTimeSent(item) {
      let msg = "";
      if (Array.isArray(item.schedule)) {
        item.schedule.forEach(e => {
          const days = e.days
            .map(day => {
              return WEEKDAY_MAP[day];
            })
            .sort();
          msg += days.join(", ") + ": <br/>";
          e.times.forEach(time => {
            msg += `Từ ${time.start} đến ${time.end};<br/> `;
          });
        });
      }
      return msg;
    },
    startItem(item) {
      this.$refs.statusDialog.show(item, "running");
    },
    pauseItem(item) {
      this.$refs.statusDialog.show(item, "pause");
    },
    stopItem(item) {
      this.$refs.statusDialog.show(item, "stop");
    }
  }
});

export default DataSponsorTable;
export type DataSponsorTableRef = InstanceType<typeof DataSponsorTable>;
</script>
