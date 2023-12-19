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
        selectable
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
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @delete-selected="deleteSelected"
        @approve-campaign="approveCampaign"
        @reject-campaign="rejectCampaign"
        @start-campaign="startCampaign"
        @pause-campaign="pauseCampaign"
        @stop-campaign="stopCampaign"
        @copy-campaign="cloneCampaign"
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
            <nuxt-link :to="`/manage-campaign/list/${item.id}`"
              >{{ item.name }}
            </nuxt-link>
          </v-layout>
        </template>
        <template slot="item.agency" slot-scope="{ item }">
          <nuxt-link
            v-if="item.agency"
            :to="`/user/${item.agency.id}`"
            class="truncate-2 w-full block"
            >{{ item.agency.full_name }}
          </nuxt-link>
        </template>
        <template slot="item.zone" slot-scope="{ item }">
          <span v-if="item.zone" class="truncate-2 w-full block">{{
            item.zone.name
          }}</span>
        </template>
        <template slot="item.advertiser" slot-scope="{ item }">
          <span v-if="item.advertiser">{{ item.advertiser.full_name }}</span>
        </template>
        <template slot="item.start_time" slot-scope="props">
          <span>{{ props.item.start_time | date }}</span>
        </template>
        <template slot="item.end_time" slot-scope="props">
          <span>{{ props.item.end_time | date }}</span>
        </template>
        <template slot="item.budget" slot-scope="{ item }">
          <div class="text-right">{{ item.budget | currency }}</div>
        </template>
        <template slot="item.expense" slot-scope="props">
          <div class="text-right">{{ props.item.expense | currency }}</div>
        </template>
        <template slot="item.remain_budget" slot-scope="{ item }">
          <div class="text-right">{{ item.remain_budget | currency }}</div>
        </template>
        <template slot="item.pending_ads_count" slot-scope="{ item }"
          >{{ item.pending_ads_count | numberSpace }}
        </template>
        <template slot="item.status" slot-scope="props">
          <v-chip
            v-if="renderStatus(props.item)"
            :color="renderStatus(props.item).color"
            class="w-full justify-content-center"
            small
            label
            >{{ renderStatus(props.item).text }}
          </v-chip>
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
    <campaign-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <campaign-delete-dialog ref="deleteDialog" @action-success="refreshTable" />
    <campaign-reject-dialog ref="rejectDialog" @action-success="refreshTable" />
    <campaign-approve-dialog
      ref="approveDialog"
      @action-success="refreshTable"
    />
    <campaign-start-dialog ref="startDialog" @action-success="refreshTable" />
    <campaign-pause-dialog ref="pauseDialog" @action-success="refreshTable" />
    <campaign-stop-dialog ref="stopDialog" @action-success="refreshTable" />
    <campaign-mass-delete-dialog
      ref="massDeleteDialog"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import CampaignApproveDialog from "@/components/page/manage-campaign/campaign/CampaignApproveDialog.vue";
import CampaignDeleteDialog from "@/components/page/manage-campaign/campaign/CampaignDeleteDialog.vue";
import CampaignPauseDialog from "@/components/page/manage-campaign/campaign/CampaignPauseDialog.vue";
import CampaignRejectDialog from "@/components/page/manage-campaign/campaign/CampaignRejectDialog.vue";
import CampaignFormDialog from "@/components/page/manage-campaign/campaign/CampaignFormDialog.vue";
import CampaignStartDialog from "@/components/page/manage-campaign/campaign/CampaignStartDialog.vue";
import CampaignStopDialog from "@/components/page/manage-campaign/campaign/CampaignStopDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import ACTIONS from "@/constants/actions";
import { STATUS_CAMPAIGN } from "@/constants/dataSelect";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { ADVERTISER_CAMPAIGN, CAMPAIGN } from "@/constants/resource";
import { ROLE_IS_ADMIN, ROLE_AGENCY, ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { SummaryMMSInterface } from "~/interface/data/banner";
import ActionInterface from "~/interface/data/action";
import { FilterInterface } from "~/interface/data/filter";
import GlobalDataInterface from "~/interface/data/global";
import { CampaignFormDialogRef } from "~/components/page/manage-campaign/campaign/CampaignFormDialog.vue";
import { CampaignDeleteDialogRef } from "~/components/page/manage-campaign/campaign/CampaignDeleteDialog.vue";
import { CampaignRejectDialogRef } from "~/components/page/manage-campaign/campaign/CampaignRejectDialog.vue";
import { CampaignApproveDialogRef } from "~/components/page/manage-campaign/campaign/CampaignApproveDialog.vue";
import { CampaignStartDialogRef } from "~/components/page/manage-campaign/campaign/CampaignStartDialog.vue";
import { CampaignStopDialogRef } from "~/components/page/manage-campaign/campaign/CampaignStopDialog.vue";
import { CampaignPauseDialogRef } from "~/components/page/manage-campaign/campaign/CampaignPauseDialog.vue";
import { CampaignInterface } from "~/interface/data/campaign";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";
import CampaignMassDeleteDialog from "~/components/page/manage-campaign/campaign/CampaignMassDeleteDialog.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";

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
  filters: Array<FilterInterface>;
  selectedItems: Array<object>;
  $refs: {
    dialog: CampaignFormDialogRef;
    deleteDialog: CampaignDeleteDialogRef;
    rejectDialog: CampaignRejectDialogRef;
    approveDialog: CampaignApproveDialogRef;
    startDialog: CampaignStartDialogRef;
    stopDialog: CampaignStopDialogRef;
    pauseDialog: CampaignPauseDialogRef;
    massDeleteDialog: ConfirmDialogRef;
  };
}

interface ComponentMethod {
  checkShowButtonStop(item: CampaignInterface): boolean;

