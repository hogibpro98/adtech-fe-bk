<template>
  <v-row class="no-margin">
    <v-overlay v-if="loadingTargeting" color="#fff" class="z-1">
      <v-progress-circular :width="4" :size="25" indeterminate color="primary">
      </v-progress-circular>
    </v-overlay>
    <v-flex v-if="hasTargeting('age')" xs12 class="mb-0 mt-5">
      <slider-range-with-validation
        v-model="item"
        :loading="loading"
        :min="0"
        :max="120"
        :rules="ageRules"
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
    <v-flex v-if="hasTargeting('location')" xs12>
      <targeting-location-select
        v-model="innerValue"
        :loading="loading"
        :attach="attachDropdown"
        label="Khu vực nhà"
      >
      </targeting-location-select>
    </v-flex>
    <v-flex v-if="hasTargeting('location')" xs12>
      <targeting-location-workplaces-select
        v-model="innerValue"
        :loading="loading"
        :attach="attachDropdown"
        label="Khu vực làm việc"
      >
      </targeting-location-workplaces-select>
    </v-flex>
    <v-flex v-if="hasTargeting('gender')" xs12 class="mt-2">
      <gender-view-item
        v-model="innerValue.genders"
        :loading="loading"
        :attach="attachDropdown"
        label="Giới tính"
      >
      </gender-view-item>
    </v-flex>
    <v-flex v-if="hasTargeting('relationship')" xs12 class="mt-2">
      <relationship-view-item
        v-model="innerValue.relationships"
        :loading="loading"
        :attach="attachDropdown"
        label="Tình trạng hôn nhân"
      >
      </relationship-view-item>
    </v-flex>
    <v-flex v-if="hasTargeting('os')" xs12>
      <o-s-view-item
        v-model="innerValue.os"
        :attach="attachDropdown"
        :loading="loading"
        label="Hệ điều hành"
      >
      </o-s-view-item>
    </v-flex>
    <v-flex v-if="hasTargeting('device')" xs12>
      <device-view-item
        v-model="innerValue.devices"
        :attach="attachDropdown"
        :loading="loading"
        label="Thiết bị sử dụng"
      >
      </device-view-item>
    </v-flex>
    <v-flex v-if="hasTargeting('phone-name')" xs12>
      <targeting-phone-name-select
        v-model="innerValue.phone_names"
        :loading="loading"
        :attach="attachDropdown"
        label="Tên điện thoại sử dụng"
      >
      </targeting-phone-name-select>
    </v-flex>
    <v-flex v-if="hasTargeting('network-data')" xs12>
      <network-data-view-item
        v-model="innerValue.network_data"
        :loading="loading"
        :attach="attachDropdown"
        label="Data"
      >
      </network-data-view-item>
    </v-flex>
    <v-flex v-if="hasTargeting('service-package')" xs12>
      <service-package-view-item
        v-model="innerValue.service_package"
        :loading="loading"
        :attach="attachDropdown"
        label="Gói cước sử dụng"
      >
      </service-package-view-item>
    </v-flex>
    <v-flex v-if="hasTargeting('sim-age')" xs12>
      <slider-range-with-validation
        v-model="simAgeData"
        :loading="loading"
        :min="0"
        :max="60"
        :props-input1="{
          'label-validation': 'Tuổi thuê bao nhỏ nhất'
        }"
        :props-input2="{
          'label-validation': 'Tuổi thuê bao lớn nhất'
        }"
        name="sim-age"
        label="Tuổi thuê bao"
        unit="năm"
      />
    </v-flex>
    <v-flex v-if="hasTargeting('data-fee')" xs12>
      <slider-range-with-validation
        v-model="dataFeeData"
        :loading="loading"
        :min="0"
        :max="100000000"
        :props-input1="{
          suffix: '₫',
          class: 'm-w-10',
          'label-validation': 'Tiêu dùng data tối thiếu'
        }"
        :props-input2="{
          suffix: '₫',
          class: 'm-w-10',
          'label-validation': 'Tiêu dùng data tối đa'
        }"
        :thumb-size="40"
        name="data-fee"
        label="Tiêu dùng data"
      />
    </v-flex>
    <v-flex v-if="hasTargeting('phone-fee')" xs12>
      <slider-range-with-validation
        v-model="phoneFeeData"
        :loading="loading"
        :min="0"
        :max="100000000"
        :props-input1="{
          suffix: '₫',
          class: 'm-w-10',
          'label-validation': 'Tiêu dùng thoại tối thiếu'
        }"
        :props-input2="{
          suffix: '₫',
          class: 'm-w-10',
          'label-validation': 'Tiêu dùng thoại tối đa'
        }"
        :thumb-size="40"
        name="phone-fee"
        label="Tiêu dùng thoại"
      />
    </v-flex>
    <v-flex v-if="hasTargeting('arpu')" xs12>
      <slider-range-with-validation
        v-model="arpuData"
        :loading="loading"
        :min="0"
        :max="100000000"
        :props-input1="{
          suffix: '₫',
          class: 'm-w-10',
          'label-validation': 'Tiêu dùng trung bình tối thiểu'
        }"
        :props-input2="{
          suffix: '₫',
          class: 'm-w-10',
          'label-validation': 'Tiêu dùng trung bình tối đa'
        }"
        :thumb-size="40"
        name="arpu"
        label="Tiêu dùng trung bình"
      />
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
import OSViewItem from "~/components/page/manage-campaign/banner/common/OSViewItem.vue";
import DeviceViewItem from "~/components/page/manage-campaign/banner/common/DeviceViewItem.vue";
import TargetingPhoneNameSelect from "~/components/select/TargetingPhoneNameSelect.vue";
import NetworkDataViewItem from "~/components/page/manage-campaign/banner/common/NetworkDataViewItem.vue";
import ServicePackageViewItem from "~/components/page/manage-campaign/banner/common/ServicePackageViewItem.vue";

