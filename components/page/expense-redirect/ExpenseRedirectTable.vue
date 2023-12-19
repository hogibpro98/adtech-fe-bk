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
            @recharge="recharge"
            @setting-max-debt="settingMaxDebt"
          >
            <template
              v-for="(_, name) in $scopedSlots"
              :slot="name"
              slot-scope="slotData"
            >
              <slot :name="name" v-bind="slotData" />
            </template>
          </api-data-table>
        </v-card>
        <redirect-recharge-form-dialog
          ref="redirectRechargeDialog"
          @submit-success="refreshTable"
        ></redirect-recharge-form-dialog>
        <setting-max-debt-form-dialog
          ref="settingMaxDebtDialog"
          @submit-success="refreshTable"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import RedirectRechargeFormDialog from "@/components/page/expense-redirect/RedirectRechargeFormDialog.vue";
import SettingMaxDebtFormDialog from "@/components/page/expense-redirect/SettingMaxDebtFormDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { CURRENCY, RESOURCE, TEXT } from "@/constants/filterType";
import { USER_BALANCE } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { ROLE_ADVERTISER, ROLE_AGENCY } from "~/constants/role";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { TransactionMMSDaily } from "~/interface/data/expense";
import { RedirectRechargeFormDialogRef } from "~/components/page/expense-redirect/RedirectRechargeFormDialog.vue";
import { SettingMaxDebtFormDialogRef } from "~/components/page/expense-redirect/SettingMaxDebtFormDialog.vue";

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
  $refs: {
    table: ApiDataTableRef;
    redirectRechargeDialog: RedirectRechargeFormDialogRef;
    settingMaxDebtDialog: SettingMaxDebtFormDialogRef;
  };
}

interface ComponentMethod {
  recharge(item: TransactionMMSDaily): void;
  settingMaxDebt(item: TransactionMMSDaily): void;
  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "ExpenseRedirectTable",
  components: {
    SettingMaxDebtFormDialog,
    RedirectRechargeFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: USER_BALANCE
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
      headers: [
        {
          text: "Tên agency",
          value: "full_name",
          width: 250
        },
        {
          text: "Ngân sách giới hạn",
          value: "url",
          width: 250
        },
        {
          text: "Ngân sách đã chạy",
          value: "url",
          width: 250
        },
        {
          text: "Ngân sách giới hạn còn chạy",
          value: "balance",
          width: 250
        },
        {
          text: "Tổng số tiền đã chạy",
          value: "paid",
          width: 250
        },
        {
          text: "Tổng số tiền đã thu",
          value: "url",
          width: 250
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
              label: "Cập nhật sô tiền quảng cáo đã thu",
              event: "recharge"
            },
            {
              color: "warning",
              icon: "attach_money",
              label: "Cài đặt ngân sách",
              event: "setting-max-debt"
            }
          ]
        }
      ],
      filters: [
        {
          type: RESOURCE,
          name: "advertiser",
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
          name: "email",
          label: "Email",
          props: {
            rules: "email"
          }
        },
        {
          type: TEXT,
          name: "user_id",
          label: "Mã ví 511"
        },
        {
          type: TEXT,
          name: "user_id",
          label: "Số điện thoại",
          props: {
            rules: "max:15|numeric"
          }
        },
        {
          type: TEXT,
          name: "user_id",
          label: "Địa chỉ"
        },
        {
          type: CURRENCY,
          name: "user_id",
          label: "Số dư"
        },
        {
          type: RESOURCE,
          name: "advertiser",
          label: "Advertiser",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_ADVERTISER
            }
          }
        }
      ]
    };
  },
  computed: {
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
    recharge(item) {
      this.$refs.redirectRechargeDialog.show(item);
    },
    settingMaxDebt(item) {
      this.$refs.settingMaxDebtDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
