<template>
  <v-flex xs12 class="no-padding">
    <time-series-chart
      v-bind="$attrs"
      :time-range="dateStatistics"
      :resource="resource"
      :categories="categories"
      :show="show"
    />
  </v-flex>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { ZONE } from "~/constants/resource";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart.vue";
import { FiltersInterface } from "~/interface/plugin/filters";

interface ComponentData {
  resource: string;
  categories: Array<object>;
  $filters: FiltersInterface;
}

const ChartZone = (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "ChartZone",
  components: { TimeSeriesChart },
  props: {
    dateStatistics: {
      type: Array,
      default: null
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      resource: ZONE,
      categories: [
        {
          text: "Lượt click",
          value: "num_click"
        },
        {
          text: "Lượt impression",
          value: "num_view"
        },
        {
          text: "Doanh thu",
          value: "total_money"
        },
        {
          text: "Lượt pageview",
          value: "num_pageview"
        },
        {
          text: "CTR",
          value: ["num_click", "num_view"],
          mapFunc: item => {
            if (item.num_view && item.num_click) {
              return this.$filters.percent(item.num_click / item.num_view);
            }
            return 0;
          },
          formatter: val => {
            return `${val}%`;
          }
        },
        {
          text: "Lượt request",
          value: "num_request"
        },
        {
          text: "Lượt lấy QC",
          value: "num_request_success"
        },
        {
          text: "Tỉ lệ lấy QC thành công",
          value: ["num_request_success", "num_request"],

          mapFunc: item => {
            if (item.num_request && item.num_request_success) {
              return this.$filters.percent(
                item.num_request_success / item.num_request
              );
            }
            return 0;
          },
          formatter: val => {
            return `${val}%`;
          }
        }
      ]
    };
  }
});

export default ChartZone;
export type ChartZoneRef = InstanceType<typeof ChartZone>;
</script>
