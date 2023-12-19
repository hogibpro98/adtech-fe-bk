<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid class="no-padding no-margin">
      <dashboard-header
        v-model="dateStatistics"
        title="Dashboard"
        class="sticky-dashboard-header"
        :type.sync="type"
        :available-types="availableTypes"
      />
      <v-layout v-if="type !== 'publisher'" row wrap class="sticky-filter z-15">
        <v-flex xs12 class="py-0 px-3">
          <new-custom-filter v-model="currentFilter" :filters="filters" />
        </v-flex>
      </v-layout>
      <v-tabs-items :value="typeIndex">
        <v-tab-item v-if="hasTab('admin')">
          <dashboard-admin-tab :date-statistics="dateStatistics" />
        </v-tab-item>
        <v-tab-item v-if="hasTab('agency')">
          <dashboard-agency-tab :date-statistics="dateStatistics" />
        </v-tab-item>
        <v-tab-item v-if="hasTab('publisher')">
          <dashboard-publisher-tab :date-statistics="dateStatistics" />
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </div>
</template>

<script lang="ts">
import Material from "vuetify/es5/util/colors";
import * as USER_ROLES from "@/constants/role";
import {
  ROLE_ADVERTISER,
  ROLE_AGENCY,
  ROLE_IS_ADMIN,
  ROLE_PUBLISHER
} from "@/constants/role";
import { RESOURCE } from "@/constants/filterType";
import CampaignSelect from "@/components/select/CampaignSelect.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import DashboardHeader from "~/components/page/dashboard/DashboardHeader.vue";
import DashboardAdminTab from "~/components/page/dashboard/DashboardAdminTab.vue";
import DashboardAgencyTab from "~/components/page/dashboard/DashboardAgencyTab.vue";
import DashboardPublisherTab from "~/components/page/dashboard/DashboardPublisherTab.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";

interface ComponentData extends GlobalDataInterface {
  color: string;
  dateStatistics: Array<string>;
  currentFilter: object;
  roles: object;
  abortController: object;
  userRole: string;
  isAdmin: boolean;
  canViewFinance: boolean;
  hideDisplayAdsHeaders: Array<string>;
  hideMmsHeaders: Array<string>;
  hideCampaignHeaders: Array<string>;
  filters: Array<FilterInterface>;
}

interface ComponentMethods {}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    DashboardPublisherTab,
    DashboardAgencyTab,
    DashboardAdminTab,
    DashboardHeader,
    NewCustomFilter
  },
  beforeRouteLeave(_to, _from, next) {
    console.log(_from, _to);
    this.$cancelAllRequest();
    next();
  },
  layout: "dashboard-without-header",
  data: () => ({
    color: Material,
    dateStatistics: [],
    currentFilter: {},
    roles: USER_ROLES,
    abortController: null,
    type: null
  }),
  computed: {
    availableTypes() {
      if (this.$authHasRole(ROLE_IS_ADMIN)) {
        return ["admin", "agency", "publisher"];
      } else if (this.$authHasRole(ROLE_AGENCY)) {
        return ["agency"];
      } else if (this.$authHasRole(ROLE_PUBLISHER)) {
        return ["publisher"];
      }
      return [];
    },
    typeIndex() {
      return this.availableTypes.indexOf(this.type);
    },
    userRole() {
      return this.$auth.user?.roles[0];
    },
    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    canViewFinance() {
      return this.$can("dashboard.view-finance");
    },
    hideDisplayAdsHeaders() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return ["price_cpm", "total_money"];
      } else {
        return [];
      }
    },
    hideMmsHeaders() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return ["total_money"];
      } else {
        return [];
      }
    },
    hideCampaignHeaders() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return ["total_money"];
      } else {
        return [];
      }
    },

    hideHeadersType() {
      return {
        redirect: this.hideDisplayAdsHeaders,
        data: this.hideMmsHeaders,
        campaign: this.hideCampaignHeaders,
        mms: this.hideMmsHeaders,
        sms: this.hideMmsHeaders
      };
    },

    filters() {
      return [
        {
          type: RESOURCE,
          name: "campaign_id",
          label: "Chiến dịch",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
          },
          component: CampaignSelect
        },
        {
          type: RESOURCE,
          name: "agency_id",
          label: "Agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          visible: this.$authHasRole(USER_ROLES.ROLE_IS_ADMIN),
          props: {
            multiple: false,
            queryParams: {
              type: USER_ROLES.ROLE_AGENCY
            }
          }
        },
        {
          type: RESOURCE,
          name: "advertiser_id",
          label: "Advertiser",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          visible: this.$authHasRole(USER_ROLES.ROLE_ADMIN_OR_AGENCY),
          props: {
            multiple: false,
            queryParams: {
              type: USER_ROLES.ROLE_ADVERTISER
            }
          }
        }
      ];
    },
    noAdvertiserFilter() {
      const filter = {
        ...this.currentFilter
      };
      if (filter.resource_advertiser_id) {
        this.$delete(filter, "resource_advertiser_id");
      }
      return filter;
    },
    pageFilter() {
      return {
        ...this.currentFilter,
        time_range: this.dateStatistics
      };
    },
    pageQuery() {
      return this.$route.query;
    },
    statusResources() {
      return [
        {
          value: "mms",
          text: "MMS",
          url: "/summary/ads-mms-status"
        },
        {
          value: "sms",
          text: "SMS",
          url: "/summary/ads-sms-status"
        },
        {
          value: "redirect",
          text: "QC Redirect",
          url: "/summary/ads-redirect-status"
        },
        {
          value: "data",
          text: "Tài trợ data",
          url: "/summary/ads-data-status"
        }
      ];
    }
  },
  watch: {
    pageFilter(query) {
      this.$router.push({ query });
    },
    pageQuery() {
      this.getPageQuery();
    },
    typeIndex() {
      this.currentFilter = null;
    }
  },
  created() {
    this.getPageQuery();
    this.type = this.availableTypes[0] || null;
  },
  methods: {
    hasTab(name) {
      return this.availableTypes.includes(name);
    },
    getPageQuery() {
      const query = this.pageQuery;
      this.dateStatistics =
        query?.time_range ||
        this.$filters.sqlDate([Date.now() - 6 * 24 * 3600 * 1000, Date.now()]);
      // this.$delete(query, "time_range");
      this.currentFilter = query;
    }
  }
});
</script>
<style>
.sticky-dashboard-header {
  position: sticky;
  top: 64px;
  z-index: 20 !important;
}

.sticky-filter {
  position: sticky;
  top: 128px;
}

@media screen and (max-width: 566px) {
  .sticky-dashboard-header {
    top: 56px;
  }

  .sticky-filter {
    position: sticky;
    top: 132px;
  }
}

@media screen and (max-width: 960px) and (min-width: 567px) {
  .sticky-dashboard-header {
    top: 56px;
  }

  .sticky-filter {
    top: 120px;
  }
}
</style>
