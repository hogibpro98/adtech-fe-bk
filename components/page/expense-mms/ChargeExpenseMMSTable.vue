<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbar"
            :use-param-url="false"
            calculate-widths
            v-on="$listeners"
          >
            <template slot="item.ads_name" slot-scope="{ item }">
              <nuxt-link
                :to="`/manage-ads/list-ads-mms/${item.ads_id}`"
                target="_blank"
              >
                {{ item.ads_name }}
              </nuxt-link>
            </template>
            <template slot="item.campaign_name" slot-scope="{ item }">
              <nuxt-link
                :to="`/manage-campaign/list/${item.campaign_id}`"
                target="_blank"
              >
                {{ item.campaign_name }}
              </nuxt-link>
            </template>
            <template slot="item.updated_at" slot-scope="{ item }">
              {{ item.updated_at | date }}
            </template>
            <template slot="item.rate_success" slot-scope="{ item }">
              <div class="text-right">{{ item.rate_success | percent }}%</div>
            </template>
            <template slot="item.num_fail" slot-scope="{ item }">
              <div class="text-right">
                {{ item.num_fail | numberSpace }}
              </div>
            </template>
            <template slot="item.num_sent" slot-scope="{ item }">
              <div class="text-right">
                {{ item.num_sent | numberSpace }}
              </div>
            </template>
            <template slot="item.num_success" slot-scope="{ item }">
              <div class="text-right">
                {{ item.num_success | numberSpace }}
              </div>
            </template>
            <template slot="item.price_mms" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price_mms | currency }}
              </div>
            </template>
            <template slot="item.total_money" slot-scope="{ item }">
              <div class="text-right">
                {{ item.total_money | currency }}
              </div>
            </template>
            <template slot="item.content" slot-scope="{ item }">
              <a
                v-if="item.content"
                href="javascript:;"
                class="truncate"
                @click="showContent(item)"
              >
                {{ textContent(item) || "Xem chi tiết" }}
              </a>
              <span v-else> Không có nội dung </span>
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
        <preview-banner-mms-dialog ref="contentDialog" />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import EWalletFormAsyncAccount from "@/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletFormRecharge from "@/components/page/expense-mms/EWalletFormRecharge.vue";
import { TRANSACTION_MMS_DAILY_DETAIL } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

import { EWalletFormRechargeRef } from "~/components/page/expense-mms/EWalletFormRecharge.vue";
import { EWalletLinkAccountRef } from "~/components/page/expense-mms/EWalletLinkAccount.vue";
import PreviewBannerMmsDialog from "~/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  $refs: {
    table: ApiDataTableRef;
    eWalletFormRecharge: EWalletFormRechargeRef;
    eWalletFormAsyncAccount: EWalletLinkAccountRef;
  };
}

interface ComponentMethod {
  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "ChargeExpenseMMSTable",
  components: {
    PreviewBannerMmsDialog,
    EWalletFormAsyncAccount,
    EWalletFormRecharge,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: TRANSACTION_MMS_DAILY_DETAIL
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
          width: 240
        },
        {
          text: "Chiến dịch",
          value: "campaign_name",
          width: 240
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 160
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "cat_id",
          width: 200
        },
        {
          text: "Nội dung tin",
          value: "content",
          width: 240
        },
        {
          text: "Mã quảng cáo",
          value: "ads_id",
          sortable: false,
          align: "right",
          width: 144
        },
        {
          text: "Tổng số tin nhắn đã gửi",
          value: "num_sent",
          align: "right",
          width: 180
        },
        {
          text: "Số tin nhắn đã gửi thành công",
          value: "num_success",
          align: "right",
          width: 144
        },
        {
          text: "Tỉ lệ tin nhắn gửi thành công",
          value: "rate_success",
          align: "right",
          width: 132
        },
        {
          text: "Đơn giá",
          value: "price_mms",
          align: "right",
          width: 104
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
  mounted() {
    this.$refs.table.clearSearch();
  },
  methods: {
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    showContent(item) {
      this.$refs.contentDialog.show({
        message: item.content,
        mms_header: item.header
      });
    },
    textContent(item) {
      let text = item.header || "";

      item.content.forEach(e => {
        if (e.type === "text") {
          text += " " + e.data + ".\n";
        }
      });
      return text;
    }
  }
});
</script>
