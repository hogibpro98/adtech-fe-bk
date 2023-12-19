import { isEqual } from "lodash";
import {hasValue, isEqualDeep} from "~/helpers/ultis";

export default {
  props: {
    value: {}
  },
  data: () => ({
    innerValue: null
  }),
  watch: {
    // Handles internal model changes.
    innerValue(newVal, oldVal) {
      if (!isEqualDeep(newVal, oldVal)) {
        this.$emit("input", newVal);
      }
    },
    // Handles external model changes.
    value(newVal, oldVal) {
      if (!isEqualDeep(newVal, oldVal)) {
        this.innerValue = newVal;
      }
    }
  },
  created() {
    this.innerValue = hasValue(this.value) ? this.value : null;
  }
};
