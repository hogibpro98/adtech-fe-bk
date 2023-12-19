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
        >
          <template slot="item.ads" slot-scope="props">
            {{ props.item.ads && props.item.ads.name }}
          </template>

          <template slot="item.campaign" slot-scope="props">
            <nuxt-link
              :to="
                `/manage-campaign/list/${props.item.campaign &&
                  props.item.campaign.id}`
              "
              >{{ props.item.campaign && props.item.campaign.name }}</nuxt-link
            >
          </template>

          <template slot="item.agency" slot-scope="{ item }">
            <nuxt-link
              v-if="getAgency(item)"
              :to="`/user/${getAgency(item).id}`"
              class="truncate-2 w-full block"
              >{{ getAgency(item).full_name }}</nuxt-link
            >
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

          <template slot="item.cdr_num_success" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.cdr_num_success | numberSpace }}</p>
            </div>
          </template>

          <template slot="item.cdr_num_fail" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.cdr_num_fail | numberSpace }}</p>
            </div>
          </template>

          <template slot="item.num_sent" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_sent | numberSpace }}</p>
            </div>
          </template>

          <template slot="item.brandname" slot-scope="props">{{
            props.item.brandname && props.item.brandname.name
          }}</template>

          <template slot="item.total_money" slot-scope="{ item }">
            <div class="text-right">{{ item.total_money | currency }}</div>
          </template>

          <template slot="item.total_money_refund" slot-scope="{ item }">
            <div class="text-right">
              <p>{{ item.total_money_refund | currency }}</p>
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
          <template slot="item.price" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.price | currency }}</p>
            </div>
          </template>

          <template slot="item.total_price" slot-scope="props">
            <div class="text-right">
              {{
                (props.item.total_money - props.item.total_money_refund)
                  | currency
              }}
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
import { MMS_DAY } from "~/constants/resource";
import { DATE, NUMBER, RESOURCE } from "~/constants/filterType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect";
import BrandnameSelect from "~/components/select/BrandnameSelect";
import CampaignSelect from "~/components/select/CampaignSelect";
import BrandnameSelectSMS from "~/components/select/BrandnameSelectSMS";
export default {
  name: "RevenueMMS",
  components: {
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  props: {
    pageName: {
      type: String,
      default: "manage-ads-list-ads-mms"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: MMS_DAY
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
          label: "Tổng số tin gửi thành công"
        },
        {
          type: NUMBER,
          name: "num_fail",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng số tin gửi thất bại"
        },
        {
          type: NUMBER,
          name: "num_sent",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng số tin gửi"
        },

        {
          type: DATE,
          name: "date_full_date",
          request_name: "date_full_date",
          label: "Thời gian"
        },
        {
          type: RESOURCE,
          name: "cat_id",
          label: "Lĩnh vực hoạt động",
          itemValue: "name",
          itemText: "name",
          props: {
            multiple: false,
            type: "mms"
          },
          component: BusinessActivitySelect
        },
        {
          type: RESOURCE,
          name: "brandname_id",
          label: "Brandname",
          itemValue: "id",
          itemText: "name",
          component: BrandnameSelectSMS,
          props: {
            multiple: false
          }
        }
      ];
    },
    headers() {
      return [
        {
          text: "Thời gian",
          value: "full_date",
          width: 160,
          align: "center"
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 120,
          sortable: false
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "cat_id",
          width: 160,
          sortable: false
        },
        {
          text: "Agency",
          value: "agency",
          sortable: false,
          width: 240
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
          text: "Đơn giá",
          value: "price",
          align: "right",
          width: 160
        },
        {
          text: "Tổng số tin gửi ra gateway thành công",
          value: "num_success",
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số tin gửi tới thiết bị thành công",
          value: "cdr_num_success",
          width: 135,
          align: "right"
        },
        {
          text: "Tổng số tin gửi ra gateway thất bại",
          value: "num_fail",
          width: 135,
          align: "right"
        },
        {
          text: "Tổng số tin gửi tới thiết bị thất bại",
          value: "cdr_num_fail",
          align: "right",
          width: 132
        },
        {
          text: "Tổng số tin gửi tới gateway",
          value: "num_sent",
          width: 200,
          align: "right"
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
          width: 160,
          sortable: false
        }
      ];
    },
    resource() {
      return MMS_DAY;
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
    changeColumnShows(val) {
      this.columnShows = val;
    },
    async getSummary(params) {
      // if (!this.showColumnsPrice) {
      //   return;
      // }

      try {
        const { data } = await this.$MMSDayRepository.post("summary", params);
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
      }, 1000);
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
