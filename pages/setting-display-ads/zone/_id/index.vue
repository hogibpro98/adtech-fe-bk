<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    :title="zoneInformation ? zoneInformation.name : ''"
  >
    <template slot="after-page-title">
      <v-toolbar
        v-if="zoneInformation && zoneInformation.id"
        dense
        color="background"
      >
        <div>{{ zoneInformation.name }} - {{ channelName }}</div>
      </v-toolbar>
    </template>
  </show-chart-and-table>
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import ChartZone from "@/components/page/setting-display-ads/zone/ChartZone.vue";
import ZoneTable from "@/components/page/setting-display-ads/zone/ZoneTable.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import { flatten } from "lodash";
import Vue, { VueConstructor } from "vue";
import { fetchPermissionToStorage } from "~/util/permission";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ZoneInterface } from "~/interface/data/zone";
import { responseErrorToString } from "~/util/array";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
  zoneId: string | number;
  loading: boolean;
  zoneInformation: ZoneInterface;
  $zoneRepository: RepositoryInterface;
}

interface ComponentMethods {
  fetchDataZone(zoneId: string | number): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    ShowChartAndTable
  },
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        component: ChartZone,
        queryParams: {
          id: this.$route.params.id
        }
      },
      table: {
        props: {},
        component: ZoneTable,
        queryParams: {
          resource_id: this.$route.params.id
        }
      },
      loading: false,
      zoneInformation: {}
    };
  },
  computed: {
    zoneId() {
      return this.$route.params.id;
    },
    channelName() {
      if (this.zoneInformation) {
        return (
          (this.zoneInformation &&
            this.zoneInformation.channel &&
            this.zoneInformation.channel.name) ||
          ""
        );
      }
      return "";
    },
    adsTypeName() {
      if (this.zoneInformation) {
        return (
          (this.zoneInformation &&
            this.zoneInformation.ads_type &&
            this.zoneInformation.ads_type.name) ||
          ""
        );
      }
      return "";
    }
  },
  watch: {
    zoneId(val) {
      this.fetchDataZone(val);
      this.chart.queryParams.id = val;
    }
  },
  async created() {
    await this.fetchDataZone(this.$route.params.id);
    fetchPermissionToStorage({
      namePage: "setting-display-ads-zone",
      app: this,
      $auth: this.$auth
    });

  },
  methods: {
    async fetchDataZone(zoneId) {
      try {
        const res = await this.$zoneRepository.getDetail(zoneId);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.zoneInformation = res.data;
          if (!this.zoneInformation) {
            this.$nuxt.error({ statusCode: 404 });

            this.$toast.global.server_error_msg(
              "Không tìm thấy vị trí hiển thị quảng cáo"
            );
          }
        } else {
          this.$toast.global.server_error_msg(
            "Không tìm thấy vị trí hiển thị quảng cáo"
          );
        }
      } catch (e) {
        console.log(e);
        this.loading = false;
        this.$nuxt.error({ statusCode: 404 });
      }
    }
  }
});
</script>
