<template>
  <expense-redirect-history-table />
</template>
<script lang="ts">
import ExpenseRedirectHistoryTable from "@/components/page/expense-redirect/ExpenseRedirectHistoryTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    ExpenseRedirectHistoryTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
