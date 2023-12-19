<template>
  <survey-table />
</template>

<script lang="ts">
import SurveyTable from "@/components/survey/SurveyTable";
import Vue, { VueConstructor } from "vue";
import { TableDataInterface } from "~/components/common/ShowChartAndTable.vue";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  table: TableDataInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  components: {
    SurveyTable
  },
  layout: "dashboard",
  permission: false
});
</script>
