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
          v-model="defaultItem.vendor_name"
          name="vendor_name"
          label="Tên đối tác phân phối"
          counter="255"
          maxlength="255"
          required
          rules="required"
        ></v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.send_sms_url"
          counter="255"
          maxlength="255"
          label="Đường dẫn API"
          name="send_sms_url"
          required
          rules="required|url|vietnameseCheck|spaceCheck"
        >
        </v-text-field-with-validation>
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
        <v-text-field-with-validation
          v-model="defaultItem.vendor_code"
          label="Mã đối tác phân phối"
          name="vendor_code"
          counter="255"
          maxlength="255"
          required
          rules="required"
          :disabled="isEdit"
        >
        </v-text-field-with-validation>
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

interface ComponentData {
  isShow: boolean;
  isEdit: boolean;
  defaultItem: {
    vendor_name: string;
    vendor_code: string;
    send_sms_token: string;
    send_sms_url: string;
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

const VendorDialog = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  name: "VendorDialog",
  components: { VTextFieldWithValidation, FormDialog },

  data() {
    return {
      isShow: false,
      isEdit: false,
      defaultItem: {
        vendor_name: "",
        vendor_code: "",
        send_sms_token: "",
        send_sms_url: ""
      },
      loading: false
    };
  },
  computed: {
    title() {
      if (this.isEdit) {
        return "Cập nhật vendor";
      } else {
        return "Thêm vendor";
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
      try {
        const result = await this.$axios.post(
          "sms-vendor/update",
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
          "sms-vendor/store",
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
export default VendorDialog;
export type VendorDialogRef = InstanceType<typeof VendorDialog>;
</script>

<style scoped></style>
