<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filterShow" />
          <v-overlay v-if="loading" absolute color="#fff" class="z-1">
            <v-progress-circular
              :width="4"
              :size="25"
              indeterminate
              color="primary"
            >
            </v-progress-circular>
          </v-overlay>
          <overview-panel
            v-if="totalCharge !== null"
            :icons="['monetization_on', 'monetization_on']"
            :data="dataOverView"
            content-class="xs12 md4 lg3 xl3 px-1"
          />
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
            @export-file="showDialogExport"
            @detail="showDialogDetail"
          >
            <template slot="item.agency" slot-scope="{ item }">
              <span v-if="item.agency">
                <nuxt-link
                  :to="`/user/${item.agency.id}`"
                  class="truncate-2 w-full block"
                  >{{ item.agency.full_name }}</nuxt-link
                >
              </span>
            </template>
            <template slot="item.advertiser" slot-scope="{ item }">
              <span v-if="item.advertiser">{{
                item.advertiser.full_name
              }}</span>
            </template>
            <template slot="item.total_money" slot-scope="{ item }">
              <div
                :class="
                  `text-right ${
                    item.total_money < 0 ? 'error--text' : 'success--text'
                  }`
                "
              >
                <p>{{ item.total_money | currency }}</p>
              </div>
            </template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | date
            }}</template>
            <template slot="item.type" slot-scope="{ item }">
              <v-chip
                v-if="getTypeTransaction(item.type)"
                :color="getTypeTransaction(item.type).color"
                class="w-full justify-content-center"
                small
                label
                >{{ getTypeTransaction(item.type).text }}</v-chip
              >
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
        <export-dialog
          ref="exportExpenseRedirectDialog"
          :resource="resource"
          :filter="filterTable"
          @export-success="refreshTable(true)"
        ></export-dialog>
        <expense-redirect-detail-dialog ref="expenseRedirectDetailDialog" />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import ExpenseRedirectDetailDialog from "@/components/page/expense-redirect/ExpenseRedirectDetailDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { TRANSACTION_REDIRECT_DAILY } from "@/constants/resource";
import { TYPE_TRANSACTION_REDIRECT } from "@/constants/dataSelect";
import ExportDialog from "@/components/common/ExportDialog.vue";
import { DataTableHeader } from "vuetify";
import OverviewPanel, {
  DataOverviewPanelInterface
} from "~/components/common/OverviewPanel.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { ROLE_ADVERTISER, ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import { FilterInterface } from "~/interface/data/filter";

import { ExportExpenseRedirectDialogRef } from "~/components/page/expense-redirect/ExportExpenseRedirectDialog.vue";
import { ExpenseRedirectDetailDialogRef } from "~/components/page/expense-redirect/ExpenseRedirectDetailDialog.vue";

import { RepositoryInterface } from "~/interface/plugin/repository";
import { TransactionMMSDaily } from "~/interface/data/expense";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  headers: Array<DataTableHeader>;
  headerShow: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  totalCharge: number;
  totalRecharge: number;
  totalDebt: number;
  startBalance: number;
  dataOverView: Array<DataOverviewPanelInterface>;
  $transactionRedirectDailyRepository: RepositoryInterface;
  $refs: {
    exportExpenseRedirectDialog: ExportExpenseRedirectDialogRef;
    expenseRedirectDetailDialog: ExpenseRedirectDetailDialogRef;
    table: ApiDataTableRef;
  };
}

interface ComponentMethods {
  getSummary(params: object): void;
  showDialogExport(params: Array<object>): void;
  showDialogDetail(item: TransactionMMSDaily): void;
  checkShowButtonAction(item: TransactionMMSDaily): boolean;
  refreshTable(toFirstPage?: boolean): void;
  $authHasRole(role: string | Array<string>): boolean;
  getTypeTransaction(typeTransaction: string): object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ExpenseRedirectHistoryTable",
  components: {
    ExportDialog,
    OverviewPanel,
    ExpenseRedirectDetailDialog,
    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: TRANSACTION_REDIRECT_DAILY
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false,
        isDownload: true
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
      totalCharge: null,
      totalRecharge: null,
      totalDebt: null,
      startBalance: null,
      headers: [
        {
          text: "Tên agency",
          value: "agency",
          sortable: false,
          width: 240
        },
        {
          text: "Tên advertiser",
          value: "advertiser",
          sortable: false,
          width: 240
        },
        {
          text: "Số tiền",
          value: "total_money",
          width: 144,
          align: "right"
        },
        {
          text: "Ngày giao dịch",
          value: "created_at",
          align: "center",
          width: 144
        },
        {
          text: "Loại giao dịch",
          value: "type",
          align: "center",
          width: 132
        },
        {
          text: "Nội dung",
          value: "message",
          sortable: false,
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
              icon: "visibility",
              label: "Xem chi tiết",
              visible: this.checkShowButtonAction,
              event: "detail"
            }
          ]
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
          name: "type",
          label: "Loại giao dịch",
          items: TYPE_TRANSACTION_REDIRECT
        },
        {
          type: DATE,
          name: "created_at",
          label: "Ngày giao dịch",
          maxDate: "tomorrow"
        }
      ]
    };
  },
  computed: {
    dataOverView() {
      return [
        {
          name: "Giao dịch nạp tiền",
          color: "success",
          value: this.$filters.currency(this.totalRecharge)
        },
        {
          name: "Giao dịch trừ tiền",
          color: "error",
          value: this.$filters.currency(this.totalCharge)
        }
      ];
    },
    headerShow() {
      let headers = this.headers.filter(
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
    filterShow() {
      let filters = this.filters.filter(
        f => !this.filterExcludes.includes(f.name)
      );

      if (this.$authHasRole(ROLE_AGENCY) && !this.$authHasRole(ROLE_IS_ADMIN)) {
        filters = filters.filter(h => h.name !== "agency_id");
      }

      if (
        this.$authHasRole(ROLE_ADVERTISER) &&
        !this.$authHasRole(ROLE_AGENCY) &&
        !this.$authHasRole(ROLE_IS_ADMIN)
      ) {
        filters = filters.filter(
          h => h.name !== "advertiser_id" && h.name !== "agency_id"
        );
      }

      return filters;
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
  watch: {
    filterTable: {
      handler(val) {
        this.getSummary(val);
      },
      deep: true
    }
  },
  mounted() {
    this.getSummary(this.filterTable);
  },
  methods: {
    async getSummary(params) {

      try {
        const { data } = await this.$transactionRedirectDailyRepository.post(
          "summary",
          params
        );
        this.totalCharge = data.total_charge;
        this.totalDebt = data.total_debt;
        this.totalRecharge = data.total_recharge;
        this.startBalance = data.start_balance;
      } catch (e) {}
    },

    showDialogExport(item) {
      this.$refs.exportExpenseRedirectDialog.show(item);
    },
    showDialogDetail(item) {
      this.$refs.expenseRedirectDetailDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    getTypeTransaction(typeTransaction) {
      return TYPE_TRANSACTION_REDIRECT.find(
        type => type.value === typeTransaction
      );
    }
  }
});
</script>
