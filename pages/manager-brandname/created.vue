<template>
  <brandname-request-table
    :resource="resource"
    :toolbar="{
      isCreate: true,
      isToggleChart: false,
      isFullScreen: false,
      isImport: false
    }"
    selectable
    is-create-request
    page-name="manager-brandname-created"
  />
</template>
<script lang="ts">
import BrandnameTable from "@/components/page/manage-brandname/BrandnameTable.vue";
import { BRANDNAME_REQUEST } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import BrandnameRequestTable from "~/components/page/manage-brandname/BrandnameRequestTable.vue";

interface ComponentData extends GlobalDataInterface {
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    BrandnameRequestTable,
    BrandnameTable
  },
  layout: "dashboard",
  data: () => ({
    resource: BRANDNAME_REQUEST
  })
});
</script>
