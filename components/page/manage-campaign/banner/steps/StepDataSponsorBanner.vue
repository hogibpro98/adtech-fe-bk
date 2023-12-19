<template>
  <v-row class="no-margin">
    <v-flex sm12 class="mt-4">
      <v-checkbox
        v-model="innerValue.use_data"
        name="use_data"
        label="Tích hợp tài trợ data"
        :false-value="0"
        :true-value="1"
        class="ma-0 pa-0 pt-2 "
      />
    </v-flex>
    <template v-if="innerValue.use_data">
      <v-flex xs12 md6 class="pr-md-2">
        <data-code-select
          v-model="innerValue.data_code"
          name="data_code"
          label="Mã gói cước"
          :return-object="false"
          required
          rules="required"
          @select-item="changeDataCapacity"
        />
      </v-flex>
      <v-flex xs12 md6 class="pl-md-2">
        <v-number-field-with-validation
          v-model="innerValue.data_capacity"
          name="data_capacity"
          readonly
          label="Dung lượng"
          suffix="MB"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <v-number-field-with-validation
          v-model="innerValue.data_trigger_time"
          name="data_trigger_time"
          label="Thời gian bắt đầu hiển thị khảo sát"
          suffix="giây"
          persistent-hint
          hint="Chỉ áp dụng với quảng cáo dạng văn bản hoặc hình ảnh"
        />
      </v-flex>
      <v-flex xs12>
        <survey-select
          v-model="innerValue.questions"
          name="questions"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <sms-template-select
          v-model="innerValue.confirm_sms_template"
          label="Template tin nhắn xác nhận"
          :query-params="{
            select_template_type: 1
          }"
          hint="Tin nhắn này sẽ gửi sau khi thuê bao nhận được data"
          persistent-hint
          name="confirm_sms_template_id"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <frequency-input-with-validation
          v-model="innerValue.max_per_phone"
          label="Tần suất nhận data cho 1 thuê bao"
          name="max_per_phone"
          suffix="lượt"
        />
      </v-flex>
    </template>
    <v-card-subtitle class="no-padding caption text-center mt-2 m-auto">
      <!--      Xem xét những gì bạn đang quảng cáo và nhập trang có liên quan nhất trên-->
      <!--      trang web của bạn. Đây có thể là trang chủ của bạn hoặc một trang cụ thể-->
      <!--      hơn.-->
    </v-card-subtitle>
  </v-row>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation";
import wrapper from "@/mixins/wrapper";
import { BannerRedirectInterface } from "~/interface/data/banner";
import DataCodeSelect from "~/components/select/DataCodeSelect.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import SurveySelect from "~/components/select/SurveySelect.vue";
import SmsTemplateSelect from "~/components/select/SmsTemplateSelect.vue";
import FrequencyInputWithValidation from "~/components/common/FrequencyInputWithValidation.vue";

interface ComponentData {
  innerValue: BannerRedirectInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "StepDataSponsorBanner",
  components: {
    FrequencyInputWithValidation,
    SmsTemplateSelect,
    SurveySelect,
    VNumberFieldWithValidation,
    DataCodeSelect,
    VTextFieldWithValidation
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      innerValue: {}
    };
  },
  methods: {
    async changeDataCapacity(item) {
      await this.$nextTick();
      if (item?.capacity) {
        this.innerValue.data_capacity = item?.capacity;
      }
      await this.$nextTick();
      this.$forceUpdate();
    }
  }
});
</script>
