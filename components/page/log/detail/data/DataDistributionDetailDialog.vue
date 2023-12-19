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
                  Tên phiếu tài trợ data:
                </span>
                <span>
                  {{ item.ads_name }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Số thuê bao:
                </span>
                <span>
                  {{ item.sub_id }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Mã gói data:
                </span>
                <span>
                  {{ item.code }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Số lượng data:
                </span>
                <span>
                  {{ item.capacity }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Đơn giá data:
                </span>
                <span>
                  {{ item.price }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1 my-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Thời gian gửi:
                </span>
                <span>
                  {{ item.sent_at | timestamp }}
                </span>
              </v-row>
            </v-flex>
          </v-row>
        </v-flex>
      </v-row>
      <v-flex xs12 class="form-group">
        <sms-follow-distribution-table
          :filter-custom="{ select_data_distribution_transid: item.transid }"
          :sms-before-transid="item.sms_before_transid"
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
import SmsFollowDistributionTable from "@/components/page/log/detail/SmsFollowDistributionTable.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, {VueConstructor} from "vue";
import {FullscreenDialogRef} from "~/components/common/FullscreenDialog.vue";
import {SettingUserPriceInterface} from "~/interface/data/banner";
import GlobalDataInterface from "~/interface/data/global";
import {SMSDistributionInterface} from "~/interface/data/log";

const DEFAULT_ITEM = {};

interface ComponentData extends GlobalDataInterface {
  DOCUMENT: Array<string>;
  title: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: SMSDistributionInterface;
  $refs: {
    refFormDialog: FullscreenDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;

  hidden(): void;

  getTypeTransaction(typeTransaction: string): object;
}

const DataDistributionDetailDialog = (Vue as VueConstructor<Vue & ComponentData & ComponentMethods>).extend({
  name: "DataDistributionDetailDialog",
  components: {
    SmsFollowDistributionTable,
    FullscreenDialog
  },
  data() {
    return {
      title: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
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

      this.title = `Chi tiết tin nhắn cộng thưởng data: ${item.transid}`;
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
  }
});

export default DataDistributionDetailDialog;
export type DataDistributionDetailDialogRef = InstanceType<typeof DataDistributionDetailDialog>;
</script>
