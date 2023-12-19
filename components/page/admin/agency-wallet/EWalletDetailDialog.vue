<template>
  <form-dialog
    ref="dialog"
    :loading="loading"
    :title="displayTitle"
    label-button-confirm=""
    content-class="flex xs12 sm8 md6 lg5 xl3"
  >
    <template #content>
      <v-flex v-if="isDetailMode" xs12>
        <v-row justify="center" class="mb-2">
          <h2 class="pa-2">Số dư: {{ item.balance }}</h2>
          <v-icon
            class="pa-2 pointer"
            :class="{ 'rotate-infinity': loading }"
            @click="syncBalance"
            >cached</v-icon
          >
        </v-row>
      </v-flex>
      <template v-if="isUnlinkMode">
        <span class="error--text mb-2"
          >Bạn có chắc chắn muốn ngắt kết nối tài khoản ví 511 này không?</span
        >
      </template>
      <v-flex xs12>
        <v-layout justify-space-between>
          <span>Người sở hữu:</span>
          <strong>{{ item.full_name }}</strong>
        </v-layout>
        <v-layout justify-space-between>
          <span>Wallet ID:</span>
          <strong>{{ item.wallet_id }}</strong>
        </v-layout>
        <v-layout justify-space-between>
          <span>Tài khoản dịch vụ:</span>
          <strong>{{ walletType }}</strong>
        </v-layout>
      </v-flex>
    </template>
    <template #actions>
      <template v-if="isDetailMode">
        <v-btn color="error" text @click.native="switchUnlinkMode">
          Hủy liên kết
        </v-btn>
      </template>
      <template v-if="isUnlinkMode">
        <v-btn color="primary" text :loading="loading" @click.native="unlink">
          Đồng ý
        </v-btn>
      </template>
      <v-btn color="grey" text @click.native="hide">
        Đóng
      </v-btn>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import ConfirmDialog, {
  ConfirmDialogRef
} from "@/components/common/ConfirmDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import Vue, { VueConstructor } from "vue";
import { SettingUserPriceInterface } from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import FormDialog from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VPasswordWithValidation from "~/components/common/VPasswordWithValidation.vue";

const DEFAULT_ITEM = {
  id: "",
  balance: 0,
  wallet_id: "",
  type: ""
};

const DETAIL_MODE = "detail";
const UNLINK_MODE = "unlink";

interface ItemInterface {
  id: string | number;
  balance: number;
  wallet_id: string;
  type: string;
  full_name: string;
}

interface ComponentData {
  DOCUMENT: Array<string>;
  title: string;
  mode: string;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
  $agencyWalletRepository: RepositoryInterface;
  $refs: {
    dialog: ConfirmDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;

  hidden(): void;

  getTypeTransaction(typeTransaction: string): object;
}

const EWalletDetailDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EWalletDetailDialog",
  components: {
    VPasswordWithValidation,
    VTextFieldWithValidation,
    FormDialog,
    ConfirmDialog
  },
  data() {
    return {
      item: cloneDeep(DEFAULT_ITEM),
      walletTypeMap: {
        mms: "Tin nhắn SMS",
        sms: "tin nhắn SMS",
        redirect: "Quảng cáo redirect"
      },
      mode: "detail",
      loading: false
    };
  },
  computed: {
    isDetailMode() {
      return this.mode === DETAIL_MODE;
    },
    isUnlinkMode() {
      return this.mode === UNLINK_MODE;
    },
    walletType() {
      const type = this.walletTypeMap[this.item.type];
      if (type) {
        return type;
      }
      return "";
    },
    displayTitle() {
      if (this.isDetailMode) {
        return "Thông tin chi tiết ví";
      }
      return "Hủy liên kết ví";
    }
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      this.$refs.dialog.show();
    },
    hide() {
      this.item = cloneDeep(DEFAULT_ITEM);
      this.mode = DETAIL_MODE;
      this.$refs.dialog.hidden();
    },
    switchLinkMode() {
      this.mode = LINK_MODE;
    },
    switchUnlinkMode() {
      this.mode = UNLINK_MODE;
    },
    async syncBalance() {
      this.loading = true;
      try {
        const res = await this.$agencyWalletRepository.post("sync-balance", {
          id: this.item.id
        });

        if (res.code === CODE_SUCCESS) {
          this.$emit("success", res.data);
          this.item.balance = res.data.balance;
          this.$toast.success("Đồng bộ số dư thành công");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.dialog.setErrors(e.response.data.errors);
        }
      }
      this.loading = false;
    },
    async unlink() {
      this.loading = true;
      try {
        const res = await this.$agencyWalletRepository.delete({
          id: this.item.id
        });

        if (res.code === CODE_SUCCESS) {
          this.$emit("success", res.data);
          this.$toast.success("Ngắt kết nối tài khoản thành công");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.dialog.setErrors(e.response.data.errors);
        }
      }
      this.loading = false;
    }
  }
});

export default EWalletDetailDialog;
export type EWalletDetailDialogRef = InstanceType<typeof EWalletDetailDialog>;
</script>
