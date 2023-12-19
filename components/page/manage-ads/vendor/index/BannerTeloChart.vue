<template>
  <v-flex xs12 class="no-padding">
    <time-series-chart
      v-bind="$attrs"
      :time-range="dateStatistics"
      :resource="resource"
      :categories="categoryShows"
      :show="show"
    />
  </v-flex>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ACTIONS from "~/constants/actions";
import {ADS_SMS, ADS_SMS_VENDOR} from "~/constants/resource";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart.vue";
import { GlobalDataInterface } from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  categories: Array<object>;
}

interface ComponentMethod {}

const BannerTelcoChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerTelcoChart",
  components: { TimeSeriesChart },
  props: {
    dateStatistics: {
      type: Array,
      default: null
    },
    show: {
      type: Boolean,
      default: true
    },
    categoryExcludes: {
      type: Array,
      default: () => []
    },
    pageName: {
      type: String,
      default: "manage-ads-list-ads-sms"
    }
  },
  data() {
    return {
      categories: [
        {
          key: "num_sent",
          text: "Số tin nhắn đã gửi",
          value: ["num_success", "num_fail"],
          mapFunc: item => {
            if (item.num_success !== undefined && item.num_fail !== undefined) {
              return item.num_success + item.num_fail;
            }
            return 0;
          },
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "num_success",
          text: "Số tin nhắn gửi thành công",
          value: "num_success"
        },
        {
          key: "num_fail",
          text: "Số tin nhắn gửi thất bại",
          value: "num_fail"
        },
        {
          key: "total_money",
          text: "Chi phí",
          value: "total_money"
        },
        {
          key: "ctr",
          text: "Tỉ lệ tin nhắn gửi thành công",
          value: ["num_success", "num_fail"],
          mapFunc: item => {
            if (item.num_success !== null && item.num_fail !== null) {
              return this.$filters.percent(
                item.num_success / (item.num_success + item.num_fail)
              );
            }
            return 0;
          },
          formatter: val => {
            return `${val}%`;
          }
        }
      ]
    };
  },
  computed: {
    resource() {
      return ADS_SMS_VENDOR;
    },
    showColumnsPrice() {
      return this.$can(`${this.pageName}.${ACTIONS.SHOW_PRICE}`);
    },
    categoryShows() {
      const categoryShows = this.categories.filter(
        category => !this.categoryExcludes.includes(category.key)
      );
      if (!this.showColumnsPrice) {
        return categoryShows.filter(category => category.key !== "total_money");
      } else {
        return categoryShows;
      }
    }
  }
});

export default BannerTelcoChart;
export type BannerTelcoChartRef = InstanceType<typeof BannerTelcoChart>;
</script>
