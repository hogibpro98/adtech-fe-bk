<template>
  <order-recharge-table />
</template>
<script lang="ts">
import OrderRechargeTable from "@/components/page/expense-mms/OrderRechargeTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    OrderRechargeTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
