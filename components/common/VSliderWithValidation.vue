<template>
  <validation-provider
    v-slot="{ errors, valid, validate }"
    :detect-input="false"
    :name="$attrs['label-validation'] || label || name"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-card-title class="text-center pb-0 pl-0  label-md font-16">
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </v-card-title>
    <v-layout justify-space-between :reverse="reverse">
      <v-number-field-with-validation
        v-model="innerValue"
        style="width: 20%; text-align: right;"
        v-bind="propsInput"
        :disabled="disabled"
        :loading="loading"
        :placeholder="placeholder"
        :suffix="unit"
        :name="`${name}-input`"
        dense
        class="d-flex align-items-center h-100 mt-1 m-w-5 input-error-absolute mx-2 text-right"
        :min-value-fixed="true"
        :min-value="minValue"
        reverse
        @input="validate"
      >
      </v-number-field-with-validation>
      <v-row no-gutters class="px-3" style="width: 80%;">
        <v-slider
          :value="minValue"
          :thumb-color="'white'"
          class="w-full mt-2 px-0 mx-0 sub-slider"
          color="grey"
          readonly
          :min="minValue === 0 ? -1 : 0"
          :max="minValue"
          :style="{ width: subSliderWidth }"
          dense
        ></v-slider>
        <v-slider
          v-model="innerValue"
          dense
          class="w-full mt-2 px-0 mx-0"
          v-bind="$attrs"
          :min="min"
          :max="max"
          :disabled="disabled"
          :loading="loading"
          :style="{ width: mainSlideWidth }"
          v-on="$listeners"
        >
          <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
          <template
            v-for="(_, name) in $scopedSlots"
            :slot="name"
            slot-scope="slotData"
          >
            <slot :name="name" v-bind="slotData" />
          </template>
        </v-slider>
        <div :style="{ width: subSliderWidth }"></div>
        <div :style="{ width: mainSlideWidth }" class="custom-slider-min-max">
          <v-layout
            align-center
            align-content-center
            justify-space-between
            reverse
          >
            <div
              v-if="!isCloseMinMax"
              class="text-right pr-3 mt-0 pt-0"
              :class="{ 'text--disabled': disabled }"
            >
              <slot name="max-value"></slot>
            </div>
            <div
              class="text-left pr-3 mt-0 pt-0"
              :style="{
                'margin-left': calculateMarginLeft(max, isCloseMinMax)
              }"
              :class="{ 'text--disabled': disabled }"
            >
              <slot name="min-value"></slot>
            </div>
          </v-layout>
        </div>
        <v-col cols="12">
          <v-row align="center" align-content="center">
            <v-col
              v-if="errors.length !== 0"
              cols="12"
              class="text-left mt-0 pt-3 pb-6 red--text subtitle-2"
            >
              {{ errors[0] }}
            </v-col>
            <v-col
              v-else
              cols="12"
              class="text-left mt-0 pt-3 pb-6 white--text subtitle-2"
            >
              Lỗi hiển thị ở đây
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-layout>
  </validation-provider>
</template>
<script lang="ts">
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import wrapper from "@/mixins/wrapper";
import { isEmpty } from "@/util/typeof";
import Vue, { VueConstructor } from "vue";
import { generateName } from "~/util/ads";
import { SliderDataInterface } from "~/interface/data/banner";

export interface ComponentData {
  innerValue: SliderDataInterface;
}

interface ComponentMethods {
  changeRange(data): void;

  getOrDefault(value, defaultValue: string): string;
}

const VSliderWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "VSliderWithValidation",
  components: { VNumberFieldWithValidation },
  mixins: [wrapper],
  props: {
    required: {
      type: Boolean,
      default: false
    },
    vid: {
      type: String,
      default: null
    },
    reverse: {
      type: Boolean,
      default: true
    },
    unit: {
      type: String,
      default: ""
    },
    min: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: 120
    },
    loading: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    propsInput: {
      type: Object,
      default: () => ({})
    },
    thumbSize: {
      type: Number,
      default: 28
    },
    thumbLabel: {
      type: [String, Boolean],
      default: "always"
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    minValue: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      innerValue: 0
    };
  },
  computed: {
    subSliderWidth() {
      if (this.max === 0) return "100%";
      const length =
        Math.floor((this.minValue / this.max) * 100) <= 100
          ? Math.floor((this.minValue / this.max) * 100)
          : 100;
      return length.toString() + "%";
    },
    mainSlideWidth() {
      if (this.max === 0) return "0%";
      const length =
        Math.floor((this.minValue / this.max) * 100) <= 100
          ? Math.floor((this.minValue / this.max) * 100)
          : 100;
      return (100 - length).toString() + "%";
    },
    isCloseMinMax() {
      return Math.floor(((this.minValue + 1) / (this.max + 1)) * 100) >= 95;
    }
  },
  methods: {
    checkMin() {
      if (this.innerValue < this.minValue) {
        this.innerValue = this.minValue;
      }
      this.$emit("input", this.innerValue);
    },
    calculateMarginLeft(number, right = true) {
      const str = number.toString();
      if (right) {
        return -(str.length * 2.3 + 2) * 4 + "px";
      }
      return "0px";
    }
  }
});

export default VSliderWithValidation;
export type VSliderWithValidationRef = InstanceType<
  typeof VSliderWithValidation
>;
</script>

<style scoped>
.sub-slider {
  margin-right: -6px !important;
}

.custom-slider-min-max {
  margin-top: -3px !important;
}
</style>
