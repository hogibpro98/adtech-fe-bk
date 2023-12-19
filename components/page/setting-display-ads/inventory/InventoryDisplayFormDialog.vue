<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          name="name"
          type="text"
          label="Tên"
          required
          counter="100"
          rules="required|max:100"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.url"
          :loading="loading"
          rules="required|url"
          name="url"
          type="text"
          label="Địa chỉ URL"
          required
          counter="2000"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.type"
          :items="platforms"
          :loading="loading"
          name="type"
          type="text"
          label="Loại"
          required
          rules="required"
        />
      </v-flex>
      <v-flex v-if="!isAdmin" xs12 class="form-group">
        <user-select
          v-model="item.user"
          :loading="loading"
          name="user_id"
          label="Người sở hữu"
          type="publisher"
          required
          rules="required"
          return-object
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import VSelectWithValidation from "@/components/common/VSelectWithValidation.vue";
import { PLATFORM } from "@/constants/dataSelect";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { ToastInterface } from "~/interface/plugin/toast";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { InventoryInterface } from "~/interface/data/inventory";
import UserSelect from "~/components/select/UserSelect.vue";
import { ROLE_IS_ADMIN } from "~/constants/role";

const DEFAULT_ITEM = {
  created_at: null,
  deleted_at: null,
  deleted_by: null,
  id: null,
  inventory_id: null,
  item_permissions: [],
  name: "",
  type: "",
  updated_at: null,
  url: "",
  user: null,
  user_id: null
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: InventoryInterface;
  resourceInventory: string;
  resourceTag: string;
  platforms: Array<string>;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $inventoryDisplayRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: InventoryInterface): void;

  hidden(): void;

  onSubmit(): void;

  addItem(): void;

  editItem(): void;
}

const InventoryDisplayFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "InventoryDisplayFormDialog",
  components: {
    UserSelect,
    VSelectWithValidation,
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
      item: cloneDeep(DEFAULT_ITEM),
      platforms: PLATFORM
    };
  },
  computed: {
    isAdmin() {
      return !this.$authHasRole(ROLE_IS_ADMIN);
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} inventory`;
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
    mapData() {
      this.item.user_id = this.item.user?.id || null;
    },

    async addItem() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$inventoryDisplayRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("inventory");
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

        const res = await this.$inventoryDisplayRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("inventory");
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

export default InventoryDisplayFormDialog;
export type InventoryDisplayFormDialogRef = InstanceType<
  typeof InventoryDisplayFormDialog
>;
</script>
