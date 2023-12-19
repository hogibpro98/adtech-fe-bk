<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    max-width="100%"
    content-class="flex xs12 sm8 md6 lg5 xl4"
    scrollable
    v-on="$listeners"
  >
    <v-card tile>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <validation-observer ref="form" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <v-card-text class="px-6 pt-0">
            <service-checkbox
              :text-value.sync="services"
              :loading="loading"
              name="services"
              label="Dịch vụ sử dụng"
            />

            <v-layout justify-end>
              <v-btn color="grey" text @click.native="showing = false"
                >Hủy</v-btn
              >
              <v-btn
                color="primary darken-1"
                class="mr-0"
                text
                type="submit"
              >
                Xác nhận
              </v-btn>
            </v-layout>
          </v-card-text>
        </form>
      </validation-observer>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { FormInterface } from "~/interface/vee-validate/form";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";
import { CODE_SUCCESS } from "~/constants/code";

interface ComponentData {
  showing: boolean;
  timeout: number;
  loading: boolean;
  services: Array<string>;
  targeting: string;
  displayName: string;
  $refs: { form: FormInterface };
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  onSubmit: Function;
  fetchServices: Function;
}

const TargetingConfigDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TargetingConfigDialog",
  components: { ServiceCheckbox },
  props: {},
  data() {
    return {
      loading: false,
      services: [],
      targeting: "location",
      displayName: "vị trí",
      showing: false
    };
  },
  computed: {
    title() {
      return `Dịch vụ sử dụng targeting ${this.displayName}`;
    }
  },
  watch: {
    showing(val) {
      if (val) {
        this.$emit("shown");
      } else {
        this.loading = false;
        this.reason = "";
        this.$refs.form.reset();
        this.$emit("hidden");
      }
    }
  },
  methods: {
    async show(targeting = "location", displayName = "vị trí") {
      this.targeting = targeting;
      this.displayName = displayName;
      this.showing = true;
      await this.$nextTick();
      const services = await this.fetchServices();
      this.services = services;
    },
    hide() {
      this.showing = false;
      this.services = [];
    },
    onSubmit() {
      this.updateServices();
    },
    async updateServices() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(
          `/service-targeting/update-service`,
          {
            targeting: this.targeting,
            services: this.services
          }
        );
        if (data.code === CODE_SUCCESS) {
          this.$toast.global.action_success("điều chỉnh cấu hình targeting");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
      }
      this.loading = false;
    },
    async fetchServices() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(
          `/service-targeting/get-service`,
          {
            targeting: this.targeting
          }
        );
        this.loading = false;
        return data.data || [];
      } catch (e) {}
      this.loading = false;
      return [];
    }
  }
});

export default TargetingConfigDialog;
export type TargetingConfigDialogRef = InstanceType<
  typeof TargetingConfigDialog
>;
</script>
