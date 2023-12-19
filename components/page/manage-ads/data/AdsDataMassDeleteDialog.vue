<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Xóa tài trợ data"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa
      <span class="red--text">{{ items.length }}</span> tài trợ data không?
      <div>Danh sách tài trợ data sẽ bị xóa:</div>
      <ul>
        <li
          v-for="(value, index) in sortedItems.slice(0, 5)"
          :key="index"
          class="error--text"
        >
          {{ value[itemText] }}
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
  items: Array<CampaignInterface>;
  $adsRepository: RepositoryInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $toast: ToastInterface;
}

interface ComponentMethod {
  show(items: CampaignInterface): void;
  hide(): void;
  deleteItem(): void;
}

const AdsDataMassDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "AdsDataMassDeleteDialog",
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
      loading: false
      // items: []
    };
  },
  computed: {
    displayWarning() {
      if (this.items.length > 0) {
        const firstName = this.items[0][this.itemText];
        if (this.items.length > 1) {
          return `${firstName} và ${this.items.length - 1} tài trợ data khác`;
        }
        return firstName;
      }
      return "";
    },
    ids(): Array<string | number> {
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
        const res = await this.$adsRepository.massDelete({
          ids: this.ids
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("tài trợ data");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default AdsDataMassDeleteDialog;
export type AdsDataMassDeleteDialogRef = InstanceType<
  typeof AdsDataMassDeleteDialog
>;
</script>
