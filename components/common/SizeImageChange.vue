<template>
  <div class="size-image-change">
    <div class="input-aspect-ratio-wrapper">
      <v-select-with-validation
        v-model="innerValue.aspect_ratio"
        :items="ASPECT_RATIOS"
        name="aspect_ratio"
        label="Tỷ lệ cỡ ảnh của hình ảnh"
        hide-details
        rules="required"
      />
    </div>
    <div
      v-if="layoutType !== 'layout_img_above'"
      class="input-image-width-wrapper"
    >
      <div class="input-image-width">
        <v-number-field-with-validation
          v-model="innerValue.width_value"
          name="image_width"
          label="Chiều rộng"
          min-value-fixed
          min-value="0"
          hide-details
        />
      </div>
      <div class="input-image-width-unit">
        <v-select-with-validation
          v-model="innerValue.width_unit"
          :items="WIDTH_UNITS"
          name="width_unit"
          label=""
          hide-details
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import { ASPECT_RATIOS, WIDTH_UNITS } from "~/constants/dataSelect";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

interface ComponentData {
  innerValue: {
    width: string;
    width_unit: string;
    aspect_ratio: string;
  };
}

interface ComponentMethods {}

const SizeImageChange = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    VNumberFieldWithValidation,
    VSelectWithValidation
  },
  mixins: [wrapper],
  props: {
    layoutType: {
      type: String,
      default: ""
    }
  },
  data: () => ({
    innerValue: {
      width_value: "",
      width_unit: "%",
      aspect_ratio: "1.91:1"
    },
    WIDTH_UNITS,
    ASPECT_RATIOS
  })
});

export default SizeImageChange;
export type SizeImageChangeRef = InstanceType<typeof SizeImageChange>;
</script>

<style lang="scss" scoped>
.size-image-change {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  .input-aspect-ratio-wrapper {
    width: 88px;
    margin-right: 72px;
    &::v-deep .v-label {
      transform: translateY(-18px) scale(0.75);
      overflow: inherit !important;
    }
  }

  .input-image-width-wrapper {
    display: flex;
    align-items: center;

    .input-image-width {
      width: 160px;

      &::v-deep .v-label {
        transform: translateY(-18px) scale(0.75);
        overflow: inherit !important;
      }
    }

    .input-image-width-unit {
      width: 62px;
      margin-left: 12px;

      &::v-deep .v-label {
        transform: translateY(-18px) scale(0.75);
        overflow: inherit !important;
      }
    }
  }
}
</style>
