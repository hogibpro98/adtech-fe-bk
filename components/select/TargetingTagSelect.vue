<template>
  <api-combo-box-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :query-params="{
      sortBy: ['name'],
      sortDesc: [false]
    }"
    :name="name"
    :label="label"
    item-text="name"
    v-on="$listeners"
  >
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
  </api-combo-box-with-validation>
</template>
<script lang="ts">
import lodash from "lodash";
import ApiComboBoxWithValidation from "@/components/common/ApiComboBoxWithValidation.vue";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { TARGETING_TAG } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "TargetingTagSelect",
  components: { ApiComboBoxWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array],
      default: null
    },
    label: {
      type: String,
      default: "Tag"
    },
    name: {
      type: String,
      default: "tag"
    }
  },
  data() {
    return {
      resource: TARGETING_TAG,
      innerValue: null
    };
  },
  methods: {
    removeTag(index) {
      this.innerValue = lodash.remove(this.innerValue, (_, n) => n !== index);
    }
  }
});
</script>
