<template>
  <v-dialog
    v-model="showing"
    tabindex="-1"
    v-bind="$attrs"
    :content-class="contentClass"
    persistent
    scrollable
    no-click-animation
    v-on="$listeners"
  >
    <v-card>
      <v-card-title class="justify-content-center">
        <span class="headline font-weight-medium">{{ title }}</span>
      </v-card-title>
      <div class="pa-0 w-full">
        <validation-observer ref="form" v-slot="{ handleSubmit, errors }">
          <form
            v-if="showing"
            class="form-input background"
            @submit.prevent="handleSubmit(onSubmit)"
          >
            <v-card-text>
              <v-layout flex wrap class="px-4">
                <slot name="content"></slot>
              </v-layout>
            </v-card-text>
            <v-layout
              v-if="$scopedSlots.actions"
              justify-end
              class="mt-2 sticky bottom--1 z-10 background px-8 py-2 border-top"
            >
              <slot name="actions"></slot>
            </v-layout>
            <v-layout
              v-if="!$scopedSlots.actions"
              justify-end
              class="mt-2 sticky bottom--1 z-10 background px-8 py-2 border-top"
            >
              <v-btn color="grey" text @click.native="showing = false">
                Hủy
              </v-btn>
              <v-btn
                :loading="loading"
                color="primary darken-1"
                class="mr-0"
                text
                type="submit"
              >
                {{ labelButtonConfirm }}
              </v-btn>
            </v-layout>
          </form>
        </validation-observer>
      </div>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { FormInterface } from "@/interface/vee-validate/form";

interface ComponentData {
  showing: boolean;
  timeout: number;
  $refs: { form: FormInterface };
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  onSubmit: Function;
  setErrors: Function;
}

const FormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FormDialog",
  props: {
    title: {
      type: String,
      default: ""
    },
    labelButtonConfirm: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: false
    },
    contentClass: {
      type: String,
      default: "flex xs12 sm8 md6 lg5 xl4"
    }
  },
  data() {
    return {
      showing: false,
      timeout: null,
      isDisableButtonConfirm: false
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.timeout = setTimeout(() => {
          this.$refs.form.reset();
          this.$emit("hidden");
        }, 300);
      } else {
        this.$emit("shown");
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    async show() {
      this.showing = true;
      await this.$nextTick();
      this.$refs.form.reset();
    },
    hidden() {
      this.showing = false;
    },
    onSubmit() {
      this.$emit("on-submit");
    },
    setErrors(error) {
      this.$refs.form.setErrors(error);
    }
  }
});

export default FormDialog;
export type FormDialogRef = InstanceType<typeof FormDialog>;
</script>

<style>
.v-window {
  overflow: visible !important;
}
</style>
