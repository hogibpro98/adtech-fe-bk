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
            sortBy: ['created_at'],
            sortDesc: [true]
          }"
          @change-table-headers="changeColumnShows"
          @change-filter="changeTableFilter"
        >
          <template slot="item.full_date" slot-scope="props">
            <div class="text-center">{{ props.item.full_date | date }}</div>
          </template>

          <template slot="item.agency" slot-scope="{ item }">
            <div v-if="item.agency">{{ item.agency["full_name"] }}</div>
          </template>

          <template slot="item.total_price" slot-scope="props">
            <div>{{ props.item.total_price | currency }}</div>
          </template>

          <template slot="item.num_sent" slot-scope="props">
            <div>{{ props.item.num_sent | numberSpace }}</div>
          </template>

          <template slot="item.num_success" slot-scope="props">
            <div>{{ props.item.num_success | numberSpace }}</div>
          </template>

          <template slot="item.cdr_num_success" slot-scope="{ item }">
            <div v-if="item.cdr_num_success">
              {{ props.item.cdr_num_success | numberSpace }}
            </div>
            <div v-else>0</div>
          </template>

          <template slot="item.num_fail" slot-scope="{ item }">
            <div v-if="item.num_fail">{{ item.num_fail | numberSpace }}</div>
            <div v-else>0</div>
          </template>

          <template slot="item.cdr_num_fail" slot-scope="props">
            <div>{{ props.item.cdr_num_fail | numberSpace }}</div>
          </template>

          <template slot="item.total_money" slot-scope="props">
            <div>{{ props.item.total_money | currency }}</div>
          </template>

          <template slot="item.total_money_refund" slot-scope="props">
            <div>{{ props.item.total_money_refund | currency }}</div>
          </template>

          <template slot="item.num_money_run_ads" slot-scope="props">
            <div>{{ props.item.num_money_run_ads | currency }}</div>
          </template>

          <template slot="item.total_price" slot-scope="props">
            <div class="text-right">
              <p>
                {{
                  (props.item.total_money - props.item.total_money_refund)
                    | currency
                }}
              </p>
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
    </v-layout>
  </v-container>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import NewCustomFilter from "~/components/common/NewCustomFilter";
import ApiDataTable from "~/components/table/ApiDataTable";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import { SMS_VENDOR_TELCO_DAY } from "~/constants/resource";
import { DATE, NUMBER, RESOURCE } from "~/constants/filterType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";

export default {
  name: "RevenueSmsVendorTelco",
  components: {
    ApiDataTable,
    NewCustomFilter
  },
  permission: false,
  layout: "dashboard",
  props: {
    pageName: {
      type: String,
      default: "manage-ads-list-ads-sms"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: SMS_VENDOR_TELCO_DAY
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
      columnShows: []
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
          type: NUMBER,
          name: "num_success",
          props: {
            rules: "numeric"
          },
          label: "Tổng số tin gửi thành công"
        },
        {
          type: NUMBER,
          name: "num_fail",
          props: {
            rules: "numeric"
          },
          label: "Tổng số tin gửi thất bại"
        },
        {
          type: NUMBER,
          name: "num_sent",
          props: {
            rules: "numeric"
          },
          label: "Tổng số tin gửi"
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
          text: "Thời gian",
          value: "full_date",
          width: 120,
          align: "center"
        },
        {
          text: "Tên nhà mạng",
          value: "telco_code",
          width: 120,
          sortable: false
        },
        {
          text: "Agency",
          value: "agency",
          width: 160,
          sortable: false
        },
        {
          text: "Số tin gửi ra GW thành công",
          value: "num_success",
          align: "right",
          width: 220
        },
        {
          text: "Số tin gửi tới thiết bị thành công",
          value: "cdr_num_success",
          align: "right",
          width: 240
        },
        {
          text: "Số tin gửi ra GW thất bại",
          value: "num_fail",
          width: 200,
          align: "right"
        },
        {
          text: "Số tin gửi tới thiết bị thất bại",
          value: "cdr_num_fail",
          width: 220,
          align: "right"
        },
        {
          text: "Tổng số tin đã gửi tới gateway",
          value: "num_sent",
          align: "right",
          width: 220
        },
        {
          text: "Tổng số tiền",
          value: "total_money",
          width: 160,
          align: "right"
        },
        {
          text: "Tổng số tiền hoàn lại",
          value: "total_money_refund",
          align: "right",
          width: 200
        },
        {
          text: "Tổng tiền đại lý",
          value: "total_price",
          align: "right",
          width: 160
        }
      ];
    },
    resource() {
      return SMS_VENDOR_TELCO_DAY;
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
    changeTableFilter(val) {
      this.tableFilter = val || {};
    },
    getAgency(item) {
      return item.agency;
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
    changeColumnShows(val) {
      this.columnShows = val;
    },
    async getSummary(params) {
      try {
        const { data } = await this.$axios.post(
          `${SMS_VENDOR_TELCO_DAY}/summary`,
          params
        );
        this.summary = data?.data;
      } catch (e) {
        console.log(e);
      }
    },
    renderShowColumn(column) {
      if (column.value) {
        switch (column.value) {
          case "total_money":
            return this.$filters.currency(this.summary?.total_money);
          case "total_money_refund":
            return this.$filters.currency(this.summary?.total_money_refund);
          case "total_price":
            return this.$filters.currency(
              this.summary?.total_money - this.summary?.total_money_refund
            );
          case "num_success":
            return this.$filters.numberSpace(this.summary?.num_success);
          case "num_sent":
            return this.$filters.numberSpace(this.summary?.num_sent);
          case "num_fail":
            return this.$filters.numberSpace(this.summary?.num_fail);
          case "cdr_num_success":
            return this.$filters.numberSpace(this.summary?.cdr_num_success);
          case "cdr_num_fail":
            return this.$filters.numberSpace(this.summary?.cdr_num_fail);
          default:
            return null;
        }
      }
    }
  }
};
</script>

<style scoped></style>
