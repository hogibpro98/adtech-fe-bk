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
        <custom-date-picker
          v-model="item.expires_date"
          :loading="loading"
          :picker-props="{ min: currentDate }"
          name="expires_date"
          type="text"
          label="Thời gian hết hạn"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          counter="255"
          name="name"
          type="text"
          label="Tên"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.code"
          :loading="loading"
          counter="255"
          name="code"
          type="text"
          label="Mã"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.action_type"
          :loading="loading"
          name="action_type"
          label="Loại hành động"
          :items="selectCountType"
          required
          rules="required"
          :disabled="isEdit"
        />
      </v-flex>
      <v-flex sm12 class="form-group">
        <v-number-field-with-validation
          v-model="item.price"
          :loading="loading"
          :suffix="item.price ? '₫' : ''"
          name="price"
          label="Đơn giá"
          min-value="0"
          max-value="99999999999999"
          required
          rules="required|min_value:0|max:99999999999999"
          :disabled="isEdit"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import CustomDatePicker from "@/components/common/CustomDatePicker.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { TagInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import {
  CONSTRACT_ACTION_TYPE,
  DISPLAY_TYPE_SELECT
} from "~/constants/dataSelect";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: TagInterface;
  $refs: { refFormDialog: FormDialogRef };
  $constractFormDiaLog: RepositoryInterface;
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
  code: null,
  expires_date: null,
  message_type: null,
  action_type: null,
  price: null,
  status: null,
  user_id: null,
  desc: null
};

/**
 * @property {Object} actionCategoryRepository
 */

const ConstractFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ConstractFormDialog",
  components: {
    VSelectWithValidation,
    CustomDatePicker,
    FormDialog,
    VTextFieldWithValidation,
    VNumberFieldWithValidation
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
      selectCountType: cloneDeep(CONSTRACT_ACTION_TYPE),
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} gói mua khoán`;
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
        const res = await this.$constractFormDiaLog.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("gói mua khoán");
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
        const res = await this.$constractFormDiaLog.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("gói mua khoán");
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
    },
    formatDate(date) {
      if (date === null || date === undefined) {
        date = new Date();
      } else {
        date = new Date(date);
      }
      const formattedDate = new Date(date);
      const day = formattedDate
        .getDate()
        .toString()
        .padStart(2, "0");
      const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = formattedDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
});

export default ConstractFormDialog;
export type ConstractFormDialogRef = InstanceType<typeof ConstractFormDialog>;
</script>
