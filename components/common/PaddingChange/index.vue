<template>
  <div class="padding-change">
    <padding-change-item
      v-model="innerValue['padding-top']"
      type="top"
      class-content="padding-change-item"
    />
    <padding-change-item
      v-model="innerValue['padding-right']"
      type="right"
      class-content="padding-change-item"
    />
    <padding-change-item
      v-model="innerValue['padding-bottom']"
      type="bottom"
      class-content="padding-change-item"
    />
    <padding-change-item
      v-model="innerValue['padding-left']"
      type="left"
      class-content="padding-change-item"
    />
    <div class="text">px</div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import PaddingChangeItem from "~/components/common/PaddingChange/PaddingChangeItem.vue";

interface ComponentData {
  innerValue: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface ComponentMethods {}

const PaddingChange = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { PaddingChangeItem },
  mixins: [wrapper],
  props: {},
  data: () => ({
    innerValue: {
      "padding-top": null,
      "padding-right": null,
      "padding-bottom": null,
      "padding-left": null
    }
  })
});

export default PaddingChange;
export type PaddingChangeRef = InstanceType<typeof PaddingChange>;
</script>

<style lang="scss" scoped>
.padding-change {
  width: fit-content;
  display: flex;
  align-items: flex-end;

  margin-top: 12px;

  .padding-change-item {
    &:not(:last-child) {
      padding-right: 16px;
    }
  }

  .text {
    margin-bottom: 4px;
  }
}
</style>
