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
          :counter="100"
          rules="required|max:100"
          name="name"
          type="text"
          label="Tên"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.code"
          :loading="loading"
          :counter="100"
          rules="required|max:100"
          name="code"
          type="text"
          label="Mã"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.min_age"
          :loading="loading"
          :decimal="true"
          name="min_age"
          min-value="0"
          max-value="999"
          label="Tối thiểu"
          required
          rules="numeric|required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.max_age"
          :loading="loading"
          :decimal="true"
          name="max_age"
          min-value="0"
          max-value="999"
          label="Tối đa"
          required
          rules="numeric|required"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { FormDialogRef } from "../../common/FormDialog.vue";
import { ManageAgeGroupFormInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { DOCUMENT_CSV_TXT } from "~/constants/fileType";
import { ROLE_IS_ADMIN } from "~/constants/role";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ManageAgeGroupFormInterface;
  $refs: { refFormDialog: FormDialogRef };
  $manageAgeGroupRepository: RepositoryInterface;
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
  code: null,
  name: null,
  min_age: null,
  max_age: null
};

/**
 * @property {Object} $manageAgeGroupRepository
 */

const ManageAgeGroupFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ManageAgeGroupFormDialog",
  components: {
    VNumberFieldWithValidation,
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      DOCUMENT_CSV_TXT,
      item: cloneDeep(DEFAULT_ITEM),
      types: [
        {
          text: "Whitelist",
          value: "white"
        },
        {
          text: "Blacklist",
          value: "black"
        }
      ]
    };
  },
  computed: {
    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} nhóm tuổi`;
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
        const res = await this.$manageAgeGroupRepository.create({
          ...this.item,
          user_id: this.item.user?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("nhóm tuổi");
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
        const res = await this.$manageAgeGroupRepository.update({
          ...this.item,
          user_id: this.item.user?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("nhóm tuổi");
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

export default ManageAgeGroupFormDialog;
export type ManageAgeGroupFormDialogRef = InstanceType<
  typeof ManageAgeGroupFormDialog
>;
</script>
