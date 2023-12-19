<template>
  <v-layout flex wrap>
    <v-card-title class="pa-0 pb-4">
      Đổi mật khẩu
    </v-card-title>
    <v-flex xs12>
      <v-password-with-validation
        v-if="isActive"
        v-model="innerValue.old_password"
        :loading="loading"
        name="old_password"
        type="password"
        label="Mật khẩu cũ"
        required
        rules="required"
      />
    </v-flex>
    <v-flex xs12>
      <v-password-with-validation
        v-model="innerValue.password"
        :loading="loading"
        name="password"
        type="password"
        label="Mật khẩu mới"
        required
        rules="required|isPassword"
      />
    </v-flex>
    <v-flex xs12>
      <v-password-with-validation
        v-model="confirmPassword"
        :loading="loading"
        name="confirmPassword"
        type="password"
        label="Xác nhận mật khẩu"
        required
        rules="required|confirmed:password"
      />
    </v-flex>
    <v-alert
      v-if="!isActive"
      type="error"
      class="justify-center w-full mb-0 mt-2"
    >
      Tài khoản của bạn chưa được đặt mật khẩu. Vui lòng đặt mật khẩu để đăng
      nhập và sử dụng dịch vụ.
    </v-alert>
  </v-layout>
</template>

<script lang="ts">
import VPasswordWithValidation from "@/components/common/VPasswordWithValidation.vue";
import Vue from "vue";
import deepWrapper from "~/mixins/deepWrapper";
import { USER_STATUS } from "~/constants/code";

export default Vue.extend({
  name: "UserPassword",
  components: { VPasswordWithValidation },
  mixins: [deepWrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      confirmPassword: ""
    };
  },
  computed: {
    user() {
      return this.$auth.user;
    },
    isActive() {
      return this.$auth.user.status === USER_STATUS.ACTIVE;
    }
  },
  methods: {
    reset() {
      this.innerValue.password = "";
      this.innerValue.old_password = "";
      this.confirmPassword = "";
    }
  }
});
</script>
