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
      <v-card-text class="pb-0">
        <slot name="content"></slot>
        <template v-if="!$slots.content">{{ content }}</template>
      </v-card-text>
      <validation-observer ref="form" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <v-card-text class="px-6 pt-0">
            <v-text-area-with-validation
              v-model="reason"
              :loading="loading"
              :counter="counter"
              name="reason"
              label="Lý do từ chối"
              rows="3"
              required
              :rules="rules"
            />

            <v-layout justify-end>
              <v-btn color="grey" text @click.native="showing = false"
                >Hủy</v-btn
              >
              <v-btn
                :loading="loading"
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
import { rules } from "~/util/validation";

interface ComponentData {
  showing: boolean;
  timeout: number;
  reason: string;
  $refs: { form: FormInterface };
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  onSubmit: Function;
}

const RejectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RejectDialog",
  components: { VTextAreaWithValidation },
  props: {
    title: {
      type: String,
      default: "Xác nhận từ chối"
    },
    content: {
      type: String,
      default:
        "Bạn có chắc chắn muốn từ chối? Vui lòng nhập chi tiết lý do từ chối:"
    },
    counter: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      loading: false,
      reason: "",
      showing: false
    };
  },
  computed: {
    rules() {
      return `required|max:${this.counter}`;
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
    show() {
      this.showing = true;
    },
    hide() {
      this.showing = false;
    },
    onSubmit() {
      this.loading = true;
      this.$emit("confirm", this.reason);
    }
  }
});

export default RejectDialog;
export type RejectDialogRef = InstanceType<typeof RejectDialog>;
</script>
