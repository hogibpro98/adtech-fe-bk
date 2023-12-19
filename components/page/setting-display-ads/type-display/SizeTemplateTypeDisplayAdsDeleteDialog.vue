<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xóa?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="$emit('delete-size-template', item, hide)"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { ToastInterface } from "~/interface/plugin/toast";

import { RepositoryInterface } from "~/interface/plugin/repository";
import { ImageTemplateInterface } from "~/interface/data/displayAdsType";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ComponentData {
  loading: boolean;
  item: ImageTemplateInterface;
  $toast: ToastInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $inventoryDisplayRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ImageTemplateInterface): void;

  hide(): void;
}

const SizeTemplateTypeDisplayAdsDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SizeTemplateTypeDisplayAdsDeleteDialog",
  components: { ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    }
  }
});

export default SizeTemplateTypeDisplayAdsDeleteDialog;
export type SizeTemplateTypeDisplayAdsDeleteDialogRef = InstanceType<
  typeof SizeTemplateTypeDisplayAdsDeleteDialog
>;
</script>
