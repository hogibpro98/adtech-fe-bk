<template>
  <div v-if="errors && errors[0]" class="v-text-field__details mt-2">
    <div class="v-messages theme--light error--text" role="alert">
      <div class="v-messages__wrapper">
        <div class="v-messages__message">
          {{ errors && errors[0] }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  name: "ErrorDisplay",
  props: {
    errors: {
      type: Array,
      default: () => []
    }
  }
});
</script>
