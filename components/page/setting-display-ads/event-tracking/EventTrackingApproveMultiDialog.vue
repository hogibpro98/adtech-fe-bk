<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Phê duyệt yêu cầu tạo tracking?"
    label-button-confirm="Xác nhận"
    @confirm="approve"
  >
    <template slot="content">
      <div>
        Bạn có chắc chắn muốn phê duyệt
        <span class="red--text">{{ items.length }}</span> yêu cầu tạo tracking
        không?
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
      </div>
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
import { ToastInterface } from "~/interface/plugin/toast";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { CODE_SUCCESS } from "~/constants/code";
import massActionDialog from "~/mixins/massActionDialog";

interface ComponentData {
  loading: boolean;
  ids: Array<number>;
  items: Array<number>;
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

const EventTrackingApproveMultiDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "EventTrackingApproveMultiDialog",
  components: { ConfirmDialog, VNumberFieldWithValidation },
  mixins: [massActionDialog],
  data() {
    return {
      loading: false,
      items: [],
      brandnameMaintainFee: null
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
        const res = await this.$eventTrackingFormDiaLog.massApprove({
          ids: this.ids,
          maintain_fee: this.brandnameMaintainFee
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("phê duyệt yêu cầu tạo tracking");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default EventTrackingApproveMultiDialog;
export type EventTrackingApproveMultiDialogRef = InstanceType<
  typeof EventTrackingApproveMultiDialog
>;
</script>
