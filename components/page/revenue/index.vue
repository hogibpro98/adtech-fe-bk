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
        :page-name="pageName"
        :default-pagination="{
          sortBy: ['created_at'],
          sortDesc: [true]
        }"
        calculate-widths
        v-on="$listeners"
      >
        <template slot="item.name" slot-scope="{ item }">
          <v-layout class="my-0">
            <v-tooltip v-if="renderStatus(item)" offset-overflow bottom>
              <template #activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  :color="renderStatus(item).color"
                  small
                  class="mr-1"
                  v-on="on"
                >
                  {{ renderStatus(item).icon || "fiber_manual_record" }}
                </v-icon>
              </template>
              <span>{{ renderStatus(item).text }}</span>
            </v-tooltip>
            <nuxt-link :to="`/manage-ads/list-ads-mms/${item.id}`">
              {{ item.name }}
            </nuxt-link>
          </v-layout>
        </template>
        <template slot="item.agency" slot-scope="{ item }">
          <nuxt-link
            v-if="getAgency(item)"
            :to="`/user/${getAgency(item).id}`"
            class="truncate-2 w-full block"
          >
            {{ getAgency(item).full_name }}
          </nuxt-link>
        </template>
        <template slot="item.advertiser" slot-scope="{ item }">
          <span v-if="getAdvertiser(item)">
            {{ getAdvertiser(item).full_name }}
          </span>
        </template>
        <template slot="item.brand_name" slot-scope="{ item }">
          <nuxt-link
            v-if="item.brandname && item.brandname_id"
            :to="`/manager-brandname/${item.brandname.id}`"
          >
            {{ item.brandname.name }}
          </nuxt-link>
        </template>
        <template slot="item.url" slot-scope="props">
          <a
            :href="props.item.url"
            class="truncate-2 w-full block"
            target="_blank"
          >
            {{ props.item.url }}
          </a>
        </template>
        <template slot="item.campaign" slot-scope="props">
          <nuxt-link
            :to="
              `/manage-campaign/list/${props.item.campaign &&
                props.item.campaign.id}`
            "
          >
            {{ props.item.campaign && props.item.campaign.name }}
          </nuxt-link>
        </template>
        <template slot="item.budget" slot-scope="{ item }">
          <div class="text-right">
            {{ item.budget | currency }}
          </div>
        </template>
        <template slot="item.mms_type" slot-scope="{ item }">
          {{ renderMMSType(item) }}
        </template>
        <template slot="item.expense" slot-scope="props">
          <div class="text-right">
            {{ props.item.expense | currency }}
          </div>
        </template>
        <template slot="item.remain_budget" slot-scope="{ item }">
          <div class="text-right">
            {{ item.remain_budget | currency }}
          </div>
        </template>
        <template slot="item.status" slot-scope="props">
          <v-chip
            v-if="renderStatus(props.item)"
            :color="renderStatus(props.item).color"
            class="w-full justify-content-center"
            small
            label
          >
            {{ renderStatus(props.item).text }}
          </v-chip>
        </template>
        <template slot="item.start_time" slot-scope="props">
          <div class="text-right">
            {{ props.item.start_time | date }}
          </div>
        </template>
        <template slot="item.end_time" slot-scope="props">
          <div class="text-right">
            {{ props.item.end_time | date }}
          </div>
        </template>
        <template slot="item.schedule" slot-scope="{ item }">
          <div v-html="displayTimeSent(item)"></div>
        </template>
        <template slot="item.num_sent" slot-scope="props">
          <div class="text-right">
            {{ props.item.num_sent | numberSpace }}
          </div>
        </template>
        <template slot="item.cdr_total_success" slot-scope="props">
          <div class="text-right">
            {{ props.item.cdr_total_success | numberSpace }}
          </div>
        </template>
        <template slot="item.cdr_total_fail" slot-scope="props">
          <div
            class="text-right primary--text failed-dialog-show"
            @click="failedDialogShow(props.item)"
          >
            {{ props.item.cdr_total_fail | numberSpace }}
          </div>
        </template>
        <template slot="item.total_money_refund" slot-scope="props">
          <div class="text-right">
            {{ props.item.total_money_refund | currency }}
          </div>
        </template>
        <template slot="item.num_success" slot-scope="props">
          <div class="text-right">
            {{ props.item.num_success | numberSpace }}
          </div>
        </template>
        <template slot="item.num_fail" slot-scope="props">
          <div class="text-right">
            {{ props.item.num_fail | numberSpace }}
          </div>
        </template>
        <template slot="item.rate_success" slot-scope="props">
          <div class="text-right">{{ props.item.rate_success | percent }}%</div>
        </template>
        <template slot="item.total_time_pause" slot-scope="props">
          <div class="text-right">
            {{ props.item.total_time_pause | humanize }}
          </div>
        </template>
        <template slot="item.total_time_running" slot-scope="{ item }">
          <div class="text-right">
            {{ getRunDuration(item) | humanize }}
          </div>
        </template>
        <template
          v-if="summary && showColumnsPrice"
          #body.prepend="{ headers, isMobile }"
        >
          <tr v-if="!isMobile">
            <td
              class="font-weight-bold nowrap"
              style="border-right: none!important;"
            >
              Tổng
            </td>
            <td />
            <template v-for="(header, index) in columnShows">
              <td
                v-if="index !== 0"
                :key="`column-prepend-${index}`"
                style="border-right: none!important;"
                class="text-right nowrap"
              >
                <div class="text-right font-weight-bold">
                  {{ renderShowColumn(header, index) }}
                </div>
              </td>
            </template>
          </tr>
        </template>
        <template
          v-for="(_, name) in $scopedSlots"
          :slot="name"
          slot-scope="slotData"
        >
          <slot :name="name" v-bind="slotData" />
        </template>
      </api-data-table>
    </v-card>
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import ACTIONS from "@/constants/actions";
import {
  STATUS_BANNER_MMS_FILTER,
  SELECT_MMS_TYPE
} from "@/constants/dataSelect";
import { DATE, NUMBER, RESOURCE, SELECT } from "@/constants/filterType";
import { ADS_MMS, ADVERTISER_MMS } from "@/constants/resource";
import { ROLE_IS_ADMIN, ROLE_AGENCY, ROLE_ADVERTISER } from "@/constants/role";
import cloneDeep from "lodash/cloneDeep";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import PhoneGroupSelect from "~/components/select/PhoneGroupSelect.vue";
import MmsTemplateSelect from "~/components/select/MmsTemplateSelect.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  SummaryMMSInterface
} from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import BannerMMSTemplateFormReviewDialog, {
  BannerMMSTemplateFormReviewDialogRef
} from "~/components/page/manage-campaign/banner/BannerMMSTemplateFormReviewDialog.vue";
import ActionInterface from "~/interface/data/action";
import { FilterInterface } from "~/interface/data/filter";
import { BannerMMSFormDialogRef } from "~/components/page/manage-campaign/banner/BannerMMSFormDialog.vue";
import { BannerDeleteDialogRef } from "~/components/page/manage-campaign/banner/BannerDeleteDialog.vue";
import { BannerMMSFormReviewDialogRef } from "~/components/page/manage-campaign/banner/BannerMMSFormReviewDialog.vue";

