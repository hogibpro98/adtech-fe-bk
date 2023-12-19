<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    content-class="flex xs12 sm9 md7 lg5 xl4"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline pt-3">Thông kê lượng tin nhắn thất bại</span>
      </v-card-title>
      <div class="pa-0 w-full">
        <v-row no-gutters class="pa-0 ma-0">
          <v-col cols="12" class="pa-3">
            <v-data-table
              :headers="header"
              :items="item.filter(data => data.cdr_state !== null)"
              :items-per-page="10"
              class="elevation-3"
              dense
              :loading="loading"
              :footer-props="{
                'show-first-last-page': true,
                'show-current-page': true,
                'items-per-page-options': [5, 10, 20],
                'items-per-page-text': 'Số bản ghi mỗi trang',
                'page-text': '{0}-{1} trong {2}'
              }"
              :loading-text="'Đang tải dữ liệu...'"
              :no-data-text="noDataText"
              :sort-by="'cdr_state'"
            >
              <template slot="no-results">
                Không tìm thấy bản ghi.
              </template>
            </v-data-table>
          </v-col>
          <v-col cols="12" class="pa-0 ma-0">
            <div
              v-if="loading"
              class="d-flex justify-content-center align-center display-card__content"
            >
              <span>Chưa có dữ liệu.</span>
            </div>
            <div v-else-if="data.length > 0" class="display-card__content">
              <client-only>
                <e-chart
                  :path-option="computeChartOption"
                  width="525px"
                  height="330px"
                >
                </e-chart>
              </client-only>
            </div>
            <div
              v-else
              class="d-flex justify-content-center align-center display-card__content"
            >
              <span>Không có dữ liệu</span>
            </div>
          </v-col>
        </v-row>

        <v-layout
          justify-end
          class="mt-2 sticky bottom--1 z-10 background px-8 py-2 border-top"
        >
          <v-btn color="primary darken-1" text @click.native="showing = false"
            >Ok</v-btn
          >
        </v-layout>
      </div>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { colorPalette } from "@/constants/color";
import DisplayCard from "@/components/common/DisplayCard.vue";
import { isEqualDeep } from "@/helpers/ultis";
import { CODE_SUCCESS } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";

interface CRITERIA {
  value: string | number;
  text: string;
}

interface ComponentData {
  $logMmsDistributionRepository: RepositoryInterface;
  showing: boolean;
  item: any;
  loading: boolean;

  defaultOptions: Array<Array<string | number | object>>;
  data: Array<object>;
  colorPalette: Array<string>;
  selectedCategories: Array<string>;
  criteriaSelected: CRITERIA;
}

interface ComponentMethods {
  show(item: any): void;
  deleteItem(): void;
}

const FailedMmsMessageDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FailedMmsMessageDialog",
  components: { DisplayCard },
  props: {
    timeRange: {
      type: Array,
      default: () => []
    },
    filter: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      default: ""
    },
    height: {
      type: Number,
      default: 240
    },
    redirect: {
      type: String,
      default: null
    },
    lazy: {
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
        ["series[0].type", "pie"],
        ["series[0].center", ["28%", "50%"]],
        ["series[0].radius", "47%"],
        ["legend.show", true],
        ["legend.tooltip.show", true],
        ["legend.orient", "vertical"],
        ["legend.right", -9],
        ["legend.textStyle.width", 200],
        ["legend.top", "center"],
        ["legend.textStyle.overflow", "truncate"],
        ["xAxis.show", false],
        [
          "series[0].label",
          {
            normal: {
              show: true,
              formatter(params) {
                return `${params.percent}%`;
              },
              position: "outer"
              // textStyle: {
              //   color: "#fff",
              //   fontSize: 14
              // }
            }
          }
        ],
        [
          "series[0].labelLine",
          {
            show: true,
            length: 8,
            length2: 8
          }
        ]

        // ["color", this.chartColor]
      ],
      data: [],
      inView: false,
      colorPalette,
      selectedCategories: [],
      loadingData: false,
      criteriaSelected: {},
      debounceFetchData: null,
      showing: false,
      header: [
        {
          text: "Mã lỗi",
          value: "cdr_state",
          align: "center"
        },
        {
          text: "Chi tiết lỗi",
          value: "description",
          sortable: false
        },
        {
          text: "Số tin nhắn dính lỗi",
          value: "total",
          align: "end",
          class: "text-right"
        }
      ],
      item: [
        {
          cdr_state: "5",
          total: 352,
          description: "Lỗi chuyển tiếp bản tin trên MMSC"
        },
        {
          cdr_state: "6",
          total: 357,
          description: "Tin nhắn bị từ chối hoặc xóa bởi MMSC"
        },
        {
          cdr_state: "7",
          total: 381,
          description: "Khum có lỗi này nha"
        },
        {
          cdr_state: "1",
          total: 345,
          description: "Thành công"
        },
        {
          cdr_state: "2",
          total: 351,
          description: "Thuê bao không liên lạc được hoặc bị chặn"
        },
        {
          cdr_state: "3",
          total: 377,
          description: "Thiết bị đầu cuối không hỗ trợ"
        },
        {
          cdr_state: "4",
          total: 362,
          description: "Tin MMS quá hạn"
        },
        {
          cdr_state: null,
          total: 0,
          description: "Không có cdr_state"
        }
      ],
      loading: false
    };
  },
  computed: {
    pieChatItem() {
      return this.item
        .filter(data => data.cdr_state !== null)
        .map(data => ({
          name: data.description,
          value: data.total
        }));
    },
    computeChartOption() {
      const options = cloneDeep(this.defaultOption);
      options.push(["series[0].name", "Tin nhắn thất bại"]);
      return options;
    },
    params() {
      return {
        time_range: this.timeRange,
        ...this.filter
      };
    },
    noDataText() {
      if (this.loading) {
        return "Đang tải dữ liệu, vui lòng đợi trong giây lát.";
      } else {
        return "Không tìm thấy bản ghi.";
      }
    }
  },
  watch: {
    params: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.debounceFetchData();
        }
      },
      deep: true
    },
    inView(val) {
      if (val) {
        this.debounceFetchData();
      }
    },
    item: {
      handler(val) {
        this.data = val
          .filter(data => data.cdr_state !== null)
          .map(data => ({
            name: data.description,
            value: data.total
          }));
      },
      deep: true
    }
  },
  created() {
    this.data = this.pieChatItem;
    this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
  },
  mounted() {
    this.data = this.pieChatItem;
    this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
  },
  methods: {
    async show(item) {
      this.showing = true;
      this.item = [];
      this.loading = true;
      try {
        const res = await this.$logMmsDistributionRepository.post("", {
          ads_id: item
        });
        this.item = res.data;
        this.data = this.item
          .filter(data => data.cdr_state !== null)
          .map(data => ({
            name: data.description,
            value: data.total
          }));
        this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
      } catch (e) {}
      this.loading = false;
    }

    // async deleteItem() {
    //   this.loading = true;
    //   try {
    //     const res = await this.$priceServiceRepository.delete({
    //       agency_id: this.item.agency_id,
    //       cat_id: this.item.cat_id,
    //       service: this.item.service
    //     });
    //     this.loading = false;
    //     if (res.code === CODE_SUCCESS) {
    //       this.showing = false;
    //       this.$emit("action-success");
    //       this.$toast.global.delete_success("đơn giá");
    //     } else {
    //       this.$toast.global.action_fail();
    //     }
    //   } catch (e) {
    //     this.loading = false;
    //     this.$toast.global.action_fail();
    //   }
    // }
  }
});

export default FailedMmsMessageDialog;
export type FailedMmsMessageDialogRef = InstanceType<
  typeof FailedMmsMessageDialog
>;
</script>

<style scoped>
.display-card__content {
  display: flex;
  justify-content: center;
  height: 330px;
}
</style>
