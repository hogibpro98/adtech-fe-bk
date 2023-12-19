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
          name="name"
          type="text"
          label="Đối tượng"
          required
          counter="100"
          rules="required|max:100"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.url"
          :loading="loading"
          name="url"
          type="text"
          label="URL"
          required
          rules="required|url|max:2000"
          counter="2000"
          hint="Xóa tất cả URL có tiền tố này, các biến thể URL (http/https, có www và không có www) đều sẽ chịu ảnh hưởng"
          persistent-hint
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
        <channel-select
          v-model="item.channel"
          :inventory-id="item.inventory && item.inventory.id"
          name="channel_id"
          item-text="name"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import InventorySelect from "~/components/select/InventorySelect.vue";
import ChannelSelect from "~/components/select/ChannelSelect.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: object;
  $refs: { refFormDialog: FormDialogRef };
  $blockUrlRepository: RepositoryInterface;
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
  url: ""
};

/**
 * @property {Object} $blockUrlRepository
 */

const BlockUrlFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "BlockUrlFormDialog",
  components: {
    ChannelSelect,
    InventorySelect,
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

      this.title = `${
        this.isEdit ? "Cập nhật" : "Thêm"
      } chặn URL nhà quảng cáo`;
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
        const res = await this.$blockUrlRepository.create(
          this.convertDataToUpdate(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("chặn URL nhà quảng cáo");
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
        const res = await this.$blockUrlRepository.update(
          this.convertDataToUpdate(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("chặn URL nhà quảng cáo");
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
    convertDataToUpdate(item) {
      return {
        id: item?.id,
        name: item?.name,
        url: item?.url,
        inventory_id: item?.inventory?.id,
        channel_id: item?.channel?.id
      };
    }
  }
});

export default BlockUrlFormDialog;
export type BlockUrlFormDialogRef = InstanceType<typeof BlockUrlFormDialog>;
</script>
