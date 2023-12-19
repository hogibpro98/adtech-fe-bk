<template>
  <div>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label"
      :rules="rules"
      :vid="fieldName"
    >
      <input v-model="innerValue" hidden type="text" />
      <label class="v-label">
        {{ label }}
      </label>
      <v-radio-group v-model="innerValue.type" row>
        <v-radio label="Vị trí cố định" :value="stickyTypes.FIXED"></v-radio>
        <v-radio
          label="Vị trí tương đối"
          :value="stickyTypes.ABSOLUTE"
        ></v-radio>
      </v-radio-group>
      <v-layout v-if="innerValue.type === stickyTypes.FIXED" wrap>
        <v-flex xs6 class="pr-2">
          <v-number-field-with-validation
            v-model="innerValue.top"
            :loading="loading"
            label="Top"
            name="top"
            suffix="px"
            min-value-fixed
            min-value="0"
            max-value="10000"
            rules="XORFieldEmpty:bottom|min:0|max_value:10000"
          />
        </v-flex>
        <v-flex xs6 class="pl-2">
          <v-number-field-with-validation
            v-model="innerValue.bottom"
            :loading="loading"
            label="Bottom"
            name="bottom"
            suffix="px"
            min-value-fixed
            min-value="0"
            max-value="10000"
            rules="XORFieldEmpty:top|min:0|max_value:10000"
          />
        </v-flex>
        <v-flex xs6 class="pr-2">
          <v-number-field-with-validation
            v-model="innerValue.left"
            :loading="loading"
            label="Left"
            name="left"
            suffix="px"
            min-value-fixed
            min-value="0"
            max-value="10000"
            rules="XORFieldEmpty:right|min:0|max_value:10000"
          />
        </v-flex>
        <v-flex xs6 class="pl-2">
          <v-number-field-with-validation
            v-model="innerValue.right"
            :loading="loading"
            label="Right"
            name="right"
            suffix="px"
            min-value-fixed
            min-value="0"
            max-value="10000"
            rules="XORFieldEmpty:left|min:0|max_value:10000"
          />
        </v-flex>
        <error-display :errors="errors" class="mt-2" />
        <div class="v-text-field__details">
          <v-icon class="pr-2">info</v-icon>
          Trong 2 trường đối lập, chỉ được nhập chỉ số cho tối đa 1 trường. Nếu không nhập chỉ số ở cả 2 trường đối lập: quảng cáo sẽ được căn giữa
        </div>
      </v-layout>
      <v-layout v-if="innerValue.type === stickyTypes.ABSOLUTE" wrap>
        <v-flex
          v-for="(item, index) in positionAbsolute"
          :key="item.code"
          xs3
          class="px-2"
        >
          <layout-image-sample
            v-model="innerValue.position_absolute"
            :code="item.code"
            :title="item.title"
            :image="item.image"
            height-img="66"
          />
        </v-flex>
        <error-display :errors="errors" class="mt-2" />
      </v-layout>
    </validation-provider>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import deepWrapper from "~/mixins/deepWrapper";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import LayoutImageSample from "~/components/page/manage-layout/LayoutImageSample.vue";
import { ZONE_STICKY_POSITION_ABSOLUTE } from "~/constants/zone";
import { POSITION_STICKY_TYPES } from "~/constants/dataSelect";

interface ComponentData {
  innerValue: object;
}

const DEFAULT_ITEM = {
  type: POSITION_STICKY_TYPES.FIXED,
  position_absolute: "top",
  top: null,
  bottom: null,
  left: null,
  right: null
};

export default (Vue as VueConstructor & ComponentData).extend({
  name: "PositionInput",
  components: {
    LayoutImageSample,
    VNumberFieldWithValidation,
    ErrorDisplay
  },
  mixins: [deepWrapper, input],
  props: {
    label: {
      type: String,
      default: "Vị trí khu vực hiển thị"
    }
  },
  data() {
    return {
      innerValue: cloneDeep(DEFAULT_ITEM),
      positionAbsolute: ZONE_STICKY_POSITION_ABSOLUTE,
      stickyTypes: POSITION_STICKY_TYPES
    };
  },
  computed: {
    fieldName() {
      return this.name || this.$attrs.name || this.vid || "schedule";
    },
    top() {
      return this.innerValue.top;
    },
    bottom() {
      return this.innerValue.bottom;
    },
    left() {
      return this.innerValue.left;
    },
    right() {
      return this.innerValue.right;
    },
    type() {
      return this.innerValue.type;
    }
  },
  created() {
    if (this.innerValue == null || this.innerValue == {}) {
      this.innerValue = cloneDeep(DEFAULT_ITEM);
    }
  },
  methods: {}
});
</script>
