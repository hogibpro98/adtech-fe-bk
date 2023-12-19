<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách tin nhắn ngoại mạng"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import Vue, { VueConstructor } from "vue";
import BannerSmsChart from "~/components/page/manage-ads/sms/index/BannerSmsChart.vue";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import BannerTelcoTable from "~/components/page/manage-ads/vendor/BannerTelcoTable.vue";
import BannerTeloChart from "~/components/page/manage-ads/vendor/index/BannerTeloChart.vue";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    ShowChartAndTable,
    BannerTelcoTable
  },
  layout: "dashboard-without-header",
  permission: false,
  data() {
    return {
      chart: {
        props: {},
        queryParams: {},
        component: BannerTeloChart
      },
      table: {
        props: {
          createBannerSMS: true
        },
        component: BannerTelcoTable
      }
    };
  }
});
</script>
