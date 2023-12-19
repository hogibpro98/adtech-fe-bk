<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label || $attrs.name"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-select
      v-model="innerValue"
      :error-messages="errors"
      :items="items"
      v-bind="$attrs"
      disable-lookup
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
    </v-select>
  </validation-provider>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

export default (Vue as VueConstructor).extend({
  name: "VSelectWithValidation",
  mixins: [wrapper],
  props: {
    rules: {
      type: [Object, String],
      default: ""
    },
    items: {
      type: Array,
      default: () => []
    },
    vid: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    }
  }
});
</script>
