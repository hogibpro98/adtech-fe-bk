<template>
  <v-row class="no-margin">
    <v-flex xs12>
      <o-s-view-item
        v-model="innerValue.os"
        :attach="attachDropdown"
        :loading="loading"
        label="Hệ điều hành"
      >
      </o-s-view-item>
    </v-flex>
    <v-flex xs12>
      <device-view-item
        v-model="innerValue.devices"
        :attach="attachDropdown"
        :loading="loading"
        label="Thiết bị sử dụng"
      >
      </device-view-item>
    </v-flex>
    <v-flex xs12>
      <targeting-phone-name-select
        v-model="innerValue.phone_names"
        :loading="loading"
        :attach="attachDropdown"
        label="Tên điện thoại sử dụng"
      >
      </targeting-phone-name-select>
    </v-flex>
    <v-flex xs12>
      <network-data-view-item
        v-model="innerValue.network_data"
        :loading="loading"
        :attach="attachDropdown"
        label="Data"
      >
      </network-data-view-item>
    </v-flex>
    <v-flex xs12>
      <service-package-view-item
        v-model="innerValue.service_package"
        :loading="loading"
        :attach="attachDropdown"
        label="Gói cước sử dụng"
      >
      </service-package-view-item>
    </v-flex>
    <v-flex xs12>
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
    <v-flex xs12>
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
    <v-flex xs12>
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
    <v-flex xs12>
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
    <v-card-subtitle class="no-padding caption text-center max-w-2xl m-auto">
      Cung cấp cho chúng tôi thêm thông tin để chúng tôi hiển thị quảng cáo của
      bạn tới mọi người một cách hiệu quả nhất
    </v-card-subtitle>
  </v-row>
</template>
<script lang="ts">
import SliderRangeWithValidation from "@/components/common/SliderRangeWithValidation.vue";
import DeviceViewItem from "@/components/page/manage-campaign/banner/common/DeviceViewItem.vue";
import NetworkDataViewItem from "@/components/page/manage-campaign/banner/common/NetworkDataViewItem.vue";
import OSViewItem from "@/components/page/manage-campaign/banner/common/OSViewItem.vue";
import ServicePackageViewItem from "@/components/page/manage-campaign/banner/common/ServicePackageViewItem.vue";
import TargetingPhoneNameSelect from "@/components/select/TargetingPhoneNameSelect.vue";
import wrapper from "@/mixins/wrapper";
import { isEqual } from "lodash";
import Vue, { VueConstructor } from "vue";
import { isEmpty } from "~/util/typeof";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { SliderDataInterface } from "~/interface/data/banner";

interface ComponentData {
  innerValue: BannerRedirectInterface | BannerMMSInterface;
  simAgeData: SliderDataInterface;
  simAge: SliderDataInterface;
  dataFeeData: SliderDataInterface;
  dataFee: SliderDataInterface;
  phoneFeeData: SliderDataInterface;
  phoneFee: SliderDataInterface;
  arpuData: SliderDataInterface;
  arpu: SliderDataInterface;
  $adsConfigRepository: RepositoryInterface;
}

interface ComponentMethod {}

const StepTargetingAdvanceBanner = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepTargetingAdvanceBanner",
  components: {
    SliderRangeWithValidation,
    ServicePackageViewItem,
    NetworkDataViewItem,
    DeviceViewItem,
    TargetingPhoneNameSelect,
    OSViewItem
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
    attachDropdown: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      innerValue: {},
      simAgeData: {},
      dataFeeData: {},
      phoneFeeData: {},
      arpuData: {}
    };
  },
  computed: {
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
  }
});

export default StepTargetingAdvanceBanner;
export type StepTargetingAdvanceBannerRef = InstanceType<
  typeof StepTargetingAdvanceBanner
>;
</script>
