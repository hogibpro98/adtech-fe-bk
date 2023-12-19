<template>
  <vue-pdf
    :src="src"
    :page="page"
    @num-pages="$emit('num-pages', $event)"
    @link-clicked="$emit('link-clicked', $event)"
    @error="$emit('error', $event)"
  />
</template>

<script lang="ts">
import Vue from "vue";

interface ComponentData {}
interface ComponentMethods {}
interface ComponentComputed {}
interface ComponentProps {
  src: string;
  page: number;
}
const VuePdf = () => import('vue-pdf');
const VuePdfWrapper = Vue.extend<
  ComponentData,
  ComponentMethods,
  ComponentComputed,
  ComponentProps
>({
  components: {
    VuePdf
  },
  props: {
    src: {
      type: String,
      required: true
    },
    page: {
      type: Number,
      required: true
    }
  },
  errorCaptured(err: Error, vm: Vue, info: string): boolean | void {
    return false;
  }
});
export default VuePdfWrapper;
</script>

<style scoped></style>
