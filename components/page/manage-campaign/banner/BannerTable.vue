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
      <new-custom-filter
        v-if="filterShow && filterShow.length > 0"
        v-model="searchParams"
        :filters="filterShow"
      />
      <v-divider />
      <api-data-table
        ref="table"
        v-bind="$attrs"
        v-model="selectedItems"
        selectable
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
        :fixed-right-count="fixRightCount"
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @start-banner="startBanner"
        @stop-banner="stopBanner"
        @pause-banner="pauseBanner"
        @review-banner="reviewItem"
        @approve-banner="reviewItem"
        @reject-banner="reviewItem"
        @copy-banner="copyBanner"
        @change-filter="changeTableFilter"
        @change-table-headers="changeColumnShows"
        @approve-multi="approveBannerMulti"
        @reject-multi="rejectBannerMulti"
        @delete-selected="deleteSelected"
        @change-weight="changeWeightItem"
        @set-config="openConfig"
        @export-survey="exportSurvey"
        @fetched-data="updateCurrentTime"
      >
        <template slot="header.run_status">
          <v-tooltip offset-overflow bottom>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" color="disabled" small v-on="on">
                fiber_manual_record
              </v-icon>
            </template>
            <span>Tình trạng</span>
          </v-tooltip>
        </template>
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
            <nuxt-link :to="`/manage-ads/list-ads-redirect/${item.id}`">{{
              item.name
            }}</nuxt-link>
          </v-layout>
        </template>
        <template slot="item.agency" slot-scope="{ item }">
          <nuxt-link
            v-if="getAgency(item)"
            :to="`/user/${getAgency(item).id}`"
            class="truncate-2 w-full block"
            >{{ getAgency(item).full_name }}</nuxt-link
          >
        </template>
        <template slot="item.advertiser" slot-scope="{ item }">
          <span v-if="getAdvertiser(item)">
            {{ getAdvertiser(item).full_name }}
          </span>
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
            >{{ props.item.campaign.name }}</nuxt-link
          >
        </template>
        <template slot="item.budget" slot-scope="{ item }">
          <div class="text-right">{{ item.budget | currency }}</div>
        </template>
        <template slot="item.total_money" slot-scope="props">
          <div class="text-right">{{ props.item.total_money | currency }}</div>
        </template>
        <template slot="item.remain_budget" slot-scope="{ item }">
          <div class="text-right">{{ item.remain_budget | currency }}</div>
        </template>
        <template slot="item.price_cpm" slot-scope="{ item }">
          <div class="text-right">{{ item.price_cpm | currency }}</div>
        </template>
        <template slot="item.price_cpc" slot-scope="{ item }">
          <div class="text-right">{{ item.price_cpc | currency }}</div>
        </template>
        <template slot="item.status" slot-scope="props">
          <v-chip
            v-if="renderStatus(props.item)"
            :color="renderStatus(props.item).color"
            class="w-full justify-content-center"
            small
            label
            >{{ renderStatus(props.item).text }}</v-chip
          >
        </template>
        <template slot="item.cpm_max" slot-scope="props">
          <div class="text-right">{{ renderCPMMax(props.item) }}</div>
        </template>
        <template slot="item.ctr" slot-scope="props">
          <div class="text-right">{{ props.item.ctr | percent }}%</div>
        </template>
        <template slot="item.start_time" slot-scope="props">
          <div class="text-center">{{ props.item.start_time | date }}</div>
        </template>
        <template slot="item.end_time" slot-scope="props">
          <div class="text-center">{{ props.item.end_time | date }}</div>
        </template>
        <template slot="item.use_data" slot-scope="props">
          {{ props.item.use_data ? "x" : "" }}
        </template>
        <template slot="item.num_view" slot-scope="props">
          <div class="text-right">{{ props.item.num_view | numberSpace }}</div>
        </template>
        <template
          v-for="(threshold, index) in thresholds"
          :slot="`item.num_view_threshold_${threshold.threshold}`"
          slot-scope="props"
        >
          <div :key="`threshold-${index}`" class="text-right">
            {{
              props.item[`num_view_threshold_${threshold.threshold}`]
                | numberSpace
            }}
          </div>
        </template>
        this.thresholds.map
        <template slot="item.num_click" slot-scope="props">
          <div class="text-right">{{ props.item.num_click | numberSpace }}</div>
        </template>
        <template slot="item.is_default" slot-scope="{ item }">
          <tooltip-icon
            :color="item.is_default ? 'warning' : ''"
            :tooltip="
              item.is_default ? 'Bỏ qc mặc định' : 'Đặt làm qc mặc định'
            "
            icon-class="pointer"
            @click.prevent.stop="toggleDefault(item)"
          >
            star
          </tooltip-icon>
        </template>
        <template slot="item.num_data_success" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_data_success | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_data_fail" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_data_fail | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_data_sent" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_data_sent | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_sms_confirm_success" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_sms_confirm_success | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_sms_confirm_fail" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_sms_confirm_fail | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.cdr_num_sms_confirm_success" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.cdr_num_sms_confirm_success | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.cdr_num_sms_confirm_fail" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.cdr_num_sms_confirm_fail | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.total_money_data" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.total_money_data | currency }}</p>
          </div>
        </template>
        <template slot="item.total_time_pause" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.total_time_pause | humanize }}</p>
          </div>
        </template>
        <template slot="item.total_time_running" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ getRunDuration(item) | humanize }}</p>
          </div>
        </template>
        <template
          v-if="summary && showColumnsPrice"
          #body.prepend="{ headers, isMobile }"
        >
          <tr v-if="!isMobile">
            <td
              class="font-weight-bold nowrap"
              style="border-right: none!important"
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
    <export-component ref="exportComponent" />
    <banner-form-dialog
      v-if="isCreateBanner || isEditBanner"
      ref="bannerRedirectDialog"
      v-on="$listeners"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></banner-form-dialog>
    <banner-form-review-dialog
      ref="bannerReviewDialog"
      @action-success="refreshTable"
    ></banner-form-review-dialog>
    <banner-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></banner-delete-dialog>
    <banner-reject-dialog
      ref="rejectDialog"
      @action-success="refreshTable"
    ></banner-reject-dialog>
    <banner-stop-dialog
      ref="stopDialog"
      @action-success="refreshTable"
    ></banner-stop-dialog>
    <banner-start-dialog
      ref="startDialog"
      @action-success="refreshTable"
    ></banner-start-dialog>
    <banner-pause-dialog ref="pauseDialog" @action-success="refreshTable" />
    <banner-approve-dialog ref="approveDialog" @action-success="refreshTable" />
    <banner-change-weight-dialog
      ref="changeWeightDialog"
      @action-success="refreshTable"
    />
    <mms-banner-mass-delete-dialog
      ref="massDeleteDialog"
      banner-type="quảng cáo"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <banner-approve-multi-dialog
      ref="approveMultiDialog"
      @action-success="refreshTable"
    >
    </banner-approve-multi-dialog>
    <banner-set-default-dialog
      ref="defaultDialog"
      @action-success="refreshTable"
    />
    <reject-multi-dialog
      ref="rejectMultiDialog"
      object-name="quảng cáo"
      resource="/banner"
      @action-success="refreshTable"
    />
    <service-targeting-config-dialog ref="configDialog" />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import BannerApproveDialog from "@/components/page/manage-campaign/banner/BannerApproveDialog.vue";
