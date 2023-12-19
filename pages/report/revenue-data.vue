<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card></v-card>
        <new-custom-filter v-model="searchParams" :filters="filterShow" />

        <v-divider />
        <api-data-table
          ref="table"
          v-bind="$attrs"
          :resource="resource"
          :headers="headerShow"
          :filter="filterTable"
          :start-index.sync="startIndex"
          :toolbar="toolbarShow"
          :page-name="pageName"
          :default-pagination="{
            sortBy: ['full_date'],
            sortDesc: [true]
          }"
          @change-table-headers="changeColumnShows"
          @change-filter="changeTableFilter"
          @synthesis-item="handleSynthesisItem"
        >
          <template slot="item.campaign" slot-scope="props">
            <nuxt-link
              :to="
                `/manage-campaign/list/${props.item.campaign &&
                  props.item.campaign.id}`
              "
              >{{ props.item.campaign && props.item.campaign.name }}
            </nuxt-link>
          </template>

          <template slot="item.agency" slot-scope="{ item }">
            <nuxt-link
              v-if="getAgency(item)"
              :to="`/user/${getAgency(item).id}`"
              class="truncate-2 w-full block"
              >{{ getAgency(item).full_name }}
            </nuxt-link>
          </template>

          <template slot="item.num_success" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_success | numberSpace }}</p>
            </div>
          </template>

          <template slot="item.num_fail" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_fail | numberSpace }}</p>
            </div>
          </template>

          <template slot="item.num_sent" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_sent | numberSpace }}</p>
            </div>
          </template>

          <template slot="item.brandname" slot-scope="{ item }">
            <div v-if="item.brandname" class="text-start">
              <p>{{ item.brandname.name }}</p>
            </div>
          </template>

          <template slot="item.ads" slot-scope="{ item }">
            <div v-if="item.ads" class="text-start">
              <p>{{ item.ads.name }}</p>
            </div>
          </template>

          <template slot="item.total_money" slot-scope="{ item }">
            <div class="text-right">
              <p>{{ item.total_money | currency }}</p>
            </div>
          </template>
          <template slot="item.full_date" slot-scope="props">
            <div class="text-center">
              <p>{{ props.item.full_date | date }}</p>
            </div>
          </template>
          <template slot="item.created_at" slot-scope="props">
            <div class="text-center">
              <p>{{ props.item.created_at | date }}</p>
            </div>
          </template>

          <template slot="item.capacity" slot-scope="props">
            <div class="text-right">
              <span>{{ props.item.capacity }} MB</span>
            </div>
          </template>

          <template slot="item.total_data" slot-scope="props">
            <div class="text-right">
              <span>{{ props.item.total_data }} MB</span>
            </div>
          </template>

          <template slot="item.price" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.price | currency }}</p>
            </div>
          </template>

          <template slot="item.num_sms_success" slot-scope="{ item }">
            <p>{{ item.num_sms_success | numberSpace }}</p>
          </template>

          <template slot="item.num_sms_fail" slot-scope="{ item }">
            <p>{{ item.num_sms_fail | numberSpace }}</p>
          </template>

          <template slot="item.num_sms_confirm_success" slot-scope="{ item }">
            <p>{{ item.num_sms_confirm_success | numberSpace }}</p>
          </template>

          <template
            slot="item.cdr_num_sms_confirm_success"
            slot-scope="{ item }"
            >{{ item.cdr_num_sms_confirm_success | numberSpace }}
          </template>

          <template slot="item.cdr_num_sms_confirm_fail" slot-scope="{ item }"
            >{{ item.cdr_num_sms_confirm_fail | numberSpace }}
          </template>

          <template slot="item.cdr_num_sms_success" slot-scope="{ item }"
            >{{ item.cdr_num_sms_success | numberSpace }}
          </template>

          <template slot="item.num_sms_confirm_fail" slot-scope="{ item }"
            >{{ item.num_sms_confirm_fail | numberSpace }}
          </template>

          <template slot="item.cdr_num_sms_fail" slot-scope="{ item }"
            >{{ item.cdr_num_sms_fail | numberSpace }}
          </template>

          <template slot="item.total_price" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.total_money | currency }}</p>
            </div>
          </template>

          <template v-if="summary" #body.prepend="{ headers, isMobile }">
            <tr v-if="!isMobile">
              <td
                class="font-weight-bold nowrap"
                style="border-right: none!important;"
              >
                Tổng
              </td>
              <template v-for="(header, index) in columnShows">
                <td
                  v-if="index !== 0"
                  :key="`column-prepend-${index}`"
                  style="border-right: none!important;"
                  class="text-right nowrap"
                >
                  <div class="text-right font-weight-bold">
                    <p>{{ renderShowColumn(header, index) }}</p>
                  </div>
                </td>
              </template>
            </tr>
          </template>
        </api-data-table>
      </v-flex>

      <confirm-dialog
        ref="confirmRef"
        title="Tổng hợp lại"
        :loading="isLoadingConfirm"
        @confirm="handRebootTime"
      >
        <template #content>
          <div class="d-flex mr-10 align-items-center">
            <div class="mr-4 title-confirm">
              Chọn ngày tổng hợp lại:
            </div>
            <custom-date-picker
              v-model="date"
              label=""
              hide-details
            ></custom-date-picker>
          </div>
          <div class="mt-8 font-16">
            Bạn có chắc muốn tổng hợp dữ liệu ngày
            <span class="error--text">{{ date | date }}</span> ?
          </div>
        </template>
      </confirm-dialog>
      <v-overlay :value="isLoadingOverlay" absolute color="#fff" class="z-10">
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

