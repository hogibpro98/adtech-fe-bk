<template>
  <v-row class="no-margin">
    <v-flex xs12>
      <v-flex xs12>
        <validation-provider
          v-slot="{ errors, valid }"
          rules="required"
          vid="targeting_type"
          name="Đối tượng quảng cáo"
        >
          <v-radio-group
            v-model="innerValue.targeting_type"
            class="radio-hidden-icon"
          >
            <v-radio
              class="no-margin z-1 rounded border-2-transparent"
              value="targeting"
              active-class="radio-card-active"
              :disabled="contentType"
            >
              <template slot="label">
                <v-card class="w-full" elevation="1">
                  <v-row class="pa-5">
                    <v-flex sm2 class="d-flex align-items-center">
                      <v-img
                        contain
                        class="type-icon"
                        src="/icon/targeting.png"
                      ></v-img>
                    </v-flex>
                    <v-flex sm9 class="d-flex align-items-center">
                      <v-card-text
                        class="text-subtitle-1 text--primary no-padding"
                      >
                        Targeting theo điều kiện
                      </v-card-text>
                    </v-flex>
                    <v-flex sm1 class="ma-auto">
                      <v-icon
                        v-if="innerValue.targeting_type === 'targeting'"
                        color="primary"
                      >
                        check
                      </v-icon>
                    </v-flex>
                  </v-row>
                </v-card>
              </template>
            </v-radio>
            <v-radio
              class="no-margin z-1 rounded border-2-transparent no-padding mt-3"
              value="import_file"
              active-class="radio-card-active"
              :disabled="contentType"
            >
              <template slot="label">
                <v-card class="w-full" elevation="1">
                  <v-row class="pa-5">
                    <v-flex sm2 class="d-flex align-items-center">
                      <v-img
                        contain
                        class="type-icon"
                        src="/icon/excel-yellow.png"
                      ></v-img>
                    </v-flex>
                    <v-flex sm9 class="d-flex align-items-center">
                      <v-card-text
                        class="text-subtitle-1 text--primary no-padding"
                      >
                        Tải trực tiếp danh sách thuê bao nhận tin nhắn
                      </v-card-text>
                    </v-flex>
                    <v-flex sm1 class="ma-auto">
                      <v-icon
                        v-if="innerValue.targeting_type === 'import_file'"
                        color="primary"
                      >
                        check
                      </v-icon>
                    </v-flex>
                  </v-row>
                </v-card>
              </template>
            </v-radio>
            <v-radio
              class="no-margin z-1 rounded border-2-transparent no-padding mt-3"
              value="phone_group"
              active-class="radio-card-active"
              :disabled="contentType"
            >
              <template slot="label">
                <v-card class="w-full" elevation="1">
                  <v-row class="pa-5">
                    <v-flex sm2 class="d-flex align-items-center">
                      <v-img
                        contain
                        class="type-icon"
                        src="/icon/excel-yellow.png"
                      ></v-img>
                    </v-flex>
                    <v-flex sm9 class="d-flex align-items-center">
                      <v-card-text
                        class="text-subtitle-1 text--primary no-padding"
                      >
                        Chọn nhóm thuê bao
                      </v-card-text>
                    </v-flex>
                    <v-flex sm1 class="ma-auto">
                      <v-icon
                        v-if="innerValue.targeting_type === 'phone_group'"
                        color="primary"
                      >
                        check
                      </v-icon>
                    </v-flex>
                  </v-row>
                </v-card>
              </template>
            </v-radio>
            <v-radio
              class="no-margin z-1 rounded border-2-transparent no-padding mt-3"
              value="api"
              active-class="radio-card-active"
              :disabled="!contentType && !value.params_file"
            >
              <template slot="label">
                <v-card class="w-full" elevation="1">
                  <v-row class="pa-5">
                    <v-flex sm2 class="d-flex align-items-center">
                      <v-img
                        contain
                        class="type-icon"
                        src="/icon/api_icon.png"
                      ></v-img>
                    </v-flex>
                    <v-flex sm9 class="d-flex align-items-center">
                      <v-card-text
                        class="text-subtitle-1 text--primary no-padding"
                      >
                        Gửi API
                      </v-card-text>
                    </v-flex>
                    <v-flex sm1 class="ma-auto">
                      <v-icon
                        v-if="innerValue.targeting_type === 'api'"
                        color="primary"
                      >
                        check
                      </v-icon>
                    </v-flex>
                  </v-row>
                </v-card>
              </template>
            </v-radio>
          </v-radio-group>
          <error-display :errors="errors"></error-display>
        </validation-provider>
    </v-flex>
  </v-row>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { BannerMMSInterface } from "~/interface/data/banner";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";

export interface ComponentData {
  innerValue: BannerMMSInterface;
}

const StepSelectTypeTargetingBannerMMS = (Vue as VueConstructor<
  Vue & ComponentData
>).extend({
  name: "StepSelectTypeTargetingBannerMMS",
  components: {ErrorDisplay},
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
  }
});

export default StepSelectTypeTargetingBannerMMS;
export type StepSelectTypeTargetingBannerMMSRef = InstanceType<
  typeof StepSelectTypeTargetingBannerMMS
>;
</script>
<style>
.type-icon {
  max-width: 40px;
  height: 35px;
  margin-left: 19px;
}
</style>
