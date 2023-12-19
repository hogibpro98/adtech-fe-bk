<template>
  <display-card
    :loading="loading"
    title="Thống kê quảng cáo Redirect"
    redirect="/manage-ads/list-ads-redirect"
    :url="resource"
    :filter="filter"
    :params="params"
  >
    <div
      class="d-flex justify-content-center align-center"
      style="height: 320px;"
    >
      <multi-series-chart
        v-bind="$attrs"
        :loading.sync="loading"
        :categories="categories"
        :resource="resource"
        :filter="filter"
        height="320px"
        width="100%"
        lazy
      />
    </div>
  </display-card>
</template>

<script lang="ts">
import DisplayCard from "@/components/common/DisplayCard.vue";
import MultiSeriesChart from "@/components/chart/common/MultiSeriesChart.vue";
import { ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
}

interface ComponentMethods {}

const DisplayAdsTimeChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DisplayAdsTimeChart",
  components: { MultiSeriesChart, DisplayCard },
  props: {
    filter: {
      type: Object,
      default: () => ({})
    },
    timeRange: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    params() {
      return {
        time_range: this.timeRange,
        ...this.filter
      };
    },
    categories() {
      return [
        {
          value: "num_view",
          text: "Lượt impression",
          type: "bar",
          yIndex: 0,
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          value: "num_click",
          text: "Lượt click",
          type: "bar",
          yIndex: 0,
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "ctr",
          text: "CTR",
          yIndex: 1,
          value: ["num_click", "num_view"],
          mapFunc: item => {
            if (item.num_view && item.num_click) {
              return this.$filters.percent(item.num_click / item.num_view);
            }
            return 0;
          },
          formatter: val => {
            return `${val}%`;
          }
        }
      ];
    },
    resource() {
      return !this.$authHasRole(ROLE_ADVERTISER)
        ? "/statistic/banner"
        : "/statistic/advertiser/banner";
    }
  }
});

export default DisplayAdsTimeChart;
export type DisplayAdsTimeChartRef = InstanceType<typeof DisplayAdsTimeChart>;
</script>
