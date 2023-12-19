<template>
  <expense-s-m-s-history-table />
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ExpenseSMSHistoryTable from "~/components/page/expense-ads/ExpenseSMSHistoryTable.vue";

export default (Vue as VueConstructor).extend({
  components: {
    ExpenseSMSHistoryTable
  },
  layout: "dashboard",
  permission: false,
  data() {
    return {};
  }
});
</script>
