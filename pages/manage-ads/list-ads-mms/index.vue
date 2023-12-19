<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách tin nhắn MMS"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import BannerMMSChart from "@/components/page/manage-campaign/banner/BannerMMSChart.vue";
import BannerMMSTable from "@/components/page/manage-campaign/banner/BannerMMSTable.vue";
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
        component: BannerMMSChart
      },
      table: {
        props: {
          createBannerSMS: true
        },
        component: BannerMMSTable
      }
    };
  }
});
</script>
