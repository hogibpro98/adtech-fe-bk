<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md8 lg5 xl4"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          counter="191"
          name="name"
          type="text"
          label="Tên"
          required
          rules="required|max:191"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.desc"
          :loading="loading"
          counter="500"
          name="code"
          type="text"
          label="Mô tả"
          rules="max:500"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { TagInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { DISPLAY_TYPE_SELECT } from "~/constants/dataSelect";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: TagInterface;
  $refs: { refFormDialog: FormDialogRef };
  $catidConfigDialog: RepositoryInterface;
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
  id: null,
  name: null,
  desc: null
};

/**
 * @property {Object} actionCategoryRepository
 */

const CatidConfigDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CatidConfigDialog",
  components: {
    FormDialog,
    VTextFieldWithValidation,
    VTextAreaWithValidation
  },
  props: {
    label: {
      type: String,
      default: "Thời gian hết hạn"
    }
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      fromDateMenu: false,
      currentDate: new Date().toISOString().substr(0, 10)
    };
  },
  computed: {
    fromDateDisp() {
      return this.formatDate(this.item.expires_date);
    },
    displayTypes() {
      return DISPLAY_TYPE_SELECT;
    }
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

      this.title = `${
        this.isEdit ? "Cập nhật" : "Thêm"
      } cấu hình lĩnh vực hoạt động`;
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

    async addItem() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$catidConfigDialog.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("cấu hình lĩnh vực hoạt động");
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
        this.mapData();
        const res = await this.$catidConfigDialog.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("cấu hình lĩnh vực hoạt động");
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
    mapData() {
      if (this.item.parent) {
        this.item.parent_id = this.item.parent.id;
      }
    }
  }
});

export default CatidConfigDialog;
export type CatidConfigDialogRef = InstanceType<typeof CatidConfigDialog>;
</script>
