<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filterShow" />
          <overview-panel
            :icons="['monetization_on', 'monetization_on']"
            :loading="loading"
            :data="dataOverView"
          />
          <v-divider></v-divider>
        </v-card>
        <api-data-table
          ref="table"
          v-bind="$attrs"
          :resource="resource"
          :headers="headerShow"
          :filter="filterTable"
          :start-index.sync="startIndex"
          :default-pagination="{
            sortBy: ['date'],
            sortDesc: [true]
          }"
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
                class="w-full block"
                style="max-width: 250px"
              >
                {{ item.agency.full_name }}
              </nuxt-link>
            </span>
            <span v-else>
              Người dùng đã bị xóa
            </span>
          </template>
          <template slot="item.advertiser" slot-scope="{ item }">
            <span v-if="item.advertiser">
              {{ item.advertiser.full_name }}
            </span>
          </template>
          <template slot="item.total_money" slot-scope="{ item }">
            <div class="text-right">
              <span v-if="item.type === 'charge'" class="error--text">
                {{ -item.total_money | currency }}
              </span>
              <span
                v-else
                :class="item.total_money > 0 ? 'success--text' : 'error--text'"
                >{{ item.total_money | currency }}</span
              >
            </div>
          </template>

          <template slot="item.date" slot-scope="{ item }">
            {{ item.date | date }}
          </template>
          <template slot="item.type" slot-scope="{ item }">
            <v-chip
              v-if="getTypeTransaction(item.type)"
              :color="getTypeTransaction(item.type).color"
              class="w-full justify-content-center"
              small
              label
            >
              {{ getTypeTransaction(item.type).text }}
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
        <!--        <expense-s-m-s-history-table ref="expenseSMSDetailDialog" />-->
        <expense-s-m-s-detail-dialog ref="expenseSMSDetailDialog" />
      </v-flex>
    </v-layout>
    <export-dialog
      ref="exportDialog"
      :resource="resource"
      :filter="filterTable"
      @export-success="refreshTable(true)"
    ></export-dialog>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import ExpenseSMSDetailDialog from "@/components/page/expense-ads/sms/ExpenseSMSDetailDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import {TRANSACTION_SMS_DAILY, TRANSACTION_SMS_VENDOR_DAILY} from "@/constants/resource";
import { TYPE_TRANSACTION_REDIRECT } from "@/constants/dataSelect";
import ExportDialog from "@/components/common/ExportDialog.vue";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import { ApiDataTableRef } from "../../table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { TransactionMMSDaily } from "~/interface/data/expense";
import { ROLE_ADVERTISER, ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import OverviewPanel, {
  DataOverviewPanelInterface
} from "~/components/common/OverviewPanel.vue";

import { RepositoryInterface } from "~/interface/plugin/repository";
import { ExportDialogRef } from "~/components/common/ExportDialog.vue";
import { ExpenseSMSDetailDialogRef } from "~/components/page/expense-ads/sms/ExpenseSMSDetailDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  totalCharge: number;
  totalRecharge: number;
  totalDebt: number;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  dataOverView: Array<DataOverviewPanelInterface>;
  $transactionSMSDailyRepository: RepositoryInterface;
  $refs: {
    table: ApiDataTableRef;
    exportDialog: ExportDialogRef;
    expenseSMSDetailDialog: ExpenseSMSDetailDialogRef;
  };
}

interface ComponentMethod {
  recharge(item: TransactionMMSDaily): void;
  settingMaxDebt(item: TransactionMMSDaily): void;
  refreshTable(toFirstPage?: boolean): void;
  getSummary(params: object): void;
  getTypeTransaction(typeTransaction: string): object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "ExpenseSMSHistoryTable",
  components: {
    ExportDialog,
    OverviewPanel,
    ExpenseSMSDetailDialog,

    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: TRANSACTION_SMS_DAILY
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
          text: "Số tiền giao dịch",
          value: "total_money",
          width: 180,
          align: "right"
        },
        {
          text: "Ngày giao dịch",
          value: "date",
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
        const { data } = await this.$transactionSMSDailyRepository.post(
          "summary",
          params
        );
        this.totalCharge = data?.total_charge;
        this.totalDebt = data?.total_debt;
        this.totalRecharge = data?.total_recharge;
      } catch (e) {}
    },
    showDialogExport(item) {
      this.$refs.exportDialog.show(item);
    },
    showDialogDetail(item) {
      this.$refs.expenseSMSDetailDialog.show(item);
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
