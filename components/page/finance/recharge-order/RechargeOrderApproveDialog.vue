<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn phê duyệt?"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc muốn phê duyệt yêu cầu nạp tiền
      <span class="red--text">{{ item.transid }}</span> không ?
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.reason"
          :loading="loading"
          name="reason"
          required
          label="Lý do"
          rules="required|max:255"
          counter="255"
        />
      </v-flex>
    </template>
  </confirm-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS } from "~/constants/code";

interface ComponentRefs {}

interface ComponentData {}

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

const RechargeOrderApproveDialog = (Vue as VueConstructor<
  Vue & ComponentRefs
>).extend<ComponentData, ComponentMethods, ComponentComputed, ComponentProps>({
  components: {
    VTextAreaWithValidation,
    ConfirmDialog
  },
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
      this.item = cloneDeep(DEFAULT_ITEM);
      this.$refs.refConfirmDialog.hide();
    },
    async confirmItem() {
      try {
        this.loading = true;
        const res = await this.$axios.$post("/order/approve", this.item);
        console.log(res);
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("phê duyệt đơn hàng");
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.hide();
      }
    }
  }
});
export default RechargeOrderApproveDialog;
export type RechargeOrderApproveDialogRef = InstanceType<
  typeof RechargeOrderApproveDialog
>;
</script>

<style scoped></style>
