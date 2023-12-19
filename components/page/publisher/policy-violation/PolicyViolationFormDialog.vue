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
        <inventory-select
          v-model="item.inventory"
          :disabled="fromInventoryPage"
          required
          rules="required"
        ></inventory-select>
      </v-flex>
      <v-flex xs12 class="form-group">
        <policy-select
          v-model="item.policy_code"
          :return-object="false"
          required
          rules="required"
        ></policy-select>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.reason"
          :loading="loading"
          name="reason"
          required
          rules="required|max:500"
          label="Mô tả lý do"
          :counter="500"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { ToastInterface } from "~/interface/plugin/toast";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import InventorySelect from "~/components/select/InventorySelect.vue";
import PolicySelect from "~/components/select/PolicySelect.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  $refs: { refFormDialog: FormDialogRef };
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
  code: "",
  id: null,
  policy_code: "",
  reason: "",
  inventory: null
};

/**
 * @property {Object} $policyRepository
 */

const PolicyViolationFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PolicyViolationFormDialog",
  components: {
    PolicySelect,
    InventorySelect,
    FormDialog,
    VTextAreaWithValidation,
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      fromInventoryPage: false,
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
        this.fromInventoryPage = true;
        this.item.inventory = cloneDeep(item);
      } else {
        this.fromInventoryPage = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `Thêm vi phạm chính sách`;
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
        const res = await this.$axios.$post(
          "publisher/policy-violation/store",
          this.item
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("vi phạm chính sách");
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
        const res = await this.$axios.$post(
          "publisher/policy/update",
          this.item
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("chính sách");
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
      this.item.inventory_id = this.item.inventory?.id;
    }
  }
});

export default PolicyViolationFormDialog;
export type PolicyViolationFormDialogRef = InstanceType<
  typeof PolicyViolationFormDialog
>;
</script>
