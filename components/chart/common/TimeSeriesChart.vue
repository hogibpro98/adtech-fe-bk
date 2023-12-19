<template>
  <v-expand-transition>
    <v-card v-show="show" color="page-chart" flat>
      <v-card-actions class="mx-6">
        <v-row justify="end" class="mx-0">
          <v-select
            v-model="selectedCategories[0]"
            :items="firstCategories"
            class="series-select font-size-14 truncate"
            placeholder="Chọn tiêu chí"
            auto-select-first
            hide-details
            return-object
            dense
          >
            <template #selection="{ item }">
              <v-icon color="blue">remove</v-icon>
              {{ item.text }}
            </template>
          </v-select>
          <v-select
            v-model="selectedCategories[1]"
            :items="secondCategories"
            :disabled="!selectedCategories[0]"
            class="series-select font-size-14 truncate"
            placeholder="Chọn tiêu chí"
            hide-details
            return-object
            dense
          >
            <template #selection="{ item }">
              <v-icon color="red">remove</v-icon>
              {{ item.text }}
            </template>
          </v-select>
          <icon-dropdown-select
            v-model="type"
            :items="chartTypes"
            icon="show_chart"
            desc="Loại biểu đồ"
            tooltip="Loại biểu đồ"
          />
          <custom-icon
            v-bind="sizeStateLabels"
            @click="toggleSize"
          ></custom-icon>
          <icon-dropdown-select
            v-model="interval"
            :items="timeIntervals"
            icon="tune"
            desc="Điều chỉnh"
            tooltip="Tùy chọn biểu đồ"
          />
        </v-row>
      </v-card-actions>
      <v-responsive
        :height="computedHeight"
        width="100%"
        class="white--text  pl-10 pr-11 page-chart"
      >
        <client-only v-if="!loadingProps">
          <e-chart
            ref="eChart"
            :path-option="computeChartOption"
            :height="computedHeight"
            width="100%"
          >
          </e-chart>
        </client-only>
        <v-skeleton-loader
          v-if="loadingProps"
          :height="computedHeight"
          max-width="100%"
          class="mx-auto"
          type="image"
        ></v-skeleton-loader>
      </v-responsive>
      <v-overlay
        v-if="!loadingProps && loadingData"
        absolute
        color="#fff"
        class="z-1"
      >
        <v-progress-circular
          :width="4"
          :size="25"
          indeterminate
          color="primary"
        >
        </v-progress-circular>
      </v-overlay>
    </v-card>
  </v-expand-transition>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import Material from "vuetify/es5/util/colors";
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

const TimeSeriesChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { CustomIcon, IconDropdownSelect },
  props: {
    title: {
      type: String,
      default: ""
    },
    gradient: {
      type: Boolean,
      default: false
    },
    subTitle: {
      type: String,
      default: ""
    },
    icon: {
      type: String,
      default: ""
    },
    cardColor: {
      type: String,
      default: "white"
    },
    iconColor: {
      type: String,
      default: "success"
    },
    chartColor: {
      type: Array,
      default: () => []
    },
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
    resource: {
      type: String,
      default: ""
    },
    queryParams: {
      type: Object,
      default: () => ({})
    },
    show: {
      type: Boolean,
      default: true
    },
    loadingProps: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultOption: [
        ["dataset.source", this.data],
        ["xAxis.show", true],
        ["yAxis.show", true],
        ["xAxis.axisLabel.show", true],
        ["yAxis.axisLabel.show", true],
        ["grid.left", "20px"],
        ["grid.right", "20px"],
        ["grid.bottom", "30px"],
        ["tooltip.trigger", "axis"]
        // ["color", this.chartColor]
      ],
      interval: "days",
      isFullScreen: false,
      type: "line",
      debounceFetchData: null,
      data: [],
      selectedCategories: [],
      loadingData: false
    };
  },

  computed: {
    splitNumber() {
      return this.isFullScreen ? 4 : 1;
    },
    computeCardDark() {
      return this.cardColor !== "white";
    },
    params() {
      return {
        time_range: this.timeRange,
        attribute: uniq(
          flatten(cloneDeep(this.selectedCategories).map(e => e.value))
        ),
        interval: this.interval,
        filter: this.filter,
        ...this.queryParams
      };
    },
    timeDiff() {
      const [start, end] = this.timeRange;
      return moment(end, REQUEST_DATE).diff(
        moment(start, REQUEST_DATE),
        "days"
      );
    },
    secondCategories() {
      const categories = this.categories.filter(
        e => e !== this.selectedCategories[0]
      );
      categories.unshift({
        text: "None",
        value: null
      });
      return categories;
    },
    firstCategories() {
      return this.categories.filter(
        category => category !== this.selectedCategories[1]
      );
    },
    sizeStateLabels() {
      if (this.isFullScreen) {
        return {
          desc: "Thu gọn",
          tooltip: "Thu gọn",
          icon: "fullscreen_exit"
        };
      }
      return {
        desc: "Mở rộng",
        tooltip: "Mở rộng",
        icon: "fullscreen"
      };
    },
    computedHeight() {
      if (this.isFullScreen) {
        return "75vh";
      } else {
        return "208px";
      }
    },
    timeIntervals() {
      return [
        {
          text: "Hàng giờ",
          value: "hours",
          disabled: this.timeDiff > 0
        },
        {
          text: "Hàng ngày",
          value: "days"
        },
        {
          text: "Hàng tuần",
          value: "weeks",
          disabled: this.timeDiff < 14
        },
        {
          text: "Hàng tháng",
          value: "months",
          disabled: this.timeDiff < 60
        },
        {
          text: "Hàng quý",
          value: "quarters",
          disabled: this.timeDiff < 180
        },
        {
          text: "Hàng năm",
          value: "years",
          disabled: this.timeDiff < 360
        }
      ];
    },
    chartTypes() {
      return [
        {
          text: "Biểu đồ đường",
          value: "line",
          icon: "show_chart",
          tooltip: "Biểu đồ đường"
        },
        {
          text: "Biểu đồ cột",
          value: "bar",
          icon: "bar_chart",
          tooltip: "Biểu đồ cột"
          // disabled: true
        }
        // {
        //   text: "Biểu đồ chuỗi thời gian xếp chồng",
        //   value: "area",
        //   icon: "stacked_line_chart",
        //   tooltip: "Biểu đồ vùng",
        //   disabled: true
        // }
      ];
    },
    computeChartOption() {
      const options = cloneDeep(this.defaultOption);
      options.push([
        "backgroundColor",
        this.$vuetify.theme.dark
          ? this.$vuetify.theme.themes.dark["page-chart"]
          : this.$vuetify.theme.themes.light["page-chart"]
      ]);
      switch (this.type) {
        case "bar":
          this.addOptionChartBar(options);
          break;
        case "stack-bar":
          this.addOptionChartStackBar(options);
          break;
        case "area":
          this.addOptionChartArea(options);
          break;
        case "line":
        default:
          // line
          this.addOptionChartLine(options);
          break;
      }
      options.push([
        "tooltip.formatter",
        params => {
          let html = "";
          const label =
            this.interval !== "weeks"
              ? params[0].name
              : `Tuần từ ${params[0].name}`;
          html += `<div style="min-width: 160px;">`;
          html += `<b style="font-size:14px;">${label}</b> <br/>`;
          params.forEach(e => {
            html += `<div class="d-flex justify-content-space-between align-center">`;
            html += `<span><i
                aria-hidden="true"
                class="v-icon notranslate fa ${
                  TYPE_MAP[e.seriesType]
                } theme--light"
                style="font-size: 16px;color: ${e.color}">
                </i> ${e.seriesName}</span>`;
            const category = find(this.categories, ["text", e.seriesName]);
            const value = category?.formatter
              ? category.formatter(e.data[e.seriesName])
              : this.$filters.numberSpace(e.data[e.seriesName]);
            html += `<span style="margin-left: 32px">${value || 0}</span>`;
            html += `</div>`;
          });
          html += `</div>`;
          return html;
        }
      ]);

      this.selectedCategories
        .filter(e => e)
        .forEach((e, index) => {
          if (e.formatter) {
            options.push([`yAxis[${index}].axisLabel.formatter`, e.formatter]);
          } else {
            options.push([`yAxis[${index}].axisLabel.formatter`, undefined]);
          }
        });
      return options;
    }
  },
  watch: {
    selectedCategories(val) {
      if (val[0] && val[0] === val[1]) {
        this.selectedCategories[1] = null;
      }
    },
    timeDiff: {
      handler(val) {
        if (val < 14) {
          this.interval = "days";
        }
      },
      immediate: true
    },
    params: {
      handler(before, after) {
        this.debounceFetchData();
      },
      deep: true
    },
    show(val) {
      if (val && this.$refs.eChart) {
        this.$refs.eChart.resize();
      }
    }
  },
  created() {
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 400);
  },
  async mounted() {
    this.$set(this.selectedCategories, 0, this.categories[0]);
    await this.$nextTick();
    if (!this.loadingProps) {
      this.debounceFetchData();
    }
  },

  methods: {
    addOptionChartBar(options) {
      options.push(["series[0].type", "bar"]);
      options.push(["series[0].barWidth", "33%"]);
      options.push(["yAxis[0].splitNumber", this.splitNumber]);
      options.push(["yAxis[1].splitNumber", this.splitNumber]);
      if (this.selectedCategories[1]?.value) {
        options.push(["series[1].type", "bar"]);
        options.push(["series[1].barWidth", "33%"]);
        options.push(["series[1].yAxisIndex", 1]);
      }
      // add shadow series
      // this.defaultOption.push(['series[1].type', 'bar']);
    },
    addOptionChartStackBar(options) {
      // set stacked bar
      // this.defaultOption.push(['series[0].data', StackBarData]);
      options.push(["series[0].type", "bar"]);
      options.push(["series[0].itemStyle.normar.color", "rgba(0,0,0,0.05)"]);
      options.push(["series[0].barGap", "-100%"]);
      // set main series
      // this.defaultOption.push(['series[1].data', StackData]);
      options.push(["series[1].type", "bar"]);
    },
    addOptionChartArea(options) {
      options.push(["series[0].type", "line"]);
      options.push(["series[0].smooth", true]);
      options.push(["xAxis.boundaryGap", false]);
      options.push(["series[0].areaStyle", {}]);
      if (this.gradient) {
        options.push([
          "series[0].areaStyle",
          {
            normal: {
              color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: this.chartColor[0]
                },
                {
                  offset: 1,
                  color: this.chartColor[1]
                }
              ])
            }
          }
        ]);
      }
    },
    addOptionChartLine(options) {
      options.push(["legend.show", false]);
      options.push(["series[0].type", this.type]);
      options.push(["yAxis[0].name", this.selectedCategories[0]?.text]);
      options.push(["series[0].name", this.selectedCategories[0]?.text]);
      options.push(["series[0].symbol", "circle"]);
      options.push([
        "series[0].itemStyle",
        {
          color: Material.blue.base
        }
      ]);
      options.push(["yAxis[0].splitNumber", this.splitNumber]);
      if (this.selectedCategories[1]?.value) {
        options.push(["series[1].type", this.type]);
        options.push(["series[1].name", this.selectedCategories[1]?.text]);
        options.push(["yAxis[1].name", this.selectedCategories[1]?.text]);
        options.push(["series[1].symbol", "circle"]);
        options.push(["series[1].yAxisIndex", 1]);
        options.push([
          "series[1].itemStyle",
          {
            color: Material.red.base
          }
        ]);
        options.push(["yAxis[1].splitNumber", this.splitNumber]);
      }
    },
    toggleSize() {
      this.isFullScreen = !this.isFullScreen;
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
      try {
        this.$set(this.defaultOption, 0, ["dataset.source", []]);
        this.loadingData = true;
        const { data } = await this.$axios.post(
          `/statistic${this.resource}`,
          this.params
        );
        this.loadingData = false;
        this.data = data.data.map(e => {
          const obj = {
            time: this.reformatTime(e.time)
          };

          this.selectedCategories
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
        this.loadingData = false;
      }
    }
  }
});

export default TimeSeriesChart;
export type TimeSeriesChartRef = InstanceType<typeof TimeSeriesChart>;
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
