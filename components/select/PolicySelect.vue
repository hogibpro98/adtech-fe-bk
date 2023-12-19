<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    item-text="name"
    item-value="code"
    v-on="$listeners"
  >
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";

const PolicySelect = (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "PolicySelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Chính sách vi phạm"
    }
  },
  data() {
    return {
      resource: "publisher/policy",
      innerValue: null
    };
  }
});

export default PolicySelect;
export type PolicySelectRef = InstanceType<typeof PolicySelect>;
</script>
