<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbar"
            :use-param-url="false"
            calculate-widths
            v-on="$listeners"
          >
            <template slot="item.user" slot-scope="{ item }">
              {{ item.user.full_name }}
            </template>
            <template slot="item.updated_at" slot-scope="{ item }">
              {{ item.updated_at | datetime }}
            </template>
            <template slot="item.user_created" slot-scope="{ item }">
              <div v-if="item.user_created">
                {{ item.user_created.full_name }}
              </div>
            </template>
            <template slot="item.created_at" slot-scope="{ item }">
              <div class="text-right">
                {{ item.updated_at | timestamp }}
              </div>
            </template>
            <template slot="item.amount" slot-scope="{ item }">
              <div class="text-right">
                {{ item.amount | currency }}
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
import EWalletFormAsyncAccount from "@/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletFormRecharge from "@/components/page/expense-mms/EWalletFormRecharge.vue";
import { TRANSACTION_REDIRECT_DAILY_DETAIL } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { ROLE_IS_ADMIN } from "~/constants/role";
import { GlobalDataInterface } from "~/interface/data/global";

import { FilterInterface } from "~/interface/data/filter";

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
  $refs: {
    table: ApiDataTableRef;
  };
}

interface ComponentMethod {
  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "RechargeExpenseRedirectTable",
  components: {
    EWalletFormAsyncAccount,
    EWalletFormRecharge,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: TRANSACTION_REDIRECT_DAILY_DETAIL
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
          text: "Mã nạp tiền",
          value: "code",
          width: 144
        },
        // {
        //   text: "Thời gian ghi nhận",
        //   value: "updated_at",
        //   align: "right",
        //   width: 162
        // },
        {
          text: "Người phê duyệt",
          value: "user_created",
          width: 200
        },
        {
          text: "Số tiền",
          value: "amount",
          align: "right",
          sortable: false,
          width: 152
        },
        {
          text: "Ghi chú",
          value: "note",
          sortable: false
        }
      ]
    };
  },
  computed: {
    headerShow() {
      let headers = this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );

      if (!this.$authHasRole(ROLE_IS_ADMIN)) {
        headers = headers.filter(h => h.value !== "user_created");
      }

      return headers;
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
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
