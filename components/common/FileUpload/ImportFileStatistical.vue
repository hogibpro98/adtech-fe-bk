<template>
  <div>
    <form-dialog
      ref="refFormDialog"
      v-bind="$attrs"
      :loading="isLoadingImportFile"
      label-button-confirm="Tải lên"
      :title="`Tải file lên ${name}`"
      content-class="flex xs12 sm8 md8 lg5 xl4"
      v-on="$listeners"
      @on-submit="onSubmit"
    >
      <template slot="content">
        <v-flex xs12 class="form-group">
          <v-file-field-with-validation
            v-model="file_import"
            :accept="document"
            :hint="`Tải tệp có định dạng ${document.join(', ')}`"
            :error-count="10"
            persistent-hint
            label="Chọn tệp dữ liệu"
            name="file"
            rules="required"
            required
          />
          <v-card-text>
            <div>Tải file mẫu tại <a :href="sampleUrl" download>đây</a></div>
          </v-card-text>
        </v-flex>
      </template>
    </form-dialog>

    <confirm-dialog
      ref="refFormDialogNext"
      v-bind="$attrs"
      :loading="isLoadingSystem"
      label-button-confirm="Tiếp tục"
      title="Bạn có muốn hệ thống tự động tính toán không ?"
      content-class="flex xs12 sm8 md8 lg6 xl6"
      v-on="$listeners"
      @confirm="handleConfirm"
    >
      <template #content>
        <div class="error--text">{{ messageError }}</div>
      </template>
    </confirm-dialog>
  </div>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import VFileFieldWithValidation from "@/components/common/VFileFieldWithValidation.vue";
import { isArray, isObject } from "@/util/typeof";
import { flattenDeep } from "lodash";
import Vue, { VueConstructor } from "vue";
import { FormDialogRef } from "../../common/FormDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import FileUpload from "~/components/common/FileUpload/index.vue";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";

interface ComponentData {
  timeout: number;
  isLoadingImportFile: boolean;

  file_import: object;
  document: Array<string>;
  $refs: { refFormDialog: FormDialogRef };
  $phoneNameRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  onSubmit: Function;
}

/**
 * @property {Object} $phoneNameRepository
 */

const ImportFileStatistical = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ImportFileStatistical",
  components: {
    ConfirmDialog,
    VFileFieldWithValidation,
    FormDialog
  },
  props: {
    sampleUrl: {
      type: String,
      default: "/import/template_import_tong_hop_bao_cao_theo_ngay.xlsx"
    },
    name: {
      type: String,
      default: ""
    },
    resource: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      timeout: null,
      isLoadingImportFile: false,
      file_import: undefined,
      document: [".xlsx", ".xls"],
      isLoadingSystem: false,
      messageError: ""
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show() {
      clearTimeout(this.timeout);
      this.file_import = null;
      this.isLoadingImportFile = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    async onSubmit() {
      this.isLoadingImportFile = true;
      try {
        const data = new FormData();
        data.set("file", this.file_import);
        const res = await this.$axios.post(`${this.resource}/import`, data);
        this.isLoadingImportFile = false;
        if (res?.data?.code === CODE_SUCCESS) {
          this.$refs.refFormDialog.hidden();
          this.$emit("create-success");
          this.$toast.global.action_success("import");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.isLoadingImportFile = false;
        console.log(e);
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors;
          if (e.response.data?.errors.file) {
            this.$refs.refFormDialogNext.show();
            this.messageError = e.response.data?.errors?.file[0];
          }
          if (isObject(errors)) {
            this.$refs.refFormDialog.setErrors({
              file: Object.values(errors)[0]
            });
          } else if (isArray(errors)) {
            const errorFile = flattenDeep(errors);
            this.$refs.refFormDialog.setErrors({ file: errorFile });
          }
        } else {
          this.$toast.global.action_fail();
        }
      }
    },
    async handleConfirm() {
      this.isLoadingSystem = true;
      try {
        const data = new FormData();
        data.set("file", this.file_import);
        data.set("custom_next", 1);
        const res = await this.$axios.post(`${this.resource}/import`, data);
        this.isLoadingSystem = false;
        if (res.data.code === CODE_SUCCESS) {
          this.$refs.refFormDialogNext.hide();
          this.$refs.refFormDialog.hidden();
          this.$toast.global.action_success("import");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.isLoadingSystem = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialogNext.hide();
          const errors = e.response.data.errors;
          if (e.response.data?.errors.file) {
            this.$refs.refFormDialogNext.show();
            this.messageError = e.response.data?.errors?.file[0];
          }
          if (isObject(errors)) {
            this.$refs.refFormDialog.setErrors({
              file: Object.values(errors)[0]
            });
          } else if (isArray(errors)) {
            const errorFile = flattenDeep(errors);
            this.$refs.refFormDialog.setErrors({ file: errorFile });
          }
        } else {
          this.$toast.global.action_fail();
        }
      }
    }
  }
});

export default ImportFileStatistical;
export type ImportFileStatisticalRef = InstanceType<
  typeof ImportFileStatistical
>;
</script>

<style lang="scss">
.form-upload {
  .v-transmit__upload-area {
    min-height: unset;
    height: 144px;
  }
}
</style>
