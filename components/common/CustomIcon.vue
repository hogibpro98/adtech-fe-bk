<template>
  <div v-on="!disabled && $listeners">
    <v-tooltip :disabled="!tooltip" bottom offset-overflow>
      <template #activator="{ on, attrs }">
        <v-hover v-slot="{ hover }">
          <div
            v-bind="attrs"
            :class="{
              'custom-icon-disabled': disabled,
              [`${color}--text`]: hover
            }"
            class="custom-icon px-1 darken-4 justify-content-center"
            v-on="on"
          >
            <v-icon
              v-bind="$attrs"
              :color="hover ? color : undefined"
              :disabled="disabled"
            >
              {{ icon }}
            </v-icon>
            <span class="uppercase desc-text darken-4 line-height-initial">
              {{ desc }}
            </span>
          </div>
        </v-hover>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

const CustomIcon = (Vue as VueConstructor).extend({
  name: "CustomIcon",
  props: {
    icon: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      default: ""
    },
    tooltip: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "icon"
    }
  },
  methods: {
    // handleClick(event) {
    //   if (!this.disabled) {
    //     this.$emit("click", event);
    //   }
    // }
  }
});

export default CustomIcon;
export type CustomIconRef = InstanceType<typeof CustomIcon>;
</script>

<style lang="scss">
.custom-icon {
  opacity: 0.75;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  min-width: 48px;
  height: 48px;
  &:hover {
    opacity: 1;
  }
  &-disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
  .desc-text {
    font-size: 0.55rem;
  }
}
</style>
