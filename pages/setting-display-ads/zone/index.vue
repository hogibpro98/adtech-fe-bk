<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    title="Danh sách khu vực hiển thị"
  />
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import ChartZone from "@/components/page/setting-display-ads/zone/ChartZone.vue";
import ZoneTable from "@/components/page/setting-display-ads/zone/ZoneTable.vue";
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
        component: ChartZone
      },
      table: {
        props: {},
        component: ZoneTable
      }
    };
  }
});
</script>
