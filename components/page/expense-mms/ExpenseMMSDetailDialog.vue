<template>
  <fullscreen-dialog
    ref="refFormDialog"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="hidden"
    v-on="$listeners"
  >
    <template slot="title">
      {{ title }}
    </template>
    <template>
      <v-row class="no-margin no-padding">
        <v-flex xs12>
          <v-row class="no-margin no-padding">
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Tên agency:
                </span>
                <span v-if="item.agency">
                  {{ item.agency.full_name }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Tên advertiser:
                </span>
                <span v-if="item.advertiser">
                  {{ item.advertiser.full_name }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Loại giao dịch:
                </span>
                <span v-if="item && item.type && getTypeTransaction(item.type)">
                  {{ getTypeTransaction(item.type).text }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Tổng số tiền:
                </span>
                <span>
                  {{ item.total_money | currency }}
                </span>
              </v-row>
            </v-flex>
            <v-flex xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <v-text-area-with-validation
                  :value="item.message"
                  :loading="loading"
                  name="reason"
                  class="w-full"
                  label="Nội dung"
                  rows="1"
                  auto-grow
                  readonly
                />
              </v-row>
            </v-flex>
          </v-row>
        </v-flex>
      </v-row>
      <v-flex xs12 class="form-group">
        <charge-expense-m-m-s-table
          v-if="item.type === 'charge'"
          :filter-custom="{ id: item.id }"
        />
        <recharge-expense-m-m-s-table
          v-if="item.type === 'recharge'"
          :filter-custom="filterTableRecharge"
        />
      </v-flex>
    </template>
    <template slot="action">
      <v-layout justify-end class="px-2 py-2">
        <v-btn
          :loading="loading"
          color="blue darken-1"
          text
          @click.native="hidden"
        >
          Đóng
        </v-btn>
      </v-layout>
    </template>
  </fullscreen-dialog>
</template>
<script lang="ts">
import FullscreenDialog from "@/components/common/FullscreenDialog.vue";
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation.vue";
import ChargeExpenseMMSTable from "@/components/page/expense-mms/ChargeExpenseMMSTable.vue";
import RechargeExpenseMMSTable from "@/components/page/expense-redirect/RechargeExpenseMMSTable.vue";
import { TYPE_TRANSACTION_REDIRECT } from "@/constants/dataSelect";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import Vue, { VueConstructor } from "vue";
import { FullscreenDialogRef } from "~/components/common/FullscreenDialog.vue";
import { SettingUserPriceInterface } from "~/interface/data/banner";
import { TransactionMMSDailyDetail } from "~/interface/data/expense";
import GlobalDataInterface from "~/interface/data/global";
import PreviewBannerMmsDialog from "~/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";

const DEFAULT_ITEM = {};

interface ComponentData extends GlobalDataInterface {
  DOCUMENT: Array<string>;
  title: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: TransactionMMSDailyDetail;
  $refs: {
    refFormDialog: FullscreenDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;
  hidden(): void;
  getTypeTransaction(typeTransaction: string): object;
}

const ExpenseMMSDetailDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ExpenseMMSDetailDialog",
  components: {
    PreviewBannerMmsDialog,
    RechargeExpenseMMSTable,
    ChargeExpenseMMSTable,
    VTextAreaWithValidation,
    FullscreenDialog
  },
  data() {
    return {
      DOCUMENT,
      title: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    filterTableRecharge() {
      return {
        select_user_id: this.item?.agency_id,
        select_service: "mms",
        date_created_at: [
          this.$filters.sqlDate(this.item?.created_at),
          this.$filters.sqlDate(this.item?.created_at)
        ]
      };
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `Chi tiết giao dịch ${this.$filters.date(item?.created_at)}`;
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    getTypeTransaction(typeTransaction) {
      return TYPE_TRANSACTION_REDIRECT.find(
        type => type.value === typeTransaction
      );
    }
  }
});

export default ExpenseMMSDetailDialog;
export type ExpenseMMSDetailDialogRef = InstanceType<
  typeof ExpenseMMSDetailDialog
>;
</script>
