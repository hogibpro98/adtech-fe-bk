<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || $attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name || name"
  >
    <v-layout justify-space-between align-center>
      <v-flex xs8 lg6 class="pr-4">
        {{ label }}
        <span v-if="required" class="error--text">(*)</span>
      </v-flex>
      <v-select-with-validation
        v-model="innerValue.unit"
        class="pr-4"
        :name="`${name}.unit`"
        label="Khoảng thời gian"
        :items="selectableTime"
        :readonly="readonly"
        :required="required"
        :rules="rules"
      />
      <v-number-field-with-validation
        v-model="innerValue.value"
        :name="`${name}.value`"
        reverse
        :readonly="readonly"
        :prefix="suffix"
        label="Số lượng tối đa"
        :required="required"
        :rules="numberRules"
      />
    </v-layout>
  </validation-provider>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import deepWrapper from "~/mixins/deepWrapper";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import input from "~/mixins/input";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import { FREQUENCY_SELECT } from "~/constants/dataSelect";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { hasValue } from "~/helpers/ultis";

interface ComponentData {
  statusCopy: boolean;
  timeout: number;
}

interface ComponentMethods {
  copy(): void;
}

const FrequencyInputWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FrequencyInputWithValidation",
  components: {
    VNumberFieldWithValidation,
    VSelectWithValidation,
    ErrorDisplay
  },
  mixins: [deepWrapper, input],
  props: {
    vid: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    numberRules: {
      type: [String, Object],
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    suffix: {
      type: String,
      default: "tin nhắn"
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectableTime: cloneDeep(FREQUENCY_SELECT),
      innerValue: {
        unit: "month",
        value: 0
      }
    };
  },
  watch: {
    value(val) {
      if (val) {
        this.innerValue = val;
      } else {
        this.innerValue = {
          unit: "month",
          value: 0
        };
      }
    }
  },
  created() {
    this.innerValue = hasValue(this.value)
      ? this.value
      : {
          unit: "month",
          value: 0
        };
  }
});
export default FrequencyInputWithValidation;
</script>