  checkShowButtonPause(item: CampaignInterface): boolean;

  checkShowButtonClone(item: CampaignInterface): boolean;

  checkShowButtonStart(item: CampaignInterface): boolean;

  renderBudget(item: CampaignInterface): boolean;

  renderStatus(item: CampaignInterface): object;

  renderCTR(item: CampaignInterface): string;

  rejectCampaign(item: CampaignInterface): void;

  approveCampaign(item: CampaignInterface): void;

  stopCampaign(item: CampaignInterface): void;

  startCampaign(item: CampaignInterface): void;

  pauseCampaign(item: CampaignInterface): void;

  addItem(): void;

  editItem(item: CampaignInterface): void;

  deleteItem(item: CampaignInterface): void;

  cloneCampaign(item: CampaignInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

interface ComponentComputed {
  isCreate: boolean;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod & ComponentComputed
>).extend({
  name: "CampaignTable",
  components: {
    CampaignMassDeleteDialog,
    CampaignStopDialog,
    CampaignPauseDialog,
    CampaignStartDialog,
    CampaignApproveDialog,
    CampaignRejectDialog,
    ConfirmDialog,
    NewCustomFilter,
    CampaignDeleteDialog,
    CampaignFormDialog,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isToggleChart: true,
        isFullScreen: true,
        isDownload: true,
        exportResource: CAMPAIGN
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
    pageName: {
      type: String,
      default: "manage-campaign-list"
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
      headers: [
        {
          text: "Chiến dịch",
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
          text: "Ngày bắt đầu",
          value: "start_time",
          align: "center",
          width: 200
        },
        {
          text: "Ngày kết thúc",
          value: "end_time",
          align: "center",
          width: 200
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },
        {
          text: "KVHT mua khoán",
          value: "zone",
          sortable: false,
          width: 160
        },
        {
          text: "Số quảng cáo chờ duyệt",
          value: "pending_ads_count",
          align: "right",
          sortable: false,
          width: 144
        },
        {
          text: "Tổng ngân sách",
          value: "budget",
          align: "right",
          width: 180
        },
        {
          text: "Số tiền QC đã chạy",
          value: "expense",
          align: "right",
          width: 180
        },
        {
          text: "Số tiền QC còn dư",
          value: "remain_budget",
          align: "right",
          width: 180
        }
      ],
      actions: [
        {
          color: "warning",
          icon: "pause",
          label: "Tạm dừng chiến dịch",
          visible: this.checkShowButtonPause,
          event: "pause-campaign"
        },
        {
          color: "success",
          icon: "play_arrow",
          label: "Bật chiến dịch",
          visible: this.checkShowButtonStart,
          event: "start-campaign"
        },
        {
          color: "error",
          icon: "stop",
          label: "Dừng chiến dịch",
          visible: this.checkShowButtonStop,
          event: "stop-campaign"
        },
        {
          color: "primary",
          icon: "content_copy",
          label: "Nhân bản",
          visible: this.checkShowButtonClone,
          event: "copy-campaign"
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
      columnsPrice: ["budget", "expense", "remain_budget"],
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
      ],
      selectedItems: []
    };
  },
  computed: {
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin || isAgency) {
        return CAMPAIGN;
      } else {
        return ADVERTISER_CAMPAIGN;
      }
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

    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };
      return toolbarShow;
    },
    actionShow() {
      let actions = this.actions.filter(
        action => !this.actionExcludes.includes(action.event)
      );
      if (!this.isPermissionAction) {
        actions = actions.filter(
          action =>
            !["pause-campaign", "start-campaign", "stop-campaign"].includes(
              action.event
            )
        );
      }

      if (!this.isPermissionReview) {
        actions = actions.filter(
          action =>
            !["approve-campaign", "reject-campaign"].includes(action.event)
        );
      }

      if (!this.isPermissionCreate) {
        actions = actions.filter(action => action.event !== "copy-campaign");
      }

      return actions;
    },
    headerShow() {
      let headers = [
        ...this.headers,
        {
          text: "Hành động",
          width: 76,
          value: "action",
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
    showColumnsPrice() {
      return this.$can(`${this.pageName}.${ACTIONS.SHOW_PRICE}`);
    },
    isCreate() {
      return this.$can(`${this.pageName}.${ACTIONS.ADD}`);
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
    checkShowButtonStop(item) {
      return item?.item_permissions?.includes("stop");
    },
    checkShowButtonPause(item) {
      return item?.item_permissions?.includes("pause");
    },
    checkShowButtonClone() {
      return this.isCreate;
    },
    checkShowButtonStart(item) {
      return item?.item_permissions?.includes("running");
    },
    renderBudget(item) {
      return this.$filters.currency(item.total_money);
    },
    renderStatus(item) {
      return STATUS_CAMPAIGN.find(({ value }) => item.status === value) || {};
    },
    renderCTR(item) {
      const numView = item.num_view;
      const numClick = item.num_click;
      if (numView && numClick) {
        return this.$filters.percent(numClick / numView);
      }
      return "0%";
    },
    rejectCampaign(item) {
      this.$refs.rejectDialog.show(item);
    },
    approveCampaign(item) {
      this.$refs.approveDialog.show(item);
    },
    stopCampaign(item) {
      this.$refs.stopDialog.show(item);
    },
    startCampaign(item) {
      this.$refs.startDialog.show(item);
    },
    pauseCampaign(item) {
      this.$refs.pauseDialog.show(item);
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    cloneCampaign(item) {
      this.$refs.dialog.show({
        ...item,
        id: null,
        isClone: true,
        name: `Bản sao ${item?.name}`
      });
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
      this.$refs.table.clearSelected();
    }
  }
});
</script>