import { BannerRejectDialogRef } from "~/components/page/manage-campaign/banner/BannerRejectDialog.vue";
import { BannerStopDialogRef } from "~/components/page/manage-campaign/banner/BannerStopDialog.vue";
import { BannerStartDialogRef } from "~/components/page/manage-campaign/banner/BannerStartDialog.vue";
import { BannerPauseDialogRef } from "~/components/page/manage-campaign/banner/BannerPauseDialog.vue";
import { BannerApproveDialogRef } from "~/components/page/manage-campaign/banner/BannerApproveDialog.vue";
import { UserInterface } from "~/interface/data/user";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import MmsBannerMassDeleteDialog from "~/components/page/manage-campaign/banner/MmsBannerMassDeleteDialog.vue";
import BannerMMSApproveMultiDialog from "~/components/page/manage-campaign/banner/BannerMMSApproveMultiDialog.vue";
import RejectMultiDialog from "~/components/common/RejectMultiDialog.vue";
import { WEEKDAY_MAP } from "~/constants/map";
import FailedMmsMessageDialog from "~/components/page/manage-ads/mms/FailedMmsMessagesDialog.vue";
import MmsTestDialog from "~/components/page/manage-ads/mms/MmsTestDialog.vue";
import ApiInstructionDialog from "~/components/page/manage-ads/mms/ApiInstructionDialog.vue";
import ServiceTargetingConfigDialog from "~/components/common/ServiceTargetingConfigDialog.vue";
import { SQL_TIMESTAMP } from "~/constants/format";
import { fetchPermissionToStorage } from "~/util/permission";
import SaveTemplateDialog from "~/components/page/manage-ads/mms/SaveTemplateDialog.vue";


