<template>
  <div :class="showFullScreen && 'show-full-screen'">
    <slot name="after-page-title" />
    <header-select-time
      v-model="dateStatistics"
      :title="title"
      :min="min"
      :max="max"
    />
    <v-container grid-list-xl fluid class="no-padding no-margin">
      <v-layout row wrap class="no-margin">
        <v-flex v-if="chart" lg12 class="no-padding no-margin">
          <Component
            v-bind="chart.props"
            :is="chart.component"
            :date-statistics="timeRange"
            :query-params="queryParamsChart"
            :show="showChart"
            v-on="$listeners"
          />
        </v-flex>
        <Component
          :is="table.component"
          v-if="table"
          :show-chart="showChart"
          v-bind="table.props"
          :filter-custom="queryParamsTable"
          v-on="$listeners"
          @toggle-chart="toggleChart"
          @full-screen="toggleFullScreen"
          @change-filter="changeTableFilter"
        >
          <template
            v-for="(_, name) in $scopedSlots.filter &&
              $scopedSlots.filter(slot => slot.name.includes('item'))"
            :slot="name"
            slot-scope="slotData"
          >
            <slot :name="name" v-bind="slotData" />
          </template>
        </Component>
      </v-layout>
    </v-container>
  </div>
</template>
<script lang="ts">
import HeaderSelectTime from "@/components/common/HeaderSelectTime";
import Vue, { VueConstructor } from "vue";

export interface TableDataInterface {
  props: object;
  queryParams: object;
  component: VueConstructor;
}

export interface ChartDataInterface {
  props: object;
  queryParams: object;
  component: VueConstructor;
}

interface ComponentData {
  dateStatistics: Array<object>;
  userId: string;
  showChart: boolean;
  showFullScreen: boolean;
  tableFilter: object;
}

interface ComponentMethods {
  toggleChart(val: boolean): void;
  toggleFullScreen(val: boolean): void;
  changeTableFilter(val: boolean): void;
}

const ShowChartAndTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ShowChartAndTable",
  components: {
    HeaderSelectTime
  },
  provide() {
    const toggleResize = {};
    Object.defineProperty(toggleResize, "value", {
      enumerable: true,
      get: () => this.showFullScreen && this.showChart
    });
    return { toggleResize };
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    chart: {
      type: Object,
      default: null
    },
    table: {
      type: Object,
      default: null
    },
    min: {
      type: [Number, String, Date],
      default: null
    },
    max: {
      type: [Number, String, Date],
      default: null
    }
  },
  data() {
    return {
      dateStatistics: this.$filters.sqlDate([
        Date.now() - 6 * 24 * 3600 * 1000,
        Date.now()
      ]),
      userId: this.$auth.user.id,
      showChart: true,
      showFullScreen: false,
      tableFilter: {}
    };
  },
  computed: {
    timeRange() {
      return this.$filters.sqlDate(this.dateStatistics);
    },
    queryParamsChart() {
      return {
        ...this.tableFilter,
        ...(this.chart.queryParams || {})
      };
    },
    queryParamsTable() {
      return {
        time_range: this.timeRange,
        ...(this.table.queryParams || {})
      };
    }
  },
  methods: {
    toggleChart(val) {
      this.showChart = val;
    },
    toggleFullScreen(val) {
      this.showFullScreen = val;
    },
    changeTableFilter(val) {
      this.tableFilter = val || {};
    }
  }
});

export default ShowChartAndTable;
export type ShowChartAndTableRef = InstanceType<typeof ShowChartAndTable>;
</script>
