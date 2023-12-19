<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-on="$listeners"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbar"
            :use-param-url="false"
            calculate-widths
          >
            <template slot="item.ads_name" slot-scope="{ item }">
              <nuxt-link :to="`/manage-ads/list-ads-redirect/${item.ads_id}`" target="_blank">
                {{ item.ads_name }}
              </nuxt-link>
            </template>
            <template slot="item.campaign_name" slot-scope="{ item }">
              <nuxt-link :to="`/manage-campaign/list/${item.campaign_id}`" target="_blank">
                {{ item.campaign_name }}
              </nuxt-link>
            </template>
            <template slot="item.updated_at" slot-scope="{ item }">
              <div class="text-right">
                {{ item.updated_at | date }}
              </div>
            </template>
            <template slot="item.num_view" slot-scope="{ item }">
              <div class="text-right">
                {{ item.num_view | numberSpace }}
              </div>
            </template>
            <template slot="item.num_click" slot-scope="{ item }">
              <div class="text-right">
                {{ item.num_click | numberSpace }}
              </div>
            </template>
            <template slot="item.ctr" slot-scope="{ item }">
              <div class="text-right">{{ item.ctr | percent }}%</div>
            </template>
            <template slot="item.price_cpm" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price_cpm | currency }}
              </div>
            </template>
            <template slot="item.total_money" slot-scope="{ item }">
              <div class="text-right">
                {{ item.total_money | currency }}
              </div>
            </template>
            <template
              v-for="(_, name) in $scopedSlots"
              :slot="name"
              slot-scope="slotData"
            >
              <slot :name="name" v-bind="slotData" />
            </template>
          </api-data-table>
        </v-card>
        <e-wallet-form-recharge
          ref="eWalletFormRecharge"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        ></e-wallet-form-recharge>
        <e-wallet-form-async-account
          ref="eWalletFormAsyncAccount"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        ></e-wallet-form-async-account>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import EWalletFormAsyncAccount from "@/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletFormRecharge from "@/components/page/expense-mms/EWalletFormRecharge.vue";
import { TRANSACTION_REDIRECT_DAILY_DETAIL } from "@/constants/resource";
import ApiDataTable from "~/components/table/ApiDataTable.vue";

export default {
  name: "ChargeExpenseRedirectTable",
  components: {
    EWalletFormAsyncAccount,
    EWalletFormRecharge,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: TRANSACTION_REDIRECT_DAILY_DETAIL
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    },
    headerExcludes: {
      type: Array,
      default: () => []
    },
    filterExcludes: {
      type: Array,
      default: () => []
    },
    createBannerSMS: {
      type: Boolean,
      default: false
    },
    createBannerRedirect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      headers: [
        {
          text: "Tên quảng cáo",
          value: "ads_name",
          width: 250
        },
        {
          text: "Tên chiến dịch",
          value: "campaign_name",
          width: 250
        },
        {
          text: "Loại quảng cáo",
          value: "ads_type_name",
          width: 150
        },
        {
          text: "Mã quảng cáo",
          value: "ads_id",
          sortable: false,
          width: 144
        },
        {
          text: "Tổng lượt impression",
          value: "num_view",
          align: "right",
          width: 172
        },
        {
          text: "Tổng lượt click",
          value: "num_click",
          align: "right",
          width: 152
        },
        {
          text: "CTR",
          value: "ctr",
          align: "right",
          width: 120
        },
        {
          text: "Đơn giá",
          value: "price_cpm",
          align: "right",
          width: 120
        },
        {
          text: "Thành tiền",
          value: "total_money",
          align: "right",
          width: 144
        }
      ]
    };
  },
  computed: {
    headerShow() {
      return this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );
    },
    filterShow() {
      return this.filters.filter(f => !this.filterExcludes.includes(f.name));
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    }
  },
  methods: {
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
};
</script>
