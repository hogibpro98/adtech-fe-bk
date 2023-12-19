<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    name="targeting_os"
    item-text="name"
    v-on="$listeners"
  >
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { GROUP_AGE } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "TargetingAgeSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    }
  },
  data() {
    return {
      resource: GROUP_AGE,
      innerValue: null
    };
  }
});
</script>
