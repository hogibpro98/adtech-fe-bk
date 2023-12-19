<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || $attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name || name"
  >
    <input v-model="innerValue" hidden type="text" />
    <v-card-title class="text-left pl-0 pb-0 v-label ">
      {{ label }}
      <span v-if="required" class="error--text">(*)</span>
    </v-card-title>

    <v-radio-group v-model="innerValue" hide-details class="mt-3">
      <div :class="layoutClass">
        <v-radio
          v-for="(item, index) in items"
          :key="item[itemValue]"
          class="mb-0 mr-2"
          :label="item[itemText]"
          dense
          hide-details
          :value="item[itemValue]"
        />
      </div>
    </v-radio-group>
    <error-display :errors="errors" />
  </validation-provider>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import deepWrapper from "~/mixins/deepWrapper";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import input from "~/mixins/input";

interface ComponentData {
  statusCopy: boolean;
  timeout: number;
}

interface ComponentMethods {
  copy(): void;
}

const VRadioWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "VRadioWithValidation",
  components: { ErrorDisplay },
  mixins: [deepWrapper, input],
  props: {
    hasCheckAll: {
      type: Boolean,
      default: false
    },
    vid: {
      type: String,
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    layoutClass: {
      type: [String, Object],
      default: "layout flex wrap"
    },
    checkboxClass: {
      type: [String, Object],
      default: "px-2"
    },
    itemText: {
      type: String,
      default: "text"
    },
    itemValue: {
      type: String,
      default: "value"
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // checkAllProxy: false,
    };
  },
  computed: {},
  watch: {
    // innerValue: {
    //   deep: true,
    //   handler(val) {
    //     console.log(val);
    //   }
    // }
  },

  methods: {}
});
export default VRadioWithValidation;
</script>
