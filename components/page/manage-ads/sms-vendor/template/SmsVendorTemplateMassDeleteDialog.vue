<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa template SMS ngoại mạng?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa
      <span class="red--text">{{ items.length }}</span> template SMS ngoại mạng
      không?
      <div>Danh sách template SMS noại mạng sẽ bị xóa:</div>
      <ul>
        <li
          v-for="(value, index) in sortedItems.slice(0, 5)"
          :key="index"
          class="error--text"
        >
          {{ value.name }}
        </li>
      </ul>
      <span v-if="items.length > 5" class="red--text">...</span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import massActionDialog from "~/mixins/massActionDialog";

interface ComponentData {
  loading: boolean;
  items: Array<number>;
  $templateSmsRepository: RepositoryInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $toast: ToastInterface;
}

interface ComponentMethod {
  show(item: CampaignInterface): void;

  hide(): void;

  deleteItem(): void;
}

const SmsVendorTemplateMassDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "SmsVendorTemplateMassDeleteDialog",
  components: { ConfirmDialog },
  mixins: [massActionDialog],
  props: {
    itemText: {
      type: String,
      default: "name"
    }
  },
  data() {
    return {
      loading: false,
      items: []
    };
  },
  computed: {
    ids() {
      return this.items.map(e => e.id);
    }
  },
  methods: {
    show(items) {
      this.items = cloneDeep(items);
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },

    async deleteItem() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(
          "template-sms-vendor/mass-delete",
          {
            ids: this.ids
          }
        );
        this.loading = false;
        if (data.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("template tin nhắn ngoại mạng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default SmsVendorTemplateMassDeleteDialog;
export type SmsVendorTemplateMassDeleteDialogRef = InstanceType<
  typeof SmsVendorTemplateMassDeleteDialog
>;
</script>
