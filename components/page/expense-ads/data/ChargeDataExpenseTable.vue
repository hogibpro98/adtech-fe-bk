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

            <template slot="item.total_money" slot-scope="{ item }">
              <span>{{ item.total_money | currency }} </span>
            </template>
            <template slot="item.full_date" slot-scope="{ item }">
              {{ item.full_date | date }}
            </template>
            <template slot="item.price" slot-scope="{ item }">
              {{ item.price | currency }}
            </template>
            <template slot="item.num_success" slot-scope="{ item }">
              {{ item.num_success | numberSpace }}
            </template>
            <template slot="item.num_fail" slot-scope="{ item }">
              {{ item.num_fail | numberSpace }}
            </template>
            <template slot="item.capacity" slot-scope="{ item }">
              {{ item.capacity | numberSpace }} MB
            </template>

            <template
              v-for="(_, name) in $scopedSlots"
              :slot="name"
              slot-scope="slotData"
            >
              <slot :name="name" v-bind="slotData"/>
            </template>
          </api-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue, {VueConstructor} from "vue";
import {DataTableHeader} from "vuetify";
import {FilterInterface} from "~/interface/data/filter";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import {GlobalDataInterface} from "~/interface/data/global";

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

interface ComponentMethod {
}

export default (Vue as VueConstructor<Vue & ComponentData & ComponentMethod>).extend({
  name: "ChargeDataExpenseTable",
  components: {
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: "/transaction-data/daily/charge"
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
          text: "Tên tài trợ",
          value: "ads.name",
          sortable: false,
          width: 240
        },
        {
          text: "Chiến dịch",
          sortable: false,
          value: "campaign.name",
          width: 200
        },
        {
          text: "Mã gói cước",
          value: "data_code",
          width: 144
        },
        {
          text: "Dung lượng",
          value: "capacity",
          align: "right",
          width: 144
        },
        {
          text: "Giá",
          value: "price",
          align: "right",
          width: 144
        },
        {
          text: "Ngày thực hiện",
          value: "full_date",
          width: 200,
          align: "right"
        },
        {
          text: "Số thuê bao tài trợ thành công",
          value: "num_success",
          width: 200,
          align: "right"
        },
        {
          text: "Số thuê bao tài trợ thất bại",
          value: "num_fail",
          width: 200,
          align: "right"
        },
        {
          text: "Tổng số tiền",
          value: "total_money",
          align: "right",
          width: 160
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
