<template>
  <v-text-field-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    autocomplete="new-password"
    :type="type"
  >
    <template slot="append">
      <v-tooltip offset-overflow bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            depressed
            text
            dense
            icon
            fab
            x-small
            class="ma-0"
            tabindex="-1"
            v-on="on"
            @click.native="toggleMode"
          >
            <v-icon>{{ icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ tooltip }}</span>
      </v-tooltip>
    </template>
  </v-text-field-with-validation>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation";
import wrapper from "@/mixins/wrapper";

interface ComponentData {
  innerValue: string;
  mode: string;
}

interface ComponentMethods {
  toggleMode(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "VPasswordWithValidation",
  components: { VTextFieldWithValidation },
  mixins: [wrapper],
  props: {},
  data: () => ({
    innerValue: "",
    mode: "hide"
  }),
  computed: {
    type() {
      return this.mode === "hide" ? "password" : "text";
    },
    icon() {
      return this.mode === "hide" ? "visibility" : "visibility_off";
    },
    tooltip() {
      return this.mode === "hide" ? "Hiển thị mật khẩu" : "Ẩn mật khẩu";
    }
  },
  methods: {
    toggleMode() {
      if (this.mode === "hide") {
        this.mode = "show";
      } else {
        this.mode = "hide";
      }
    }
  }
});
</script>
