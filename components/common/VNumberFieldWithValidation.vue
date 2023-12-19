<template>
  <validation-provider
    v-slot="{ errors, valid, validate }"
    :name="$attrs['label-validation'] || $attrs.label || $attrs.name"
    :rules="rules"
    :vid="vid || $attrs.name"
    :immediat="immediate"
  >
    <v-text-field v-show="false" v-model="value" disabled />
    <v-text-field
      :value="formattedValue"
      :error-messages="errors"
      :disabled="disabled"
      v-bind="$attrs"
      maxlength="18"
      @input="parseInput"
      @blur="handleBlur(validate)"
    >
      <!-- Slot section. Inherit slot override custom slot -->
      <!-- Custom slot -->
      <template v-if="required && $attrs.label" #label>
        {{ $attrs.label }} <span class="red--text"> (*) </span>
      </template>

      <!-- Pass on all slots & slot scope-->
      <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      <template
        v-for="(_, name) in $scopedSlots"
        :slot="name"
        slot-scope="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>
    </v-text-field>
  </validation-provider>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import numeral from "numeral";
import { DECIMAL_TYPING } from "@/constants/regex";
import { DECIMAL } from "@/constants/format";

interface ComponentData {
  innerValue: number | string;
  formattedValue: string;
}

interface ComponentMethods {
  parseInput(input: number | string): void;

  pushDecimalToProps(input: number | string): void;

  handleBlur(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "VNumberFieldWithValidation",
  props: {
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    value: {
      type: [Number, String],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    decimal: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    minValueFixed: {
      type: Boolean,
      default: false
    },
    minValue: {
      type: [String, Number],
      default: 0
    },
    maxValue: {
      type: [Number, String],
      default: undefined
    },
    immediate: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    innerValue: null,
    formattedValue: null
  }),
  computed: {},
  watch: {
    // Handles external model changes.
    value(newVal) {
      // if (this.maxValue || this.maxValue === 0) {
      //   if (newVal > this.maxValue) {
      //     this.innerValue = this.maxValue;
      //   } else {
      //     this.innerValue = newVal;
      //   }
      // } else {
      this.innerValue = newVal;
      // }
    },

    async innerValue(val, oldVal) {
      if (val || val === 0) {
        this.formattedValue = val;
        await this.$nextTick();
        this.pushDecimalToProps(val, oldVal);
      } else {
        this.formattedValue = val;
        this.$emit("input", val);
      }
    }
  },
  created() {
    this.innerValue = this.value;
  },
  methods: {
    parseInput(input) {
      if (input || input === 0) {
        this.innerValue = input;
      } else {
        this.innerValue = null;
      }
    },
    pushDecimalToProps(val, oldVal) {
      if (typeof val === "string") {
        const numDot = (val.match(/\./g) || []).length;
        if (numDot > 1 || (numDot === 1 && !this.decimal)) {
          if (oldVal !== null) {
            this.formattedValue = numeral(oldVal).format(DECIMAL);
            this.innerValue = this.formattedValue;
          } else {
            this.formattedValue = null;
            this.innerValue = null;
          }
          return;
        }
      }
      if (!DECIMAL_TYPING.test(val)) {
        if (typeof val === "string") {
          this.formattedValue = numeral(val).format(DECIMAL);
          if (this.formattedValue === "0") {
            this.innerValue = null;
            this.$emit("input", null);
          } else {
            this.innerValue = this.formattedValue;
            this.$emit("input", numeral._.stringToNumber(this.formattedValue));
          }
        } else if (typeof val === "number") {
          this.formattedValue = numeral(val).format(DECIMAL);
        }
      } else if (
        typeof val === "number" ||
        (!val.includes(".") && !val.includes(","))
      ) {
        this.formattedValue = numeral(val).format(DECIMAL);
        this.$emit("input", numeral._.stringToNumber(this.formattedValue));
      }
    },
    handleBlur(validate) {
      if (typeof this.innerValue === "string") {
        this.innerValue = numeral._.stringToNumber(this.innerValue);
      }
      validate();
      this.handleOutOfFocus();
    },
    handleOutOfFocus() {
      if (typeof this.innerValue === "string") {
        this.innerValue = numeral._.stringToNumber(this.innerValue);
      }
      if (this.minValueFixed) {
        if (this.innerValue < this.minValue) {
          this.innerValue = this.minValue;
          this.$emit("input", this.innerValue);
        }
      }
      if (this.maxValue || this.maxValue === 0) {
        if (this.innerValue > this.maxValue) {
          this.innerValue = this.maxValue;
          this.$emit("input", this.maxValue);
        }
      }
    }
  }
});
</script>
