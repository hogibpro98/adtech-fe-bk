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
            :page-name="pageName"
            calculate-widths
            v-on="$listeners"
            @set-threshold="setThreshold"
            @set-price="setPrice"
          >
            <template slot="item.username" slot-scope="{ item }">
              <nuxt-link
                :to="`/user/${item.id}`"
                class="truncate-2 w-full block"
                >{{ item.username }}</nuxt-link
              >
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="USER_STATUS_MAP[item.status].color"
                small
                label

                class="w-full d-flex justify-center"
                >{{ USER_STATUS_MAP[item.status].text }}</v-chip
              >
            </template>
            <template slot="item.price_cpm" slot-scope="{ item }">
              <div v-if="item.price_cpm" class="text-right">
                <p>{{ item.price_cpm | currency }}</p>
              </div>
            </template>
            <template slot="item.price_cpc" slot-scope="{ item }">
              <div v-if="item.price_cpc" class="text-right">
                <p>{{ item.price_cpc | currency }}</p>
              </div>
            </template>
            <template slot="item.charge" slot-scope="{ item }">
              <div v-if="item.charge !== null" class="text-right error--text">
                <p>{{ item.charge | currency }}</p>
              </div>
            </template>
            <template slot="item.balance" slot-scope="{ item }">
              <div
                v-if="item.balance !== null"
                :class="item.balance >= 0 ? 'success--text' : 'error--text'"
                class="text-right"
              >
                <p>{{ item.balance | currency }}</p>
              </div>
              <div v-else>Không sử dụng dịch vụ</div>
            </template>
            <template slot="item.recharge" slot-scope="{ item }">
              <div
                v-if="item.recharge !== null"
                :class="item.recharge >= 0 ? 'success--text' : 'error--text'"
                class="text-right"
              >
                <p>{{ item.recharge | currency }}</p>
              </div>
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
        <setting-threshold-form-dialog
          ref="settingThresholdDialog"
          service="redirect"
          @update-success="refreshTable"
        />
        <set-price-form-dialog
          ref="priceDialog"
          @update-success="refreshTable"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import EWalletLinkAccount from "@/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletFormRecharge from "@/components/page/expense-mms/EWalletFormRecharge.vue";
import RedirectRechargeFormDialog from "@/components/page/expense-redirect/RedirectRechargeFormDialog.vue";
import { SELECT } from "@/constants/filterType";
import { CODE_SUCCESS, USER_STATUS } from "@/constants/code";
import EWalletDisconnectDialog from "@/components/page/expense-mms/EWalletDisconnectDialog.vue";
import { USER_STATUS_MAP } from "@/constants/dataSelect";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import ACTIONS from "~/constants/actions";
import SettingThresholdFormDialog, {
  SettingThresholdFormDialogRef
} from "~/components/page/expense-mms/SettingThresholdFormDialog.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { RedirectRechargeFormDialogRef } from "~/components/page/expense-redirect/RedirectRechargeFormDialog.vue";
import ActionInterface from "~/interface/data/action";
import { EWalletFormRechargeRef } from "~/components/page/expense-mms/EWalletFormRecharge.vue";
import { EWalletLinkAccountRef } from "~/components/page/expense-mms/EWalletLinkAccount.vue";
import { EWalletDisconnectDialogRef } from "~/components/page/expense-mms/EWalletDisconnectDialog.vue";
import { UserBalanceInterface } from "~/interface/data/userBalance";
import SetPriceFormDialog from "~/components/page/expense-redirect/SetPriceFormDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  actions: Array<ActionInterface>;
  actionShow: Array<ActionInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  canViewRemain: boolean;
  isPermissionRecharge: boolean;
  syncingId: string | number;
  filterTable: object;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  $refs: {
    table: ApiDataTableRef;
    eWalletFormRecharge: EWalletFormRechargeRef;
    linkDialog: EWalletLinkAccountRef;
    disconnectDialog: EWalletDisconnectDialogRef;
    redirectRechargeDialog: RedirectRechargeFormDialogRef;
    settingThresholdDialog: SettingThresholdFormDialogRef;
  };
}

