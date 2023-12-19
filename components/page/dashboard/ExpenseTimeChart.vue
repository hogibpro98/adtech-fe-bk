<template>
  <display-card
    :loading="loading"
    title="Biểu đồ quản lý tiền quảng cáo"
    :params="params"
  >
    <div
      class="d-flex justify-content-center align-center"
      style="height: 320px;"
    >
      <multi-series-chart
        v-bind="$attrs"
        :loading.sync="loading"
        :categories="categories"
        :time-range="timeRange"
        :url="url"
        height="320px"
        width="100%"
        lazy
      />
    </div>
  </display-card>
</template>

<script lang="ts">
import DisplayCard from "@/components/common/DisplayCard.vue";
import MultiSeriesChart from "@/components/chart/common/MultiSeriesChart.vue";
import Vue, { VueConstructor } from "vue";
import colors from "vuetify/es5/util/colors";
import { ROLE_ADVERTISER } from "@/constants/role";

interface ComponentData {
  loading: boolean;
}

interface ComponentMethods {}

const ExpenseTimeChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ExpenseTimeChart",
  components: { MultiSeriesChart, DisplayCard },
  props: {
    timeRange: {
      type: Array,
      default: null
    },
    filter: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    categories() {
      return [
        {
          value: "charge_sms",
          text: "Tổng tiền tin nhắn SMS",
          type: "bar",
          color: colors.yellow.base,
          yIndex: 0,
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          value: "charge_mms",
          text: "Tổng tiền tin nhắn MMS",
          type: "bar",
          color: colors.blue.base,
          yIndex: 0,
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          value: "charge_redirect",
          text: "Tổng tiền quảng cáo redirect",
          type: "bar",
          color: colors.green.base,
          yIndex: 0,
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          value: "charge_data",
          text: "Tổng tài trợ data",
          type: "bar",
          color: colors.red.base,
          yIndex: 0,
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          value: "total_charge",
          text: "Tổng chi phí quảng cáo",
          type: "line",
          color: colors.yellow.base,
          yIndex: 0,
          mapFunc: e => {
            return (
              e.charge_mms + e.charge_redirect + e.charge_data + e.charge_sms
            );
          },
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        }
      ];
    },
    url() {
      return this.$authHasRole(ROLE_ADVERTISER)
        ? "/statistic/advertiser/expense"
        : "/statistic/expense";
    },
    params() {
      return {
        time_range: this.timeRange,
        ...this.filter
      };
    }
  }
});

export default ExpenseTimeChart;
export type ExpenseTimeChartRef = InstanceType<typeof ExpenseTimeChart>;
</script>
