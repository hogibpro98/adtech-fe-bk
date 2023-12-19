<template>
  <div :class="`v-stepper__step v-stepper__step${isActive ? '--active' : ''}`">
    <span :class="`v-stepper__step__step ${isActive ? 'primary' : ''}`">
      <span v-if="!complete">
        {{ step }}
      </span>
      <i
        v-if="complete"
        aria-hidden="true"
        class="v-icon notranslate mdi mdi-check "
      />
    </span>
    <div class="v-stepper__label">
      <slot />
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  menu: boolean;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "VStepperStepCustom",
  props: {
    complete: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    step: {
      type: Number,
      default: 1
    }
  },
  data: () => ({
    menu: false
  })
});
</script>
