<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <header-select-month
            v-model="month"
            type="month"
            title="Báo cáo tháng"
            :config-props="maxTimePicker"
          ></header-select-month>
          <v-divider></v-divider>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :has-index="false"
            :toolbar="toolbarShow"
            :page-name="pageName"
            :filter="filterTable"
            :default-pagination="{
              sortBy: ['created_at'],
              sortDesc: [true]
            }"
            @synthesis-item="handleSynthesisItem"
            @import-file="handImportFile"
          >
            <template slot="item.report_date" slot-scope="props"
              >{{ props.item.report_date | month }}
            </template>

            <template slot="item.brand" slot-scope="props">
              <span v-if="props.item.brand && props.item.brand.name">
                {{ props.item.brand.name }}
              </span>
            </template>

            <template slot="item.full_name" slot-scope="props">
              <span v-if="props.item.user && props.item.user.full_name">
                {{ props.item.user.full_name }}
              </span>
            </template>

            <template slot="item.type_account" slot-scope="props">
              <span v-if="props.item.user && props.item.user.roles">
                {{ props.item.user.roles[0] && props.item.user.roles[0].name }}
                {{ props.item.user.roles[1] && props.item.user.roles[1].name }}
              </span>
            </template>

            <template slot="item.num_sms" slot-scope="props">
              {{ props.item.num_sms | numberSpace }}
            </template>

            <template
              slot="item.actual_brand_money_consumption"
              slot-scope="props"
            >
              {{ props.item.actual_brand_money_consumption | currency }}
            </template>

            <template slot="item.discount" slot-scope="props">
              {{ props.item.discount | formattedTwoNumberRound }}%
            </template>

            <template slot="item.revenue_after_vat_month" slot-scope="props">
              {{ props.item.revenue_after_vat_month | currency }}
            </template>

            <template
              slot="item.actual_last_balance_month_ago"
              slot-scope="props"
            >
              {{ props.item["actual_last_balance_month"] | currency }}
            </template>

            <template slot="item.actual_last_balance_month" slot-scope="props">
              {{ props.item["actual_last_balance_month"] | currency }}
            </template>

            <template slot="item.actual_recharge_amount" slot-scope="props">
              {{ props.item["actual_recharge_amount"] | currency }}
            </template>

            <template slot="item.actual_transferred_money" slot-scope="props">
              {{ props.item["actual_transferred_money"] | currency }}
            </template>

            <template slot="item.total_amount_received" slot-scope="props">
              {{ props.item["actual_last_balance_month"] | currency }}
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
              @click="handRebootTime"
            >
              Xác nhận
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <import-file-statistical
        ref="importFile"
        name="báo cáo tháng brandname"
        :resource="resource"
        sample-url="/import/template_import_tong_hop_bao_cao_brandname_theo_thang.xlsx"
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
import {
  REPORT_BRAND_BY_DAY,
  REPORT_BRAND_BY_MONTH
} from "~/constants/resource";
import HeaderSelectMonth from "~/components/common/HeaderSelectMonth.vue";
import { SQL_DATE, SQL_MONTH } from "~/constants/format";
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
        exportResource: REPORT_BRAND_BY_MONTH,
        isSearch: true,
        isSynthesis: true,
        isImport: true
      })
    },
    pageName: {
      type: String,
      default: "brandname-detail-report-monthly"
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
    toolbarShow() {
      return cloneDeep(this.toolbar);
    },
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
          text: "Brandname",
          value: "brand",
          sortable: false,
          width: 120
        },
        {
          text: "Tên khách hàng",
          value: "full_name",
          width: 160,
          sortable: false
        },
        {
          text: "Loại tài khoản",
          value: "type_account",
          width: 200,
          sortable: false
        },
        {
          text: "Đơn vị quản lý",
          value: "manage_unit",
          width: 150
        },
        {
          text: "Tỉnh",
          value: "location",
          width: 100
        },
        {
          text: "Nhà Mạng",
          value: "telco",
          width: 120
        },
        {
          text: "Số dư chốt tháng trước",
          value: "actual_last_balance_month_ago",
          align: "right",
          width: 200
        },
        {
          text: "Số dư chốt tháng lấy dữ liệu",
          value: "actual_last_balance_month",
          align: "right",
          width: 220
        },
        {
          text: "Tổng tiền nạp",
          value: "actual_recharge_amount",
          align: "right",
          width: 200
        },
        {
          text: "Tổng tiền nhận",
          value: "actual_transferred_money",
          align: "right",
          width: 200
        },
        {
          text: "Tổng tiền chuyển",
          value: "total_amount_received",
          align: "right",
          width: 200
        },
        {
          text: "Số lượng tin",
          value: "num_sms",
          align: "right",
          width: 160
        },
        {
          text: "Doanh thu tiêu dùng",
          value: "actual_brand_money_consumption",
          align: "right",
          width: 160
        },
        {
          text: "Chiết khấu",
          value: "discount",
          align: "right",
          width: 160
        },
        {
          text: "Doanh thu trừ VAT/CK",
          value: "revenue_after_vat_month",
          align: "right",
          width: 200
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
      return REPORT_BRAND_BY_MONTH;
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
        const result = await this.$axios.$post("report-brand-by-month/update", {
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

<style scoped>
.merge-header-cell {
  height: 35px;
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}

.merge-child {
  height: 35px;
  padding: 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.merge-child:not(:last-child) {
  border-right: thin solid rgba(0, 0, 0, 0.12);
}
</style>