interface ComponentMethod {
  checkShowButtonRechargeRedirect(item: UserBalanceInterface): boolean;

  checkShowButtonSettingMaxDebt(item: UserBalanceInterface): boolean;

  checkShowButtonRechargeMMS(item: UserBalanceInterface): boolean;

  getDifferentBalance(item: UserBalanceInterface): number;

  linkAccount(item: UserBalanceInterface): void;

  setThreshold(item: UserBalanceInterface): void;

  rechargeMMS(item: UserBalanceInterface): void;

  rechargeRedirect(item: UserBalanceInterface): void;

  syncRemainBudget(item: UserBalanceInterface): void;

  disconnectAccount(item: UserBalanceInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    SetPriceFormDialog,
    SettingThresholdFormDialog,
    RedirectRechargeFormDialog,
    EWalletDisconnectDialog,
    EWalletLinkAccount,
    EWalletFormRecharge,
    NewCustomFilter,
    ApiDataTable
  },
  layout: "dashboard",
  permission: false,
  props: {
    resource: {
      type: String,
      default: "/redirect-balance"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false
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
    pageName: {
      type: String,
      default: "expense-ads-redirect-balance"
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

      filters: [
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: [
            {
              value: "ACTIVE",
              text: "Đang sử dụng"
            },
            {
              value: "DELETED",
              text: "Đã khóa"
            },
            {
              value: "VERIFIED",
              text: "Chờ kích hoạt"
            }
          ]
        }
      ],
      actions: [
        {
          color: "success",
          icon: "attach_money",
          label: "Cập nhật đơn giá",
          visible: this.checkShowButtonSettingMaxDebt,
          event: "set-price"
        },
        {
          color: "primary",
          icon: "settings",
          label: "Cài đặt ngân sách",
          // visible: () => true,
          visible: this.checkShowButtonSettingMaxDebt,
          event: "set-threshold"
        }
      ],
      syncingId: null
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Tên tài khoản",
          value: "username",
          width: 240
        },
        {
          text: "Tên doanh nghiệp",
          value: "full_name",
          width: 240
        },
        // {
        //   text: "Email",
        //   value: "email",
        //   width: 250
        // },
        // {
        //   text: "Số dư ví 511",
        //   value: "wallet_balance_511",
        //   width: 250,
        //   align: "right"
        // },

        {
          text: "Số dư",
          value: "balance",
          width: 200,
          align: "right"
        },
        {
          text: "Tiền đã nạp",
          value: "recharge",
          width: 180,
          align: "right"
        },
        {
          text: "Tiền đã chạy",
          value: "charge",
          width: 180,
          align: "right"
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },
        {
          text: "Giá CPM",
          value: "price_cpm",
          width: 180,
          align: "right"
        },
        {
          text: "Giá CPC",
          value: "price_cpc",
          width: 180,
          align: "right"
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: this.actionShow
        }
      ];
    },
    actionShow() {
      return this.actions;
    },
    canViewRemain() {
      return this.$can(`${this.pageName}.${ACTIONS.VIEW_REMAIN}`);
    },
    headerShow() {
      return this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );
    },
    isPermissionRecharge() {
      return this.$can(`${this.pageName}.${ACTIONS.RECHARGE_MMS}`);
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
    checkShowButtonRechargeRedirect: item => {
      return item?.item_permissions?.includes("recharge-redirect");
    },
    checkShowButtonSettingMaxDebt: item => {
      return item.balance !== null;
    },
    checkShowButtonRechargeMMS: item => {
      return item?.item_permissions?.includes("recharge-mms");
    },

    setThreshold(item) {
      this.$refs.settingThresholdDialog.show({
        user_id: item.id,
        warning_mode: item.warning_mode,
        min_threshold: item.min_threshold
      });
    },
    setPrice(item) {
      this.$refs.priceDialog.show({
        agency_id: item.id,
        price_cpc: item.price_cpc,
        price_cpm: item.price_cpm
      });
    },

    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
