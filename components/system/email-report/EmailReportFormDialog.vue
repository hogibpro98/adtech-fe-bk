<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md8 xl6"
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
          rules="required|max:100"
          name="name"
          type="text"
          label="Tên"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.content"
          rows="5"
          :loading="loading"
          :counter="500"
          rules="required|max:500"
          name="content"
          type="text"
          label="Nội dung"
          required
        />
      </v-flex>

      <v-flex xs12 class="my-2">
        <v-cron-editor-with-validation
          v-model="item.schedule"
          name="schedule"
          rules="required"
          label="Lịch gửi"
          required
        />
      </v-flex>
      <v-flex xs12>
        <!--        <user-select-->
        <!--          v-model="item.receivers"-->
        <!--          :loading="loading"-->
        <!--          :attach="false"-->
        <!--          :resource="USER_RECEIVER_EXPORT"-->
        <!--          name="receivers"-->
        <!--          label="Người nhận báo cáo"-->
        <!--          item-value="id"-->
        <!--          return-object-->
        <!--          required-->
        <!--          rules="required"-->
        <!--          multiple-->
        <!--        >-->
        <!--        </user-select>-->
        <email-combobox
          v-model="item.email_address"
          :loading="loading"
          multiple
          name="email_address"
          label="Người nhận báo cáo"
          resource="/user/receiver-export"
          item-value="email"
          item-text="email"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <file-report-select
          v-model="item.excels"
          :loading="loading"
          :attach="false"
          name="excels"
          label="Người nhận báo cáo"
          item-value="id"
          :return-object="true"
          required
          rules="required"
          multiple
        >
          <template slot="selection" slot-scope="{ item }">
            <v-chip class="mx-1" small close @click:close="remove(item)">
              {{ item.email }}
            </v-chip>
          </template>
        </file-report-select>
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { FormDialogRef } from "../../common/FormDialog.vue";
import { OSInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VCronEditorWithValidation from "~/components/common/VCronEditorWithValidation.vue";
import UserSelect from "~/components/select/UserSelect.vue";
import FileReportSelect from "~/components/select/FileReportSelect.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import ComboBoxWithValidation from "~/components/common/ComboBoxWithValidation.vue";
import EmailCombobox from "~/components/select/EmailCombobox.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: OSInterface;
  $refs: { refFormDialog: FormDialogRef };
  $osRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  editItem: Function;
  addItem: Function;
  onSubmit: Function;
}

const DEFAULT_ITEM = {
  name: "",
  schedule: "",
  content: "",
  email_address: []
};

/**
 * @property {Object} $osRepository
 */

const EmailReportFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EmailReportFormDialog",
  components: {
    EmailCombobox,
    ComboBoxWithValidation,
    VTextAreaWithValidation,
    FileReportSelect,
    UserSelect,
    VCronEditorWithValidation,
    FormDialog,
    VTextFieldWithValidation
  },
  props: {
    value: {
      type: Boolean
    }
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} báo cáo tự động`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      console.log("bakwlek");
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },

    mapData() {
      this.item.excel_ids = this.item.excels.map(e => e.id);
    },

    async addItem() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$emailReportRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("báo cáo tự động");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        console.log(e);
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    },

    async editItem() {
      this.loading = true;

      try {
        this.mapData();
        const res = await this.$emailReportRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("báo cáo tự động");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        console.log(e);
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default EmailReportFormDialog;
export type EmailReportFormDialogRef = InstanceType<
  typeof EmailReportFormDialog
>;
</script>
<style scoped>
.has-addons {
  padding: 4px;
}
</style>
