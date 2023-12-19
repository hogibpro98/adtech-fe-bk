<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs['label-validation'] || $attrs.label || $attrs.name"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-text-field
      v-bind="$attrs"
      ref="input"
      v-model="innerValue"
      placeholder=" "
      :error-messages="errors"
      :class="inputClass"
      v-on="$listeners"
    >
      <!-- Slot section. Inherit slot override custom slot -->
      <!-- Custom slot -->
      <template v-if="required" #label>
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

interface ComponentData {
  innerValue: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "VTextFieldWithValidation",
  props: {
    rules: {
      type: [Object, String],
      default: ""
    },
    inputClass: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: null,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    innerValue: ""
  }),
  watch: {
    // Handles internal model changes.
    async innerValue(newVal) {
      if (this.$attrs.type === "number") {
        this.$emit("input", this.$options.filters.number(newVal));
        await this.$nextTick();
        this.innerValue = this.$options.filters.number(newVal);
      } else {
        this.$emit("input", newVal);
      }
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
  },
  methods: {}
});
</script>
