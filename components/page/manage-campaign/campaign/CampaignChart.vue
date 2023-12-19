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
import { FiltersInterface } from "../../../../interface/plugin/filters";
import { ADVERTISER_CAMPAIGN, CAMPAIGN } from "~/constants/resource";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart";

interface ComponentData {
  resource: string;
  categories: Array<object>;
  $filters: FiltersInterface;
}

const CampaignChart = (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "CampaignChart",
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
      default: "manage-campaign-list"
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
          key: "ctr",
          text: "Tỉ lệ tin nhắn gửi thành công",
          value: ["num_success", "num_fail"],
          mapFunc: item => {
            if (item.num_success && item.num_fail) {
              return this.$filters.percent(
                item.num_success / (item.num_success + item.num_fail)
              );
            }
            return 0;
          },
          formatter: val => {
            return `${val}%`;
          }
        },
        {
          key: "total_money",
          text: "Chi phí",
          value: "total_money"
        }
      ]
    };
  },
  computed: {
    resource() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin || isAgency) {
        return CAMPAIGN;
      } else {
        return ADVERTISER_CAMPAIGN;
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

export default CampaignChart;
export type CampaignChartRef = InstanceType<typeof CampaignChart>;
</script>
