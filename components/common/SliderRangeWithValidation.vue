<template>
  <v-flex xs12>
    <v-card-title class="text-center pb-0 pl-1  label-md font-16">
      {{ label }}
      <span v-if="required" class="error--text ml-1">(*)</span>
    </v-card-title>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="$attrs['label-validation'] || $attrs.label || $attrs.name"
      :rules="rules"
      :vid="vid || $attrs.name"
    >
      <input v-model="innerValue" hidden />
      <v-flex class="d-flex align-items-end mb-6 mx-1">
        <v-card-text
          class="text-subtitle-1 text--primary no-padding w-auto line-height-initial mr-3"
        >
          Từ
        </v-card-text>
        <v-number-field-with-validation
          v-model="innerValue.min"
          v-bind="propsInput1"
          :loading="loading"
          :placeholder="placeholder"
          :rules="{
            required: requiredMin,
            min_value: min,
            max_value: max,
            lessOrNull: [`${name}-max`, 1]
          }"
          :name="`${name}-min`"
          dense
          class="d-flex align-items-center h-100 mt-1 m-w-5 input-error-absolute"
        >
        </v-number-field-with-validation>
        <v-card-text
          class="text-subtitle-1 text--primary no-padding w-auto line-height-initial mx-3"
        >
          đến
        </v-card-text>
        <v-number-field-with-validation
          v-model="innerValue.max"
          v-bind="propsInput2"
          :loading="loading"
          :placeholder="placeholder"
          :rules="{
            required: requiredMax,
            min_value: min,
            max_value: max,
            greaterOrNull: [`${name}-min`, 1]
          }"
          :name="`${name}-max`"
          class="d-flex align-items-center h-100 mt-1 m-w-5 input-error-absolute"
          dense
        >
        </v-number-field-with-validation>
        <v-card-text
          class="text-subtitle-1 text--primary no-padding w-auto line-height-initial ml-3"
        >
          {{ unit }}
        </v-card-text>
      </v-flex>
      <v-card-text
        class="input-slider no-padding-left no-padding-right no-padding-bottom"
      >
        <v-range-slider
          :loading="loading"
          :thumb-size="thumbSize"
          :height="52"
          :min="min"
          :max="max"
          :value="[innerValue.min, innerValue.max]"
          :thumb-label="thumbLabel"
          dense
          @change="changeRange"
        >
          <template slot="thumb-label" slot-scope="{ value }">
            {{ value | commarize }}
          </template>
        </v-range-slider>
      </v-card-text>
      <error-display :errors="errors" class="mt-2" />
    </validation-provider>
  </v-flex>
</template>
<script lang="ts">
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import wrapper from "@/mixins/wrapper";
import { isEmpty } from "@/util/typeof";
import Vue, { VueConstructor } from "vue";
import { generateName } from "~/util/ads";
import { SliderDataInterface } from "~/interface/data/banner";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";

export interface ComponentData {
  innerValue: SliderDataInterface;
}

interface ComponentMethods {
  changeRange(data): void;

  getOrDefault(value, defaultValue: string): string;
}

const SliderRangeWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SliderRangeWithValidation",
  components: { ErrorDisplay, VNumberFieldWithValidation },
  mixins: [wrapper, input],
  props: {
    value: {
      type: Object,
      default: () => ({ min: 0, max: 0 })
    },
    required: {
      type: Boolean,
      default: false
    },
    unit: {
      type: String,
      default: ""
    },
    min: {
      type: Number,
      default: 1
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
    propsInput1: {
      type: Object,
      default: () => ({})
    },
    propsInput2: {
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
    isDefaultSelectAll: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    innerValue: {
      min: null,
      max: null,
      code: "_"
    }
  }),
  computed: {
    requiredMin() {
      return this.required || !isEmpty(this.innerValue?.max);
    },
    requiredMax() {
      return this.required || !isEmpty(this.innerValue?.min);
    },
    valueTemp() {
      if (!this.innerValue?.min || !this.innerValue?.max) {
        return "";
      }
      return `${this.innerValue?.min}-${this.innerValue?.max}`;
    }
  },
  methods: {
    changeRange(data) {
      const [min, max] = data || [];
      if (min !== this.innerValue?.min || max !== this.innerValue?.max) {
        this.innerValue = {
          min,
          max,
          code: `${min}_${max}`,
          name: generateName({ min, max }, this.unit)
        };
      }
    },
    getOrDefault(value, defaultValue = "") {
      if (isEmpty(value)) {
        return defaultValue;
      } else {
        return value;
      }
    }
  }
});

export default SliderRangeWithValidation;
export type SliderRangeWithValidationRef = InstanceType<
  typeof SliderRangeWithValidation
>;
</script>
