<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-file-input
      v-model="innerValue"
      :error-messages="errors"
      :truncate-length="64"
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
    </v-file-input>
  </validation-provider>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  innerValue: any;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "VFileFieldWithValidation",
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
      type: undefined,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    innerValue: undefined
  })
});
</script>
