<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách tin nhắn SMS"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import Vue, {VueConstructor} from "vue";
import BannerSmsChart from "~/components/page/manage-ads/sms/index/BannerSmsChart.vue";
import BannerSmsTable from "~/components/page/manage-ads/sms/index/BannerSmsTable.vue";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import BannerMsgVendorTable from "~/components/page/manage-ads/msg-vendor/BannerMsgVendorTable.vue";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    ShowChartAndTable,
    BannerSmsChart
  },
  permission: false,
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        queryParams: {},
        component: BannerSmsChart
      },
      table: {
        props: {
          createBannerSMS: true
        },
        component: BannerMsgVendorTable
      }
    };
  }
});
</script>
