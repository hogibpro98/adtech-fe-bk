<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <header-select-month
            v-model="month"
            type="date"
            title="Báo cáo tồn kênh"
            :config-props="maxTimePicker"
          ></header-select-month>
          <v-divider></v-divider>
          <api-data-table
            ref="table"
            :resource="resource"
            :filter="filterTable"
            :headers="headers"
            :toolbar="toolbarShow"
            :default-pagination="{
               sortBy: ['created_at'],
              sortDesc: [true]
            }"
            :page-name="pageName"
            @synthesis-item="handleSynthesisItem"
            @import-file="handImportFile"
          >
            <template slot="item.report_date" slot-scope="props">
              {{ props.item.report_date | date }}
            </template>
            <template slot="item.user_code" slot-scope="props">
              <span v-if="props.item.user_code">
                {{ props.item.user_code }}
              </span>
            </template>
            <template slot="item.full_name" slot-scope="props">
              <span v-if="props.item.user && props.item.user.full_name">
                {{ props.item.user.full_name }}
              </span>
            </template>

            <template slot="item.actual_open_balance" slot-scope="props">
              {{ props.item.actual_open_balance | currency }}
            </template>

            <template slot="item.actual_recharge_amount" slot-scope="props">
              {{ props.item.actual_recharge_amount | currency }}
            </template>

            <template slot="item.actual_transferred_money" slot-scope="props">
              {{ props.item.actual_transferred_money | currency }}
            </template>

            <template slot="item.actual_receive_money" slot-scope="props">
              {{ props.item.actual_receive_money | currency }}
            </template>

            <template slot="item.actual_consumption_money" slot-scope="props">
              {{ props.item.actual_consumption_money | currency }}
            </template>

            <template slot="item.actual_end_balance" slot-scope="props">
              {{ props.item.actual_end_balance | currency }}
            </template>

            <template slot="item.type_account" slot-scope="props">
              <span
                v-if="props.item.user.roles && props.item.user.roles[0].name"
              >
                {{ props.item.user.roles[0].name }}
              </span>
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
        :resource="resource"
        name="báo cáo tồn kênh"
        sample-url="/import/template_import_bao_cao_ton_kenh.xlsx"
      ></import-file-statistical>
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
import {
  REPORT_TOTAL_DAY,
  REPORT_TOTAL_MONTH,
  REPORT_TOTAL_USER_DAY
} from "~/constants/resource";
import HeaderSelectMonth from "~/components/common/HeaderSelectMonth.vue";
import { SQL_DATE, SQL_MONTH } from "~/constants/format";
import { TOTAL_SECOND_OF_DAY } from "~/constants/time-unit";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import ImportFileStatistical from "~/components/common/FileUpload/ImportFileStatistical.vue";

export default Vue.extend({
  name: "ReportUserDetail",
  components: { ImportFileStatistical, HeaderSelectMonth, ApiDataTable },
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
        isSearch: false,
        isDownload: true,
        exportResource: REPORT_TOTAL_USER_DAY,
        isSynthesis: true,
        isImport: true
      })
    },
    pageName: {
      type: String,
      default: "report-detail-user"
    }
  },
  data() {
    return {
      month: this.$options.filters.timeDateLine(
        Date.now() - TOTAL_SECOND_OF_DAY
      ),
      searchParams: null,
      dialog: false,
      loading: false,
      documents: null
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Ngày báo cáo",
          value: "report_date",
          align: "center",
          width: 140
        },
        {
          text: "Tỉnh",
          value: "location",
          width: 120
        },
        {
          text: "Mã KH",
          value: "user_code",
          width: 100,
          sortable: false
        },
        {
          text: "Tên KH",
          value: "full_name",
          width: 200,
          sortable: false
        },
        {
          text: "Loại tài khoản",
          value: "type_account",
          width: 160
        },
        {
          text: "Loại khách hàng",
          value: "agency_type",
          width: 160
        },
        {
          text: "Đơn vị quản lý",
          value: "manage_unit",
          width: 160
        },

        {
          text: "Số dư đầu",
          value: "actual_open_balance",
          align: "right",
          width: 180
        },
        {
          text: "Nạp tiền",
          value: "actual_recharge_amount",
          align: "right",
          width: 180
        },
        {
          text: "Chuyển tiền",
          value: "actual_transferred_money",
          align: "right",
          width: 180
        },
        {
          text: "Nhận tiền",
          value: "actual_receive_money",
          align: "right",
          width: 180
        },
        {
          text: "Tiêu dùng",
          value: "actual_consumption_money",
          align: "right",
          width: 180
        },
        {
          text: "Số dư cuối",
          value: "actual_end_balance",
          align: "right",
          width: 180
        }
      ];
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
    resource() {
      return REPORT_TOTAL_USER_DAY;
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
    handleSynthesisItem() {
      this.dialog = true;
    },
    handImportFile() {
      this.$refs.importFile.show();
    },
    async handRebootTime() {
      this.loading = true;

      try {
        const result = await this.$axios.$post("report-total-user-day/update", {
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

<style scoped></style>
