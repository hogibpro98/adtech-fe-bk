<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || name"
    :rules="rules"
    :vid="name"
  >
    <label
      :class="valid ? '' : 'error-text'"
      class="v-label theme--light mb-2 block"
    >
      {{ label }}
      <span v-if="required" class="red--text"> (*) </span></label
    >
    <quill-editor-custom
      v-model="innerValue"
      :error-messages="errors"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <div class="v-text-field__details mt-2">
      <div class="v-messages theme--light error--text" role="alert">
        <div class="v-messages__wrapper">
          <div class="v-messages__message">
            {{ errors && errors[0] }}
          </div>
        </div>
      </div>
    </div>
  </validation-provider>
</template>

<script lang="ts">
import QuillEditorCustom from "@/components/common/QuillEditor/index.vue";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";

const QuillEditorWidthValidation = (Vue as VueConstructor).extend({
  name: "QuillEditorWidthValidation",
  components: { QuillEditorCustom },
  mixins: [wrapper],
  props: {
    value: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    vid: {
      type: String,
      default: null
    },
    required: {
      default: false,
      type: Boolean
    },
    rules: {
      type: [Object, String],
      default: ""
    }
  }
});

export default QuillEditorWidthValidation;
export type QuillEditorWidthValidationRef = InstanceType<
  typeof QuillEditorWidthValidation
>;
</script>
