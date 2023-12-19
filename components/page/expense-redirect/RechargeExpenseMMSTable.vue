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
            <template slot="item.created_at" slot-scope="{ item }">
              {{ item.created_at | timestamp }}
            </template>
            <template slot="item.change" slot-scope="{ item }">
              <span
                :class="{
                  'success--text': item.change > 0,
                  'error--text': item.change < 0
                }"
              >
                {{ item.change | currency }}
              </span>
            </template>
            <template slot="item.new_balance" slot-scope="{ item }">
              {{ item.new_balance | currency }}
            </template>
            <template slot="item.old_balance" slot-scope="{ item }">
              {{ item.old_balance | currency }}
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
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { FilterInterface } from "~/interface/data/filter";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { ROLE_IS_ADMIN } from "~/constants/role";
import { GlobalDataInterface } from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  showUserApprove: boolean;
  headers: Array<DataTableHeader>;
  headerShow: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  $refs: {
    table: ApiDataTableRef;
  };
}

interface ComponentMethod {}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "RechargeExpenseMMSTable",
  components: {
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: "/transaction-mms/daily/recharge"
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
          value: "transid",
          width: 240
        },
        {
          text: "Thay đổi",
          align: "right",
          value: "change",
          width: 144
        },
        {
          text: "Số dư mới",
          align: "right",
          value: "new_balance",
          width: 144
        },
        {
          text: "Số dư cũ",
          align: "right",
          value: "old_balance",
          width: 144
        },
        {
          text: "Thời gian giao dịch",
          value: "created_at",
          width: 160
        }
      ]
    };
  },
  computed: {
    headerShow() {
      let filters = this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );

      if (!this.showUserApprove) {
        filters = this.headers.filter(
          header => header.value !== "approve_admin.full_name"
        );
      }

      return filters;
    },
    showUserApprove() {
      return this.$authHasRole(ROLE_IS_ADMIN);
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
