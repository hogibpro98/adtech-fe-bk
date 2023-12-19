<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <header-select-month
            v-model="month"
            title="Báo cáo theo ngày"
            :config-props="maxTimePicker"
          ></header-select-month>

          <v-divider></v-divider>
          <api-data-table
            ref="table"
            :headers="headers"
            :resource="resource"
            :toolbar="toolbarShow"
            :filter="filterTable"
            :fixed-left-count="3"
            :fixed-right-count="0"
            :page-name="pageName"
            v-on="$listeners"
            @synthesis-item="handleSynthesisItem"
            @import-file="handImportFile"
          >
            <template slot="item.report_date" slot-scope="props"
              >{{ props.item.report_date | date }}
            </template>

            <template slot="item.user" slot-scope="props">
              <span v-if="props.item.user && props.item.user.username">
                {{ props.item.user.username && props.item.user.username }}
              </span>
            </template>

            <template slot="header.date">
              <v-row
                class="merge-header-cell no-padding no-margin align-items-center justify-content-center"
              >
                Thực hiện ngày {{ month | getDay }} tháng {{ month | getMonth }}
              </v-row>
              <v-row class="no-margin no-padding  align-items-center">
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Số lượng tin</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu tiêu dùng</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Chiết khấu</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu trừ VAT/CK</p>
                </v-col>
              </v-row>
            </template>
            <template slot="header.month">
              <v-row
                class="merge-header-cell no-padding no-margin align-items-center justify-content-center"
              >
                Lũy kế đến ngày {{ month | getDay }} tháng
                {{ month | getMonth }}
              </v-row>
              <v-row
                class="no-margin no-padding justify-content-center align-items-center"
              >
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Số lượng tin</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu tiêu dùng</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Chiết khấu</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu trừ VAT/CK</p>
                </v-col>
              </v-row>
            </template>
            <template slot="header.month_ago">
              <v-row
                class="merge-header-cell no-padding no-margin align-items-center justify-content-center"
              >
                Lũy kế đến ngày {{ month | getDay }} tháng
                {{ month | getPreviousMonth }}
              </v-row>
              <v-row
                class="no-margin no-padding justify-content-center align-items-center"
              >
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Số lượng tin</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu tiêu dùng</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Chiết khấu</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu trừ VAT/CK</p>
                </v-col>
              </v-row>
            </template>
            <template slot="header.different">
              <v-row
                class="merge-header-cell no-padding no-margin align-items-center justify-content-center"
              >
                So sánh cùng kỳ với tháng trước
              </v-row>
              <v-row
                class="no-margin no-padding justify-content-center align-items-center"
              >
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Số lượng tin</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu tiêu dùng</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Chiết khấu</p>
                </v-col>
                <v-col class="col-3 merge-child">
                  <p class="no-margin">Doanh thu trừ VAT/CK</p>
                </v-col>
              </v-row>
            </template>

            <template slot="item.date" slot-scope="props">
              <v-row class="no-margin no-padding">
                <v-col class="col-3 merge-child"
                  >{{ props.item.num_sms | numberSpace }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{ props.item.sys_consumption_money | currency }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{ props.item.discount | formattedTwoNumberRound }}%
                </v-col>
                <v-col class="col-3 merge-child">
                  {{ props.item.revenue_after_vat | currency }}
                </v-col>
              </v-row>
            </template>
            <template slot="item.month" slot-scope="props">
              <v-row
                class="no-margin no-padding justify-content-center align-items-center"
              >
                <v-col class="col-3 merge-child"
                  >{{ props.item.num_sms_month | numberSpace }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{ props.item.sys_consumption_money_month | currency }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{ props.item.discount_month | formattedTwoNumberRound }}%
                </v-col>
                <v-col class="col-3 merge-child">
                  {{ props.item.revenue_after_vat_month | currency }}
                </v-col>
              </v-row>
            </template>
            <template slot="item.different" slot-scope="props">
              <v-row
                class="no-margin no-padding justify-content-center align-items-center"
              >
                <v-col class="col-3 merge-child"
                  >{{ props.item.num_sms_different | numberSpace }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{
                    props.item.actual_consumption_money_different | currency
                  }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{
                    props.item.discount_different | formattedTwoNumberRound
                  }}%
                </v-col>
                <v-col class="col-3 merge-child">
                  {{ props.item.revenue_after_vat_different | currency }}
                </v-col>
              </v-row>
            </template>
            <template slot="item.month_ago" slot-scope="props">
              <v-row
                class="no-margin no-padding justify-content-center align-items-center"
              >
                <v-col class="col-3 merge-child"
                  >{{ props.item.num_sms_month_ago | numberSpace }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{
                    props.item.actual_consumption_money_month_ago | currency
                  }}
                </v-col>
                <v-col class="col-3 merge-child"
                  >{{
                    props.item.discount_month_ago | formattedTwoNumberRound
                  }}%
                </v-col>
                <v-col class="col-3 merge-child">
                  {{ props.item.revenue_after_vat_month_ago | currency }}
                </v-col>
              </v-row>
            </template>
          </api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
      <v-dialog
        v-model="dialog"
        persistent
        max-width="600px"
        class="mb-6"
        title="Tổng hợp lại dữ liệu?"
      >
        <v-card>
          <v-card-title class="flex ">
            <span class="text-h5">Tổng hợp lại</span>
          </v-card-title>
          <v-card-text>
            <template>
              <span>
                Bạn có chắc chắn muốn tổng hợp lại dữ liệu ngày
                <span class="error--text">
                  {{ month | date }}
                </span>
                ?
              </span>
            </template>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click.native="dialog = false">
              Hủy
            </v-btn>

            <v-btn
              color="blue darken-1"
              class="mr-2"
              text
              @click="handRebootTime"
            >
              Xác nhận
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <import-file-statistical
        ref="importFile"
        :resource="resource"
        title="báo cáo tổng hợp theo ngày"
      />

      <v-overlay :value="loading" absolute color="#fff" class="z-10">
        <v-progress-circular
          :width="4"
          :size="32"
          indeterminate
          color="primary"
        >
        </v-progress-circular>
      </v-overlay>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import { da } from "cronstrue/dist/i18n/locales/da";
