<template>
  <v-responsive
    :height="computedHeight"
    :width="computedWidth"
    class="white--text  page-chart"
  >
    <client-only v-if="!loading">
      <e-chart
        ref="eChart"
        :path-option="computeChartOption"
        :height="computedHeight"
        :width="computedWidth"
      >
      </e-chart>
    </client-only>
    <!--    <v-skeleton-loader-->
    <!--      v-if="loadingProps"-->
    <!--      :height="computedHeight"-->
    <!--      class="mx-auto"-->
    <!--      type="image"-->
    <!--    ></v-skeleton-loader>-->
  </v-responsive>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import colors from "vuetify/es5/util/colors";
import { cloneDeep, flatten, uniq, isEqual, debounce, find } from "lodash";
// @ts-ignore
import moment from 'moment/src/moment';
import IconDropdownSelect from "~/components/common/IconDropdownSelect.vue";
import CustomIcon from "~/components/common/CustomIcon.vue";
import { REQUEST_DATE } from "~/constants/format";
import GlobalDataInterface from "~/interface/data/global";

const TYPE_MAP = {
  bar: "fa fa-square",
  area: "fa fa-minus",
  line: "fa fa-minus"
};

interface ComponentData extends GlobalDataInterface {
  defaultOption: Array<Array<string | number | object>>;
  interval: string;
  loadingData: boolean;
  isFullScreen: boolean;
  type: string;
  data: Array<object>;
  selectedCategories: Array<string>;
}

interface ComponentMethods {
  addOptionChartBar(options: Array<Array<string>>): void;
  addOptionChartStackBar(options: Array<Array<string>>): void;
  addOptionChartArea(options: Array<Array<string>>): void;
  addOptionChartLine(options: Array<Array<string>>): void;
  toggleSize(): void;
  reformatTime(time: string | number): string;
  debounceFetchData(): void;
  fetchData(): void;
}

const MiniCompareChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { CustomIcon, IconDropdownSelect },
  props: {
    dataSet: {
      type: Array,
      default: () => []
    },
    compareDataSet: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultOption: [
        // ["color", this.chartColor]
      ],
      type: "line"
    };
  },

  computed: {
    primColor() {
      return this.$auth.primaryColor || "blue";
    },
    series() {
      return [
        {
          type: "line",
          data: this.compareDataSet,
          itemStyle: {
            opacity: 0 // Set the opacity to 0 to hide the points
          },
          lineStyle: {
            color: colors[this.primColor]?.lighten3 || "#bfe7ff",
            width: 2
          }
        },
        {
          type: "line",
          data: this.dataSet,
          itemStyle: {
            opacity: 0 // Set the opacity to 0 to hide the points
          },
          lineStyle: {
            color: colors[this.primColor]?.base || "blue",
            width: 2
          }
        },
      ];
    },
    computedHeight() {
      return "60px";
    },
    computedWidth() {
      return "100px";
    },
    computeChartOption() {
      const options = cloneDeep(this.defaultOption);
      options.push([
        "backgroundColor",
        this.$vuetify.theme.dark
          ? this.$vuetify.theme.themes.dark.background
          : this.$vuetify.theme.themes.light.background
      ]);
      this.addOptionChartLine(options);

      return options;
    }
  },
  watch: {
    show(val) {
      if (val && this.$refs.eChart) {
        this.$refs.eChart.resize();
      }
    }
  },

  methods: {
    addOptionChartLine(options) {
      options.push(["legend.show", false]);
      options.push(["tooltip.show", false]);
      options.push(["xAxis.show", false]);
      options.push(["yAxis.0.show", false]);
      options.push(["yAxis.1.show", false]);
      options.push(["xAxis.legend.show", false]);
      options.push(["yAxis.0.legend.show", false]);
      options.push(["yAxis.1.legend.show", false]);
      options.push(["yAxis.0.splitNumber", 0]);
      options.push(["yAxis.1.splitNumber", 0]);
      options.push(["grid.containLabel", false]);
      options.push(["grid.left", 2]);
      options.push(["grid.right", 2]);
      options.push(["grid.top", 2]);
      options.push(["grid.bottom", 2]);

      options.push(["series", this.series]);
    }
  }
});

export default MiniCompareChart;
export type MiniCompareChartRef = InstanceType<typeof MiniCompareChart>;
</script>

<style lang="scss">
.series-select {
  max-width: 180px;
  margin-right: 16px;

  .v-select__selections {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-wrap: nowrap;
  }
}
</style>
