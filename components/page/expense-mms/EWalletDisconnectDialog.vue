<template>
  <v-dialog
    ref="dialog"
    :loading="loading"
    title="Ngắt kết nối tài khoản ví"
    @confirm="confirm"
  >
    <template #content>
      Bạn có chắc chắn muốn ngắt kết nối tới tài khoản ví 511 ID:
      <span class="error--text"> {{ item.wallet_id }} </span>
    </template>
  </v-dialog>
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

const DEFAULT_ITEM = {
  id: "",
  wallet: {
    wallet_id: ""
  }
};

interface ItemInterface {
  id: string | number;
  wallet: {
    wallet_id: string | number;
  };
}

interface ComponentData {
  DOCUMENT: Array<string>;
  title: string;
  isEdit: boolean;
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

const EWalletDisconnectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EWalletDisconnectDialog",
  components: { ConfirmDialog },
  data() {
    return {
      item: cloneDeep(DEFAULT_ITEM),
      loading: false
    };
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      this.$refs.dialog.show();
    },
    hide() {
      this.item = cloneDeep(DEFAULT_ITEM);
      this.$refs.dialog.hide();
    },
    async confirm() {
      this.loading = true;
      try {
        const res = await this.$agencyWalletRepository.post(
          "disconnect-account",
          {
            id: this.item.id
          }
        );

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

export default EWalletDisconnectDialog;
export type EWalletDisconnectDialogRef = InstanceType<
  typeof EWalletDisconnectDialog
>;
</script>