import moment from "moment/moment";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import HeaderSelectMonth from "~/components/common/HeaderSelectMonth.vue";
import { REPORT_TOTAL_DAY } from "~/constants/resource";
import { TOTAL_SECOND_OF_DAY } from "~/constants/time-unit";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import ImportFileStatistical from "~/components/common/FileUpload/ImportFileStatistical.vue";

export default Vue.extend({
  name: "Daily",
  components: { ImportFileStatistical, ApiDataTable, HeaderSelectMonth },
  filters: {
    getMonth(val) {
      return Number(val.split("-")[1]);
    },
    getDay(val) {
      return Number(val.split("-")[2]);
    },
    getPreviousMonth(val) {
      const month = Number(val.split("-")[1]);
      if (month === 1) {
        return 12;
      }
      return Number(val.split("-")[1]) - 1;
    }
  },
  layout: "dashboard-without-header",
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: REPORT_TOTAL_DAY,
        isSearch: false,
        isSynthesis: true,
        isImport: true
      })
    },
    pageName: {
      type: String,
      default: "synthesis-report-daily"
    }
  },
  data() {
    return {
      month: this.$options.filters.timeDateLine(
        Date.now() - TOTAL_SECOND_OF_DAY
      ),
      data_time_reboot: {
        time_reboot: null
      },
      resource: REPORT_TOTAL_DAY,
      searchParams: null,
      dialog: false,
      loading: false
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Luỹ kế ngày báo cáo",
          value: "report_date",
          align: "center",
          width: 180
        },
        {
          text: "Loại khách hàng",
          value: "agency_type",
          sortable: false,
          width: 160
        },
        {
          text: "Tỉnh",
          value: "location",
          sortable: false,
          width: 100
        },
        {
          text: "Nhà mạng",
          value: "telco",
          sortable: false,
          width: 116
        },
        {
          text: "Thực hiện ngày",
          sortable: false,
          value: "date",
          class: "no-padding",
          cellClass: "no-padding",
          width: 600
        },
        {
          text: "lũy kế đến ngày n tháng N",
          sortable: false,
          value: "month",
          class: "no-padding",
          cellClass: "no-padding",
          width: 600
        },
        {
          text: "lũy kế đến ngày n tháng N-1",
          sortable: false,
          value: "month_ago",
          class: "no-padding",
          cellClass: "no-padding",
          width: 600
        },
        {
          text: "So sánh cùng kì với tháng trước",
          sortable: false,
          value: "different",
          class: "no-padding",
          cellClass: "no-padding",
          width: 600
        }
      ];
    },
    toolbarShow() {
      return cloneDeep(this.toolbar);
    },

    filterCustom() {
      return {
        date_report_date: [
          this.$options.filters.timeDateLine(this.month),
          this.$options.filters.timeDateLine(this.month)
        ]
      };
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    },
    maxTimePicker() {
      const timeMax = new Date().toISOString().slice(0, 10);
      console.log("time", timeMax);
      return timeMax;
    }
  },
  created() {
    console.log("date", Date.now());
  },
  methods: {
    handImportFile() {
      this.$refs.importFile.show();
    },
    handleSynthesisItem() {
      this.dialog = true;
    },
    async handRebootTime() {
      this.loading = true;

      try {
        const result = await this.$axios.$post("report-total-day/update", {
          time_reboot: this.month
        });
        if (result.code === CODE_SUCCESS) {
          this.dialog = false;
          setTimeout(() => {
            this.loading = false;
            this.$refs.table.refresh();
            this.$emit("action-success");
            this.$toast.global.action_success("tổng hợp lại");
          }, 5000);
        } else {
          this.$toast.global.action_fail();
          this.loading = false;
        }
      } catch (e) {
        console.log(e.response);
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.error(e.response.data.errors.time_reboot[0]);
          this.dialog = false;
          this.loading = false;
          // this.$refs.table.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});
</script>

<style>
.merge-header-cell {
  height: 35px;
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}

.merge-child {
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px 0 0;
}

.merge-child:not(:last-child) {
  border-right: thin solid rgba(0, 0, 0, 0.12);
}
</style>
