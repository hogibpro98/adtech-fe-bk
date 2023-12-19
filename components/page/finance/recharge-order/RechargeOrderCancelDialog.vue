<template>
  <confirm-dialog
    ref="rejectDialog"
    :loading="loading"
    title="Hủy đơn hàng"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn hủy đơn hàng nạp tiền
      <span class="error--text">{{ item.transid }}</span
      >?<br />

    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
interface ComponentRefs {
  $ref: {
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
  note: "",
  id: null,
};

const RechargeOrderCancelDialog = (Vue as VueConstructor<
  Vue & ComponentRefs
>).extend<ComponentData, ComponentMethods, ComponentComputed, ComponentProps>({
  components: {
    ConfirmDialog,
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
        const res = await this.$axios.$post("/order/delete", this.item);
        console.log(res);
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("hủy đơn hàng");
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
export default RechargeOrderCancelDialog;
</script>

<style scoped></style>
