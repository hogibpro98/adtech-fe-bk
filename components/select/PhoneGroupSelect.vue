<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    name="phone_group"
    label="Nhóm thuê bao"
    :query-params="params"
    item-text="name"
    required
    rules="required"
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
import { BRAND_NAME, PHONE_GROUP, TEMPLATE_MMS } from "~/constants/resource";
import deepWrapper from "~/mixins/deepWrapper";

const PhoneGroupSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "PhoneGroupSelect",
  components: { ApiSelectWithValidation },
  mixins: [deepWrapper],
  props: {
    blacklist: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      resource: PHONE_GROUP,
      innerValue: null
    };
  },
  computed: {
    params() {
      return {
        select_type: this.blacklist ? "black" : "white"
      };
    }
  }
});

export default PhoneGroupSelect;
export type PhoneGroupSelectRef = InstanceType<typeof PhoneGroupSelect>;
</script>
