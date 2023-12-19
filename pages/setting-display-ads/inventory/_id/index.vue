<template>
  <show-chart-and-table
    :chart="chart"
    :table="table"
    :title="inventoryInformation ? inventoryInformation.name : ''"
  >
    <template slot="after-page-title">
      <v-toolbar
        v-if="inventoryInformation && inventoryInformation.id"
        dense
        color="background"
      >
        <div>
          {{ inventoryInformation.name }} - {{ inventoryInformation.url }}
        </div>
      </v-toolbar>
    </template>
  </show-chart-and-table>
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import ChannelTable from "@/components/page/setting-display-ads/channel/ChannelTable.vue";
import InventoryChart from "@/components/page/setting-display-ads/inventory/InventoryChart.vue";
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
import { InventoryInterface } from "~/interface/data/inventory";
import { responseErrorToString } from "~/util/array";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
  loading: boolean;
  inventoryId: number | string;
  inventoryInformation: InventoryInterface;
  $inventoryDisplayRepository: RepositoryInterface;
}

interface ComponentMethods {
  fetchDataInventory(channelId: string | number): void;
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
        component: InventoryChart,
        queryParams: {
          id: this.$route.params.id
        }
      },
      table: {
        props: {},
        component: ChannelTable,
        queryParams: {
          resource_inventory_id: this.$route.params.id
        }
      },
      loading: false,
      inventoryInformation: {}
    };
  },
  computed: {
    inventoryId() {
      return this.$route.params.id;
    }
  },
  watch: {
    inventoryId(val) {
      this.fetchDataInventory(val);
      this.chart.queryParams.id = val;
      this.table.queryParams.resource_inventory_id = val;
    }
  },
  async created() {
    await this.fetchDataInventory(this.$route.params.id);
    fetchPermissionToStorage({
      namePage: "setting-display-ads-channel",
      app: this,
      $auth: this.$auth
    });

  },
  methods: {
    async fetchDataInventory(inventoryId) {
      try {
        const res = await this.$inventoryDisplayRepository.getDetail(
          inventoryId
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.inventoryInformation = res.data;
          if (!this.inventoryInformation) {
            this.$nuxt.error({ statusCode: 404 });
            this.$toast.global.server_error_msg("Không tìm thấy inventory");
          }
        } else {
          this.$toast.global.server_error_msg("Không tìm thấy inventory");
        }
      } catch (e) {
        this.loading = false;
        this.$nuxt.error({ statusCode: 404 });
      }
    }
  }
});
</script>
