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
import {ADS_REDIRECT, ADVERTISER_BANNER, ADVERTISER_REDIRECT, BANNER} from "~/constants/resource";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart";
import { GlobalDataInterface } from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  categories: Array<object>;
}

interface ComponentMethod {}

const BannerChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerChart",
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
      default: "manage-ads-list-ads-redirect"
    }
  },
  data() {
    return {
      categories: [
        {
          key: "num_click",
          text: "Lượt click",
          value: "num_click"
        },
        {
          key: "num_view",
          text: "Lượt impression",
          value: "num_view"
        },
        {
          key: "total_money",
          text: "Chi phí",
          value: "total_money"
        },
        {
          key: "ctr",
          text: "CTR",
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
        },
        {
          key: "cdr_num_sms_confirm_fail",
          text: "Số tin xác nhận tới thiết bị thất bại",
          value: "cdr_num_sms_confirm_fail"
        },
        {
          key: "cdr_num_sms_confirm_success",
          text: "Số tin xác nhận tới thiết bị thành công",
          value: "cdr_num_sms_confirm_success"
        }
      ]
    };
  },
  computed: {
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin || isAgency) {
        return ADS_REDIRECT;
      } else {
        return ADVERTISER_REDIRECT;
      }
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

export default BannerChart;
export type BannerChartRef = InstanceType<typeof BannerChart>;
</script>
