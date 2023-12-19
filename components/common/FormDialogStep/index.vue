<template>
  <v-dialog
    ref="form"
    v-bind="$attrs"
    v-model="showing"
    :max-width="maxWidth"
    persistent
    fullscreen
    no-click-animation
    scrollable
    v-on="$listeners"
  >
    <v-card tile class="form-dialog-step">
      <v-toolbar flat dark color="primary" class="full-dialog-header">
        <v-layout justify-space-between>
          <v-toolbar-title class="d-flex align-center">
            <template v-if="title">
              {{ title }}
            </template>
            <template v-else>
              <slot name="title"></slot>
            </template>
          </v-toolbar-title>
          <v-btn icon dark @click="showing = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-layout>
      </v-toolbar>
      <v-card-text>
        <v-container class="max-w-full">
          <v-stepper v-model="currentStep" class="flat">
            <v-container class="max-w-full">
              <v-stepper-header class="flat justify-content-center">
                <template v-for="(step, index) in steps">
                  <v-divider
                    v-if="index !== 0 && !step.hiddenTitle"
                    :key="`divider-item-${index}`"
                    class="m-w-3"
                  />
                  <v-stepper-step-custom
                    v-if="!step.hiddenTitle"
                    :key="`stepper-item-${index}`"
                    :complete="stepComplete >= step.index"
                    :is-active="steps[currentStep - 1].index === step.index"
                    :step="step.index"
                  >
                    <div>
                      {{ step.name }}
                    </div>
                  </v-stepper-step-custom>
                </template>
              </v-stepper-header>
            </v-container>
            <v-stepper-items>
              <v-stepper-content
                v-for="(step, index) in steps"
                :key="`step-content-${index}`"
                :step="index + 1"
              >
                <v-container class="no-padding max-w-full">
                  <v-layout column>
                    <v-card-title
                      class="text-center flex align-items-center justify-center pt-0"
                    >
                      {{ step.title }}
                    </v-card-title>
                    <validation-observer v-slot="{ handleSubmit }">
                      <form
                        v-if="showing && currentStep === index + 1"
                        class="form-input"
                        @submit.prevent="handleSubmit(onSubmit)"
                      >
                        <v-container :class="step.classContent">
                          <slot :name="`content-${index + 1}`" />
                          <form-dialog-step-action
                            :label-next="
                              index === steps.length - 1
                                ? labelButtonConfirm
                                : labelButtonNext
                            "
                            :loading="loading"
                            :label-prev="index === 0 ? 'Đóng' : 'Quay lại'"
                            class="footer-action card-background"
                            @prev="prev"
                            @next="next"
                            v-on="$listeners"
                          />
                        </v-container>
                      </form>
                    </validation-observer>
                  </v-layout>
                </v-container>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import FormDialogStepAction from "@/components/common/FormDialogStep/FormDialogStepAction.vue";
import VStepperStepCustom from "@/components/common/VStepperStepCustom.vue";
import { findLastIndex } from "lodash";

interface ComponentData {
  showing: boolean;
  currentStep: number;
  stepComplete: number;
  timeout: number;
}

interface ComponentMethods {
  show(initStep: number): void;
  setStepComplete(index: number): void;
  hidden(): void;
  next(): void;
  prev(): void;
  onSubmit(): void;
}

const FormDialogStep = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FormDialogStep",
  components: { VStepperStepCustom, FormDialogStepAction },
  props: {
    title: {
      type: String,
      required: true
    },
    labelButtonConfirm: {
      type: String,
      required: true
    },
    labelButtonNext: {
      type: String,
      default: "Tiếp theo"
    },
    loading: {
      type: Boolean,
      default: true
    },
    maxWidth: {
      type: [String, Number],
      default: "40%"
    },
    steps: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showing: false,
      currentStep: 1,
      stepComplete: 0,
      timeout: null
    };
  },
  watch: {
    async currentStep(newValue, oldValue) {
      if (newValue && this.steps && newValue < this.steps.length) {
        const stepNext = this.steps[newValue - 1];
        const isNext = newValue > oldValue;
        if (stepNext.disabled) {
          let indexStepAvailable;
          if (isNext) {
            indexStepAvailable = this.steps.findIndex((step, index) => {
              return index + 1 > newValue && !step.disabled;
            });
          } else {
            indexStepAvailable = findLastIndex(this.steps, (step, index) => {
              return index + 1 < newValue && !step.disabled;
            });
          }
          await this.$nextTick();
          if (indexStepAvailable > -1) {
            this.currentStep = indexStepAvailable + 1;
          } else {
            this.currentStep = oldValue;
          }
        }
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(initStep) {
      this.showing = true;
      if (initStep) {
        this.currentStep = initStep;
        const step = this.steps?.[initStep - 2];
        const stepNext = this.steps?.[initStep - 1];
        let stepComplete = 0;
        if (step?.index !== stepNext?.index) {
          stepComplete = step?.index || 0;
        }
        this.stepComplete = stepComplete;
      } else {
        this.currentStep = 1;
        this.stepComplete = 0;
      }
    },
    setStepComplete(index) {
      this.stepComplete = index;
    },
    hidden() {
      this.showing = false;
    },
    next() {
      let stepCompleteNew = 0;
      const step = this.steps?.[this.currentStep - 1];
      const stepNext = this.steps?.[this.currentStep];

      if (stepNext?.index !== step?.index) {
        stepCompleteNew = step.index;
      }

      if (stepCompleteNew > this.stepComplete) {
        this.stepComplete = stepCompleteNew;
      }

      if (this.currentStep < this.steps.length) {
        this.currentStep += 1;
      }
      this.$emit("next", this.currentStep);
    },
    prev() {
      if (this.currentStep > 1) {
        this.currentStep -= 1;
      } else {
        this.hidden();
      }
    },
    onSubmit() {
      this.$emit("on-submit", this.currentStep);
    }
  }
});

export default FormDialogStep;
export type FormDialogStepRef = InstanceType<typeof FormDialogStep>;
</script>
<style lang="scss">
.form-dialog-step {
  .v-stepper,
  .v-stepper__wrapper,
  .v-stepper__items {
    overflow: inherit !important;
  }

  & > .v-card__text {
    padding: 0 !important;
  }

  .footer-action {
    position: sticky;
    bottom: 0;
    //background-color: #fff;
    z-index: 11;
    padding-bottom: 1.2rem;
    margin-left: -1.6rem;
    margin-right: -1.6rem;
  }
}
</style>
