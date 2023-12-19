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
import ACTIONS from "@/constants/actions";
import { ROLE_IS_ADMIN, ROLE_AGENCY } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import { ADVERTISER_BANNER, ADS_MMS, ADS_SMS } from "~/constants/resource";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart.vue";
import { GlobalDataInterface } from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  categories: Array<object>;
}

interface ComponentMethod {}

const AdsDataChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "AdsDataChart",
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
      default: "manage-ads-data"
    }
  },
  data() {
    return {
      categories: [
        {
          key: "num_sent",
          text: "Số thuê bao đã gửi",
          value: "num_sent",
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "num_success",
          text: "Số thuê bao gửi thành công",
          value: "num_success",
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "num_fail",
          text: "Số thuê bao gửi thất bại",
          value: "num_fail",
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "total_money",
          text: "Chi phí",
          value: "total_money",
          formatter: val => {
            return this.$filters.currency(val);
          }
        },
        {
          key: "total_data",
          text: "Số data đã gửi",
          value: "total_data",
          formatter: val => {
            return this.$filters.numberSpace(val) + " MB";
          }
        }
      ]
    };
  },
  computed: {
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin || isAgency) {
        return "/ads-data";
      } else {
        return "/ads-data/advertiser";
      }
    },
    showColumnsPrice() {
      return true;
    },
    categoryShows() {
      const categoryShows = this.categories.filter(
        category => !this.categoryExcludes.includes(category.key)
      );
      if (!this.showColumnsPrice) {
        return categoryShows.filter(
          category => category.key !== "amount_money"
        );
      } else {
        return categoryShows;
      }
    }
  }
});

export default AdsDataChart;
export type AdsDataChartRef = InstanceType<typeof AdsDataChart>;
</script>
