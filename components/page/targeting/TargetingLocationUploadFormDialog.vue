<template>
  <form-dialog
    ref="refFormDialog"
    v-bind="$attrs"
    :loading="loading"
    label-button-confirm="Tải lên"
    title="Tải lên dữ liệu các vị trí"
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

interface ComponentData {
  timeout: number;
  loading: boolean;

  file_import: object;
  document: Array<string>;
  $refs: { refFormDialog: FormDialogRef };
  $targetingLocationRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  onSubmit: Function;
}

/**
 * @property {Object} $targetingLocationRepository
 */

const TargetingLocationUploadFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TargetingLocationUploadFormDialog",
  components: {
    VFileFieldWithValidation,
    FormDialog
  },
  props: {
    sampleUrl: {
      type: String,
      default: "/targeting/templates/Template_Import_vị_trí.xlsx"
    }
  },
  data() {
    return {
      timeout: null,
      loading: false,
      file_import: undefined,
      document: [".xlsx", ".xls"]
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show() {
      clearTimeout(this.timeout);
      this.file_import = null;
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    async onSubmit() {
      this.loading = true;
      try {
        const data = new FormData();
        data.set("file", this.file_import);
        const res = await this.$targetingLocationRepository.post(
          "import",
          data
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("vị trí");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors;
          if (isObject(errors)) {
            this.$refs.refFormDialog.setErrors(errors);
          } else if (isArray(errors)) {
            const errorFile = flattenDeep(errors);
            this.$refs.refFormDialog.setErrors({ file: errorFile });
          }
        }
      }
    }
  }
});

export default TargetingLocationUploadFormDialog;
export type TargetingLocationUploadFormDialogRef = InstanceType<
  typeof TargetingLocationUploadFormDialog
>;
</script>
