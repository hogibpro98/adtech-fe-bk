<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    :title="`Từ chối phê duyệt ${objectName}?`"
    label-button-confirm="Xác nhận"
    @confirm="reject"
  >
    <template slot="content">
      Bạn có chắc chắn muốn từ chối phê duyệt
      <span class="red--text"> {{ items.length }}</span> {{ objectName }} không?
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
      <v-text-area-with-validation
        v-model="reason"
        :loading="loading"
        :counter="500"
        name="reason"
        label="Lý do từ chối"
        rows="3"
        required
        rules="required|max:500"
      />
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS } from "~/constants/code";
import massActionDialog from "~/mixins/massActionDialog";

interface ComponentData {
  loading: boolean;
  items: Array<object>;
  $campaignRepository: RepositoryInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $toast: ToastInterface;
}

interface ComponentMethod {
  show(item: String[]): void;
  hide(): void;
  reject(): void;
}

const RejectMultiDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "RejectMultiDialog",
  components: { VTextAreaWithValidation, ConfirmDialog },
  mixins: [massActionDialog],
  props: {
    objectName: {
      type: String,
      required: true
    },
    itemText: {
      type: String,
      default: "name"
    },
    resource: {
      type: String,
      required: true
    },
    hasReason: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      items: [],
      reason: ""
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

    async reject() {
      this.loading = true;

      try {
        const { data } = await this.$axios.post(
          `${this.resource}/mass-reject`,
          {
            ids: this.ids,
            reason: this.reason
          }
        );
        this.loading = false;
        if (data.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success(`từ chối ${this.objectName}`);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default RejectMultiDialog;
export type RejectMultiDialogDialogRef = InstanceType<typeof RejectMultiDialog>;
</script>
