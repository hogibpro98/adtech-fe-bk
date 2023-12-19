<template>
  <client-only>
    <e-chart
      ref="chart"
      v-intersect.once="{
        handler: handleInView,
        options: {
          threshold: [0.8]
        }
      }"
      :path-option="computeChartOption"
      v-bind="$attrs"
    />
  </client-only>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { cloneDeep, debounce, find, flatten, uniq } from "lodash";
import { isEqualDeep } from "@/helpers/ultis";

const TYPE_MAP = {
  bar: "fa fa-square",
  area: "fa fa-minus",
  line: "fa fa-minus"
};

interface ComponentData {
  defaultOptions: Array<Array<string | number | object>>;
  debounceFetchData(): void;
  data: Array<object>;
  interval: string;
}

interface ComponentMethods {
  reformatTime(time: object): void;
  fetchData(): void;
}

const MultiSeriesChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "MultiSeriesChart",
  props: {
    timeRange: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      default: () => []
    },
    filter: {
      type: Object,
      default: null
    },
    lazy: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultOption: [
        ["dataset.source", this.data],
        ["xAxis.show", true],
        ["xAxis.axisLabel.show", true],
        ["grid.left", "16px"],

        ["grid.bottom", "24px"],
        ["grid.width", "auto"],
        ["grid.right", "240px"],
        ["tooltip.trigger", "axis"],
        ["yAxis[0].show", true],
        ["yAxis[1].show", true],
        ["legend.tooltip.show", true],
        ["legend.orient", "vertical"],
        ["legend.top", "20px"],
        ["legend.right", 4],
        ["legend.width", "180px"]
        // ["color", this.chartColor]
      ],
      debounceFetchData: null,
      data: [],
      inView: false,
      interval: "days"
    };
  },
  computed: {
    params() {
      return {
        time_range: this.timeRange,
        attribute: uniq(flatten(cloneDeep(this.categories.map(e => e.value)))),
        interval: this.interval,
        ...this.filter
      };
    },
    visibleCategories() {
      return this.categories.filter(e => {
        return e.visible !== false;
      });
    },
    computeChartOption() {
      const options = cloneDeep(this.defaultOption);

      // line
      options.push(["legend.show", true]);
      this.visibleCategories.forEach((e, i) => {
        options.push([`series[${i}].type`, e.type || "line"]);
        options.push([`series[${i}].symbol`, "circle"]);
        options.push([`series[${i}].name`, e.text]);
        options.push([`series[${i}].yAxisIndex`, e.yIndex]);
        if (e.formatter) {
          options.push([`yAxis[${e.yIndex}].axisLabel.formatter`, e.formatter]);
        } else {
          options.push([`yAxis[${e.yIndex}].axisLabel.formatter`, undefined]);
        }
        if (e.color) {
          options.push([`series[${i}].color`, e.color]);
        }
      });

      options.push([
        "tooltip.formatter",
        params => {
          let html = "";
          const label =
            this.interval !== "weeks"
              ? params[0].name
              : `Tuần từ ${params[0].name}`;
          html += `<div>`;
          html += `<b style="font-size:14px;">${label}</b> <br/>`;
          params.forEach(e => {
            html += `<div class="d-flex justify-content-space-between align-center">`;
            html += `<span><i
                  aria-hidden="true"
                  class="v-icon notranslate fa ${
                    TYPE_MAP[e.seriesType]
                  } theme--light"
                  style="font-size: 16px; color: ${e.color}">
                  </i> ${e.seriesName}</span>`;
            const category = find(this.categories, ["text", e.seriesName]);
            const value = category?.formatter
              ? category.formatter(e.data[e.seriesName])
              : e.data[e.seriesName];
            html += `<span style="padding-left:32px">${value}</span>`;
            html += `</div>`;
          });
          html += `</div>`;
          return html;
        }
      ]);
      return options;
    }
  },
  watch: {
    params: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          // console.log("params changed");
          this.debounceFetchData();
        }
      },
      deep: true
    },
    url(val, oldVal) {
      if (val !== oldVal) {
        // console.log("url changed", val, oldVal);
        this.debounceFetchData();
      }
    },
    inView(val) {
      if (val) {
        this.debounceFetchData();
      }
    }
  },
  created() {
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 400);
  },
  mounted() {
    if (this.$auth.loggedIn) {
      this.debounceFetchData();
    }
  },
  beforeDestroy() {
    // this.$cancelAllRequest();
  },

  methods: {
    handleInView(entries) {
      if (entries[0].isIntersecting && this.lazy) {
        this.inView = true;
      }
    },
    reformatTime(time) {
      switch (this.interval) {
        case "days":
        case "weeks":
          return this.$filters.date(time);
        case "months":
          return this.$filters.month(time);
        default:
          return time;
      }
    },

    async fetchData() {
      if (!(this.lazy && !this.inView) && this.$auth.loggedIn) {
        try {
          this.$set(this.defaultOption, 0, ["dataset.source", []]);
          this.$emit("update:loading", true);
          const { data } = await this.$axios.post(`${this.url}`, this.params);
          this.$emit("update:loading", false);
          this.data = data.data.map(e => {
            const obj = {
              time: this.reformatTime(e.time)
            };

            this.visibleCategories
              .filter(category => category)
              .forEach(category => {
                if (category.mapFunc) {
                  obj[category.text] = category.mapFunc(e);
                } else {
                  obj[category.text] = e[category.value];
                }
              });
            return obj;
          });

          await this.$nextTick();
          if (this.data && this.data.length > 0) {
            this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
          } else {
            this.$set(this.defaultOption, 0, ["dataset.source", [{}]]);
          }
        } catch (e) {
          this.$emit("update:loading", false);
        }
      }
    }
  }
});
export default MultiSeriesChart;
export type MultiSeriesChartRef = InstanceType<typeof MultiSeriesChart>;
</script>
