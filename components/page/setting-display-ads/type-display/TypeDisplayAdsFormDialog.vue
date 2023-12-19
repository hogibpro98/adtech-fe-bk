<template>
  <v-row justify="center">
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
            :counter="100"
            name="name"
            rules="required|max:100"
            type="text"
            label="Tên"
            required
          />
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-text-area-with-validation
            v-model="item.description"
            :loading="loading"
            name="description"
            label="Mô tả"
            rows="3"
            counter="500"
            rules="max:500"
          />
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-select-with-validation
            v-model="item.media_type"
            :items="MEDIA_TYPES"
            name="type"
            label="Loại hiển thị"
            required
            rules="required"
          />
        </v-flex>
        <v-flex xs12 class="mt-4">
          <label class="v-label ">
            Kích thước
          </label>
        </v-flex>
        <v-flex sm6 class="pr-sm-2">
          <v-number-field-with-validation
            v-model="width"
            :loading="loading"
            min-value-fixed
            min-value="0"
            name="width"
            label="Chiều rộng"
            required
            rules="required"
          />
        </v-flex>
        <v-flex sm6 class="pl-sm-2">
          <v-number-field-with-validation
            v-model="height"
            :loading="loading"
            name="height"
            label="Chiều dài"
            min-value-fixed
            min-value="0"
            required
            rules="required"
          />
        </v-flex>
        <v-flex xs12 class="form-group mt-4">
          <file-upload
            v-model="item.image_demo"
            :accept="acceptImage"
            upload-area-classe="height-23vh"
            name="file"
            label="Ảnh demo"
            rules="required"
            required
          />
        </v-flex>
      </template>
    </form-dialog>
  </v-row>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import FileUpload from "@/components/common/FileUpload/index.vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import { DEVICES, PLATFORM, MEDIA_TYPES } from "@/constants/dataSelect";
import cloneDeep from "lodash/cloneDeep";
import { IMAGE } from "@/constants/fileType";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { InventoryInterface } from "~/interface/data/inventory";
import { ToastInterface } from "~/interface/plugin/toast";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { DisplayAdsTypeInterface } from "~/interface/data/displayAdsType";

const DEFAULT_ITEM = {
  name: "",
  description: "",
  image_templates: [],
  image_demo: "",
  platform: null,
  device: null
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  acceptImage: string;
  devices: Array<object>;
  platforms: Array<object>;
  MEDIA_TYPES: Array<object>;
  isEdit: boolean;
  width: number;
  height: number;
  timeout: number;
  loading: boolean;

  item: DisplayAdsTypeInterface;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $adsTypeRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: InventoryInterface): void;

  hidden(): void;

  onSubmit(): void;

  addItem(): void;

  editItem(): void;
}

const TypeDisplayAdsFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TypeDisplayAdsFormDialog",
  components: {
    VSelectWithValidation,
    VNumberFieldWithValidation,
    FormDialog,
    FileUpload,
    VTextAreaWithValidation,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      acceptImage: IMAGE,
      devices: DEVICES,
      platforms: PLATFORM,
      MEDIA_TYPES,
      isEdit: false,
      width: null,
      height: null,
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

        if (item?.image_templates) {
          const imageTemplate = item.image_templates[0] || {};
          this.width = imageTemplate.width;
          this.height = imageTemplate.height;
        }
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.width = null;
        this.height = null;
      }

      this.title = `${
        this.isEdit ? "Cập nhật" : "Thêm"
      } loại hiển thị quảng cáo`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    getItemToUpdate() {
      const imageTemplate = {
        width: this.width,
        height: this.height,
        name: "default_name",
        image: this.item.image_demo
      };

      this.item.image_templates = [imageTemplate];
      return this.item;
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$adsTypeRepository.create(
          this.getItemToUpdate()
        );
        this.loading = false;
        if (res?.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("loại hiển thị quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    },
    async editItem() {
      this.loading = true;

      try {
        const res = await this.$adsTypeRepository.update(
          this.getItemToUpdate()
        );
        this.loading = false;
        if (res?.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("loại hiển thị quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default TypeDisplayAdsFormDialog;
export type TypeDisplayAdsFormDialogRef = InstanceType<
  typeof TypeDisplayAdsFormDialog
>;
</script>
