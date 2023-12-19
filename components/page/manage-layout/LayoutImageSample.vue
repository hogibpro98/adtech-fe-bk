<template>
  <div
    :aria-disabled="isSelected"
    class="card-container"
    role="button"
    tabindex="0"
    @click="selected"
  >
    <div class="image-sample" :style="{ height: heightImg + 'px' }">
      <v-img :src="image" contain class="image-content" />
    </div>
    <div class="layout-caption">{{ title }}</div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

const LayoutImageSample = (Vue as VueConstructor).extend({
  name: "LayoutImageSample",
  mixins: [wrapper],
  props: {
    code: {
      type: String,
      required: true
    },
    heightImg: {
      type: Number,
      default: null
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  data: () => ({
    innerValue: null
  }),
  computed: {
    isSelected() {
      return this.innerValue === this.code;
    }
  },
  methods: {
    selected() {
      this.innerValue = this.code;
    }
  }
});

export default LayoutImageSample;
export type LayoutImageSampleRef = InstanceType<typeof LayoutImageSample>;
</script>

<style lang="scss" scoped>
.card-container {
  position: relative;
  overflow: hidden;
  border-width: 0;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
    0 1px 3px 1px rgba(60, 64, 67, 0.15);
  align-items: center;
  border-radius: 2px;
  background-color: #e8eaed;
  display: flex;
  flex: auto;
  flex-direction: column;
  justify-content: space-between;

  &:not(:first-child) {
    margin-top: 0.8rem;
  }

  &:hover {
    border-width: 0;
    box-shadow: 0 2px 3px 0 rgba(60, 64, 67, 0.3),
      0 6px 10px 4px rgba(60, 64, 67, 0.15);
  }

  &[aria-disabled="true"] {
    border: 2px solid #1a73e8 !important;
  }

  .image-sample {
    max-width: 100%;
    padding: 16px 16px 0;
  }

  .image-content {
    width: 100%;
    height: 100%;
  }

  .layout-caption {
    padding: 8px 0;
  }
}
</style>
