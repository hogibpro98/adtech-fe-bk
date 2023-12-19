<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn phê duyệt quảng cáo?"
    label-button-confirm="Xác nhận"
    @confirm="approve"
  >
    <template slot="content">
      Bạn có chắc chắn muốn phê duyệt
      <span class="red--text"> {{ items.length }} </span> quảng cáo không?
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
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import massActionDialog from "~/mixins/massActionDialog";

interface ComponentData {
  loading: boolean;
  items: Array<number>;
  $campaignRepository: RepositoryInterface;
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

const BannerApproveMultiDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerApproveMultiDialog",
  components: { ConfirmDialog },
  mixins: [massActionDialog],
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

    async approve() {
      this.loading = true;

      try {
        const res = await this.$bannerRepository.massApprove({
          ids: this.ids
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("duyệt quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default BannerApproveMultiDialog;
export type CampaignDeleteDialogRef = InstanceType<
  typeof BannerApproveMultiDialog
>;
</script>
