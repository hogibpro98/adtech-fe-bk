<template>
  <div>
    <form-dialog
      ref="refFormDialog"
      v-bind="$attrs"
      :loading="loading"
      label-button-confirm="Tải lên"
      title="Tải lên dữ liệu brandname"
      content-class="flex xs12 sm8 md8 lg5 xl4"
      v-on="$listeners"
      @on-submit="openConfirm"
    >
      <template slot="content">
        <v-flex xs12 class="form-group">
          <v-file-field-with-validation
            v-model="file_import"
            :accept="document"
            :error-count="10"
            :hint="`Tải tệp có định dạng ${document.join(', ')}`"
            persistent-hint
            label="Chọn tệp brandname"
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
      ref="confirmDialog"
      title="Xác nhận"
      content="Các brandname đã tồn tại sẽ bị ghi đè, bạn có chắc chắn muốn tiếp tục?"
      :loading="loading"
      @confirm="onSubmit"
    />
  </div>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import VFileFieldWithValidation from "@/components/common/VFileFieldWithValidation.vue";
import { isArray, isObject } from "@/util/typeof";
import { flattenDeep } from "lodash";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "../../common/ConfirmDialog.vue";
import { BrandnameInterface } from "~/interface/data/brandname";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FileInterface } from "~/interface/data/file";
import { FormDialogRef } from "~/components/common/FormDialog.vue";

interface ComponentData {
  loading: boolean;
  item: BrandnameInterface;
  $refs: {
    confirmDialog: ConfirmDialogRef;
    refFormDialog: FormDialogRef;
  };
  $brandNameRepository: RepositoryInterface;
  $toast: ToastInterface;
  file_import: FileInterface;
  document: string;
}

interface ComponentMethods {
  show: () => void;
  hide: () => void;
  deleteItem: () => void;
  openConfirm: () => void;
}

/**
 * @property {Object} $brandNameRepository
 */

const BrandNameImportDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "BrandNameImportDialog",
  components: {
    ConfirmDialog,
    VFileFieldWithValidation,
    FormDialog
  },
  props: {
    sampleUrl: {
      type: String,
      default: "/targeting/templates/Template_import_brandname.xlsx"
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
    openConfirm() {
      this.$refs.confirmDialog.show();
    },

    async onSubmit() {
      this.loading = true;
      this.$refs.confirmDialog.hide();
      try {
        const data = new FormData();
        data.set("file", this.file_import);
        const res = await this.$brandNameRepository.post("import", data);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("brandname");
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

export default BrandNameImportDialog;
export type BrandNameImportDialogRef = InstanceType<
  typeof BrandNameImportDialog
>;
</script>
