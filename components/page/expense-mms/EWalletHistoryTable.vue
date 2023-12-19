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
        <e-wallet-form-recharge
          ref="eWalletFormRecharge"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        ></e-wallet-form-recharge>
        <e-wallet-form-async-account
          ref="eWalletFormAsyncAccount"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        ></e-wallet-form-async-account>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import EWalletFormAsyncAccount from "@/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletFormRecharge from "@/components/page/expense-mms/EWalletFormRecharge.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { DATE, RESOURCE } from "@/constants/filterType";
import { ADS_MMS } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { ROLE_AGENCY } from "~/constants/role";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { ApiDataTableRef } from "~/components/table/ApiDataTable.vue";
import { RedirectRechargeFormDialogRef } from "~/components/page/expense-redirect/RedirectRechargeFormDialog.vue";
import { SettingMaxDebtFormDialogRef } from "~/components/page/expense-redirect/SettingMaxDebtFormDialog.vue";
import { EWalletInterface } from "~/interface/data/expense";

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
  linkAccount(item: EWalletInterface): void;
  recharge(item: EWalletInterface): void;
  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "EWalletHistoryTable",
  components: {
    EWalletFormAsyncAccount,
    EWalletFormRecharge,
    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: ADS_MMS
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
          value: "agency",
          width: 150
        },
        {
          text: "Tên advertiser",
          value: "advertiser",
          width: 150
        },
        {
          text: "Nội dung",
          value: "phone",
          width: 300
        },
        {
          text: "Số tiền",
          value: "email",
          width: 180
        },
        {
          text: "Loại hiển thị",
          value: "type",
          width: 150
        },
        {
          text: "Thời gian ghi nhận",
          value: "company",
          width: 250
        }
      ],
      filters: [
        {
          type: RESOURCE,
          name: "advertiser",
          label: "Agency",
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
          type: DATE,
          name: "create_time",
          label: "Thời gian ghi nhận"
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
    linkAccount(item) {
      this.$refs.eWalletFormAsyncAccount.show(item);
    },
    recharge(item) {
      this.$refs.eWalletFormRecharge.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
