<template>
  <fullscreen-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @submit="onSubmit"
    v-on="$listeners"
  >
    <validation-observer ref="form" v-slot="{ handleSubmit }">
      <v-row wrap>
        <v-flex xs12 class="form-group">
          <v-text-field-with-validation
            v-model="item.file_name"
            :loading="loading"
            :counter="100"
            name="file_name"
            type="text"
            label="Tên file"
            rules="required|max:100"
            required
          />
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-select-with-validation
            v-model="item.model"
            name="model"
            label="Đối tượng báo cáo"
            item-text="title"
            item-value="model"
            :items="selectableReports"
            rules="required"
            required
            @change="handleChangeTargetReport"
          />
        </v-flex>

        <v-flex xs12 md6 class="form-group pr-md-2">
          <v-select-with-validation
            v-model="item.frequency"
            name="frequency"
            label="Khoảng thời gian dữ liệu"
            :items="selectableFrequencies"
            rules="required"
            hint="Báo cáo theo tháng/tuần/ngày"
            persistent-hint
            required
          />
        </v-flex>
        <v-flex xs12 md6 class="form-group pl-md-2">
          <v-number-field-with-validation
            v-model="item.offset"
            name="offset"
            label="Thời gian chênh lệch"
            rules="required|max_value:100"
            :min-value="0"
            :max-value="100"
            :hint="offsetHint"
            persistent-hint
            required
          />
        </v-flex>
        <v-flex v-show="item.model" id="file-report-filter" xs12>
          <v-container grid-list-xl fluid class="no-padding no-margin">
            <new-custom-filter
              v-model="item.filter"
              attach="#file-report-filter"
              :filters="selectedFilters"
              class="mt-4"
            ></new-custom-filter>
          </v-container>
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-checkbox-with-validation
            ref="checkBoxes"
            v-model="item.fields"
            has-check-all
            name="fields"
            label="Các cột hiển thị"
            required
            multiple
            item-text="text"
            :item-value="null"
            layout-class="layout flex wrap"
            checkbox-class="flex-unset flex xs12 lg6 xl4 checkbox-responsive"
            :items="selectableHeaders"
            rules="required"
          />
        </v-flex>
      </v-row>
    </validation-observer>
  </fullscreen-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import { FormDialogRef } from "../../common/FormDialog.vue";
import { OSInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VCronEditorWithValidation from "~/components/common/VCronEditorWithValidation.vue";
import UserSelect from "~/components/select/UserSelect.vue";
import report from "~/api/report";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import VCheckboxWithValidation from "~/components/common/VCheckboxWithValidation.vue";
import FullscreenDialog from "~/components/common/FullscreenDialog.vue";
import { FREQUENCY_SELECT } from "~/constants/dataSelect";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { ROLE_AGENCY, ROLE_ADVERTISER } from "~/constants/role";

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
  file_name: "",
  model: "",
  fields: [],
  filter: {},
  frequency: "month",
  offset: 0
};

/**
 * @property {Object} $osRepository
 */

const FileReportFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FileReportFormDialog",
  components: {
    VNumberFieldWithValidation,
    FullscreenDialog,
    VCheckboxWithValidation,
    VSelectWithValidation,
    FormDialog,
    VTextFieldWithValidation,
    NewCustomFilter
  },
  data() {
    return {
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      selectableReports: cloneDeep(report),
      item: cloneDeep(DEFAULT_ITEM),
      selectableFrequencies: cloneDeep(FREQUENCY_SELECT),
      filterResources: []
    };
  },
  computed: {
    selectableHeaders() {
      return cloneDeep(
        this.selectableReports.find(e => e.model === this.item.model)
          ?.headers || []
      );
    },
    selectedFilters() {
      return cloneDeep(
        this.selectableReports.find(e => e.model === this.item.model)
          ?.filters || []
      );
    },
    title() {
      return (this.isEdit ? "Cập nhật" : "Thêm") + " file báo cáo";
    },
    offsetHint() {
      const offset = this.item.offset ? this.item.offset : 0;
      if (this.item.frequency === "day") {
        return `Ngày N sẽ gửi báo cáo ngày N - ${offset}`;
      }
      if (this.item.frequency === "week") {
        return `Tuần N sẽ gửi báo cáo tuần N - ${offset}`;
      }
      if (this.item.frequency === "month") {
        return `Tháng N sẽ gửi báo cáo tháng N - ${offset}`;
      }
      return "";
    }
  },
  // beforeDestroy() {
  //   clearTimeout(this.timeout);
  // },
  methods: {
    async show(item = null) {
      clearTimeout(this.timeout);
      this.$refs.refFormDialog.show();
      this.loading = false;
      if (item) {
        this.isEdit = true;
        this.item.model = cloneDeep(item.model);
        await this.$nextTick();
        await this.$nextTick();
        this.item = cloneDeep(item);
        this.$set(this.item, "filter", {});
        await this.$nextTick();
        await this.$nextTick();
        this.$set(this.item, "filter", item.filter);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.isEdit = false;
      this.item = cloneDeep(DEFAULT_ITEM);
      clearTimeout(this.timeout);
    },
    async onSubmit() {
      const success = await this.$refs.form.validate();
      if (!success) {
        return;
      }
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$fileReportRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$emit("create-success");
          this.$toast.global.add_success("báo cáo");
          this.hidden();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },

    async editItem() {
      this.loading = true;
      await this.$nextTick();
      try {
        const res = await this.$fileReportRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$emit("update-success");
          this.$toast.global.edit_success("báo cáo");
          this.hidden();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },
    handleChangeTargetReport() {
      this.$refs.checkBoxes.itemsChange();
      this.item.filter = {};
    }
  }
});

export default FileReportFormDialog;
export type FileReportFormDialogRef = InstanceType<typeof FileReportFormDialog>;
</script>
<style>
.has-addons {
  padding: 4px;
}
</style>
