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
            page-name="expense-ads-user-balance"
            calculate-widths
            v-on="$listeners"
            @link-account="linkAccount"
            @recharge-mms="rechargeMMS"
            @recharge-redirect="rechargeRedirect"
            @setting-max-debt="settingMaxDebt"
            @disconnect-account="disconnectAccount"
            @sync-remain-budget="syncRemainBudget"
          >
            <template slot="item.username" slot-scope="{ item }">
              <nuxt-link
                :to="`/user/${item.id}`"
                class="truncate-2 w-full block"
              >
                {{ item.username }}
              </nuxt-link>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="USER_STATUS_MAP[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
              >
                {{ USER_STATUS_MAP[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.price_cpm" slot-scope="{ item }">
              <div v-if="item.price_cpm" class="text-right">
                {{ item.price_cpm | currency }}
              </div>
            </template>
            <template slot="item.price_cpc" slot-scope="{ item }">
              <div v-if="item.price_cpc" class="text-right">
                {{ item.price_cpc | currency }}
              </div>
            </template>
            <template slot="item.max_debt" slot-scope="{ item }">
              <div v-if="item.max_debt" class="text-right">
                {{ item.max_debt | currency }}
              </div>
            </template>
            <template slot="item.remain_max_debt" slot-scope="{ item }">
              <div
                v-if="item.remain_max_debt"
                :class="
                  item.remain_max_debt >= item.max_debt * -1
                    ? 'success--text'
                    : 'error--text'
                "
                class="text-right"
              >
                {{ item.remain_max_debt | currency }}
              </div>
            </template>
            <template slot="item.difference" slot-scope="{ item }">
              <div
                :class="
                  getDifferentBalance(item) >= 0
                    ? 'success--text'
                    : 'error--text'
                "
                class="text-right"
              >
                {{ getDifferentBalance(item) | currency }}
              </div>
            </template>
            <template slot="item.redirect_recharge" slot-scope="{ item }">
              <div v-if="item.redirect_recharge" class="text-right">
                {{ item.redirect_recharge | currency }}
              </div>
            </template>
            <template slot="item.redirect_charge" slot-scope="{ item }">
              <div v-if="item.redirect_charge" class="text-right">
                {{ item.redirect_charge | currency }}
              </div>
            </template>

            <template slot="item.redirect_balance" slot-scope="{ item }">
              <div
                v-if="item.redirect_balance"
                :class="
                  item.redirect_balance >= 0 ? 'success--text' : 'error--text'
                "
                class="text-right"
              >
                {{ item.redirect_balance | currency }}
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
        <e-wallet-form-recharge
          ref="eWalletFormRecharge"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        ></e-wallet-form-recharge>
        <e-wallet-link-account
          ref="linkDialog"
          @success="refreshTable"
        ></e-wallet-link-account>
        <e-wallet-disconnect-dialog
          ref="disconnectDialog"
          @success="refreshTable"
        ></e-wallet-disconnect-dialog>
        <set-price-form-dialog
          ref="redirectRechargeDialog"
          @update-success="refreshTable"
        />
        <setting-threshold-form-dialog
          ref="settingMaxDebtDialog"
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
import SettingMaxDebtFormDialog from "@/components/page/expense-redirect/SettingMaxDebtFormDialog.vue";
import { SELECT } from "@/constants/filterType";
import { USER_EXPENSE } from "@/constants/resource";
import { CODE_SUCCESS, USER_STATUS } from "@/constants/code";
import EWalletDisconnectDialog from "@/components/page/expense-mms/EWalletDisconnectDialog.vue";
import { USER_STATUS_MAP } from "@/constants/dataSelect";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import { ApiDataTableRef } from "../../table/ApiDataTable.vue";
import { RedirectRechargeFormDialogRef } from "../expense-redirect/RedirectRechargeFormDialog.vue";
import { SettingMaxDebtFormDialogRef } from "../expense-redirect/SettingMaxDebtFormDialog.vue";
import { FilterInterface } from "~/interface/data/filter";
import { GlobalDataInterface } from "~/interface/data/global";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { EWalletFormRechargeRef } from "~/components/page/expense-mms/EWalletFormRecharge.vue";
import { EWalletLinkAccountRef } from "~/components/page/expense-mms/EWalletLinkAccount.vue";
import { EWalletDisconnectDialogRef } from "~/components/page/expense-mms/EWalletDisconnectDialog.vue";
import { UserBalanceInterface } from "~/interface/data/userBalance";
import SettingThresholdFormDialog from "~/components/page/expense-mms/SettingThresholdFormDialog.vue";
import SetPriceFormDialog from "~/components/page/expense-redirect/SetPriceFormDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  syncingId: string | number;
  $refs: {
    table: ApiDataTableRef;
    eWalletFormRecharge: EWalletFormRechargeRef;
    linkDialog: EWalletLinkAccountRef;
    disconnectDialog: EWalletDisconnectDialogRef;
    redirectRechargeDialog: RedirectRechargeFormDialogRef;
    settingMaxDebtDialog: SettingMaxDebtFormDialogRef;
  };
}

interface ComponentMethod {
  checkShowButtonRechargeRedirect(item: UserBalanceInterface): boolean;
  checkShowButtonSettingMaxDebt(item: UserBalanceInterface): boolean;
  checkShowButtonRechargeMMS(item: UserBalanceInterface): boolean;
  checkShowButtonSyncRemainBudget(item: UserBalanceInterface): boolean;
  getDifferentBalance(item: UserBalanceInterface): number;
  linkAccount(item: UserBalanceInterface): void;
  rechargeMMS(item: UserBalanceInterface): void;
  rechargeRedirect(item: UserBalanceInterface): void;
  settingMaxDebt(item: UserBalanceInterface): void;
  syncRemainBudget(item: UserBalanceInterface): void;
  disconnectAccount(item: UserBalanceInterface): void;
  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "UserBalanceTable",
  components: {
    SetPriceFormDialog,
    SettingThresholdFormDialog,
    SettingMaxDebtFormDialog,
    RedirectRechargeFormDialog,
    EWalletDisconnectDialog,
    EWalletLinkAccount,
    EWalletFormRecharge,
    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: USER_EXPENSE
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
          text: "Đơn giá CPM",
          value: "price_cpm",
          width: 144,
          align: "right"
        },
        {
          text: "Đơn giá CPC",
          value: "price_cpc",
          width: 144,
          align: "right"
        },
        {
          text: "Số dư QC Redirect",
          value: "redirect_balance",
          width: 200,
          align: "right"
        },
        {
          text: "Tiền QC Redirect đã chạy",
          value: "redirect_charge",
          width: 200,
          align: "right"
        },

        {
          text: "Tổng số tiền QC Redirect đã thu",
          value: "redirect_recharge",
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
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "success",
              icon: "attach_money",
              label: "Cập nhật sô tiền quảng cáo Redirect đã thu",
              visible: this.checkShowButtonRechargeRedirect,
              event: "recharge-redirect"
            },
            {
              color: "purple",
              icon: "settings",
              label: "Cài đặt ngân sách quảng cáo Redirect",
              visible: this.checkShowButtonSettingMaxDebt,
              event: "setting-max-debt"
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
    checkShowButtonRechargeRedirect: item => {
      return item?.item_permissions?.includes("recharge-redirect");
    },
    checkShowButtonSettingMaxDebt: item => {
      return item?.item_permissions?.includes("setting-max-debt");
    },
    checkShowButtonRechargeMMS: item => {
      return item?.item_permissions?.includes("recharge-mms");
    },
    checkShowButtonSyncRemainBudget: item => {
      return item?.item_permissions?.includes("recharge-mms");
    },
    getDifferentBalance(item) {
      return (item.wallet_balance || 0) - (item.wallet_balance_511 || 0);
    },
    linkAccount(item) {
      this.$refs.linkDialog.show(item);
    },
    rechargeMMS(item) {
      this.$refs.eWalletFormRecharge.show({
        full_name: item.full_name,
        id: item.id
      });
    },
    rechargeRedirect(item) {
      this.$refs.redirectRechargeDialog.show({
        user_id: item.id,
        created_at: this.$filters.sqlDate(Date.now()),
        amount: "",
        note: ""
      });
    },
    settingMaxDebt(item) {
      this.$refs.settingMaxDebtDialog.show({
        user_id: item.id,
        warning_mode: item.warning_mode,
        min_threshold: item.min_threshold
      });
    },
    async syncRemainBudget(item) {
      this.syncingId = item.id;
      try {
        const res = await this.$agencyWalletRepository.post("sync-balance", {
          id: item.id
        });
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Đồng bộ tài khoản thành công");
          this.refreshTable();
        }
      } catch (e) {}

      this.syncingId = null;
    },
    disconnectAccount(item) {
      this.$refs.disconnectDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
