<template>
  <form-dialog
    ref="refFormDialog"
    :loading="loading"
    v-bind="$attrs"
    :title="`Liên kết tài khoản ví ${type}`"
    label-button-confirm="Xác nhận"
    max-width="600px"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group pr-1">
        <v-text-field-with-validation
          v-model="item.full_name"
          :loading="loading"
          name="name"
          disabled
          type="text"
          label="Tên doanh nghiệp"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group pr-1">
        <v-text-field-with-validation
          v-model="wallet_id"
          :loading="loading"
          name="wallet_id"
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
          name="password"
          prefix=""
          type="password"
          label="Password"
          required
          rules="required"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import VPasswordWithValidation from "@/components/common/VPasswordWithValidation.vue";
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import { pick } from "lodash";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { UserInterface } from "~/interface/data/user";
import { RepositoryInterface } from "~/interface/plugin/repository";
import GlobalDataInterface from "~/interface/data/global";

const DEFAULT_ITEM = {
  id: null,
  full_name: ""
};

interface ComponentData extends GlobalDataInterface {
  period: Array<object>;
  timeout: number;
  loading: boolean;
  item: UserInterface;
  wallet_id: number | string;
  password: string;
  $agencyWalletRepository: RepositoryInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: UserInterface): void;
  hide(): void;
  onSubmit(): void;
  linkAccount(): void;
}

const EWalletLinkAccount = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EWalletLinkAccount",
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
      type: "sms",
      item: cloneDeep(DEFAULT_ITEM),
      wallet_id: "",
      password: ""
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null, type = "sms") {
      clearTimeout(this.timeout);
      this.type = type;
      this.item = pick(item, ["id", "full_name"]);
      this.wallet_id = item.wallet?.wallet_id || "";
      this.password = "";
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
        const res = await this.$agencyWalletRepository.post("link", {
          user_id: this.item.id,
          type: this.type,
          wallet_id: this.wallet_id,
          password: this.password
        });
        if (res.code === CODE_SUCCESS) {
          this.$emit("success", res.data);
          this.$toast.success("Liên kết tài khoản thành công");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
      this.loading = false;
    }
  }
});

export default EWalletLinkAccount;
export type EWalletLinkAccountRef = InstanceType<typeof EWalletLinkAccount>;
</script>
