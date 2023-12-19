<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Phê duyệt tài khoản"
    label-button-confirm="Xác nhận"
    @confirm="approve"
  >
    <template slot="content">
      Bạn có chắc chắn muốn phê duyệt
      <span class="red--text"> {{ items.length }}</span> tài khoản không?
      <ul>
        <li
          v-for="(value, index) in sortedItems.slice(0, 5)"
          :key="index"
          class="error--text"
        >
          {{ value.username }}
        </li>
      </ul>
      <span v-if="items.length > 5" class="red--text">...</span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import {cloneDeep} from "lodash";
import massActionDialog from "~/mixins/massActionDialog";

interface ComponentData {
  loading: boolean;
  items: Array<number>;
  $templateMmsRepository: RepositoryInterface;
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

const UserApproveMultiDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
  >).extend({
  name: "UserApproveMultiDialog",
  mixins: [massActionDialog],
  components: { ConfirmDialog },
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
        const res = await this.$userRepository.massApprove({
          ids: this.ids
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("duyệt tài khoản");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default UserApproveMultiDialog;
export type UserApproveMultiDialogRef = InstanceType<
  typeof UserApproveMultiDialog
  >;
</script>
