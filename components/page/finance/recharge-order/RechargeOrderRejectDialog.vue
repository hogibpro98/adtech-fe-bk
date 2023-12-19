<template>
  <confirm-dialog
    ref="rejectDialog"
    :loading="loading"
    title="Từ chối yêu cầu"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn từ chối yêu cầu đơn hàng nạp tiền
      <span class="error--text">{{ item.transid }}</span
      >?<br />
      Vui lòng nêu rõ lý do từ chối:
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.reason"
          :loading="loading"
          name="reason"
          required
          label="Lý do"
          counter
          rules="required|max:255"
        />
      </v-flex>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import RejectDialog, {
  RejectDialogRef
} from "~/components/common/RejectDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
interface ComponentRefs {
  $ref: {
    rejectDialog: RejectDialogRef;
  };
}
interface ComponentData {
  loading: boolean;
  item: any;
}
interface ComponentMethods {}
interface ComponentComputed {}
interface ComponentProps {}

const DEFAULT_ITEM = {
  transid: "",
  user: null,
  company_name: "",
  customer_name: "",
  tin: "",
  phone_number: "",
  address: "",
  payment_method: null,
  amount: 0,
  vat: null,
  discount: 0,
  documents: null,
  reason: "",
  note: ""
};

const RechargeOrderRejectDialog = (Vue as VueConstructor<
  Vue & ComponentRefs
>).extend<ComponentData, ComponentMethods, ComponentComputed, ComponentProps>({
  components: {
    VTextAreaWithValidation,
    ConfirmDialog,
    RejectDialog
  },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    async confirmItem() {
      try {
        this.loading = true;
        const res = await this.$axios.$post("/order/reject", this.item);
        console.log(res);
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("từ chối phê duyệt đơn hàng");
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.hide();
      }
    },
    show(item) {
      this.item = item;
      this.$refs.rejectDialog.show();
    },
    hide() {
      this.$refs.rejectDialog.hide();
    }
  }
});
export default RechargeOrderRejectDialog;
</script>

<style scoped></style>
