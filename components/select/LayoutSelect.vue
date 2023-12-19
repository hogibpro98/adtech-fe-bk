<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    item-text="name"
    return-object
    v-on="$listeners"
  >
  </api-select-with-validation>
</template>
<script lang="ts">
import { BUSINESS_ACTIVITY, MANAGE_LAYOUT } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";
import LayoutSelect from "~/components/select/LayoutSelect.vue";

const LayoutSelect = (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "LayoutSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Layout"
    }
  },
  data() {
    return {
      resource: MANAGE_LAYOUT,
      innerValue: null
    };
  }
});

export default LayoutSelect;
export type LayoutSelectRef = InstanceType<typeof LayoutSelect>;
</script>
