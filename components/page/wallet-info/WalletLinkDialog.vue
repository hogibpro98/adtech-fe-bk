<template>
  <form-dialog
    ref="refFormDialog"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
    title="Liên kết tài khoản ví"
    label-button-confirm="Xác nhận"
    max-width="600px"
  >
    <template slot="content">
      <v-flex xs12 class="form-group pr-1">
        <v-text-field-with-validation
          v-model="wallet_id"
          :loading="loading"
          name="name"
          type="text"
          label="ID Ví"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group pr-1">
        <v-password-with-validation
          v-model="password"
          :loading="loading"
          name="name"
          prefix=""
          type="password"
          label="Mật khẩu"
          required
          rules="required"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import VPasswordWithValidation from "@/components/common/VPasswordWithValidation.vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import { WALLET_INFO } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";

const DEFAULT_ITEM = {
  id: null,
  username: ""
};

/**
 * @property {Object} $campaignRepository
 */

interface ItemInterface {
  id: string;
  username: string;
}

interface ComponentData {
  period: Array<object | number>;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
  wallet_id: string;
  password: string;
}

interface ComponentMethods {
  $refs: {
    refFormDialog: FormDialogRef;
    form: FormDialogRef;
  };

  show(): void;

  hide(): void;

  onSubmit(): void;

  linkAccount(): void;
}

const WalletLinkDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "WalletLinkDialog",
  components: {
    VPasswordWithValidation,
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      period: [],
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      wallet_id: "",
      password: ""
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show() {
      clearTimeout(this.timeout);

      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
      this.password = "";
      clearTimeout(this.timeout);
    },
    onSubmit() {
      this.linkAccount();
    },
    async linkAccount() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(`${WALLET_INFO}/link`, {
          wallet_id: this.wallet_id,
          password: this.password
        });
        this.loading = false;
        if (data.code === CODE_SUCCESS) {
          this.$emit("success", data.data);
          this.$toast.success("Liên kết tài khoản ví thành công");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default WalletLinkDialog;
export type WalletLinkDialogRef = InstanceType<typeof WalletLinkDialog>;
</script>
