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
import { CHANNEL } from "~/constants/resource";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart.vue";
import { FiltersInterface } from "~/interface/plugin/filters";

interface ComponentData {
  resource: string;
  categories: Array<object>;
  $filters: FiltersInterface;
}

const ChannelChart = (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "ChannelChart",
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
      resource: CHANNEL,
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
        }
      ]
    };
  }
});

export default ChannelChart;
export type ChannelChartRef = InstanceType<typeof ChannelChart>;
</script>
