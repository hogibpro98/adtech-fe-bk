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
          counter="100"
          required
          rules="required|max:100"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.description"
          :loading="loading"
          name="description"
          label="Mô tả"
          rows="3"
          counter="500"
          rules="max:500"
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
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <inventory-select
          v-model="item.inventory"
          name="inventory_id"
          item-text="name"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <targeting-tag-select
          v-model="item.tags"
          :loading="loading"
          required
          rules="required"
          multiple
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog";
import InventorySelect from "@/components/select/InventorySelect";
import TargetingTagSelect from "@/components/select/TargetingTagSelect";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { ToastInterface } from "~/interface/plugin/toast";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { ChannelInterface } from "~/interface/data/channel";

const DEFAULT_ITEM = {
  id: "",
  name: "",
  description: "",
  url: "",
  inventory_id: "",
  tags: []
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ChannelInterface;
  resourceInventory: string;
  resourceTag: string;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $channelRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ChannelInterface): void;

  hide(): void;

  deleteItem(): void;
}

const ChannelFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ChannelFormDialog",
  components: {
    TargetingTagSelect,
    InventorySelect,
    FormDialog,
    VTextAreaWithValidation,
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
      resourceInventory: INVENTORY_DISPLAY,
      resourceTag: TARGETING_TAG
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    convertDataToUpdate() {
      const item = this.item;
      return {
        id: item?.id,
        name: item?.name,
        description: item?.description,
        url: item?.url,
        inventory_id: item?.inventory?.id,
        tags: (item?.tags || []).map(tag => tag.code)
      };
    },
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} sub-inventory`;
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
        const res = await this.$channelRepository.create(
          this.convertDataToUpdate()
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("kênh");
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
        const res = await this.$channelRepository.update(
          this.convertDataToUpdate()
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("kênh");
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

export default ChannelFormDialog;
export type ChannelFormDialogRef = InstanceType<typeof ChannelFormDialog>;
</script>
