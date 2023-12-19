<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          name="name"
          type="text"
          label="Tên"
          required
          rules="required"
        />
      </v-flex>
      <v-flex sm6 class="form-group pr-2">
        <v-number-field-with-validation
          v-model="item.width"
          :loading="loading"
          name="width"
          type="number"
          min-value-fixed
          min-value="0"
          label="Chiều dọc"
          required
          rules="required"
        />
      </v-flex>
      <v-flex sm6 class="form-group pl-2">
        <v-number-field-with-validation
          v-model="item.height"
          :loading="loading"
          name="height"
          type="number"
          min-value-fixed
          min-value="0"
          label="Chiều ngang"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <file-upload
          v-model="item.image_src"
          name="image_src"
          label="Ảnh demo"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FileUpload from "@/components/common/FileUpload.vue";
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { ToastInterface } from "~/interface/plugin/toast";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ImageTemplateInterface } from "~/interface/data/displayAdsType";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

const DEFAULT_ITEM = {
  name: "",
  image_src: "",
  width: 0,
  height: 0
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ImageTemplateInterface;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $inventoryDisplayRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ImageTemplateInterface): void;

  hidden(): void;

  onSubmit(): void;

  addItem(): void;

  editItem(): void;
}

const SizeTemplateDisplayAdsFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SizeTemplateDisplayAdsFormDialog",
  components: {
    VNumberFieldWithValidation,
    FormDialog,
    FileUpload,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} kích thước`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },

    addItem() {
      this.$emit("check-and-add-size-template", this.item);
    },

    editItem() {
      this.$emit("update-size-template", this.item);
      this.hidden();
    }
  }
});

export default SizeTemplateDisplayAdsFormDialog;
export type SizeTemplateDisplayAdsFormDialogRef = InstanceType<
  typeof SizeTemplateDisplayAdsFormDialog
>;
</script>