interface ComponentData {
  innerValue: BannerRedirectInterface | BannerMMSInterface;
  item: Array<object>;
  usableTargeting: Array<string>;
  fetchTargeting: Function;
}

const StepTargetingBannerVendor = (Vue as VueConstructor<
  Vue & ComponentData
>).extend({
  name: "StepTargetingBannerVendor",
  components: {
    ServicePackageViewItem,
    NetworkDataViewItem,
    TargetingPhoneNameSelect,
    DeviceViewItem,
    OSViewItem,
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
      usableTargeting: [],
      item: {},
      simAgeData: {},
      dataFeeData: {},
      phoneFeeData: {},
      arpuData: {},
      loadingTargeting: false
    };
  },
  computed: {
    ageRules() {
      const rules = {};
      if (this.$store.state.config?.config?.min_targeting_age_difference) {
        rules.rangeMinDifferent = this.$store.state.config.config.min_targeting_age_difference;
      }
      if (this.$store.state.config?.config?.max_targeting_age_difference) {
        rules.rangeMaxDifferent = this.$store.state.config.config.max_targeting_age_difference;
      }
      return rules;
    },
    age() {
      return this.innerValue?.ages?.[0] || {};
    },
    simAge() {
      return this.innerValue.sim_ages && this.innerValue.sim_ages[0];
    },
    dataFee() {
      return (this.innerValue.data_fee && this.innerValue.data_fee[0]) || {};
    },
    phoneFee() {
      return (this.innerValue.phone_fee && this.innerValue.phone_fee[0]) || {};
    },
    arpu() {
      return (this.innerValue.arpu && this.innerValue.arpu[0]) || {};
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
    },
    async simAge(val) {
      await this.$nextTick();
      if (!isEqual(val, this.simAgeData)) {
        this.simAgeData = val || {};
      }
    },
    async dataFee(val) {
      await this.$nextTick();
      if (!isEqual(val, this.dataFeeData)) {
        this.dataFeeData = val || {};
      }
    },
    async phoneFee(val) {
      await this.$nextTick();
      if (!isEqual(val, this.phoneFeeData)) {
        this.phoneFeeData = val || {};
      }
    },
    async arpu(val) {
      await this.$nextTick();
      if (!isEqual(val, this.arpuData)) {
        this.arpuData = val || {};
      }
    },
    simAgeData(val) {
      if (!isEqual(val, this.simAge)) {
        if (!isEmpty(val)) {
          this.$set(this.innerValue, "sim_ages", [val]);
        } else {
          this.$set(this.innerValue, "sim_ages", []);
        }
      }
    },
    dataFeeData(val) {
      if (!isEqual(val, this.dataFee)) {
        if (!isEmpty(val)) {
          this.$set(this.innerValue, "data_fee", [val]);
        } else {
          this.$set(this.innerValue, "data_fee", []);
        }
      }
    },
    phoneFeeData(val) {
      if (!isEqual(val, this.phoneFee)) {
        if (!isEmpty(val)) {
          this.$set(this.innerValue, "phone_fee", [val]);
        } else {
          this.$set(this.innerValue, "phone_fee", []);
        }
      }
    },
    arpuData(val) {
      if (!isEqual(val, this.arpu)) {
        if (!isEmpty(val)) {
          this.$set(this.innerValue, "arpu", [val]);
        } else {
          this.$set(this.innerValue, "arpu", []);
        }
      }
    }
  },
  created() {
    this.fetchTargeting();
  },
  methods: {
    async fetchTargeting() {
      this.loadingTargeting = true;
      try {
        const { data } = await this.$axios.post(
          `/service-targeting/get-targeting`,
          {
            service: "sms-vendor"
          }
        );

        this.usableTargeting = data.data || [];
      } catch (e) {
        this.usableTargeting = [];
      }
      this.loadingTargeting = false;
    },
    hasTargeting(targeting) {
      return this.usableTargeting.includes(targeting);
    }
  }
});

export default StepTargetingBannerVendor;
export type StepTargetingBannerVendorRef = InstanceType<
  typeof StepTargetingBannerVendor
>;
</script>
