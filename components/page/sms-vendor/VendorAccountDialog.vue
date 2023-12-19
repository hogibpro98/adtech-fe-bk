<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 md8 lg7 xl6"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.username"
          name="username"
          label="Username"
          counter="255"
          maxlength="255"
          required
          rules="required|max:255"
        ></v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <vendor-select
          v-model="defaultItem.vendor_code"
          :loading="loading"
          :return-object="false"
          name="vendor"
          label="Mã đối tác phân phối"
          item-value="vendor_code"
          item-text="vendor_name"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <telco-combobox
          v-model="defaultItem.telco_codes"
          :loading="loading"
          multiple
          name="telco_codes"
          label="Nhà mạng"
          resource="/telco"
          item-value="code"
          item-text="name"
          required
          rules="required"
        ></telco-combobox>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.send_sms_token"
          label="API Token"
          name="send_sms_token"
          counter="255"
          maxlength="255"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="defaultItem.description"
          label="Mô tả"
          name="description"
          counter="500"
          maxlength="500"
        >
        </v-text-area-with-validation>
      </v-flex>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import FormDialog, { FormDialogRef } from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import TelcoCombobox from "~/components/select/TelcoCombobox.vue";
import VendorSelect from "~/components/select/VendorSelect.vue";

interface ComponentData {
  isShow: boolean;
  isEdit: boolean;
  defaultItem: {
    username: string;
    vendor_code: string;
    send_sms_token: string;
    description: string;
    telco_codes: [];
  };
  labelButtonConfirm: string;
  loading: boolean;
}
interface ComponentMethod {
  show(item: object): void;
  hide(): void;
  editItem(): void;
  addItem(): void;
  onSubmit(): void;
}
interface ComponentComputed {
  title: string;
  labelButtonConfirm: string;
}
interface ComponentProp {}

const VendorAccountDialog = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  name: "VendorAccountDialog",
  components: {
    VendorSelect,
    VTextAreaWithValidation,
    VTextFieldWithValidation,
    FormDialog,
    TelcoCombobox
  },
  data() {
    return {
      isShow: false,
      isEdit: false,
      defaultItem: {
        username: "",
        vendor_code: "",
        send_sms_token: "",
        description: "",
        telco_codes: []
      },
      loading: false
    };
  },
  computed: {
    title() {
      if (this.isEdit) {
        return "Cập nhật cấu hình token đối tác nhà phân phối";
      } else {
        return "Thêm cấu hình token đối tác nhà phân phối";
      }
    },
    labelButtonConfirm() {
      if (this.isEdit) {
        return "Cập nhật";
      } else {
        return "Xác nhận";
      }
    }
  },
  methods: {
    show(item = null) {
      if (item) {
        this.defaultItem = cloneDeep(item);
        this.isEdit = true;
      } else {
        this.isEdit = false;
        this.defaultItem = {};
      }
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    async editItem() {
      this.loading = true;
      // this.defaultItem.vendor_code = this.defaultItem.vendor?.code;
      try {
        const result = await this.$axios.post(
          "vendor-account/update",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cập nhật vendor");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const result = await this.$axios.post(
          "vendor-account/store",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("thêm mới vendor");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    onSubmit() {
      if (!this.isEdit) {
        this.addItem();
      } else {
        this.editItem();
      }
    }
  }
});
export default VendorAccountDialog;
export type VendorAccountDialogRef = InstanceType<typeof VendorAccountDialog>;
</script>

<style scoped></style>
