<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs['label-validation'] || $attrs.label || $attrs.name"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-textarea
      v-model="innerValue"
      :error-messages="errors"
      v-bind="$attrs"
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
    </v-textarea>
  </validation-provider>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

export default (Vue as VueConstructor).extend({
  name: "VTextAreaWithValidation",
  mixins: [wrapper],
  props: {
    rules: {
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
  }
});
</script>
