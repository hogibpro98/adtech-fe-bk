<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách sub-inventory"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import ChannelChart from "@/components/page/setting-display-ads/channel/ChannelChart.vue";
import ChannelTable from "@/components/page/setting-display-ads/channel/ChannelTable.vue";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    ShowChartAndTable
  },
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        queryParams: {},
        component: ChannelChart
      },
      table: {
        props: {},
        component: ChannelTable
      }
    };
  }
});
</script>
