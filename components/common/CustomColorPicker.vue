<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
    max-height="320px"
    content-class="h-full"
  >
    <template #activator="{ on, attrs }">
      <div v-bind="attrs" class="input-pick-color-wrapper" v-on="on">
        <div class="input-pick-color">
          <v-icon size="24">{{ icon }}</v-icon>
          <span
            class="preview-color"
            :style="`background-color: ${colorSelectHex}`"
            :color="colorSelectHex"
          />
        </div>
        <v-icon size="24">mdi-menu-down</v-icon>
      </div>
    </template>
    <v-row class="mx-0">
      <v-color-picker
        v-model="colorPicker"
        dot-size="25"
        hide-canvas
        hide-mode-switch
        hide-sliders
        mode="hexa"
        show-swatches
        swatches-max-height="200"
        max-width="310px"
      ></v-color-picker>
    </v-row>
  </v-menu>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

interface ComponentData {
  menu: boolean;
}

interface ComponentMethods {
  closeMenu(): void;
  selectAlias(val: object): void;
}

const CustomColorPicker = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  mixins: [wrapper],
  props: {
    icon: {
      type: String,
      default: "mdi-format-color-fill"
    }
  },
  data: () => ({
    menu: false,
    innerValue: null,
    colorPicker: null
  }),
  computed: {
    colorSelectHex() {
      return this.colorPicker?.hexa || this.colorPicker || "#FFFFFFFF";
    }
  },
  watch: {
    colorSelectHex(value) {
      this.innerValue = value;
    },
    innerValue(value) {
      const colorSelect = this.colorPicker?.hexa || this.colorPicker;
      if (colorSelect !== value) {
        this.colorPicker = value;
      }
    }
  },
  mounted() {
    this.colorPicker = this.innerValue;
  }
});

export default CustomColorPicker;
export type CustomColorPickerRef = InstanceType<typeof CustomColorPicker>;
</script>

<style lang="scss" scoped>
.input-pick-color-wrapper {
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: #fff;

  &:hover {
    background-color: #f7fafe;
  }

  .input-pick-color {
    display: flex;
    align-items: center;
    flex-direction: column;

    .preview-color {
      box-sizing: border-box;
      display: flex;
      height: 4px;
      width: 20px;
      margin-top: -4px;

      &[color="#FFFFFFFF"],
      &[color="#00000000"] {
        border: 1px solid #dadce0;
      }
    }
  }
}
</style>
