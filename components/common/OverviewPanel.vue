<template>
  <v-flex xs12>
    <div class="d-flex justify-content-center align-items-center flex-wrap">
      <v-overlay v-if="loading" absolute color="#fff" class="z-1"></v-overlay>
      <template v-for="(item, i) in data">
        <overview-item-panel
          :key="`overview-item-${i}`"
          v-bind="$attrs"
          :icon="icons[i]"
          :color="item.color"
          :name="item.name"
          :value="item.value"
        />
      </template>
    </div>
  </v-flex>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import OverviewItemPanel from "~/components/common/OverviewItemPanel.vue";

export interface DataOverviewPanelInterface {
  name: string;
  color: string;
  value: string | number;
}

export default (Vue as VueConstructor).extend({
  name: "OverviewPanel",
  components: { OverviewItemPanel },
  props: {
    icons: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
});
</script>
