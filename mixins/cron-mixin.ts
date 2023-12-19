import Vue from "vue";
import KEYCODE_VALUE from "~/constants/key-code-value";
interface computedInterface {
  innerValue: any;
}

interface propsInterface {
  value: any;
}
interface ComponentMethods {
  isNumber(event: any): boolean | undefined;
}

interface ComponentData {}

const CronMixin = Vue.extend<
  ComponentData,
  ComponentMethods,
  computedInterface,
  propsInterface
>({
  props: {
    value: [String]
  },
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      }
    }
  },
  watch: {
    innerValue: {
      handler(newVal) {
        this.$emit("input", newVal);
      },
      deep: true
    }
  },
  methods: {
    isNumber(evt) {
      // evt = (evt) ? evt : window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > KEYCODE_VALUE.NUMBER_THIRTYONE &&
        (charCode < KEYCODE_VALUE.NUMBER_ZERO ||
          charCode > KEYCODE_VALUE.NUMBER_NINE) &&
        charCode !== KEYCODE_VALUE.DELETE
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    }
  }
});

export default CronMixin;
