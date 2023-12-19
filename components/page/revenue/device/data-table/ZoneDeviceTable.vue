<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card></v-card>
        <new-custom-filter v-model="searchParams" :filters="filterShow"/>

        <v-divider/>
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
          <template slot="item.inventory_id" slot-scope="props">
            {{ props.item.inventory && props.item.inventory.name }}
          </template>
          <template slot="item.zone_id" slot-scope="props">
            {{ props.item.zone && props.item.zone.name }}
          </template>
          <template slot="item.channel_id" slot-scope="props">
            {{ props.item.channel && props.item.channel.name }}
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
import {ROLE_AGENCY, ROLE_IS_ADMIN} from "~/constants/role";
import {PUBLIC_REVENUE_DEVICE} from "~/constants/resource";
import {DATE, NUMBER} from "~/constants/filterType";

export default {
  name: "ZoneDeviceTable",
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
        exportResource: PUBLIC_REVENUE_DEVICE
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
          type: DATE,
          name: "full_date",
          label: "Ngày"
        },
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
          name: "num_pageview",
          props: {
            rules: "numeric|required"
          },
          label: "Tổng số pageview"
        }
      ];
    },
    headers() {
      return [
        {
          text: "Ngày",
          value: "full_date",
          width: 120,
          align: "center"
        },
        {
          text: "Loại thiết bị",
          value: "device",
          width: 120
        },
        {
          text: "Zone",
          value: "zone_id",
          sortable: false,
          width: 240
        },
        {
          text: "Sub Inventory",
          value: "channel_id",
          sortable: false,
          width: 240
        },
        {
          text: "Inventory",
          value: "inventory_id",
          width: 160,
          sortable: false
        },
        {
          text: "Tổng số click",
          value: "num_click",
          align: "right",
          width: 150
        },
        {
          text: "Tổng số view",
          value: "num_view",
          width: 150,
          align: "right"
        },
        {
          text: "Tổng số pageview",
          value: "num_pageview",
          width: 150,
          align: "right"
        }
      ];
    },
    resource() {
      return PUBLIC_REVENUE_DEVICE;
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
    changeColumnShows(val) {
      this.columnShows = val;
    },
    async getSummary(params) {
      // if (!this.showColumnsPrice) {
      //   return;
      // }

      try {
        const {data} = await this.$axios.post(
          "/publisher/revenue-device/summary",
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
          case "num_pageview":
            return this.$filters.numberSpace(this.summary?.num_pageview);
          default:
            return null;
        }
      }
    }
  }
};
</script>

<style scoped></style>
