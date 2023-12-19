<template>
  <user-balance-table />
</template>
<script lang="ts">
import UserBalanceTable from "@/components/page/expense-ads/UserBalanceTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    UserBalanceTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
