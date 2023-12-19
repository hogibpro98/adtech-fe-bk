<template>
  <v-row class="no-margin">
    <v-flex xs12 class="mb-0 mt-5">
      <slider-range-with-validation
        v-model="item"
        :loading="loading"
        :min="0"
        :max="120"
        :rules="{ required: true }"
        :props-input1="{
          'label-validation': 'Độ tuổi nhỏ nhất'
        }"
        :props-input2="{
          'label-validation': 'Độ tuổi lớn nhất'
        }"
        name="age"
        label="Độ tuổi"
        unit="tuổi"
        required
      />
    </v-flex>
    <v-flex xs12>
      <targeting-location-select
        v-model="innerValue"
        :loading="loading"
        :attach="attachDropdown"
        label="Khu vực nhà"
      >
      </targeting-location-select>
    </v-flex>
    <v-flex xs12>
      <targeting-location-workplaces-select
        v-model="innerValue"
        :loading="loading"
        :attach="attachDropdown"
        label="Khu vực làm việc"
      >
      </targeting-location-workplaces-select>
    </v-flex>
    <v-flex xs12 class="mt-2">
      <gender-view-item
        v-model="innerValue.genders"
        :loading="loading"
        :attach="attachDropdown"
        label="Giới tính"
      >
      </gender-view-item>
    </v-flex>
    <v-flex xs12 class="mt-2">
      <relationship-view-item
        v-model="innerValue.relationships"
        :loading="loading"
        :attach="attachDropdown"
        label="Tình trạng hôn nhân"
      >
      </relationship-view-item>
    </v-flex>
    <v-card-subtitle
      v-if="!hideFooter"
      class="no-padding caption text-center max-w-2xl m-auto"
    >
      Cung cấp cho chúng tôi thêm thông tin để chúng tôi hiển thị quảng cáo của
      bạn tới mọi người một cách hiệu quả nhất
    </v-card-subtitle>
  </v-row>
</template>
<script lang="ts">
import SliderRangeWithValidation from "@/components/common/SliderRangeWithValidation.vue";
import GenderViewItem from "@/components/page/manage-campaign/banner/common/GenderViewItem.vue";
import RelationshipViewItem from "@/components/page/manage-campaign/banner/common/RelationshipViewItem.vue";
import TargetingLocationSelect from "@/components/select/TargetingLocationSelect.vue";
import TargetingLocationWorkplacesSelect from "@/components/select/TargetingLocationWorkplacesSelect.vue";
import wrapper from "@/mixins/wrapper";
import { isEqual } from "lodash";
import Vue, { VueConstructor } from "vue";
import { isEmpty } from "~/util/typeof";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";

interface ComponentData {
  innerValue: BannerRedirectInterface | BannerMMSInterface;
  item: Array<object>;
}

const StepTargetingOptionalBanner = (Vue as VueConstructor<
  Vue & ComponentData
>).extend({
  name: "StepTargetingOptionalBanner",
  components: {
    SliderRangeWithValidation,
    TargetingLocationSelect,
    TargetingLocationWorkplacesSelect,
    RelationshipViewItem,
    GenderViewItem
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: null
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    attachDropdown: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      innerValue: {},
      item: {}
    };
  },
  computed: {
    age() {
      return this.innerValue?.ages?.[0] || {};
    }
  },
  watch: {
    async age(val) {
      if (!isEqual(val, this.item)) {
        await this.$nextTick();
        this.item = val;
      }
    },
    item(val) {
      if (!isEqual(val, this.age)) {
        if (!isEmpty(val)) {
          this.$set(this.innerValue, "ages", [val]);
        } else {
          this.$set(this.innerValue, "ages", []);
        }
      }
    }
  }
});

export default StepTargetingOptionalBanner;
export type StepTargetingOptionalBannerRef = InstanceType<
  typeof StepTargetingOptionalBanner
>;
</script>
