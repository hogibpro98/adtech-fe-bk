<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <v-overlay v-if="loading" absolute color="#fff" class="z-30">
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
        selectable
        calculate-widths
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @start-banner="startBanner"
        @pause-banner="pauseBanner"
        @stop-banner="stopBanner"
        @delete-selected="deleteSelected"
        @review-banner="reviewItem"
        @approve-banner="reviewItem"
        @reject-banner="reviewItem"
        @review-banner-template="reviewItemTemplate"
        @approve-banner-template="reviewItemTemplate"
        @reject-banner-template="reviewItemTemplate"
        @copy-banner="copyBanner"
        @change-filter="changeTableFilter"
        @change-table-headers="changeColumnShows"
        @approve-multi="approveBannerMulti"
        @reject-multi="rejectBannerMulti"
        @test-message="testMessage"
        @show-api="openApiInstruction"
        @set-config="openConfig"
        @fetched-data="updateCurrentTime"
        @save-template="saveTemplate"
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
                  >{{ renderStatus(item).icon || "fiber_manual_record" }}
                </v-icon>
              </template>
              <span>{{ renderStatus(item).text }}</span>
            </v-tooltip>
            <nuxt-link :to="`/manage-ads/list-ads-sms/${item.id}`"
              >{{ item.name }}
            </nuxt-link>
          </v-layout>
        </template>
        <template slot="item.agency" slot-scope="{ item }">
          <nuxt-link
            v-if="getAgency(item)"
            :to="`/user/${getAgency(item).id}`"
            class="truncate-2 w-full block"
            >{{ getAgency(item).full_name }}
          </nuxt-link>
        </template>
        <template slot="item.advertiser" slot-scope="{ item }">
          <span v-if="getAdvertiser(item)">{{
            getAdvertiser(item).full_name
          }}</span>
        </template>
        <template slot="item.brand_name" slot-scope="{ item }">
          <div v-if="item.brandname && item.brandname.name">
            {{ item.brandname.name }}
          </div>
        </template>
        <template slot="item.url" slot-scope="props">
          <a
            :href="props.item.url"
            class="truncate-2 w-full block"
            target="_blank"
            >{{ props.item.url }}</a
          >
        </template>
        <template slot="item.campaign" slot-scope="props">
          <nuxt-link
            :to="
              `/manage-campaign/list/${props.item.campaign &&
                props.item.campaign.id}`
            "
            >{{ props.item.campaign && props.item.campaign.name }}
          </nuxt-link>
        </template>
        <template slot="item.budget" slot-scope="{ item }">
          <div class="text-right">{{ item.budget | currency }}</div>
        </template>
        <template slot="item.sms_type" slot-scope="{ item }"
          >{{ renderMMSType(item) }}
        </template>
        <template slot="item.expense" slot-scope="props">
          <div class="text-right">{{ props.item.expense | currency }}</div>
        </template>
        <template slot="item.remain_budget" slot-scope="{ item }">
          <div class="text-right">{{ item.remain_budget | currency }}</div>
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
          <div class="text-center">{{ props.item.start_time | date }}</div>
        </template>
        <template slot="item.end_time" slot-scope="props">
          <div class="text-center">{{ props.item.end_time | date }}</div>
        </template>
        <template slot="item.schedule" slot-scope="{ item }">
          <div v-html="displayTimeSent(item)"></div>
        </template>
        <template slot="item.num_sent" slot-scope="props">
          <div class="text-right">{{ props.item.num_sent | numberSpace }}</div>
        </template>
        <template slot="item.num_success" slot-scope="props">
          <div class="text-right">
            {{ props.item.num_success | numberSpace }}
          </div>
        </template>
        <template slot="item.num_fail" slot-scope="props">
          <div class="text-right">{{ props.item.num_fail | numberSpace }}</div>
        </template>
        <template slot="item.cdr_total_success" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.cdr_total_success | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.cdr_total_fail" slot-scope="props">
          <div
            class="text-right primary--text failed-dialog-show"
            @click="failedDialogShow(props.item)"
          >
            <p>{{ props.item.cdr_total_fail | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.total_money_refund" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.total_money_refund | currency }}</p>
          </div>
        </template>
        <template slot="item.num_success" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_success | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_fail" slot-scope="props">
          <div class="text-right">{{ props.item.num_fail | numberSpace }}</div>
        </template>
        <template slot="item.rate_success" slot-scope="props">
          <div class="text-right">{{ props.item.rate_success | percent }}%</div>
        </template>
        <template slot="item.total_time_pause" slot-scope="props"
          >{{ props.item.total_time_pause | humanize }}
        </template>
        <template slot="item.total_time_running" slot-scope="{ item }"
          >{{ getRunDuration(item) | humanize }}
        </template>
        <template slot="item.total_click_shorten" slot-scope="props">
          <div class="text-right">
            {{ props.item.total_click_shorten | numberSpace }}
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
            <td style="border-right: none!important;"></td>
            <template v-for="(header, index) in columnShows">
              <td
                v-if="index !== 0"
                :key="`column-prepend-${index}`"
                style="border-right: none!important;"
                class="text-right nowrap"
              >
                <div class="text-right font-weight-bold">
                  <p>{{ renderShowColumn(header, index) }}</p>
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
    <banner-sms-form-dialog
      v-if="isCreateBanner || isEditBanner"
      ref="bannerMMSDialog"
      v-on="$listeners"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></banner-sms-form-dialog>
    <banner-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></banner-delete-dialog>
    <banner-sms-form-review-dialog
      ref="bannerReviewDialog"
      @action-success="refreshTable"
    ></banner-sms-form-review-dialog>
    <banner-sms-template-form-review-dialog
      ref="bannerMMSTemplateReviewDialog"
      @action-success="refreshTable"
    />
    <banner-reject-dialog ref="rejectDialog" @action-success="refreshTable" />
    <banner-stop-dialog ref="stopDialog" @action-success="refreshTable" />
    <banner-start-dialog ref="startDialog" @action-success="refreshTable" />
    <banner-pause-dialog ref="pauseDialog" @action-success="refreshTable" />
    <banner-approve-dialog ref="approveDialog" @action-success="refreshTable" />
    <failed-sms-message-dialog ref="failedDialog" />
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/ads"
      object-name="template SMS"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <banner-sms-approve-multi-dialog
      ref="approveMultiDialog"
      @action-success="refreshTable"
    ></banner-sms-approve-multi-dialog>

    <reject-multi-dialog
      ref="rejectMultiDialog"
      object-name="quảng cáo tin nhắn SMS"
      :resource="resource"
      @action-success="refreshTable"
    />
    <service-targeting-config-dialog ref="configDialog" />
    <api-instruction-dialog ref="apiDialog" service="sms" />
    <sms-test-dialog ref="testDialog" @action-success="refreshTable" />
    <save-sms-template-dialog
      ref="saveTemplateDialog"
      @action-success="refreshTable"
    />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import BannerApproveDialog from "@/components/page/manage-campaign/banner/BannerApproveDialog.vue";
import BannerDeleteDialog from "@/components/page/manage-campaign/banner/BannerDeleteDialog.vue";
import BannerPauseDialog from "@/components/page/manage-campaign/banner/BannerPauseDialog.vue";
import BannerRejectDialog from "@/components/page/manage-campaign/banner/BannerRejectDialog.vue";
import BannerStartDialog from "@/components/page/manage-campaign/banner/BannerStartDialog.vue";
import BannerStopDialog from "@/components/page/manage-campaign/banner/BannerStopDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import ACTIONS from "@/constants/actions";
import { CODE_SUCCESS } from "@/constants/code";
import {
  STATUS_BANNER_MMS,
  STATUS_BANNER_MMS_FILTER,
  SELECT_MMS_TYPE
} from "@/constants/dataSelect";
import { DATE, NUMBER, RESOURCE, SELECT } from "@/constants/filterType";
import { ADS_SMS } from "@/constants/resource";
import { ROLE_IS_ADMIN, ROLE_AGENCY, ROLE_ADVERTISER } from "@/constants/role";
import cloneDeep from "lodash/cloneDeep";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import BannerSmsTemplateFormReviewDialog from "~/components/page/manage-campaign/banner/BannerSmsTemplateFormReviewDialog.vue";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
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
import BannerSmsFormReviewDialog from "~/components/page/manage-ads/sms/index/BannerSmsFormReviewDialog.vue";
import BannerSmsFormDialog from "~/components/page/manage-ads/sms/index/BannerSmsFormDialog.vue";
import { WEEKDAY_MAP } from "~/constants/map";
import FailedSmsMessageDialog from "~/components/page/manage-ads/sms/FailedSmsMessagesDialog.vue";
import ServiceTargetingConfigDialog from "~/components/common/ServiceTargetingConfigDialog.vue";
import ApiInstructionDialog from "~/components/page/manage-ads/mms/ApiInstructionDialog.vue";
import SmsTestDialog from "~/components/page/manage-ads/sms/index/SmsTestDialog.vue";
import { SQL_TIMESTAMP } from "~/constants/format";
import SaveSmsTemplateDialog from "~/components/page/manage-ads/sms/SaveSmsTemplateDialog.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import BrandnameSelect from "~/components/select/BrandnameSelect.vue";
import SmsTemplateSelect from "~/components/select/SmsTemplateSelect.vue";
import BannerSmsApproveMultiDialog from "~/components/page/manage-campaign/banner/BannerSmsApproveMultiDialog.vue";
import { STOP, PAUSE, RUNNING } from "~/constants/statusAds.js";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  tableFilter: object;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  summary: SummaryMMSInterface;
  headers: Array<DataTableHeader>;
  columnShows: Array<string>;
  columnsPrice: Array<string>;
  actions: Array<ActionInterface>;
  actionShow: Array<ActionInterface>;
  filters: Array<FilterInterface>;
  isPermissionCreate: boolean;
  isPermissionReview: boolean;
  thresholds: Array<number>;
  filterAll: object;
  $refs: {
    bannerMMSDialog: BannerMMSFormDialogRef;
    deleteDialog: BannerDeleteDialogRef;
    bannerReviewDialog: BannerMMSFormReviewDialogRef;
    bannerMMSTemplateReviewDialog: BannerMMSTemplateFormReviewDialogRef;
    rejectDialog: BannerRejectDialogRef;
    stopDialog: BannerStopDialogRef;
    startDialog: BannerStartDialogRef;
    pauseDialog: BannerPauseDialogRef;
    approveDialog: BannerApproveDialogRef;
  };
  $adsSmsRepository: RepositoryInterface;
}

interface ComponentMethod {
  changeColumnShows(val: string): void;

  getSummary(params: Array<object>): void;

  checkShowButtonStop(item: BannerMMSInterface): boolean;

  checkShowButtonPause(item: BannerMMSInterface): boolean;

  checkShowButtonClone(): boolean;

  checkShowButtonStart(item: BannerMMSInterface): boolean;

  checkShowButtonApprove(item: BannerMMSInterface): boolean;

  checkShowButtonReject(item: BannerMMSInterface): boolean;

  checkShowButtonTemplateApprove(item: BannerMMSInterface): boolean;

  checkShowButtonTemplateReject(item: BannerMMSInterface): boolean;

  checkShowButtonReview(item: BannerMMSInterface): boolean;

  checkShowButtonReviewTemplate(item: BannerMMSInterface): boolean;

  addItem(): void;

  editItem(item: BannerMMSInterface): void;

  copyBanner(item: BannerMMSInterface): void;

  deleteItem(item: BannerMMSInterface): void;

  stopBanner(item: BannerMMSInterface): void;

  pauseBanner(item: BannerMMSInterface): void;

  startBanner(item: BannerMMSInterface): void;

  reviewItem(item: BannerMMSInterface): void;

  reviewItemTemplate(item: BannerMMSInterface): void;

  rejectBanner(item: BannerMMSInterface): void;

  approveBanner(item: BannerMMSInterface): void;

  renderStatus(item: BannerMMSInterface): object;

  renderMMSType(item: BannerMMSInterface): string;

  renderCPMMax(item: BannerMMSInterface): string;

  renderTotalMoneyAds(item: BannerMMSInterface): number;

  getAgency(item: BannerMMSInterface): UserInterface;

  getAdvertiser(item: BannerMMSInterface): UserInterface;

  bannerDay(item: BannerMMSInterface): string;

  refreshTable(toFirstPage?: boolean): void;

  renderShowColumn(column?: object): string;

  debounceFetchSummary(): void;

  changeTableFilter(val: object): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerSmsTable",
  components: {
    BannerSmsApproveMultiDialog,
    BaseMassDeleteDialog,
    SaveSmsTemplateDialog,
    SmsTestDialog,
    ApiInstructionDialog,
    ServiceTargetingConfigDialog,
    FailedSmsMessageDialog,
    BannerSmsFormDialog,
    BannerSmsFormReviewDialog,
    RejectMultiDialog,
    MmsBannerMassDeleteDialog,
    BannerMMSApproveMultiDialog,
    BannerMMSTemplateFormReviewDialog,
    SmsTemplateSelect,
    BannerApproveDialog,
    BannerPauseDialog,
    BannerStartDialog,
    BannerStopDialog,
    BannerRejectDialog,
    BannerDeleteDialog,
    NewCustomFilter,
    ApiDataTable,
    BannerSmsTemplateFormReviewDialog
  },
  mixins: [massDeleteTableWrapper],
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isToggleChart: true,
        isDownload: true,
        isFullScreen: true,
        exportResource: ADS_SMS
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
      default: "manage-ads-list-ads-sms"
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
      currentTime: null,
      timeoutSummary: null,
      objectName: "tin nhắn SMS",
      selectedItems: [],
      headers: [
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
          value: "sms_type",
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
          sortable: false,
          width: 240
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
          width: 200
        },
        {
          text: "Thời gian đã chạy",
          value: "total_time_running",
          align: "right",
          sortable: false,
          width: 180
        },
        {
          text: "Số lượt click QC",
          value: "total_click_shorten",
          align: "right",
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
          text: "Số tiền QC đã chạy",
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
      ],
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
          name: "sms_user_template_id",
          label: "Template SMS",
          visible: false,
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
            // type: "sms"
          },
          component: SmsTemplateSelect
        },
        {
          type: RESOURCE,
          name: "brandname_id",
          label: "Brandname",
          itemValue: "id",
          itemText: "name",
          component: BrandnameSelect,
          props: {
            multiple: false
          }
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
    isCreateBanner() {
      return this.$can(`${this.pageName}.${ACTIONS.ADD}`);
    },
    isEditBanner() {
      return this.$can(`${this.pageName}.${ACTIONS.EDIT}`);
    },
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      return ADS_SMS;
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
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };
      if (this.$pageCan("review")) {
        const itemsApprove = this.selectedItems?.filter(item =>
          item?.item_permissions?.includes("approve_template")
        );

        toolbarShow["approve-multi"] = {
          icon: "check",
          desc: `Phê duyệt (${itemsApprove?.length})`,
          disabled: itemsApprove?.length === 0,
          tooltip: "Đồng ý duyệt"
        };

        const itemsReject = this.selectedItems?.filter(item =>
          item?.item_permissions?.includes("reject_template")
        );
        toolbarShow["reject-multi"] = {
          icon: "close",
          desc: `Từ chối (${itemsReject?.length})`,
          disabled: itemsReject?.length === 0,
          tooltip: "Từ chối duyệt"
        };
      }

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
    await this.$fetchPermissions("manage-ads-sms-template");
    this.debounceFetchSummary();
  },
  methods: {
    checkCanSaveTemplate(item) {
      return (
        ["running", "pause", "stop", "waiting"].includes(item.status) &&
        item?.tempid &&
        this.$can("manage-ads-sms-template.add") &&
        item.saved_template_count === 0
      );
    },
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
          moment(currentTime).unix() -
          moment(item.start_time).unix() -
          item.total_time_pause
        );
      }
      return 0;
    },
    checkHasApi(item) {
      return item.targeting_type === "api";
    },
    checkTestMessage(item) {
      return (
        ["running", "pause", "stop", "waiting"].includes(item.status) &&
        item?.tempid
      );
    },
    changeColumnShows(val) {
      this.columnShows = val;
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
    async getSummary(params) {
      if (!this.showColumnsPrice) {
        return;
      }

      try {
        const { data } = await this.$adsSmsRepository.post("summary", params);
        this.summary = data;
      } catch (e) {
        console.log(e);
      }
    },
    checkShowButtonStop(item) {
      return item?.item_permissions?.includes("stop");
    },
    checkShowButtonPause(item) {
      return item?.item_permissions?.includes("pause");
    },
    checkShowButtonClone() {
      return this.isPermissionCreate;
    },
    checkShowButtonStart(item) {
      return item?.item_permissions?.includes("running");
    },
    checkShowButtonApprove(item) {
      return (
        item?.item_permissions?.includes("approve") &&
        !item?.item_permissions?.includes("reject")
      );
    },
    checkShowButtonReject(item) {
      return (
        !item?.item_permissions?.includes("approve") &&
        item?.item_permissions?.includes("reject")
      );
    },
    checkShowButtonTemplateApprove(item) {
      return (
        item?.item_permissions?.includes("approve_template") &&
        !item?.item_permissions?.includes("reject_template")
      );
    },
    checkShowButtonTemplateReject(item) {
      return (
        !item?.item_permissions?.includes("approve_template") &&
        item?.item_permissions?.includes("reject_template")
      );
    },
    checkShowButtonReview(item) {
      return (
        item?.item_permissions?.includes("approve") &&
        item?.item_permissions?.includes("reject")
      );
    },
    checkShowButtonReviewTemplate(item) {
      return (
        item?.item_permissions?.includes("approve_template") &&
        item?.item_permissions?.includes("reject_template")
      );
    },
    restShortUrlStore() {
      this.$store.commit("shorten/RESET_SHORTEN_URL");
      this.$store.commit("shorten/RESET_CONTENT_URL");
    },
    addItem() {
      if (this.formSelectedCampaign) {
        this.$refs.bannerMMSDialog.show({
          autoFillCampaign: true,
          campaign_id: this.formSelectedCampaign.id,
          campaign: this.formSelectedCampaign
        });
      } else {
        this.$refs.bannerMMSDialog.show();
        this.restShortUrlStore();
      }
    },
    async editItem(item) {
      try {
        this.restShortUrlStore();
        this.loading = true;
        const res = await this.$adsSmsRepository.getDetail(item.id);

        this.loading = false;
        if (res.code === CODE_SUCCESS && res.data) {
          this.$refs.bannerMMSDialog.show(res.data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    },
    async copyBanner(item) {
      try {
        this.restShortUrlStore();
        this.loading = true;
        const res = await this.$adsSmsRepository.getDetail(item.id);
        this.loading = false;
        if (res.code === CODE_SUCCESS && res.data) {
          const data = {
            ...res.data,
            name: `Bản sao ${res.data?.name}`,
            id: null
          };
          if (this.formSelectedCampaign) {
            data.campaign_id = this.formSelectedCampaign.id;
            data.campaign = this.formSelectedCampaign;
          }
          this.$refs.bannerMMSDialog.show(data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    stopBanner(item) {
      this.$refs.stopDialog.show(item);
    },
    pauseBanner(item) {
      this.$refs.pauseDialog.show(item);
    },
    failedDialogShow(item) {
      this.$refs.failedDialog.show(item.id);
    },
    startBanner(item) {
      this.$refs.startDialog.show(item);
    },
    approveBannerMulti() {
      const itemIds = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("approve_template")
      );
      if (itemIds?.length > 0) {
        this.$refs.approveMultiDialog.show(itemIds);
      }
    },
    rejectBannerMulti() {
      const itemIds = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("reject_template")
      );
      if (itemIds?.length > 0) {
        this.$refs.rejectMultiDialog.show(itemIds);
      }
    },
    async reviewItem(item) {
      try {
        this.restShortUrlStore();
        this.loading = true;
        const res = await this.$adsSmsRepository.getDetail(item.id);
        this.loading = false;
        if (res.code === CODE_SUCCESS && res.data) {
          this.$refs.bannerReviewDialog.show(res.data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        console.log(e);
        this.$toast.global.action_fail();
      }
    },
    async reviewItemTemplate(item) {
      try {
        this.restShortUrlStore();
        this.loading = true;
        const res = await this.$adsSmsRepository.getDetail(item.id);
        this.loading = false;
        if (res.code === CODE_SUCCESS && res.data) {
          this.$refs.bannerMMSTemplateReviewDialog.show(res.data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        console.log(e);
        this.$toast.global.action_fail();
      }
    },
    rejectBanner(item) {
      this.$refs.rejectDialog.show(item);
    },
    saveTemplate(item) {
      this.$refs.saveTemplateDialog.show(item);
    },
    approveBanner(item) {
      this.$refs.approveDialog.show(item);
    },
    renderStatus(item) {
      return STATUS_BANNER_MMS.find(({ value }) => item.status === value);
    },
    renderMMSType(item) {
      return SELECT_MMS_TYPE.find(({ value }) => item.sms_type === value)?.text;
    },
    renderCPMMax(item) {
      if (item.max_view) {
        return `${this.$filters.numberSpace(item.max_view)} Lượt impression`;
      } else {
        return `${this.$filters.numberSpace(
          item.max_view_per_day
        )} Lượt impression/ngày`;
      }
    },
    renderTotalMoneyAds(item) {
      const priceMMS = (item.brandname && item.brandname.price_mms) || 0;
      const maxMMS = item.max_mms || 0;
      return priceMMS * maxMMS;
    },
    getAgency(item) {
      const campaign = item.campaign || {};
      return campaign.agency;
    },
    getAdvertiser(item) {
      const campaign = item.campaign || {};
      return campaign.advertiser;
    },
    renderCTR(item) {
      const numView = item.num_view;
      const numClick = item.num_click;
      if (numView && numClick) {
        return this.$filters.percent(numClick / numView);
      }
      return "0%";
    },
    bannerDay(item) {
      const startTime = item.start_time;
      const endTime = item.end_time;

      if (!startTime || !endTime) return "";

      const date1 = moment(startTime)
        .format("DD/MM/YYYY")
        .toString();
      const date2 = moment(endTime)
        .format("DD/MM/YYYY")
        .toString();
      if (date1 !== date2) {
        return `${date1} đến ${date2}`;
      } else {
        return date1;
      }
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    openConfig() {
      this.$refs.configDialog.show("sms", "tin nhắn SMS");
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
    testMessage(item) {
      this.$refs.testDialog.show(item);
    },
    openApiInstruction(item) {
      this.$refs.apiDialog.show(item);
    }
  }
});
</script>

<style>
.failed-dialog-show {
  cursor: pointer;
}
</style>
