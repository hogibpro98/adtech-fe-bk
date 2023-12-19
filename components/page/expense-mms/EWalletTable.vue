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
            calculate-widths
            v-on="$listeners"
            @link-account="linkAccount"
            @recharge="recharge"
            @disconnect-account="disconnectAccount"
            @sync-remain-budget="syncRemainBudget"
          >
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                small
                :color="USER_STATUS_MAP[item.status].color"
                label
                class="w-full d-flex justify-center"
              >
                {{ USER_STATUS_MAP[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.wallet.balance" slot-scope="{ item }">
              <div
                v-if="item.wallet"
                :class="
                  item.wallet.balance >= 0 ? 'success--text' : 'error--text'
                "
                class="text-right"
              >
                {{ item.wallet.balance | currency }}
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
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import EWalletLinkAccount from "@/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletFormRecharge from "@/components/page/expense-mms/EWalletFormRecharge.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { RESOURCE, TEXT } from "@/constants/filterType";
import { AGENCY_WALLET } from "@/constants/resource";
import { CODE_SUCCESS, USER_STATUS } from "@/constants/code";
import EWalletDisconnectDialog from "@/components/page/expense-mms/EWalletDisconnectDialog.vue";
import { USER_STATUS_MAP } from "@/constants/dataSelect";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { ROLE_AGENCY } from "~/constants/role";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { ApiDataTableRef } from "~/components/table/ApiDataTable.vue";
import { EWalletInterface } from "~/interface/data/expense";
import { EWalletFormRechargeRef } from "~/components/page/expense-mms/EWalletFormRecharge.vue";
import { EWalletLinkAccountRef } from "~/components/page/expense-mms/EWalletLinkAccount.vue";
import { EWalletDisconnectDialogRef } from "~/components/page/expense-mms/EWalletDisconnectDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  $refs: {
    table: ApiDataTableRef;
    eWalletFormRecharge: EWalletFormRechargeRef;
    linkDialog: EWalletLinkAccountRef;
    disconnectDialog: EWalletDisconnectDialogRef;
  };
}

interface ComponentMethod {
  refreshTable(toFirstPage?: boolean): void;
  checkShowButtonAction(item: EWalletInterface, action: string): boolean;
  linkAccount(item: EWalletInterface): void;
  recharge(item: EWalletInterface): void;
  syncRemainBudget(item: EWalletInterface): void;
  disconnectAccount(item: EWalletInterface): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "EWalletTable",
  components: {
    EWalletDisconnectDialog,
    EWalletLinkAccount,
    EWalletFormRecharge,
    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: AGENCY_WALLET
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
          type: RESOURCE,
          name: "id",
          label: "Tài khoản",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            }
          }
        },

        {
          type: TEXT,
          name: "wallet_id",
          label: "Mã ví 511"
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
          width: 250
        },
        {
          text: "Tên doanh nghiệp",
          value: "full_name",
          width: 250
        },
        {
          text: "Email",
          value: "email",
          width: 250
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },
        {
          text: "Số điện thoại",
          value: "phone",
          width: 250
        },
        {
          text: "Mã ví 511",
          value: "wallet_id",
          width: 250,
          sortable: false
        },
        {
          text: "Số dư",
          value: "wallet.balance",
          width: 250,
          sortable: false
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
              icon: "queue",
              label: "Nạp tiền",
              visible: this.checkShowButtonAction,
              event: "recharge"
            },
            {
              color: "warning",
              icon: "cached",
              label: "Đồng bộ số dư",
              event: "sync-remain-budget",
              class: item => {
                return {
                  "rotate-infinity": this.syncingId === item.id,
                  "v-btn--disabled":
                    this.syncingId && this.syncingId !== item.id
                };
              },
              visible: this.checkShowButtonAction
            },
            {
              color: "purple",
              icon: "link",
              label: "Liên kết tài khoản ví 511",
              visible: this.checkShowButtonAction,
              event: "link-account"
            },
            {
              color: "error",
              icon: "close",
              label: "Hủy liên kết tài khoản ví 511",
              visible: this.checkShowButtonAction,
              event: "disconnect-account"
            }
          ]
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
    checkShowButtonAction(item, action) {
      if (item.status !== USER_STATUS.ACTIVE) {
        return false;
      }
      if (!item.wallet) {
        return action.event === "link-account";
      }
      return true;
    },
    linkAccount(item) {
      this.$refs.linkDialog.show(item);
    },
    recharge(item) {
      this.$refs.eWalletFormRecharge.show(item);
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
