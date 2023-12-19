<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách chiến dịch"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import CampaignChart from "@/components/page/manage-campaign/campaign/CampaignChart.vue";
import CampaignTable from "@/components/page/manage-campaign/campaign/CampaignTable.vue";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "../../../interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "../../../components/common/ShowChartAndTable.vue";

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
        component: CampaignChart
      },
      table: {
        props: {},
        component: CampaignTable
      }
    };
  }
});
</script>
