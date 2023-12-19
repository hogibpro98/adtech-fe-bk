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
          @change-table-headers="changeColumnShows"
          @change-filter="changeTableFilter"
        >
          <template slot="item.user_id" slot-scope="props">
            {{ props.item.user && props.item.user.full_name }}
          </template>
          <template slot="item.layout_id" slot-scope="props">
            {{ props.item.layout && props.item.layout.name }}
          </template>
          <template slot="item.channel_id" slot-scope="props">
            {{ props.item.channel && props.item.channel.name }}
          </template>
          <template slot="item.constract_id" slot-scope="props">
            {{ props.item.constract && props.item.constract.name }}
          </template>
          <template slot="item.status" slot-scope="props">
            <v-chip
              v-if="renderStatus(props.item)"
              :color="renderStatus(props.item).color"
              class="w-full justify-content-center"
              small
              label
            >
              {{ renderStatus(props.item).text }}
            </v-chip>
          </template>

          <template slot="item.num_pageview" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_pageview | numberSpace }}</p>
            </div>
          </template>
          <template slot="item.num_view" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_view | numberSpace }}</p>
            </div>
          </template>
          <template slot="item.num_click" slot-scope="props">
            <div class="text-right">
              <p>{{ props.item.num_click | numberSpace }}</p>
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
import { ZONE_REVENUE } from "~/constants/resource";
import { NUMBER } from "~/constants/filterType";
import { STATUS_ZONE } from "~/constants/dataSelect";
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
      default: "report-publisher-revenue-device"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: ZONE_REVENUE
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
          type: NUMBER,
          name: "num_click",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng số click"
        },
        {
          type: NUMBER,
          name: "num_view",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng số view"
        },
        {
          type: NUMBER,
          name: "ctr",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng số ctr"
        },
        {
          type: NUMBER,
          name: "total_money",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng doanh thu"
        }
      ];
    },
    headers() {
      return [
        {
          text: "Thời gian",
          value: "created_at",
          width: 160,
          align: "center"
        },
        {
          text: "Tên",
          value: "name",
          width: 150,
          sortable: false
        },
        {
          text: "Publisher",
          value: "user_id",
          sortable: false,
          width: 240
        },
        {
          text: "Layout",
          value: "layout_id",
          width: 150,
          sortable: false
        },
        {
          text: "Sub inventory",
          value: "channel_id",
          width: 150,
          sortable: false
        },
        {
          text: "Gói mua khoán",
          value: "constract_id",
          width: 150,
          sortable: false
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false,
          width: 300
        },
        {
          text: "Trạng thái",
          value: "status",
          sortable: false,
          width: 150
        },
        {
          text: "Loại hiển thị",
          value: "display_type",
          align: "left",
          sortable: false,
          width: 150
        },
        {
          text: "Chiều cao",
          value: "height",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Chiều rộng",
          value: "width",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Số tin CTR",
          value: "ctr_recent",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tỷ lệ CPC",
          value: "rate_cpc",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tỷ lệ CPM",
          value: "rate_cpm",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tỷ lệ request thành công",
          value: "request_success_rate",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số pageview",
          value: "num_pageview",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số request",
          value: "num_request",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số request thành công",
          value: "num_request_success",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số view",
          value: "num_view",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số click",
          value: "num_click",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng CTR",
          value: "ctr",
          sortable: false,
          width: 150,
          align: "right"
        },
        {
          text: "Tổng doanh thu",
          value: "total_money",
          sortable: false,
          width: 150,
          align: "right"
        }
      ];
    },
    resource() {
      return ZONE_REVENUE;
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
    renderStatus(item) {
      return STATUS_ZONE.find(({ value }) => item.status === value);
    },
    changeTableFilter(val) {
      this.tableFilter = val || {};
    },
    changeColumnShows(val) {
      this.columnShows = val;
    },
    async getSummary(params) {
      // if (!this.showColumnsPrice) {
      //   return;
      // }

      try {
        const { data } = await this.$axios.post(
          "/zone/revenue/summary",
          params
        );
        this.summary = data?.data;
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
          case "num_click":
            return this.$filters.numberSpace(this.summary?.num_click);
          case "num_view":
            return this.$filters.numberSpace(this.summary?.num_view);
          case "ctr":
            return this.$filters.numberSpace(this.summary?.ctr);
          case "total_money":
            return this.$filters.numberSpace(this.summary?.total_money);
          case "num_pageview":
            return this.$filters.numberSpace(this.summary?.num_pageview);
          case "num_request":
            return this.$filters.numberSpace(this.summary?.num_request);
          case "num_request_success":
            return this.$filters.numberSpace(this.summary?.num_request_success);
          default:
            return null;
        }
      }
    }
  }
};
</script>

<style scoped></style>
