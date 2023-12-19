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
          v-model="defaultItem.name"
          name="name"
          label="Tên lĩnh vực hoạt động"
          counter="255"
          maxlength="255"
          required
          rules="required"
        ></v-text-field-with-validation>
      </v-flex>
      <v-flex xs12>
        <select-type-m-m-s
          v-model="defaultItem.type"
          name="type"
          label="Loại quảng cáo"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <action-business-type-select
          v-model="defaultItem.business_type_id"
          :loading="loading"
          :return-object="false"
          name="business_type_id"
          label="Lĩnh vực kinh doạnh"
          item-value="id"
          required
          rules="required"
        />
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
import ActionBusinessTypeSelect from "~/components/select/ActionBusinessTypeSelect.vue";
import SelectTypeMMS from "~/components/page/manage-campaign/banner/common/SelectTypeMMS.vue";

interface ComponentData {
  isShow: boolean;
  isEdit: boolean;
  defaultItem: {
    type: string;
    business_type_id: string;
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

const BusinessCatDialog = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  name: "BusinessCatDialog",
  components: {
    SelectTypeMMS,
    VTextFieldWithValidation,
    FormDialog,
    ActionBusinessTypeSelect
  },
  data() {
    return {
      isShow: false,
      isEdit: false,
      defaultItem: {
        type: "",
        business_type_id: ""
      },
      loading: false
    };
  },
  computed: {
    title() {
      if (this.isEdit) {
        return "Cập nhật cấu hình lĩnh vực hoạt động";
      } else {
        return "Thêm lĩnh vực hoạt động";
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
          "business-cat/update",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cập nhật hình lĩnh vực hoạt động");
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
          "business-cat/store",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("thêm mới hình lĩnh vực hoạt động");
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
export default BusinessCatDialog;
export type BusinessCatDialogRef = InstanceType<typeof BusinessCatDialog>;
</script>

<style scoped></style>
