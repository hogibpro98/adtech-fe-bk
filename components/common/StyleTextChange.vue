<template>
  <div class="style-text-change">
    <div class="input-font-size-wrapper">
      <v-number-field-with-validation
        v-model="innerValue['font-size']"
        v-bind="$attrs"
        dense
        class="font-size"
        label="Kích thước phông chữ"
        min-value-fixed
        min-value="0"
        append
        hide-details
        suffix="px"
      />
    </div>
    <div class="input-font-style-wrapper">
      <div>
        <v-btn-toggle
          v-model="innerValue['text-align']"
          color="primary"
          dense
          group
        >
          <v-btn value="left">
            <v-icon>mdi-format-align-left</v-icon>
          </v-btn>
          <v-btn value="center">
            <v-icon>mdi-format-align-center</v-icon>
          </v-btn>
          <v-btn value="right">
            <v-icon>mdi-format-align-right</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>
      <div>
        <v-btn-toggle
          v-model="innerValue['font-weight']"
          color="primary"
          dense
          group
        >
          <v-btn value="bold">
            <v-icon>mdi-format-bold</v-icon>
          </v-btn>
        </v-btn-toggle>
        <v-btn-toggle
          v-model="innerValue['font-style']"
          color="primary"
          dense
          group
        >
          <v-btn value="italic">
            <v-icon>mdi-format-italic</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>
      <div>
        <custom-color-picker
          v-model="innerValue.color"
          icon="mdi-format-color-text"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import CustomColorPicker from "~/components/common/CustomColorPicker.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { STYLE_TEXT_DEFAULT } from "~/constants/default";

interface ComponentData {
  innerValue: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface ComponentMethods {}

const StyleTextChange = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { VNumberFieldWithValidation, CustomColorPicker },
  mixins: [wrapper],
  props: {},
  data: () => ({
    innerValue: {
      "font-size": STYLE_TEXT_DEFAULT["font-size"],
      "text-align": STYLE_TEXT_DEFAULT["text-align"],
      "font-weight": STYLE_TEXT_DEFAULT["font-weight"],
      "font-style": STYLE_TEXT_DEFAULT["font-style"],
      color: STYLE_TEXT_DEFAULT.color
    }
  })
});

export default StyleTextChange;
export type StyleTextChangeRef = InstanceType<typeof StyleTextChange>;
</script>

<style lang="scss" scoped>
.style-text-change {
  margin-top: 12px;
  .input-font-size-wrapper {
    width: 72px;

    &::v-deep .v-label {
      transform: translateY(-18px) scale(0.75);
      overflow: inherit !important;
    }
  }

  .input-font-style-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    margin-top: 12px;
  }
}
</style>