export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
  >).extend({
  name: "PageRevenue",
  components: {
  },
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isToggleChart: true,
        isDownload: true,
        isFullScreen: true,
        exportResource: ADS_MMS
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
    },
    actionExcludes: {
      type: Array,
      default: () => []
    },
    formSelectedCampaign: {
      type: Object,
      default: null
    },
    pageName: {
      type: String,
      default: "manage-ads-list-ads-mms"
    }
  },
  data() {
    return {
      searchParams: null,
      tableFilter: {},
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      summary: null,
      timeoutSummary: null,
      currentTime: null,
      objectName: "tin nhắn MMS",
      selectedItems: [],
      columnShows: [],
      columnsPrice: ["budget", "expense", "remain_budget"],
      actions: [
        {
          color: "success",
          icon: "mdi-content-save",
          label: "Lưu template",
          event: "save-template",
          visible: this.checkCanSaveTemplate
        },
        {
          color: "purple",
          icon: "mdi-api",
          label: "Hướng dẫn API",
          event: "show-api",
          visible: this.checkHasApi
        },
        {
          color: "primary",
          icon: "mdi-email-send",
          label: "Gửi thử tin nhắn",
          event: "test-message",
          visible: this.checkTestMessage
        },
        {
          color: "warning",
          icon: "pause",
          label: "Tạm dừng quảng cáo",
          visible: this.checkShowButtonPause,
          event: "pause-banner"
        },
        {
          color: "success",
          icon: "play_arrow",
          label: "Bật quảng cáo",
          visible: this.checkShowButtonStart,
          event: "start-banner"
        },
        {
          color: "error",
          icon: "stop",
          label: "Dừng quảng cáo",
          visible: this.checkShowButtonStop,
          event: "stop-banner"
        },
        {
          color: "purple",
          icon: "visibility",
          label: "Duyệt",
          visible: this.checkShowButtonReview,
          event: "review-banner"
        },
        {
          color: "purple",
          icon: "visibility",
          label: "Duyệt Template",
          visible: this.checkShowButtonReviewTemplate,
          event: "review-banner-template"
        },
        {
          color: "success",
          icon: "check",
          label: "Phê duyệt Template",
          visible: this.checkShowButtonTemplateApprove,
          event: "approve-banner-template"
        },
        {
          color: "error",
          icon: "close",
          label: "Từ chối Template",
          visible: this.checkShowButtonTemplateReject,
          event: "reject-banner-template"
        },
        {
          color: "success",
          icon: "check",
          label: "Phê duyệt quảng cáo",
          visible: this.checkShowButtonApprove,
          event: "approve-banner"
        },
        {
          color: "error",
          icon: "close",
          label: "Từ chối quảng cáo",
          visible: this.checkShowButtonReject,
          event: "reject-banner"
        },
        {
          color: "primary",
          icon: "content_copy",
          label: "Nhân bản",
          visible: this.checkShowButtonClone,
          event: "copy-banner"
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
          name: "mms_type",
          label: "Loại tin nhắn",
          items: SELECT_MMS_TYPE
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: STATUS_BANNER_MMS_FILTER
        },
        {
          type: DATE,
          name: "custom_running_time",
          request_name: "custom_running_time",
          label: "Thời gian diễn ra",
          renderQuery: (filter, setInnerValue) => {
            setInnerValue(filter.name, filter.value);
          }
        },
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
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 240
        },
        {
          text: "Agency",
          value: "agency",
          sortable: false,
          width: 240
        },
        {
          text: "Advertiser",
          value: "advertiser",
          sortable: false,
          width: 240
        },
        {
          text: "Chiến dịch",
          value: "campaign",
          sortable: false,
          width: 240
        },
        {
          text: "Template Id",
          value: "tempid",
          sortable: false,
          width: 220
        },
        {
          text: "Loại quảng cáo",
          value: "mms_type",
          sortable: false,
          width: 220
        },
        {
          text: "Brandname",
          value: "brand_name",
          sortable: false,
          width: 240
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "cat_id",
          // sortable: false,
          width: 240
        },
        {
          text: "Thời gian bắt đầu",
          value: "start_time",
          width: 160,
          align: "right"
        },
        {
          text: "Thời gian kết thúc",
          value: "end_time",
          width: 160,
          align: "right"
        },
        {
          text: "Thời gian gửi tin",
          value: "schedule",
          width: 200
        },

        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
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
          text: "Tổng số tin nhắn đã gửi",
          value: "num_sent",
          align: "right",
          width: 144
        },
        {
          text: "Số tin gửi ra gateway thành công",
          value: "num_success",
          align: "right",
          width: 180
        },
        {
          text: "Số tin nhắn tới thiết bị thành công",
          value: "cdr_total_success",
          align: "right",
          width: 180
        },
        {
          text: "Số tin gửi ra gateway thất bại",
          value: "num_fail",
          align: "right",
          width: 180
        },
        {
          text: "Số tin nhắn tới thiết bị thất bại",
          value: "cdr_total_fail",
          align: "right",
          width: 180
        },
        {
          text: "Tỉ lệ tin nhắn gửi thành công",
          value: "rate_success",
          align: "right",
          width: 144
        },
        {
          text: "Tổng ngân sách",
          value: "budget",
          align: "right",
          width: 182
        },
        {
          text: "Số tiền refund",
          value: "total_money_refund",
          align: "right",
          width: 182
        },
        {
          text: "Số tiền đã chạy",
          value: "expense",
          align: "right",
          width: 182
        },
        {
          text: "Số tiền QC còn dư",
          value: "remain_budget",
          align: "right",
          width: 182
        }
      ];
    },
    isCreateBanner() {
      return this.$can(`${this.pageName}.${ACTIONS.ADD}`);
    },
    isEditBanner() {
      return this.$can(`${this.pageName}.${ACTIONS.EDIT}`);
    },
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin || isAgency) {
        return ADS_MMS;
      } else {
        return ADVERTISER_MMS;
      }
    },
    showColumnsPrice() {
      return this.$can(`${this.pageName}.${ACTIONS.SHOW_PRICE}`);
    },
    isPermissionCreate() {
      return this.$can(`${this.pageName}.${ACTIONS.ADD}`);
    },
    isPermissionReview() {
      return this.$can(`${this.pageName}.${ACTIONS.REVIEW}`);
    },

    canSetting() {
      return this.$can("system-config.edit");
    },
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      if (this.canSetting) {
        toolbarShow["set-config"] = {
          icon: "camera",
          desc: `Mục tiêu`,
          tooltip: "Điều chỉnh targeting sử dụng"
        };
      }
      const itemsApprove = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("approve_template")
      );
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };
      toolbarShow["approve-multi"] = {
        icon: "check",
        desc: `Phê duyệt (${itemsApprove?.length})`,
        disabled: this.selectedItems.length === 0 || itemsApprove?.length === 0,
        tooltip: "Đồng ý duyệt"
      };

      const itemsReject = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("reject_template")
      );
      toolbarShow["reject-multi"] = {
        icon: "close",
        desc: `Từ chối (${itemsReject?.length})`,
        disabled: this.selectedItems.length === 0 || itemsReject?.length === 0,
        tooltip: "Từ chối duyệt"
      };

      return toolbarShow;
    },
    headerShow() {
      let headers = [
        ...this.headers,
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: this.actionShow
        }
      ].filter(header => !this.headerExcludes.includes(header.value));

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

      if (this.showColumnsPrice) {
        return headers;
      } else {
        return headers.filter(
          header => !this.columnsPrice.includes(header.value)
        );
      }
    },
    actionShow() {
      let actions = this.actions.filter(
        action => !this.actionExcludes.includes(action.event)
      );

      if (!this.isPermissionReview) {
        actions = actions.filter(
          action => !["approve-banner", "reject-banner"].includes(action.event)
        );
      }

      if (!this.isPermissionCreate) {
        actions = actions.filter(action => action.event !== "copy-banner");
      }

      return actions;
    },
    filterShow() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);
      const filterShow = this.filters.filter(
        f =>
          !this.filterExcludes.includes(f.name) &&
          !this.headerExcludes.includes(f.name)
      );
      if (isAdmin) {
        return filterShow;
      } else if (isAgency) {
        return filterShow.filter(f => f.name !== "agency_id");
      } else {
        return filterShow.filter(
          f => f.name !== "agency_id" && f.name !== "advertiser_id"
        );
      }
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    },
    filterAll() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      const tableFilter = this.tableFilter || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps,
        ...tableFilter
      };
    }
  },
  watch: {
    filterAll: {
      handler() {
        this.debounceFetchSummary();
      },
      deep: true
    },
    showColumnsPrice(val) {
      if (val) {
        this.debounceFetchSummary();
      }
    }
  },
  async mounted() {
    await this.$fetchPermissions("manage-ads-mms-template");
    this.debounceFetchSummary();
  },
  methods: {

    async getSummary(params) {
      if (!this.showColumnsPrice) {
        return;
      }

      try {
        const { data } = await this.$adsMMSRepository.post("summary", params);
        this.summary = data;
      } catch (e) {
        console.log(e);
      }
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    renderShowColumn(column) {
      if (column?.value === "expense") {
        return this.$filters.currency(this.summary?.expense);
      } else if (column?.value === "budget") {
        return this.$filters.currency(this.summary?.budget);
      } else if (column?.value === "remain_budget") {
        return this.$filters.currency(this.summary?.remain_budget);
      }
      return null;
    },
    debounceFetchSummary() {
      if (this.timeoutSummary) {
        clearTimeout(this.timeoutSummary);
      }

      this.timeoutSummary = setTimeout(() => {
        this.timeoutSummary = null;
        this.getSummary(this.filterAll);
      }, 300);
    },
    changeTableFilter(val) {
      this.tableFilter = val || {};
    },
    openConfig() {
      this.$refs.configDialog.show("mms", "tin nhắn MMS");
    }
  }
});
</script>

<style>
.failed-dialog-show {
  cursor: pointer;
}
</style>
