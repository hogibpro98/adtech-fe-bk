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
import { ROLE_IS_ADMIN, ROLE_AGENCY } from "~/constants/role";
import TimeSeriesChart from "~/components/chart/common/TimeSeriesChart.vue";
import { GlobalDataInterface } from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  categories: Array<object>;
}

interface ComponentMethod {}

const DataTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "DataTable",
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
          key: "num_click",
          text: "Số click",
          value: "num_click",
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "num_view",
          text: "Số view",
          value: "num_view",
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "num_ctr",
          text: "Số CTR",
          value: "num_ctr",
          formatter: val => {
            return this.$filters.numberSpace(val);
          }
        },
        {
          key: "total_money",
          text: "Doanh thu",
          value: "total_money",
          formatter: val => {
            return this.$filters.currency(val);
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
        return "/inventory";
      } else {
        return "/inventory/advertiser";
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

export default DataTable;
export type DataTableRef = InstanceType<typeof DataTable>;
</script>
