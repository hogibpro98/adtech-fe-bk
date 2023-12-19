<template>
  <expense-sms-vendor-history-table />
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ExpenseSmsVendorHistoryTable from "~/components/page/expense-ads/sms-vendor/ExpenseSmsVendorHistoryTable.vue";

export default (Vue as VueConstructor).extend({
  components: {
    ExpenseSmsVendorHistoryTable
  },
  layout: "dashboard",
  permission: false,
  data() {
    return {};
  }
});
</script>
