/**
 * ECharts Vue Wrapper
 * Michael Wang
 */
import _object from "lodash/object";
import cloneDeep from "lodash/cloneDeep";
import { colorPalette } from "@/constants/color";
import { isEqualDeep } from "~/helpers/ultis";

const ECharts = window.echarts || undefined;
if (ECharts === undefined) {
  console.error("ECharts is not defined");
}
// set color palette
// const colorPalette = [];
// Object.entries(colors).forEach(item => {
//   if (item[1].base) {
//     colorPalette.push(item[1].base);
//   }
// });
// default
// const colorPalette = ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'];
// ECharts.registerTheme('material', {
//   color: colorPalette,
//   graph: {
//     color: colorPalette
//   },
//   textStyle: {
//
//   }
// });
(function() {
  const throttle = function(type, name, obj) {
    obj = obj || window;
    let running = false;
    const func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };
  /* init - you can init any event */
  throttle("resize", "optimizedResize");
})();
export default {
  name: "v-echart",
  inject: {
    toggleResize: {
      default: true
    }
  },
  render(h) {
    const data = {
      staticClass: "v-chart",
      style: this.canvasStyle,
      ref: "canvas",
      on: this.$listeners
    };
    return h("div", data);
  },

  props: {
    // args of  ECharts.init(dom, theme, opts)
    width: { type: String, default: "auto" },
    height: { type: String, default: "400px" },
    merged: {
      type: Boolean,
      default: true
    },
    // instace.setOption
    pathOption: [Object, Array],
    option: Object,
    // general config
    textStyle: Object,
    title: Object,
    legend: [Object, Array],
    tooltip: Object,
    grid: { type: [Object, Array] },
    xAxis: [Object, Array],
    yAxis: [Object, Array],
    series: [Object, Array],
    axisPointer: Object,
    dataset: {
      type: [Object, Array],
      default() {
        return {};
      }
    }, // option.dataSet
    colors: Array, // echarts.option.color
    backgroundColor: [Object, String],
    toolbox: { type: [Object, Array] },
    // resize delay
    widthChangeDelay: {
      type: Number,
      default: 1000
    }
  },
  data: () => ({
    chartInstance: null,
    clientWidth: null,
    allowedOptions: [
      "textStyle",
      "title",
      "legend",
      "xAxis",
      "yAxis",
      "series",
      "tooltip",
      "axisPointer",
      "grid",
      "dataset",
      "colors",
      "backgroundColor",
      "legend"
    ],
    _defaultOption: {
      legend: {
        show: true,
        type: "scroll",
        symbolKeepAspect: false,
        // width: "30%",
        textStyle: {
          fontSize: 14,
          overflow: "truncate"
        },
        tooltip: {
          show: true
        }
      },
      color: colorPalette,
      tooltip: {
        show: true,
        trigger: "item",
        axisPointer: {
          show: true,
          type: "line",
          lineStyle: {
            type: "dashed",
            width: 1
          }
        }
        // borderWidth: 1
      },
      title: {
        show: true,
        textStyle: {
          color: "rgba(0, 0, 0 , .87)",
          fontFamily: "sans-serif"
        }
      },
      grid: {
        containLabel: true
      },
      xAxis: {
        show: true,
        type: "category",
        axisLine: {
          lineStyle: {
            type: "solid"
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          lineStyle: {
            show: true,
            type: "solid"
          }
        },
        axisLabel: {
          show: false
        }
      },
      yAxis: [
        {
          name: "yAxis-1",
          show: true,
          type: "value",
          splitNumber: 1,
          axisLine: {
            lineStyle: {
              color: "transparent",
              type: ""
            }
          },
          axisLabel: {
            show: true,
            color: "rgba(0, 0, 0 , .54)"
          },
          splitLine: {
            lineStyle: {
              type: "solid"
            }
          },
          axisTick: {
            show: false,
            lineStyle: {
              show: false,
              color: "rgba(0, 0, 0 , .54)",
              type: "dashed"
            }
          }
        },
        {
          show: true,
          name: "yAxis-2",
          splitNumber: 1,
          type: "value",
          axisLine: {
            lineStyle: {
              color: "transparent",
              type: ""
            }
          },
          axisLabel: {
            show: true
          },
          splitLine: {
            show: false,
            lineStyle: {
              type: "solid"
            }
          },
          axisTick: {
            show: false,
            lineStyle: {
              show: false,
              color: "rgba(0, 0, 0 , .54)",
              type: "dashed"
            }
          }
        }
      ],
      series: [
        {
          type: "line",
          symbol: "circle",
          right: "10%"
        }
      ]
    },
    chartOptions: {}
  }),
  computed: {
    canvasStyle() {
      return {
        width: this.width,
        height: this.height
      };
    },
    chartThemeOptions() {
      return [
        [
          "backgroundColor",
          this.backgroundColor || this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.background
            : this.$vuetify.theme.themes.light.background
        ],
        [
          "legend.textStyle.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],

        ["textStyle.fontFamily", "Roboto"],
        [
          "title.textStyle.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],
        [
          "xAxis.axisLine.lineStyle.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],
        [
          "xAxis.axisTick.lineStyle.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],
        [
          "yAxis[0].axisLabel.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],
        [
          "yAxis[1].axisLabel.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],
        [
          "yAxis.axisTick.lineStyle.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.icon
            : this.$vuetify.theme.themes.light.icon
        ],
        [
          "tooltip.backgroundColor",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.dark.background
            : this.$vuetify.theme.themes.light.background
        ],
        [
          "tooltip.textStyle.color",
          this.$vuetify.theme.dark
            ? this.$vuetify.theme.themes.light.background
            : this.$vuetify.theme.themes.dark.background
        ],
        [
          "tooltip.extraCssText",
          "box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)!important;" +
            "border-radius: 0px!important"
        ]
      ];
    }
  },
  watch: {
    canvasStyle: {
      handler() {
        this.resize();
      },
      deep: true
    },
    chartThemeOptions: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.refresh();
        }
      },
      deep: true
    },
    pathOption: {
      handler() {
        this.refresh();
      },
      deep: true
    },
    toggleResize: {
      handler() {
        this.resize();
      },
      deep: true
    }
  },
  methods: {
    resizeByScreenWidth() {
      if (window.outerWidth <= 560) {
        this.chartInstance.resize({
          width: "auto",
          height: "170px"
        });
      }
      // else
      //   this.chartInstance.resize({
      //     width: "auto",
      //     height: "320px"
      //   });
    },
    init() {
      // set
      this.chartInstance = ECharts.init(this.$refs.canvas, "material");
      this.refresh();
      window.addEventListener("optimizedResize", () => {
        this.resize();
      });

      this.chartInstance.on("click", params => {
        this.$emit("click", params);
      });
    },

    async refresh() {
      this.chartOptions = cloneDeep(this.$data._defaultOption);
      this.chartThemeOptions.forEach(p => {
        _object.set(this.chartOptions, p[0], p[1]);
      });
      if (this.pathOption) {
        this.pathOption.forEach(p => {
          _object.set(this.chartOptions, p[0], p[1]);
        });
      }
      this.clean();
      await this.$nextTick();
      this.chartInstance.setOption(
        _object.merge(this.option, this.chartOptions),
        {
          notMerge: false
        }
      );
    },

    async resize() {
      await this.$nextTick();
      this.chartInstance.resize();
      // this.resizeByScreenWidth();
    },
    clean() {
      window.removeEventListener("resize", this.chartInstance.resize);
      this.chartInstance.clear();
    }
  },
  mounted() {
    this.init();
    // this.resizeByScreenWidth();
  },

  beforeDestroy() {
    this.clean();
  }
};
