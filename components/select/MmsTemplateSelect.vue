<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    attach
    :resource="resource"
    name="mms_template"
    label="Template MMS"
    item-text="name"
    item-disabled="aaa"
    clearable
    return-object
    v-on="$listeners"
  />
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { BRAND_NAME, TEMPLATE_MMS } from "~/constants/resource";

const MmsTemplateSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "MmsTemplateSelect",
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
      resource: TEMPLATE_MMS,
      innerValue: null
    };
  }
});

export default MmsTemplateSelect;
export type MmsTemplateSelectRef = InstanceType<typeof MmsTemplateSelect>;
</script>
