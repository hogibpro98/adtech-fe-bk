<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách tài trợ data"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import Vue, { VueConstructor } from "vue";
import AdsDataChart from "~/components/page/manage-ads/data/AdsDataChart.vue";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import DataSponsorTable from "~/components/page/manage-ads/data/DataSponsorTable.vue";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    DataSponsorTable,
    AdsDataChart,
    ShowChartAndTable
  },
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        queryParams: {},
        component: AdsDataChart
      },
      table: {
        props: {
          createBannerSMS: true
        },
        component: DataSponsorTable
      }
    };
  }
});
</script>
