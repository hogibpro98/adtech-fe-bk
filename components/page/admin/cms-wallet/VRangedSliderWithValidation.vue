<template>
  <validation-provider
    v-slot="{ errors, valid, validate }"
    :detect-input="false"
    :name="$attrs['label-validation'] || label || name"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-card-title class="text-center pb-0 pl-1  label-md font-16">
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </v-card-title>
    <v-layout justify-space-between :reverse="reverse">
      <v-range-slider
        v-model="innerValue"
        dense
        class="w-full mt-2"
        v-bind="$attrs"
        v-model="valueRange"
        :min="0"
        :max="max"
        :disabled="disabled"
        :error-messages="errors"
        :loading="loading"
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
      </v-range-slider>

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
        class="d-flex align-items-center h-100 mt-1 m-w-5 input-error-absolute mx-2"
        @input="validate"
      >
      </v-number-field-with-validation>
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

const VRangedSliderWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
  >).extend({
  name: "VRangedSliderWithValidation",
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
      default: false
    },
    unit: {
      type: String,
      default: ""
    },
    min: {
      type: Number,
      default: 0
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
    }
  },
  data() {
    return {};
  },
  computed: {
    valueRange() {
      return [this.min, this.innerValue]
    }
  },
  methods: {}
});

export default VRangedSliderWithValidation;
export type VRangedSliderWithValidationRef = InstanceType<
  typeof VRangedSliderWithValidation
  >;
</script>

