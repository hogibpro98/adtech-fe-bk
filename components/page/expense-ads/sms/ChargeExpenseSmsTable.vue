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
import { TRANSACTION_MMS_DAILY_DETAIL } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { FilterInterface } from "~/interface/data/filter";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
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
  name: "ChargeExpenseSmsTable",
  components: {
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: "/transaction-sms/daily/charge"
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
          text: "Tên quảng cáo",
          value: "ads_name",
          width: 240
        },
        {
          text: "Chiến dịch",
          value: "campaign_name",
          width: 240
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 160
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "cat_id",
          width: 200
        },
        {
          text: "Nội dung tin",
          value: "content",
          width: 240
        },
        {
          text: "Tổng số tin nhắn đã gửi",
          value: "num_sent",
          align: "right",
          width: 180
        },
        {
          text: "Số tin nhắn đã gửi thành công",
          value: "num_success",
          align: "right",
          width: 144
        },
        {
          text: "Tỉ lệ tin nhắn gửi thành công",
          value: "rate_success",
          align: "right",
          width: 132
        },
        {
          text: "Đơn giá",
          value: "price_mms",
          align: "right",
          width: 104
        },
        {
          text: "Thành tiền",
          value: "total_money",
          align: "right",
          width: 144
        }
      ]
    };
  },
  computed: {
    headerShow() {
      const filters = this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );

      return filters;
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
