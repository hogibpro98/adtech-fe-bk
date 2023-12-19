<template>
  <div class="border-change">
    <div class="input-border-width-wrapper">
      <v-number-field-with-validation
        v-model="innerValue['border-width']"
        v-bind="$attrs"
        dense
        min-value-fixed
        min-value="0"
        name="Kích thước"
        class="border-width"
        append
        suffix="px"
      />
    </div>
    <div class="input-border-color-wrapper">
      <custom-color-picker v-model="innerValue['border-color']" />
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import CustomColorPicker from "~/components/common/CustomColorPicker.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

interface ComponentData {
  innerValue: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface ComponentMethods {}

const BorderChange = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { VNumberFieldWithValidation, CustomColorPicker },
  mixins: [wrapper],
  props: {},
  data: () => ({
    innerValue: {
      "border-width": null,
      "border-color": "#00000000"
    }
  })
});

export default BorderChange;
export type BorderChangeRef = InstanceType<typeof BorderChange>;
</script>

<style lang="scss" scoped>
.border-change {
  width: fit-content;
  display: flex;
  align-items: center;

  .input-border-width-wrapper {
    width: 68px;
    margin-right: 16px;
  }

  .input-border-color-wrapper {
  }

  &::v-deep .v-messages {
    min-height: 0 !important;
  }
}
</style>
