<template>
  <brandname-table/>
</template>
<script lang="ts">
import BrandnameTable from "@/components/page/manage-brandname/BrandnameTable.vue";
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  components: {
    BrandnameTable
  },
  layout: "dashboard"
});
</script>
