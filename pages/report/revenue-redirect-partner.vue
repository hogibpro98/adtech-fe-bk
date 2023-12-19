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
          <template slot="item.full_date" slot-scope="{ item }">
            <div class="text-center">
              <p>{{ item.full_date | date }}</p>
            </div>
          </template>
          <template slot="item.num_view" slot-scope="{ item }">
            <span>{{ item.num_view | spaceNumber }}</span>
          </template>
          <template slot="item.num_click" slot-scope="{ item }">
            <span>{{ item.num_click | spaceNumber }}</span>
          </template>
          <template v-if="summary" #body.prepend="{ headers, isMobile }">
            <tr v-if="!isMobile">
              <td
                class="font-weight-bold text-center nowrap"
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
import { DATA_DAY } from "~/constants/resource";
import { DATE, NUMBER, RESOURCE, TEXT } from "~/constants/filterType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect";
import CampaignSelect from "~/components/select/CampaignSelect";

export default {
  name: "RevenueRedirectPartner",
  components: {
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  props: {
    pageName: {
      type: String,
      default: "manage-ads-data"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isDownload: true,
        exportResource: "/partner-zone-day"
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
          type: TEXT,
          name: "partner_code",
          label: "Tên đối tác"
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
          width: 200,
          align: "center"
        },
        {
          text: "Tên đối tác",
          value: "partner_code",
          width: 200,
          align: "left"
        },
        {
          text: "Zone ID",
          value: "zone_id",
          align: "left",
          width: 240,
          sortable: false
        },
        {
          text: "Số lượt view",
          value: "num_view",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Số lượt click",
          value: "num_click",
          align: "right",
          sortable: false,
          width: 160
        }
      ];
    },
    resource() {
      return "/partner-zone-day";
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
        const { data } = await this.$axios.$post(
          "partner-zone-day/summary",
          params
        );
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
          case "num_click":
            return this.$filters.numberSpace(this.summary?.num_click);
          case "num_view":
            return this.$filters.numberSpace(this.summary?.num_view);
          default:
            return null;
        }
      }
    }
  }
};
</script>

<style scoped></style>