<script>
import cloneDeep from "lodash/cloneDeep";
import NewCustomFilter from "~/components/common/NewCustomFilter";
import ApiDataTable from "~/components/table/ApiDataTable";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import { DATA_DAY } from "~/constants/resource";
import { DATE, NUMBER, RESOURCE } from "~/constants/filterType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect";
import CampaignSelect from "~/components/select/CampaignSelect";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import Template from "~/pages/manage-ads/mms/template.vue";
import CustomDatePicker from "~/components/common/CustomDatePicker.vue";
import { TOTAL_SECOND_OF_DAY } from "~/constants/time-unit";

export default {
  name: "RevenueData",
  components: {
    CustomDatePicker,
    Template,
    ConfirmDialog,
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  props: {
    pageName: {
      type: String,
      default: "report-revenue-data"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: DATA_DAY,
        isSynthesis: true
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      startIndex: 0,
      searchParams: null,
      tableFilter: {},
      summary: null,
      timeoutSummary: null,
      columnShows: [],
      isLoadingOverlay: false,
      isLoadingConfirm: false,
      date: this.$options.filters.timeDateLine(Date.now())
    };
  },
  computed: {
    headerShow() {
      let headers = [...this.headers];
      if (this.$authHasRole(ROLE_AGENCY) && !this.$authHasRole(ROLE_IS_ADMIN)) {
        headers = headers.filter(h => h.value !== "agency");
      }
      return headers;
    },
    filterShow() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin) {
        return this.filters;
      } else if (isAgency) {
        return this.filters.filter(f => f.name !== "agency_id");
      } else {
        return this.filters;
      }
    },
    filters() {
      return [
        {
          type: RESOURCE,
          name: "agency_id",
          label: "Agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            },
            label: "Agency"
          }
        },
        {
          type: RESOURCE,
          name: "campaign_id",
          label: "Chiến dịch",
          itemValue: "id",
          itemText: "name",
          component: CampaignSelect,
          props: {
            multiple: false
          }
        },
        {
          type: NUMBER,
          name: "price",
          props: {
            rules: "numeric|required"
          },
          label: "Đơn giá"
        },
        {
          type: NUMBER,
          name: "num_success",
          props: {
            rules: "numeric|required"
          },
          label: "Số lượt gửi tin thành công"
        },
        {
          type: NUMBER,
          name: "num_fail",
          props: {
            rules: "numeric|required"
          },
          label: "Số lượt gửi tin thất bại"
        },
        {
          type: NUMBER,
          name: "num_sent",
          props: {
            rules: "numeric|required"
          },
          label: "Số lượt tin gửi"
        },
        {
          type: DATE,
          name: "date_full_date",
          request_name: "date_full_date",
          label: "Thời gian"
        }
      ];
    },
    headers() {
      return [
        {
          text: "Ngày lấy dữ liệu",
          value: "full_date",
          width: 160,
          align: "center"
        },
        {
          text: "Gói cước",
          value: "data_code",
          width: 160,
          align: "left"
        },
        {
          text: "Dung lượng gói cước",
          value: "capacity",
          align: "center",
          width: 160,
          sortable: false
        },
        {
          text: "Tên chiến dịch",
          value: "campaign",
          sortable: false,
          width: 240
        },
        {
          text: "Tên quảng cáo",
          value: "ads",
          sortable: false,
          width: 240
        },
        {
          text: "Agency",
          value: "agency",
          sortable: false,
          width: 240
        },
        {
          text: "Đơn giá",
          value: "price",
          align: "right",
          width: 160
        },
        {
          text: " Số lượt gửi tin nhắn tài trợ data thành công",
          value: "num_success",
          width: 200,
          align: "right"
        },
        {
          text: "Số lượt gửi tin nhắn tài trợ data thất bại",
          value: "num_fail",
          width: 200,
          align: "right"
        },
        {
          text: " Số lượt tin nhắn đã gửi",
          value: "num_sent",
          width: 200,
          align: "right"
        },
        {
          text: "Tổng dung lượng data",
          value: "total_data",
          width: 200,
          align: "right"
        },
        // {
        //   text: "Tổng tiền đại lý",
        //   value: "total_price",
        //   align: "right",
        //   width: 160,
        //   sortable: false
        // },
        {
          text: "Số tin xác nhận gửi ra gateway thành công",
          value: "num_sms_confirm_success",
          align: "right",
          width: 200
        },
        {
          text: "Số tin nhắn xác nhận tới thiết bị thành công",
          value: "cdr_num_sms_confirm_success",
          align: "right",
          width: 200
        },
        {
          text: "Số tin xác nhận gửi ra gateway thất bại",
          value: "num_sms_confirm_fail",
          align: "right",
          width: 200
        },
        {
          text: "Số tin nhắn xác nhận tới thiết bị thất bại",
          value: "cdr_num_sms_confirm_fail",
          align: "right",
          width: 200
        },
        {
          text: "Số tin QC gửi ra gateway thành công",
          value: "num_sms_success",
          width: 200,
          align: "right"
        },
        {
          text: "Số tin QC tới thiết bị thành công",
          value: "cdr_num_sms_success",
          width: 200,
          align: "right"
        },
        {
          text: "Số tin QC gửi ra gateway thất bại",
          value: "num_sms_fail",
          width: 240,
          align: "right"
        },

        {
          text: "Số tin QC tới thiết bị thất bại",
          value: "cdr_num_sms_fail",
          width: 220,
          align: "right"
        },
        {
          text: "Tổng số tiền",
          value: "total_money",
          width: 160,
          align: "right"
        }
      ];
    },
    resource() {
      return DATA_DAY;
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    },
    filterAll() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      const tableFilter = this.tableFilter || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps,
        ...tableFilter
      };
    },
    toolbarShow() {
      return cloneDeep(this.toolbar);
    }
  },
  watch: {
    filterAll: {
      handler() {
        this.debounceFetchSummary();
      },
      deep: true
    }
  },
  async mounted() {
    await this.debounceFetchSummary();
  },
  methods: {
    async handRebootTime() {
      this.isLoadingConfirm = true;
      try {
        const result = await this.$axios.$post("/data-day/resend", {
          date: this.date
        });
        this.isLoadingConfirm = false;
        this.$refs.confirmRef.hide();
        this.isLoadingOverlay = true;
        if (result.code === CODE_SUCCESS) {
          setTimeout(() => {
            this.isLoadingOverlay = false;
            this.$refs.table.refresh();
            this.$toast.global.action_success("tổng hợp lại");
          }, 2000);
        } else {
          this.$toast.global.server_error_msg(result.message);
          this.isLoadingOverlay = false;
        }
      } catch (e) {
        this.isLoadingConfirm = false;
        this.$refs.confirmRef.hide();
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.error(e.response.data.errors.date[0]);
          this.dialog = false;
          this.isLoadingOverlay = false;
        }
      }
      this.isLoadingConfirm = false;
    },
    handleSynthesisItem() {
      this.$refs.confirmRef.show();
    },
    changeTableFilter(val) {
      this.tableFilter = val || {};
    },
    getAgency(item) {
      return item.agency;
    },
    changeColumnShows(val) {
      this.columnShows = val;
    },
    async getSummary(params) {
      // if (!this.showColumnsPrice) {
      //   return;
      // }

      try {
        const { data } = await this.$dataDayRepository.post("summary", params);
        this.summary = data;
      } catch (e) {
        console.log(e);
      }
    },
    debounceFetchSummary() {
      if (this.timeoutSummary) {
        clearTimeout(this.timeoutSummary);
      }

      this.timeoutSummary = setTimeout(() => {
        this.timeoutSummary = null;
        this.getSummary(this.filterAll);
      }, 300);
    },
    renderShowColumn(column) {
      if (column.value) {
        switch (column.value) {
          case "total_money":
            return this.$filters.currency(this.summary?.total_money);
          case "total_money_refund":
            return this.$filters.currency(this.summary?.total_money_refund);
          case "total_price":
            return this.$filters.currency(this.summary?.total_money);
          case "num_success":
            return this.$filters.numberSpace(this.summary?.num_success);
          case "num_sent":
            return this.$filters.numberSpace(this.summary?.num_sent);
          case "num_fail":
            return this.$filters.numberSpace(this.summary?.num_fail);
          case "cdr_num_sms_fail":
            return this.$filters.numberSpace(this.summary?.cdr_num_sms_fail);
          case "cdr_num_sms_success":
            return this.$filters.numberSpace(this.summary?.cdr_num_sms_success);
          case "total_data": {
            const total_data = this.$filters.numberSpace(
              this.summary?.total_data
            );
            return `${total_data} MB`;
          }
          case "num_sms_success":
            return this.$filters.numberSpace(this.summary?.num_sms_success);
          case "num_sms_fail":
            return this.$filters.numberSpace(this.summary?.num_sms_fail);
          case "num_sms_confirm_success":
            return this.$filters.numberSpace(
              this.summary?.num_sms_confirm_success
            );
          case "num_sms_confirm_fail":
            return this.$filters.numberSpace(
              this.summary?.num_sms_confirm_fail
            );
          case "cdr_num_sms_confirm_success":
            return this.$filters.numberSpace(
              this.summary?.cdr_num_sms_confirm_success
            );
          case "cdr_num_sms_confirm_fail":
            return this.$filters.numberSpace(
              this.summary?.cdr_num_sms_confirm_fail
            );

          default:
            return null;
        }
      }
    }
  }
};
</script>

<style scoped>
.title-confirm {
  align-self: end;
}
</style>
