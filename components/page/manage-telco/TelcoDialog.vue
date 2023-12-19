<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 md8 lg6 xl4"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.name"
          label="Tên nhà mạng"
          name="name"
          required
          rules="required"
          counter="255"
          maxlength="255"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.code"
          label="Mã nhà mạng"
          name="code"
          required
          rules="required"
          counter="255"
          maxlength="255"
          :disabled="isDisabled"
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
  loading: boolean;
  labelButtonConfirm: string;
  isEdit: boolean;
  defaultItem: {
    name: string;
    code: string;
  };
  isDisabled: boolean;
}
interface ComponentMethods {
  onSubmit(): void;
  editItem(): void;
  addItem(): void;
  show(): void;
  hide(): void;
}
interface ComponentComputed {
  title: string;
  labelButtonConfirm: string;
}
interface ComponentProps {}

const TelcoDialog = Vue.extend<
  ComponentData,
  ComponentMethods,
  ComponentComputed,
  ComponentProps
>({
  name: "TelcoDialog",
  components: { FormDialog, VTextFieldWithValidation },
  data() {
    return {
      loading: false,
      isEdit: false,
      defaultItem: {
        name: "",
        code: ""
      },
      isDisabled: false
    };
  },
  computed: {
    title() {
      if (this.isEdit) {
        return "Cập nhật nhà mạng";
      } else {
        return "Thêm mới nhà mạng";
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
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async editItem() {
      this.loading = true;
      try {
        const result = await this.$axios.$post("telco/update", {
          id: this.defaultItem.id,
          name: this.defaultItem.name,
          code: this.defaultItem.code
        });
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("sửa nhà mạng");
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
        const result = await this.$axios.$post("telco/store", this.defaultItem);
        console.log(result);
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("thêm mới nhà mạng");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        console.log(e.response);
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
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    show(item = null) {
      if (item) {
        this.isEdit = true;
        this.isDisabled = true;
        this.defaultItem = cloneDeep(item);
      } else {
        this.isDisabled = false;
        this.isEdit = false;
        this.defaultItem = {
          name: "",
          code: ""
        };
      }
      this.$refs.refFormDialog.show();
    }
  }
});

export default TelcoDialog;
</script>

<style scoped></style>
