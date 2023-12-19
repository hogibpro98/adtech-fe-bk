<template>
  <expense-m-m-s-history-table />
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ExpenseMMSHistoryTable from "@/components/page/expense-mms/ExpenseMMSHistoryTable.vue";

export default (Vue as VueConstructor).extend({
  components: {
    ExpenseMMSHistoryTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
