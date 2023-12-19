<template>
  <div>
    <form-dialog
      ref="refFormDialog"
      v-bind="$attrs"
      :loading="isLoadingImportFile"
      label-button-confirm="Tiếp tục"
      :title="`${name}`"
      content-class="flex xs12 sm8 md8 lg4 xl3"
      v-on="$listeners"
      @on-submit="onSubmit"
    >
      <template slot="content">
        <v-flex xs12 class="form-group">
          <v-card-text>
            <template>
              <span>
                Bạn có muốn đồng bộ lại dữ liệu ngày <span class="error--text">{{ yesterday }}</span>
              </span>
            </template>
          </v-card-text>
        </v-flex>
      </template>
    </form-dialog>
  </div>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import VFileFieldWithValidation from "@/components/common/VFileFieldWithValidation.vue";
import { isArray, isObject } from "@/util/typeof";
import { flattenDeep } from "lodash";
import Vue, { VueConstructor } from "vue";
import moment from "moment";
import { FormDialogRef } from "../../common/FormDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
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

const SyncAdsDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SyncAdsDialog",
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
      messageError: "",
      interval: null,
      numRecords: 0,
      numFail: 0
    };
  },
  computed: {
    yesterday() {
      return moment()
        .subtract(1, "day")
        .format("DD/MM/YYYY");
    }
  },
  beforeDestroy() {
    this.handleImportFinished();
    clearTimeout(this.timeout);
  },
  methods: {
    show() {
      this.$refs.refFormDialog.show();
      clearTimeout(this.timeout);
      this.file_import = null;
      this.handleImportFinished();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.handleImportFinished();
      clearTimeout(this.timeout);
    },
    async onSubmit() {
      this.isLoadingImportFile = true;
      try {
        const formData = new FormData();
        formData.set("file", this.file_import);
        const { data } = await this.$axios.post(
          `${this.resource}/sync`,
          formData
        );
        console.log(data);
        if (data?.data?.key) {
          this.checkProgress(data.data.key);
          // this.$refs.refFormDialog.hidden();
          // this.$emit("create-success");
          // this.$toast.global.action_success("import");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.isLoadingImportFile = false;
        console.log(e);
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors;
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

    checkProgress(key) {
      this.interval = setInterval(async () => {
        try {
          const { data } = await this.$axios.$post(
            `${this.resource}/check-sync`,
            {
              key
            }
          );
          if (data.status == CODE_SUCCESS) {
            this.handleImportFinished();
            this.$refs.refFormDialog.hidden();
            this.$emit("create-success");
            this.$toast.global.action_success(`Tổng hợp ${data.count} bản ghi`);
          } else if (data.status == 1) {
            this.numRecords = data.count;
            this.numFail = 0;
          } else {
            this.handleImportFinished();
            this.$toast.global.action_fail();
          }
        } catch (e) {
          this.numFail++;
          if (e.response && e.response.status === HTTP_CODE_422) {
            const errors = e.response.data.errors;
            if (isObject(errors)) {
              this.$refs.refFormDialog.setErrors({
                file: Object.values(errors)[0]
              });
            } else if (isArray(errors)) {
              const errorFile = flattenDeep(errors);
              this.$refs.refFormDialog.setErrors({ file: errorFile });
            }
            this.handleImportFinished();
          }
          if (this.numFail >= 3) {
            this.handleImportFinished();
            this.$toast.global.action_fail();
          }
        }
      }, 5 * 1000);
    },

    handleImportFinished() {
      this.numRecords = 0;
      this.numFail = 0;
      if (this.interval) {
        console.log("clearing interval");
        clearInterval(this.interval);
      }
      this.interval = null;
      this.isLoadingImportFile = false;
    }
  }
});

export default SyncAdsDialog;
export type SyncAdsDialogRef = InstanceType<typeof SyncAdsDialog>;
</script>

<style lang="scss">
.form-upload {
  .v-transmit__upload-area {
    min-height: unset;
    height: 144px;
  }
}
</style>
