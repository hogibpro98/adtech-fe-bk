<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 sm8 lg6"
    @on-submit="onSubmit"
    @hidden="hidden"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-container grid-list-xl fluid>
          <v-layout row wrap justify-center>
            <v-flex xs12>
              <v-overlay
                v-if="loading"
                absolute
                color="#fff"
                class="z-1"
              ></v-overlay>
              <wallet-detail-multiple-slider v-model="item.wallets" />
              <div class="display-none">
                <wallet-detail-save-dialog
                  ref="saveWalletDialog"
                  :wallet-data="item.wallets"
                  :user-id="id"
                  style="display: none"
                  @save-wallet-success="saveWalletSuccess"
                />
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { clone } from "lodash";
import { ToastInterface } from "~/interface/plugin/toast";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { ChannelInterface } from "~/interface/data/channel";
import WalletDetailMultipleSlider from "~/components/page/admin/cms-wallet/WalletDetailMultipleSlider.vue";
import WalletDetailSaveDialog from "~/components/page/admin/cms-wallet/WalletDetailSaveDialog.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  timeout: number;
  loading: boolean;
  item: Array<any>;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: Array<any>): void;

  hide(): void;

  deleteItem(): void;
}

const defaultWallet = {
  wallets: [
    {
      service: "total",
      balance: 0
    }
  ]
};

const WalletDetailDisplayDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "WalletDetailDisplayDialog",
  components: {
    WalletDetailSaveDialog,
    WalletDetailMultipleSlider,
    FormDialog
  },
  middleware: ["self-or-admin"],
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      timeout: null,
      loading: false,
      item: cloneDeep(defaultWallet),
      id: 0
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      // clearTimeout(this.timeout);
      // if(item.wallets.length !== 0) {
      //   this.item = cloneDeep(item);
      // }else{
      this.id = item.id;
      this.fetchData(item.id);
      // }
      // this.title = "Thay đổi giá trị các ví";
      // this.labelButtonConfirm = "Lưu ví";
      // this.loading = false;
      // this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.item = cloneDeep(defaultWallet);
      clearTimeout(this.timeout);
    },
    onSubmit() {
      this.$refs.saveWalletDialog.show();
    },
    async fetchData(userId) {
      clearTimeout(this.timeout);
      this.$refs.refFormDialog.show();
      try {
        this.loading = true;
        const { data } = await this.$agencyWalletRepository.post(
          "get-wallets",
          {
            id: userId
          }
        );
        await this.$nextTick();
        this.item.wallets = cloneDeep(data);
        // await this.$nextTick();
        // this.item.wallets = cloneDeep(data);
      } catch (e) {}
      this.title = "Thay đổi giá trị các ví";
      this.labelButtonConfirm = "Lưu ví";
      this.loading = false;
    },
    saveWalletSuccess() {
      this.$emit("success");
      this.$refs.refFormDialog.hidden();
    }
  }
});

export default WalletDetailDisplayDialog;
export type WalletDetailDisplayDialogRef = InstanceType<
  typeof WalletDetailDisplayDialog
>;
</script>
