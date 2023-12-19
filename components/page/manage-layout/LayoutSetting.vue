<template>
  <v-expansion-panels accordion>
    <v-expansion-panel>
      <v-expansion-panel-header>
        Toàn cầu
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <field-column-with-validate label="Màu nền">
          <custom-color-picker
            v-model="innerValue.style_component['background-color']"
          />
        </field-column-with-validate>
        <field-row-with-validate label="Kích thước đường viền">
          <border-change v-model="innerValue.style_component" />
        </field-row-with-validate>
        <field-row-with-validate label="Khoảng thừa">
          <padding-change v-model="innerValue.style_component" />
        </field-row-with-validate>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel v-if="innerValue.layout_type !== 'layout_text_only'">
      <v-expansion-panel-header>
        Hình ảnh
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <float-image-change
          v-if="
            innerValue.layout_type !== 'layout_img_above' &&
              innerValue.layout_type !== 'layout_img_only'
          "
          v-model="innerValue.style_image.float"
        />
        <field-row-with-validate
          v-if="innerValue.layout_type !== 'layout_img_only'"
          label="Kích thước"
        >
          <size-image-change
            v-model="innerValue.style_image"
            :layout-type="innerValue.layout_type"
          />
        </field-row-with-validate>
        <field-row-with-validate label="Khoảng thừa">
          <padding-change v-model="innerValue.style_image" />
        </field-row-with-validate>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel v-if="innerValue.layout_type !== 'layout_img_only'">
      <v-expansion-panel-header>
        Tiêu đề
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-select-with-validation
          v-model="innerValue.style_title['font-family']"
          :items="LAYOUT_FONTS"
          name="font"
          label="Phông chữ"
          hide-details
          rules="required"
        />
        <field-row-with-validate label="Kiểu">
          <style-text-change v-model="innerValue.style_title" />
        </field-row-with-validate>
        <field-row-with-validate label="Khoảng thừa">
          <padding-change v-model="innerValue.style_title" />
        </field-row-with-validate>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel v-if="innerValue.layout_type !== 'layout_img_only'">
      <v-expansion-panel-header>
        Mô tả
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-select-with-validation
          v-model="innerValue.style_description['font-family']"
          :items="LAYOUT_FONTS"
          name="font"
          label="Phông chữ"
          hide-details
          rules="required"
        />
        <field-row-with-validate label="Kiểu">
          <style-text-change v-model="innerValue.style_description" />
        </field-row-with-validate>
        <field-row-with-validate label="Khoảng thừa">
          <padding-change v-model="innerValue.style_description" />
        </field-row-with-validate>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { objectToStyle } from "~/util/object";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import { LAYOUT_FONTS } from "~/constants/dataSelect";
import CustomColorPicker from "~/components/common/CustomColorPicker.vue";
import FieldColumnWithValidate from "~/components/page/manage-layout/field/FieldColumnWithValidate.vue";
import FieldRowWithValidate from "~/components/page/manage-layout/field/FieldRowWithValidate.vue";
import PaddingChange from "~/components/common/PaddingChange/index.vue";
import SizeImageChange from "~/components/common/SizeImageChange.vue";
import BorderChange from "~/components/common/BorderChange.vue";
import StyleTextChange from "~/components/common/StyleTextChange.vue";
import FloatImageChange from "~/components/common/FloatImageChange.vue";
import wrapper from "~/mixins/wrapper";
import {
  STYLE_COMPONENT_DEFAULT,
  STYLE_IMAGE_DEFAULT,
  STYLE_TEXT_DEFAULT
} from "~/constants/default";

const LayoutSetting = (Vue as VueConstructor).extend({
  name: "LayoutSetting",
  components: {
    FloatImageChange,
    StyleTextChange,
    BorderChange,
    PaddingChange,
    FieldRowWithValidate,
    FieldColumnWithValidate,
    CustomColorPicker,
    SizeImageChange,
    VSelectWithValidation
  },
  mixins: [wrapper],
  props: {},
  data: () => ({
    objectToStyle,
    dataSample: {
      title: "Quảng cáo mẫu",
      description: "Mô tả quảng cáo mẫu",
      media:
        "https://cdn.noron.vn/2021/08/21/5395151651087139-1629534313_1024.jpg"
    },
    LAYOUT_FONTS,
    innerValue: {
      layout_type: null,
      style_component: cloneDeep(STYLE_COMPONENT_DEFAULT),
      style_image: cloneDeep(STYLE_IMAGE_DEFAULT),
      style_title: cloneDeep(STYLE_TEXT_DEFAULT),
      style_description: cloneDeep(STYLE_TEXT_DEFAULT)
    }
  }),
  methods: {}
});

export default LayoutSetting;
export type LayoutSettingRef = InstanceType<typeof LayoutSetting>;
</script>

<style lang="scss" scoped></style>
