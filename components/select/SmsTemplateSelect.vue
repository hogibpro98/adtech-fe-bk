<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    attach
    :resource="resource"
    name="sms_template"
    :label="label"
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
import { BRAND_NAME, TEMPLATE_MMS, TEMPLATE_SMS } from "~/constants/resource";

const SmsTemplateSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "SmsTemplateSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Template SMS"
    }
  },
  data() {
    return {
      resource: TEMPLATE_SMS,
      innerValue: null
    };
  }
});

export default SmsTemplateSelect;
export type SmsTemplateSelectRef = InstanceType<typeof SmsTemplateSelect>;
</script>
