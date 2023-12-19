<template>
  <div class="float-image-change">
    <v-radio-group v-model="innerValue" hide-details>
      <v-radio label="Căn trái" value="left"></v-radio>
      <v-radio label="Căn phải" value="right"></v-radio>
    </v-radio-group>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

interface ComponentData {
  innerValue: {
    width: string;
    width_unit: string;
    aspect_ratio: string;
  };
}

interface ComponentMethods {}

const FloatImageChange = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  mixins: [wrapper],
  props: {},
  data: () => ({
    innerValue: "left"
  })
});

export default FloatImageChange;
export type FloatImageChangeRef = InstanceType<typeof FloatImageChange>;
</script>

<style lang="scss" scoped>
.float-image-change {
}
</style>
