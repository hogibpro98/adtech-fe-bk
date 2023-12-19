<template>
  <v-container>
    <v-layout justify-center>
      <v-flex xs12 md8 lg6>
        <v-card>
          <v-overlay v-if="loading" absolute color="#fff" class="z-1">
            <v-progress-circular
              :width="4"
              :size="25"
              indeterminate
              color="primary"
            >
            </v-progress-circular>
          </v-overlay>
          <v-card-title>
            Cấu hình chung
          </v-card-title>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form
              class="form-input background"
              @submit.prevent="handleSubmit(apply)"
            >
              <v-layout
                v-if="configs.mms_threshold_agency_notification"
                align-center
                justify-space-between
                class="px-4"
              >
                <span>{{
                  configs.mms_threshold_agency_notification.display_name
                }}</span>
                <v-switch
                  v-model="configs.mms_threshold_agency_notification.value"
                  :readonly="!canEdit"
                ></v-switch>
              </v-layout>
              <v-layout
                v-if="configs.redirect_threshold_agency_notification"
                align-center
                justify-space-between
                class="px-4"
              >
                <span>{{
                  configs.redirect_threshold_agency_notification.display_name
                }}</span>
                <v-switch
                  v-model="configs.redirect_threshold_agency_notification.value"
                  :readonly="!canEdit"
                ></v-switch>
              </v-layout>
              <v-layout
                v-if="configs.min_targeting_age_difference"
                align-center
                justify-space-between
                class="px-4"
              >
                <span>{{
                  configs.min_targeting_age_difference.display_name
                }}</span>
                <v-number-field-with-validation
                  v-model="configs.min_targeting_age_difference.value"
                  name="min_targeting_age_difference"
                  :readonly="!canEdit"
                  reverse
                ></v-number-field-with-validation>
              </v-layout>
              <v-layout
                v-if="configs.max_targeting_age_difference"
                align-center
                justify-space-between
                class="px-4"
              >
                <span>{{
                  configs.max_targeting_age_difference.display_name
                }}</span>
                <v-number-field-with-validation
                  v-model="configs.max_targeting_age_difference.value"
                  name="max_targeting_age_difference"
                  :readonly="!canEdit"
                  :rules="{
                    min_value: configs.min_targeting_age_difference.value
                  }"
                  :label-validation="
                    configs.max_targeting_age_difference.display_name
                  "
                  reverse
                ></v-number-field-with-validation>
              </v-layout>
              <div class="px-4">
                <frequency-input-with-validation
                  v-if="configs.brandname_max_ads_per_phone"
                  v-model="configs.brandname_max_ads_per_phone.value"
                  :readonly="!canEdit"
                  name="brandname_max_ads_per_phone"
                  :label="configs.brandname_max_ads_per_phone.display_name"
                />
              </div>
              <div class="px-4">
                <frequency-input-with-validation
                  v-if="configs.phone_max_ads"
                  v-model="configs.phone_max_ads.value"
                  :readonly="!canEdit"
                  name="brandname_max_ads_per_phone"
                  :label="configs.phone_max_ads.display_name"
                  class="px-4"
                />
              </div>
              <v-card-actions v-if="canEdit">
                <v-layout justify-end>
                  <v-btn
                    color="primary darken-1"
                    text
                    :disabled="loading"
                    @click.prevent="handleSubmit(apply)"
                  >
                    Áp dụng
                  </v-btn>
                </v-layout>
              </v-card-actions>
            </form>
          </validation-observer>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import GlobalDataInterface from "~/interface/data/global";
import { ConfigSystemInterface } from "~/interface/data/config";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import FrequencyInputWithValidation from "~/components/common/FrequencyInputWithValidation.vue";

interface ComponentData extends GlobalDataInterface {
  configs: object;
  loading: boolean;
  $systemConfigRepository: RepositoryInterface;
}

interface ComponentMethods {
  fetchConfig(): void;

  apply(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { FrequencyInputWithValidation, VNumberFieldWithValidation },
  layout: "dashboard",
  data() {
    return {
      configs: {},
      loading: false
    };
  },
  computed: {
    canEdit() {
      return this.$pageCan("edit");
    }
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      this.loading = true;
      const { data } = await this.$systemConfigRepository.all();
      data.forEach(e => {
        this.$set(this.configs, e.name, {
          value: e.value,
          display_name: e.display_name
        });
      });
      this.loading = false;
    },

    async apply() {
      this.loading = true;
      const data = cloneDeep(this.configs);
      try {
        const res = await this.$systemConfigRepository.update(data);
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Lưu thành công.");
          this.$store.dispatch("config/fetchConfig");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
      this.loading = false;
    }
  }
});
</script>
