<template>
  <multiple-pie-chart
    title="Cơ cấu tin nhắn thất bại theo nguyên nhân"
    v-bind="$attrs"
    has-resource
    :resources="statusResources"
    item-text="description"
    item-value="total"
  />
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import MultiplePieChart from "~/components/chart/common/MultiplePieChart.vue";

interface ComponentData extends GlobalDataInterface {}

interface ComponentMethods {
  fetchData(): void;
}

const MessageFailedPieChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "MessageFailedPieChart",
  components: {
    MultiplePieChart
  },
  data() {
    return {};
  },
  computed: {
    statusResources() {
      return [
        {
          value: "mms",
          text: "MMS",
          url: "/log/mms-distribution/statistical/"
        },
        {
          value: "sms",
          text: "SMS",
          url: "/log/sms-distribution/statistical/"
        }
      ];
    },
  },
  mounted() {},
  methods: {}
});

export default MessageFailedPieChart;
export type MessageFailedPieChartRef = InstanceType<
  typeof MessageFailedPieChart
>;
</script>
<style>
.ministats-wrapper {
  height: 100%;
  padding: 16px;
}
</style>
