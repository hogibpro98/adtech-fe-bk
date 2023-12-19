<template>
  <div :class="`padding-change-item ${classContent}`">
    <div class="padding-change-item-preview">
      <div :class="`padding-change-item-position ${type}`" />
    </div>
    <div class="padding-input-wrapper">
      <v-number-field-with-validation
        v-model="innerValue"
        v-bind="$attrs"
        min-value-fixed
        min-value="0"
        dense
        class="padding-input"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

interface ComponentData {
  menu: boolean;
}

interface ComponentMethods {
  closeMenu(): void;
  selectAlias(val: object): void;
}

const PaddingChangeItem = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { VNumberFieldWithValidation },
  mixins: [wrapper],
  props: {
    type: {
      type: String,
      default: "left"
    },
    classContent: {
      type: String,
      default: ""
    }
  },
  data: () => ({
    innerValue: null
  })
});

export default PaddingChangeItem;
export type PaddingChangeItemRef = InstanceType<typeof PaddingChangeItem>;
</script>

<style lang="scss" scoped>
.padding-change-item {
  .padding-change-item-preview {
    background-color: #f1f3f4;
    border: 1px solid #9aa0a6;
    height: 24px;
    position: relative;
    width: 24px;

    .padding-change-item-position {
      position: absolute;
      background-color: #bdc1c6;

      &.top {
        width: 100%;
        height: 6px;
        top: 0;
        left: 0;

        border-bottom: 1px solid #9aa0a6;
      }

      &.right {
        width: 6px;
        height: 100%;
        top: 0;
        right: 0;

        border-left: 1px solid #9aa0a6;
      }

      &.bottom {
        width: 100%;
        height: 6px;
        bottom: 0;
        left: 0;

        border-top: 1px solid #9aa0a6;
      }

      &.left {
        width: 6px;
        height: 100%;
        top: 0;
        left: 0;

        border-right: 1px solid #9aa0a6;
      }
    }
  }
  .padding-input-wrapper {
    width: 24px;
    .padding-input {
    }

    &::v-deep .v-messages {
      min-height: 0 !important;
    }
  }
}
</style>
