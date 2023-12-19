<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <header-select-month
            v-model="month"
            type="month"
            title="Báo cáo theo tháng"
            :config-props="maxTimePicker"
          ></header-select-month>

          <v-divider></v-divider>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :toolbar="toolbarShow"
            :filter="filterTable"
            :page-name="pageName"
            @synthesis-item="handleSynthesisItem"
            @import-file="handImportFile"
          >
            <template slot="item.report_date" slot-scope="props">
              {{ props.item.report_date | month }}
            </template>

            <template slot="item.num_sms" slot-scope="props">
              {{ props.item.num_sms | numberSpace }}
            </template>

            <template slot="item.actual_consumption_money" slot-scope="props">
              {{ props.item.actual_consumption_money | currency }}
            </template>

            <template slot="item.discount" slot-scope="props">
              <span v-if="props.item.discount"
                >{{ props.item.discount | formattedTwoNumberRound }}%</span
              >
              <span v-else>0%</span>
            </template>

            <template
              slot="item.actual_consumption_money_month"
              slot-scope="props"
            >
              {{ props.item.actual_consumption_money_month | currency }}
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
                Bạn có chắc chắn muốn tổng hợp lại dữ liệu tháng
                <span class="error--text">
                  {{ month | month }}
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
              :loading="loading"
              @click="handRebootTime"
            >
              Xác nhận
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <import-file-statistical
        ref="importFile"
        name="báo cáo tổng hợp theo tháng"
        :resource="resource"
        sample-url="/import/template_import_tong_hop_bao_cao_theo_thang.xlsx"
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
import moment from 'moment/src/moment';
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { REPORT_TOTAL_DAY, REPORT_TOTAL_MONTH } from "~/constants/resource";
import HeaderSelectMonth from "~/components/common/HeaderSelectMonth.vue";
import { TOTAL_SECOND_OF_DAY } from "~/constants/time-unit";
import { MONTH, SQL_DATE, SQL_MONTH } from "~/constants/format";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import ImportFileStatistical from "~/components/common/FileUpload/ImportFileStatistical.vue";

export default Vue.extend({
  name: "Monthly",
  components: { ImportFileStatistical, HeaderSelectMonth, ApiDataTable },
  layout: "dashboard-without-header",
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: REPORT_TOTAL_MONTH,
        isSearch: false,
        isSynthesis: true,
        isImport: true
      })
    },
    pageName: {
      type: String,
      default: "synthesis-report-monthly"
    }
  },
  data() {
    return {
      month: moment().format(SQL_MONTH),
      dialog: false,
      loading: false
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Tháng báo cáo",
          value: "report_date",
          align: "center",
          width: 140
        },
        {
          text: "Hạng mục",
          value: "agency_type",
          width: 200
        },
        {
          text: "Tỉnh",
          value: "location",
          width: 100
        },
        {
          text: "Nhà mạng",
          value: "telco",
          width: 120
        },
        {
          text: "Số lượng tin",
          align: "end",
          value: "num_sms",
          width: 160
        },
        {
          text: "Doanh thu tiêu dùng",
          value: "actual_consumption_money",
          align: "end",
          width: 180
        },
        {
          text: "Chiếu khấu",
          value: "discount",
          align: "end",
          width: 120
        },
        {
          text: "Doanh thu trừ VAT/CK",
          value: "actual_consumption_money_month",
          align: "end",
          width: 180
        }
      ];
    },
    filterCustom() {
      return {
        date_report_date: [
          moment(this.month, SQL_MONTH)
            .startOf("month")
            .format(SQL_DATE),
          moment(this.month, SQL_MONTH)
            .endOf("month")
            .format(SQL_DATE)
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
    resource() {
      return REPORT_TOTAL_MONTH;
    },
    toolbarShow() {
      return cloneDeep(this.toolbar);
    },
    maxTimePicker() {
      const timeMax = new Date().toISOString().slice(0, 10);
      console.log("time", timeMax);
      return timeMax;
    }
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
        const result = await this.$axios.$post("report-total-month/update", {
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
          // this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});
</script>

<style scoped></style>
