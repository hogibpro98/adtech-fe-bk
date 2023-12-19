<template>
  <v-dialog v-model="isShow" content-class="flex xs12 sm8 md8 lg6 xl4">
    <validation-observer ref="form" v-slot="{ handleSubmit, errors }">
      <form
        v-if="isShow"
        class="form-input background"
        @submit.prevent="handleSubmit(onSubmit)"
      >
        <v-card>
          <v-card-title>
            Cấu hình Vendor
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="px-8 pt-4">
            <v-row class="align-items-center">
              <v-col class="col-2">
                Trọng số
              </v-col>
              <v-col class="col-10">
                <v-slider
                  v-model="defaultItem.weight"
                  min="1"
                  max="1000"
                  hide-details
                  thumb-label
                >
                  <template slot="append">
                    <v-number-field-with-validation
                      v-model="defaultItem.weight"
                      class="mt-n6 pt-0"
                      style="width: 100px"
                      :decimal="false"
                      min-value="1"
                      max-value="1000"
                      name="Trọng số"
                      rules="max_value:1000|min_value:1"
                      immediate
                    >
                    </v-number-field-with-validation>
                  </template>
                </v-slider>
              </v-col>
            </v-row>
            <v-row class="align-items-center">
              <v-col class="col-2">
                TPS
              </v-col>
              <v-col class="col-10 d-flex align-items-center">
                <v-slider
                  v-model="defaultItem.tps"
                  min="1"
                  max="10000"
                  hide-details
                  thumb-label
                >
                  <template slot="append">
                    <v-number-field-with-validation
                      v-model="defaultItem.tps"
                      class="mt-n6 pt-0"
                      single-line
                      style="width: 100px"
                      :decimal="false"
                      min-value="1"
                      max-value="10000"
                      rules="max_value:10000|min_value:1"
                      name="TPS"
                      immediate
                    >
                    </v-number-field-with-validation>
                  </template>
                </v-slider>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-layout justify-end class="px-2 py-2">
              <v-btn color="grey" text @click="hide">
                Đóng
              </v-btn>
              <v-btn
                :loading="loading"
                color="primary darken-1"
                text
                type="submit"
              >
                Xác nhận
              </v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </form>
    </validation-observer>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
interface ComponentData {
  isShow: boolean;
  weight: number;
  tps: number;
  loading: boolean;
  defaultItem: {
    weight: number;
    tps: number;
  };
}
interface ComponentMethod {
  show(): void;
  hide(): void;
  onSubmit(): void;
}
interface ComponentComputed {}
interface ComponentProp {}
const ConfigVendorDialog = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  name: "ConfigVendorDialog",
  components: { VTextFieldWithValidation, VNumberFieldWithValidation },
  data() {
    return {
      isShow: false,
      weight: 0,
      tps: 0,
      loading: false,
      defaultItem: {
        weight: 0,
        tps: 0
      }
    };
  },
  methods: {
    show(item = null) {
      this.defaultItem = cloneDeep(item);
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
    },
    async onSubmit() {
      this.loading = true;
      try {
        const result = await this.$axios.post(
          "sms-vendor/config",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cấu hình vendor");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
        console.log();
      } finally {
        this.loading = false;
      }
    }
  }
});
export default ConfigVendorDialog;
export type ConfigVendorDialogRef = InstanceType<typeof ConfigVendorDialog>;
</script>

<style scoped></style>
