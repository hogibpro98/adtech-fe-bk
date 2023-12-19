<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách quảng cáo Redirect"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import BannerChart from "@/components/page/manage-campaign/banner/BannerChart.vue";
import BannerTable from "@/components/page/manage-campaign/banner/BannerTable.vue";
import Vue, { VueConstructor } from "vue";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import GlobalDataInterface from "~/interface/data/global";

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
        component: BannerChart
      },
      table: {
        props: {},
        component: BannerTable
      }
    };
  }
});
</script>
