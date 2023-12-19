<template>
  <api-select-with-validation
    v-model="innerValue"
    name="targeting_os"
    item-text="name"
    item-value="id"
    v-bind="$attrs"
    :resource="resource"
    v-on="$listeners"
  >
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { OS } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "TargetingOSSelect",
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
      resource: OS,
      innerValue: null
    };
  }
});
</script>
