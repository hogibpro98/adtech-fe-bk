<template>
  <expense-redirect-table />
</template>
<script lang="ts">
import ExpenseRedirectTable from "@/components/page/expense-redirect/ExpenseRedirectTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    ExpenseRedirectTable
  },
  layout: "dashboard",
  data() {
    return {};
  }
});
</script>
