<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    :title="channelInformation.name"
  >
    <template slot="after-page-title">
      <v-toolbar
        v-if="channelInformation && channelInformation.id"
        dense
        color="background"
      >
        <div>{{ channelInformation.name }} - {{ channelInformation.url }}</div>
      </v-toolbar>
    </template>
  </show-chart-and-table>
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import ChannelChart from "@/components/page/setting-display-ads/channel/ChannelChart.vue";
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
import { ChannelInterface } from "~/interface/data/channel";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
  loading: boolean;
  channelInformation: ChannelInterface;
  $channelRepository: RepositoryInterface;
}

interface ComponentMethods {
  fetchDataChannel(channelId: string | number): void;
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
        component: ChannelChart,
        queryParams: {
          id: this.$route.params.id
        }
      },
      table: {
        props: {},
        component: ZoneTable,
        queryParams: {
          resource_channel_id: this.$route.params.id
        }
      },
      loading: false,
      channelInformation: {}
    };
  },
  computed: {
    channelId() {
      return this.$route.params.id;
    }
  },
  watch: {
    channelId(val) {
      this.fetchDataChannel(val);
      this.chart.queryParams.id = val;
    }
  },
  async created() {
    await this.fetchDataChannel(this.$route.params.id);
    fetchPermissionToStorage({
      namePage: "setting-display-ads-zone",
      app: this,
      $auth: this.$auth
    });
  },
  methods: {
    async fetchDataChannel(channelId) {
      try {
        const res = await this.$channelRepository.getDetail(channelId);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.channelInformation = res.data;
        } else {
          this.$nuxt.error({ statusCode: 404 });
          this.$toast.global.server_error_msg("Không tìm thấy sub-inventory");
        }
      } catch (e) {
        this.loading = false;
        this.$nuxt.error({ statusCode: 404 });
      }
    }
  }
});
</script>