import BannerDeleteDialog from "@/components/page/manage-campaign/banner/BannerDeleteDialog.vue";
import BannerFormReviewDialog from "@/components/page/manage-campaign/banner/BannerFormReviewDialog.vue";
import BannerPauseDialog from "@/components/page/manage-campaign/banner/BannerPauseDialog.vue";
import BannerRejectDialog from "@/components/page/manage-campaign/banner/BannerRejectDialog.vue";
import BannerStartDialog from "@/components/page/manage-campaign/banner/BannerStartDialog.vue";
import BannerStopDialog from "@/components/page/manage-campaign/banner/BannerStopDialog.vue";
import BannerFormDialog from "@/components/page/manage-campaign/banner/BannerFormDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import ACTIONS from "@/constants/actions";
import { CODE_SUCCESS } from "@/constants/code";
import {
  IS_DEFAULT_ADS,
  STATUS_BANNER_REDIRECT,
  STATUS_BANNER_REDIRECT_FILTER
} from "@/constants/dataSelect";
import { DATE, NUMBER, RESOURCE, SELECT } from "@/constants/filterType";
import { ADVERTISER_BANNER, BANNER } from "@/constants/resource";
import { ROLE_IS_ADMIN, ROLE_AGENCY, ROLE_ADVERTISER } from "@/constants/role";
import { cloneDeep, isEqual } from "lodash";
// @ts-ignore
import moment from 'moment/src/moment';
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { isArray, isEmpty } from "~/util/typeof";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  SummaryRedirectInterface
} from "~/interface/data/banner";
import ActionInterface from "~/interface/data/action";
import { FilterInterface } from "~/interface/data/filter";
import { BannerDeleteDialogRef } from "~/components/page/manage-campaign/banner/BannerDeleteDialog.vue";
import { BannerRejectDialogRef } from "~/components/page/manage-campaign/banner/BannerRejectDialog.vue";
import { BannerStopDialogRef } from "~/components/page/manage-campaign/banner/BannerStopDialog.vue";
import { BannerStartDialogRef } from "~/components/page/manage-campaign/banner/BannerStartDialog.vue";
import { BannerPauseDialogRef } from "~/components/page/manage-campaign/banner/BannerPauseDialog.vue";
import { BannerApproveDialogRef } from "~/components/page/manage-campaign/banner/BannerApproveDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { UserInterface } from "~/interface/data/user";
import { BannerFormDialogRef } from "~/components/page/manage-campaign/banner/BannerFormDialog.vue";
import { BannerFormReviewDialogRef } from "~/components/page/manage-campaign/banner/BannerFormReviewDialog.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import MmsBannerMassDeleteDialog from "~/components/page/manage-campaign/banner/MmsBannerMassDeleteDialog.vue";
import BannerApproveMultiDialog from "~/components/page/manage-campaign/banner/BannerApproveMultiDialog.vue";
import RejectMultiDialog from "~/components/common/RejectMultiDialog.vue";
import BannerChangeWeightDialog from "~/components/page/manage-campaign/banner/BannerChangeWeightDialog.vue";
import TooltipIcon from "~/components/common/TooltipIcon.vue";
import BannerSetDefaultDialog from "~/components/page/manage-campaign/banner/BanneSetDefaultDialog.vue";
import CampaignSelect from "~/components/select/CampaignSelect.vue";
import ServiceTargetingConfigDialog from "~/components/common/ServiceTargetingConfigDialog.vue";
import ExportComponent from "~/components/common/ExportComponent.vue";
import { SQL_TIMESTAMP } from "~/constants/format";
import { PAUSE, RUNNING, STOP } from "~/constants/statusAds";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  tableFilter: object;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  currentTime?: number;
  summary: SummaryRedirectInterface;
  headers: Array<DataTableHeader>;
  columnShows: Array<string>;
  columnsPrice: Array<string>;
  actions: Array<ActionInterface>;
  actionShow: Array<ActionInterface>;
  filters: Array<FilterInterface>;
  isPermissionCreate: boolean;
  isPermissionReview: boolean;
  isPermissionAction: boolean;
  thresholds: Array<number>;
  filterAll: object;
  $refs: {
    bannerRedirectDialog: BannerFormDialogRef;
    bannerReviewDialog: BannerFormReviewDialogRef;
    deleteDialog: BannerDeleteDialogRef;
    rejectDialog: BannerRejectDialogRef;
    stopDialog: BannerStopDialogRef;
    startDialog: BannerStartDialogRef;
    pauseDialog: BannerPauseDialogRef;
    approveDialog: BannerApproveDialogRef;
  };
  $bannerRepository: RepositoryInterface;
}

