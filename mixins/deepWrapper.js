import { hasValue, isEqualDeep } from "~/helpers/ultis";

export default {
  props: {
    value: {}
  },
  data: () => ({
    innerValue: {}
  }),
  watch: {
    // Handles internal model changes.
    innerValue: {
      handler(val, oldVal) {
        // if (!isEqualDeep(val, oldVal)) {
        this.$emit("input", val);
        // }
      },
      deep: true
    },
    // Handles external model changes.
    value: {
      handler(val, oldVal) {
        // if (!isEqualDeep(val, oldVal)) {
        // console.log("value", val, oldVal);
        this.innerValue = val;
        // }
      },
      deep: true
    }
  },
  created() {
    this.innerValue = hasValue(this.value) ? this.value : null;
  }
};
