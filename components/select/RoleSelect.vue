<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :query-params="filter"
    name="role"
    label="Nhóm người dùng"
    item-text="display_name"
    v-on="$listeners"
  ></api-select-with-validation>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { ROLE } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "RoleSelect",
  components: { ApiSelectWithValidation },
  props: {
    // rules: {
    //   type: [Object, String],
    //   default: ""
    // },
    // must be included in props
    value: {
      type: [Object, Array, String],
      default: ""
    },
    includeSystem: {
      type: Boolean,
      default: false
    },
    isSystemMode: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      resource: ROLE,
      innerValue: null,

    };
  },
  computed: {
    filter() {
      if (!this.includeSystem) {
        return {
          boolean_is_system: this.isSystemMode ? this.isSystemMode : 0
        };
      }
      return {};
    }
  },
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit("input", newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    }
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  }
});
</script>
