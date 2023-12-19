<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách top zone"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import Vue, { VueConstructor } from "vue";
import DataChart from "~/components/page/revenue/zone/data-chart/DataChart.vue";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import DataTable from "~/components/page/revenue/zone/data-table/DataTable.vue";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    DataChart,
    DataTable,
    ShowChartAndTable
  },
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        queryParams: {},
        component: DataChart
      },
      table: {
        props: {
          createBannerSMS: true
        },
        component: DataTable
      }
    };
  }
});
</script>
