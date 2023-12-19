<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    persistent
    :content-class="contentClass"
    scrollable
    max-width="100%"
    no-click-animation
    v-on="$listeners"
  >
    <v-card>
      <v-card-title style="border-bottom: 1px solid #ccc">
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <form
            v-if="showing"
            class="form-input"
            @submit.prevent="handleSubmit(confirm)"
          >
            <v-card-text v-if="!!showing" class="px-2">
              {{ content }}
              <slot v-if="!content" name="content"></slot>
            </v-card-text>
            <v-card-actions>
              <v-layout justify-end>
                <v-btn color="grey" text @click.native="showing = false">{{
                  labelButtonCancel
                }}</v-btn>
                <v-btn
                  v-if="labelButtonConfirm"
                  :loading="loading"
                  color="primary darken-1"
                  type="submit"
                  text
                >
                  {{ labelButtonConfirm }}
                </v-btn>
              </v-layout>
            </v-card-actions>
          </form>
        </validation-observer>
      </v-card-text>
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
  hide: Function;
  confirm: Function;
  setErrors: Function;
}

const ConfirmDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ConfirmDialog",
  props: {
    title: {
      type: String,
      default: "Bạn muốn xóa?"
    },
    content: {
      type: String,
      default: ""
    },
    contentClass: {
      type: String,
      default: "flex xs12 sm8 md6 lg5 xl4"
    },
    labelButtonConfirm: {
      type: String,
      default: "Xác nhận"
    },
    labelButtonCancel: {
      type: String,
      default: "Hủy"
    },
    maxWidth: {
      type: [String, Number],
      default: "600"
    },
    loading: Boolean
  },
  data() {
    return {
      showing: false,
      timeout: null
    };
  },
  watch: {
    showing(val) {
      if (val) {
        this.$emit("shown");
      } else {
        this.timeout = setTimeout(() => {
          this.$refs.form.reset();
        }, 300);
        this.$emit("hidden");
      }
    }
  },
  methods: {
    show() {
      this.showing = true;
    },
    hide() {
      this.showing = false;
    },
    confirm() {
      this.$emit("confirm");
    },
    setErrors(error) {
      this.$refs.form.setErrors(error);
    }
  }
});

export default ConfirmDialog;
export type ConfirmDialogRef = InstanceType<typeof ConfirmDialog>;
</script>
