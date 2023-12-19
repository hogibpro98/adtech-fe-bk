<template>
  <mms-balance-table></mms-balance-table>
</template>
<script lang="ts">
import MmsBalanceTable from "@/components/page/expense-ads/MmsBalanceTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    MmsBalanceTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