interface ComponentMethod {
  changeColumnShows(val: string): void;

  getThresholds(): void;

  getSummary(params: Array<object>): void;

  getAgency(item: BannerMMSInterface): UserInterface;

  getAdvertiser(item: BannerMMSInterface): UserInterface;

  canChangeWeight: boolean;

  checkShowButtonClone(): boolean;

  checkShowButtonStop(item: BannerMMSInterface): boolean;

  checkShowButtonPause(item: BannerMMSInterface): boolean;

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

  bannerDay(item: BannerMMSInterface): string;

  refreshTable(toFirstPage?: boolean): void;

  renderShowColumn(column?: object): string;

  debounceFetchSummary(): void;

  changeTableFilter(val: object): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerTable",
  components: {
    ExportComponent,
    ServiceTargetingConfigDialog,
    BannerSetDefaultDialog,
    TooltipIcon,
    BannerChangeWeightDialog,
    RejectMultiDialog,
    MmsBannerMassDeleteDialog,
    BannerApproveMultiDialog,
    BannerFormReviewDialog,
    BannerApproveDialog,
    BannerPauseDialog,
    BannerStartDialog,
    BannerStopDialog,
    BannerRejectDialog,
    BannerDeleteDialog,
    BannerFormDialog,
    NewCustomFilter,
    ApiDataTable
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
        exportResource: BANNER
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
    },
    createBannerSMS: {
      type: Boolean,
      default: false
    },
    createBannerRedirect: {
      type: Boolean,
      default: false
    },
    formSelectedCampaign: {
      type: Object,
      default: null
    },
    pageName: {
      type: String,
      default: "manage-ads-list-ads-redirect"
    }
  },
  data() {
    return {
      searchParams: null,
      tableFilter: {},
      userId: this.$auth.user.id,
      startIndex: 0,
      objectName: "quảng cáo",
      loading: false,
      currentTime: null,
      summary: null,
      timeoutSummary: null,
      selectedItems: [],
      thresholds: [],
      columnShows: [],
      columnsPrice: ["budget", "total_money", "remain_budget", "price_cpm"],
      actions: [
        {
          color: "success",
          icon: "download",
          label: "Tải kết quả khảo sát",
          visible: item => {
            return (
              item.use_data &&
              ["pause", "running", "stop"].includes(item.status)
            );
          },
          event: "export-survey"
        },
        {
          color: "primary",
          icon: "settings",
          label: "Điều chỉnh trọng số",
          visible: item => {
            return this.canChangeWeight;
          },
          event: "change-weight"
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
          type: DATE,
          name: "custom_running_time",
          request_name: "custom_running_time",
          label: "Thời gian diễn ra",
          renderQuery: (filter, setInnerValue) => {
            setInnerValue(filter.name, filter.value);
          }
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: STATUS_BANNER_REDIRECT_FILTER
        },
        {
          type: SELECT,
          multiple: false,
          name: "is_default",
          label: "Quảng cáo mặc định",
          items: IS_DEFAULT_ADS
        },
        {
          type: SELECT,
          name: "pricing_mode",
          multiple: false,
          label: "Loại đơn giá",
          items: [
            {
              value: "cpm",
              text: "CPM"
            },
            {
              value: "cpc",
              text: "CPC"
            }
          ]
        },
        {
          type: NUMBER,
          name: "ctr",
          label: "CTR",
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
        },
        {
          type: NUMBER,
          name: "num_view",
          label: "Lượt impression",
          props: {
            rules: "numeric"
          }
        },
        {
          type: NUMBER,
          name: "num_click",
          label: "Lượt click",
          props: {
            rules: "numeric"
          }
        },
        {
          type: NUMBER,
          name: "weight",
          label: "Độ ưu tiên",
          props: {
            rules: "numeric"
          }
        },
        {
          type: SELECT,
          name: "use_data",
          multiple: false,
          label: "Tích hợp tài trợ data",
          items: [
            {
              value: "0",
              text: "Không"
            },
            {
              value: "1",
              text: "Có"
            }
          ]
        }
      ]
    };
  },
  computed: {
    fixRightCount() {
      return 1;
    },
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin || isAgency) {
        return BANNER;
      } else {
        return ADVERTISER_BANNER;
      }
    },
    isCreateBanner() {
      return this.$can(`${this.pageName}.${ACTIONS.ADD}`);
    },
    canChangeWeight() {
      return this.$can(`${this.pageName}.change-weight`);
    },
    isEditBanner() {
      return this.$can(`${this.pageName}.${ACTIONS.EDIT}`);
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
    isPermissionAction() {
      return this.$can(`${this.pageName}.${ACTIONS.ACTION}`);
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
      if (this.isPermissionReview) {
        const itemsApprove = this.selectedItems?.filter(item =>
          item?.item_permissions?.includes("approve")
        );
        toolbarShow["approve-multi"] = {
          icon: "check",
          desc: `Phê duyệt (${itemsApprove?.length})`,
          disabled:
            this.selectedItems.length === 0 || itemsApprove?.length === 0,
          tooltip: "Đồng ý duyệt"
        };

        const itemsReject = this.selectedItems?.filter(item =>
          item?.item_permissions?.includes("reject")
        );
        toolbarShow["reject-multi"] = {
          icon: "close",
          desc: `Từ chối (${itemsReject?.length})`,
          disabled:
            this.selectedItems.length === 0 || itemsReject?.length === 0,
          tooltip: "Từ chói phê duyệt quảng cáo"
        };
      }

      return toolbarShow;
    },
    headers() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 250
        },
        {
          text: "Agency",
          value: "agency",
          sortable: false,
          width: 250
        },
        {
          text: "Advertiser",
          value: "advertiser",
          sortable: false,
          width: 250
        },
        {
          text: "Chiến dịch",
          value: "campaign",
          sortable: false,
          width: 250
        },
        {
          text: "Loại đơn giá",
          value: "pricing_mode",
          width: 144
        },
        {
          text: "CPM",
          value: "price_cpm",
          align: "right",
          width: 144
        },
        {
          text: "CPC",
          value: "price_cpc",
          align: "right",
          width: 144
        },
        {
          text: "Thời gian bắt đầu",
          value: "start_time",
          align: "center",
          width: 160
        },
        {
          text: "Thời gian kết thúc",
          value: "end_time",
          align: "center",
          width: 160
        },
        {
          text: "Trạng thái quảng cáo",
          value: "status",
          width: 180
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
          text: "Lượt impression",
          value: "num_view",
          align: "right",
          width: 160
        },
        {
          text: "Lượt click",
          value: "num_click",
          align: "right",
          width: 120
        },
        {
          text: "CTR",
          value: "ctr",
          align: "right",
          width: 88
        },
        {
          text: "Tổng ngân sách",
          value: "budget",
          align: "right",
          width: 180
        },
        {
          text: "Số tiền QC đã chạy",
          value: "total_money",
          align: "right",
          width: 180
        },
        {
          text: "Số tiền QC còn dư",
          value: "remain_budget",
          align: "right",
          width: 180
        },
        {
          text: "Tích hợp tài trợ data",
          value: "use_data",
          align: "center",
          width: 160
        },
        {
          text: "Mã gói cước",
          value: "data_code",
          width: 144
        },
        {
          text: "Dung lượng",
          align: "right",
          value: "data_capacity",
          width: 144
        },
        {
          text: "Tổng số thuê bao đã gửi",
          value: "num_data_sent",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Tổng số thuê bao đã gửi thành công",
          value: "num_data_success",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Tổng số thuê bao đã gửi thất bại",
          value: "num_data_fail",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Số tin xác nhận gửi ra gateway thành công",
          value: "num_sms_confirm_success",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Số tin xác nhận tới thiết bị thành công",
          value: "cdr_num_sms_confirm_success",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Số tin xác nhận gửi ra gateway thất bại",
          value: "num_sms_confirm_fail",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Số tin xác nhận tới thiết bị thất bại",
          value: "cdr_num_sms_confirm_fail",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Tổng tiền data đã chạy",
          value: "data_total_money",
          sortable: false,
          align: "right",
          width: 200
        },
        {
          text: "Độ ưu tiên",
          value: "weight",
          align: "center",
          visible: this.canChangeWeight,
          width: 120
        },
        {
          text: "QC mặc định",
          value: "is_default",
          visible: this.canChangeWeight,
          align: "center",
          width: 144
        }
      ];
    },

    headerShow() {
      let headers = [
        ...this.headers,
        {
          text: "Hành động",
          value: "action",
          width: 200,
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

      const indexColumnNumView = headers.findIndex(
        header => header?.value === "num_view"
      );
      if (
        indexColumnNumView !== -1 &&
        isArray(this.thresholds) &&
        !isEmpty(this.thresholds)
      ) {
        const headerSummaryThresholds = this.thresholds.map(threshold => {
          const text =
            threshold?.threshold === 0
              ? "non-skippable"
              : `${threshold?.threshold}s`;
          return {
            text: `Lượt view ${text}`,
            value: `num_view_threshold_${threshold?.threshold}`,
            align: "right",
            sortable: false,
            width: 160
          };
        });
        headers = [
          ...headers?.slice(0, indexColumnNumView),
          headers[indexColumnNumView],
          ...headerSummaryThresholds,
          ...headers?.slice(indexColumnNumView + 1)
        ];
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
      if (!this.isPermissionAction) {
        return [];
      }

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
      handler(newValue, oldValue) {
        if (!isEqual(newValue, oldValue)) {
          this.debounceFetchSummary();
        }
      },
      deep: true
    },
    showColumnsPrice(val) {
      if (val) {
        this.debounceFetchSummary();
      }
    }
  },
  mounted() {
    this.debounceFetchSummary();
    this.getThresholds();
  },
  methods: {
    changeColumnShows(val) {
      this.columnShows = val;
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
    approveBannerMulti() {
      const items = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("approve")
      );
      if (items?.length > 0) {
        this.$refs.approveMultiDialog.show(items);
      }
    },
    rejectBannerMulti() {
      const itemIds = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("reject")
      );
      if (itemIds?.length > 0) {
        this.$refs.rejectMultiDialog.show(itemIds);
      }
    },
    async getThresholds() {
      try {
        const { data } = await this.$adsVideoTypeRepository.select({
          page: 1,
          itemsPerPage: -1
        });
        this.thresholds = data;
      } catch (e) {
        console.log(e);
      }
    },
    async getSummary(params) {
      if (!this.showColumnsPrice) {
        return;
      }
      try {
        const { data } = await this.$bannerRepository.post("summary", params);
        this.summary = data;
      } catch (e) {
        console.log(e);
      }
    },
    getAgency(item) {
      const campaign = item.campaign || {};
      return campaign.agency;
    },
    getAdvertiser(item) {
      const campaign = item.campaign || {};
      return campaign.advertiser;
    },

    checkShowButtonClone() {
      return this.isPermissionCreate;
    },
    checkShowButtonStop(item) {
      return item?.item_permissions?.includes("stop");
    },
    checkShowButtonPause(item) {
      return item?.item_permissions?.includes("pause");
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
    checkShowButtonReview(item) {
      return (
        item?.item_permissions?.includes("approve") &&
        item?.item_permissions?.includes("reject")
      );
    },
    addItem() {
      if (this.formSelectedCampaign) {
        this.$refs.bannerRedirectDialog.show({
          autoFillCampaign: true,
          campaign_id: this.formSelectedCampaign.id,
          campaign: this.formSelectedCampaign
        });
      } else {
        this.$refs.bannerRedirectDialog.show();
      }
    },
    async editItem(item) {
      try {
        this.loading = true;
        const res = await this.$bannerRepository.getDetail(item.id);
        this.loading = false;
        if (res.code === CODE_SUCCESS && res.data) {
          this.$refs.bannerRedirectDialog.show(res.data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    },
    async copyBanner(item) {
      try {
        this.loading = true;
        const res = await this.$bannerRepository.getDetail(item.id);
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
          this.$refs.bannerRedirectDialog.show(data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        console.log(e);
        this.$toast.global.action_fail();
      }
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    async reviewItem(item) {
      try {
        this.loading = true;
        const res = await this.$bannerRepository.getDetail(item.id);
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
    stopBanner(item) {
      this.$refs.stopDialog.show(item);
    },
    pauseBanner(item) {
      this.$refs.pauseDialog.show(item);
    },
    startBanner(item) {
      this.$refs.startDialog.show(item);
    },
    rejectBanner(item) {
      this.$refs.rejectDialog.show(item);
    },
    approveBanner(item) {
      this.$refs.approveDialog.show(item);
    },
    changeWeightItem(item) {
      this.$refs.changeWeightDialog.show(item);
    },
    renderStatus(item) {
      return STATUS_BANNER_REDIRECT.find(({ value }) => item.status === value);
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
    renderCTR(item) {
      const numView = item.num_view;
      const numClick = item.num_click;
      if (numView && numClick) {
        return `${this.$filters.percent(numClick / numView)}%`;
      } else if (numView && !numClick) {
        return "0%";
      }
      return "-";
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
    renderShowColumn(column) {
      if (column?.value === "total_money") {
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
    toggleDefault(item) {
      this.$refs.defaultDialog.show(item);
    },
    openConfig() {
      this.$refs.configDialog.show("redirect", "quảng cáo Redirect");
    },
    exportSurvey(item) {
      const url = process.env.API_EXPORT_BASE + "export/survey-answer";
      const params = {
        ads_id: item.id
      };
      this.$refs.exportComponent.start(url, params);
    }
  }
});
</script>
