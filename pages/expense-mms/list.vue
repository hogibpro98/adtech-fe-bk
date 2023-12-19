<template>
  <e-wallet-table />
</template>
<script lang="ts">
import EWalletTable from "@/components/page/expense-mms/EWalletTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    EWalletTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
