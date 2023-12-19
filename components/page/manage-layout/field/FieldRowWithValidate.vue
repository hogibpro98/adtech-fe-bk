<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label || $attrs.name"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <div class="d-flex flex-column mt-2">
      <label
        :class="errors.length > 0 ? 'error--text' : ''"
        class="v-label py-2 block"
      >
        {{ label }}
        <span v-if="required" class="error--text"> (*) </span>
      </label>
      <slot></slot>
    </div>
    <div v-if="errors && errors[0]" class="v-text-field__details mt-2">
      <div class="v-messages theme--light error--text" role="alert">
        <div class="v-messages__wrapper">
          <div class="v-messages__message">
            {{ resError || (errors && errors[0]) }}
          </div>
        </div>
      </div>
    </div>
  </validation-provider>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

export default (Vue as VueConstructor).extend({
  name: "FieldRowWithValidate",
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
