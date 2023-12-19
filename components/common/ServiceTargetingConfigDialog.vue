<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    max-width="100%"
    content-class="flex xs12 sm8 md6 lg5 xl4"
    v-on="$listeners"
  >
    <v-card tile>
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
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <validation-observer ref="form" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <v-card-text class="px-6 pt-0">
            <v-checkbox-with-validation
              v-model="targeting"
              label="Các cột hiển thị"
              required
              multiple
              item-text="text"
              item-value="value"
              layout-class="layout flex wrap"
              checkbox-class="flex-unset flex xs12 lg6 xl4 checkbox-responsive"
              :items="selectableTargeting"
            />

            <v-layout justify-end>
              <v-btn color="grey" text @click.native="showing = false"
                >Hủy</v-btn
              >
              <v-btn color="primary darken-1" class="mr-0" text type="submit">
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
import cloneDeep from "lodash/cloneDeep";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { FormInterface } from "~/interface/vee-validate/form";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";
import { CODE_SUCCESS } from "~/constants/code";
import VCheckboxWithValidation from "~/components/common/VCheckboxWithValidation.vue";
import { TARGETING_SELECT } from "~/constants/dataSelect";

interface ComponentData {
  showing: boolean;
  timeout: number;
  loading: boolean;
  targeting: Array<string>;
  service: string;
  displayName: string;
  $refs: { form: FormInterface };
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  onSubmit: Function;
  fetchServices: Function;
}

const ServiceTargetingConfigDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ServiceTargetingConfigDialog",
  components: { VCheckboxWithValidation },
  props: {},
  data() {
    return {
      loading: false,
      targeting: [],
      service: "mms",
      displayName: "tin nhắn",
      showing: false,
      selectableTargeting: cloneDeep(TARGETING_SELECT)
    };
  },
  computed: {
    title() {
      return `Cấu hình targeting cho dịch vụ ${this.displayName}`;
    }
  },
  watch: {
    showing(val) {
      if (val) {
        this.$emit("shown");
      } else {
        this.loading = false;
        this.$refs.form.reset();
        this.$emit("hidden");
      }
    }
  },
  methods: {
    async show(service = "location", displayName = "vị trí") {
      this.service = service;
      this.displayName = displayName;
      this.showing = true;
      await this.$nextTick();
      const targeting = await this.fetchServices();
      this.targeting = targeting;
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
          `/service-targeting/update-targeting`,
          {
            service: this.service,
            targeting: this.targeting
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
          `/service-targeting/get-targeting`,
          {
            service: this.service
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

export default ServiceTargetingConfigDialog;
export type ServiceTargetingConfigDialogRef = InstanceType<
  typeof ServiceTargetingConfigDialog
>;
</script>
