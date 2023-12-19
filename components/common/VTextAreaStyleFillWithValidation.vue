<template>
  <validation-provider
    :name="$attrs.label || $attrs.name"
    :rules="rules"
    :vid="vid || $attrs.name"
    v-slot="{ errors, valid }"
  >
    <div class="d-flex align-items-center mt-2">
      <label
        :class="errors.length > 0 ? 'error--text' : ''"
        class="v-label py-2 block"
      >
        {{ label }}
        <span v-if="required" class="error--text"> (*) </span>
      </label>
      <slot v-if="$scopedSlots.appendTitle" name="appendTitle"></slot>
    </div>
    <v-textarea
      v-model="innerValue"
      :error-messages="errors"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <!-- Pass on all slots & slot scope-->
      <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
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
  name: "VTextAreaStyleFillWithValidation",
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
    label: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: String,
      default: ""
    },
    required: {
      type: Boolean,
      default: false
    }
  }
});
</script>
