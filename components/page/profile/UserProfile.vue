<template>
  <v-layout flex wrap>
    <v-card-title class="pa-0 pb-4">
      Thông tin cá nhân
    </v-card-title>
    <v-flex xs12>
      <v-text-field-with-validation
        v-model="innerValue.username"
        :loading="loading"
        name="username"
        type="text"
        label="Tên tài khoản"
        required
        :disabled="!readonly"
        readonly
        rules="required|min:4|max:128|isUsername"
      />
    </v-flex>
    <v-flex xs12>
      <v-text-field-with-validation
        v-model="innerValue.full_name"
        :loading="loading"
        :label="isBusiness ? 'Tên doanh nghiệp' : 'Họ tên'"
        :readonly="readonly"
        name="full_name"
        type="text"
        required
        rules="required|max:255"
      />
    </v-flex>
    <v-flex xs12>
      <v-text-field-with-validation
        v-model="innerValue.email"
        :loading="loading"
        :disabled="!readonly"
        readonly
        name="email"
        type="text"
        label="Email"
        required
        rules="required|email|max:255"
      />
    </v-flex>

    <v-flex xs12>
      <v-text-field-with-validation
        v-model="innerValue.phone_number"
        :loading="loading"
        :readonly="readonly"
        name="phone_number"
        type="text"
        label="Số điện thoại"
        rules="min:9|max:12"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import { ROLE_ADVERTISER, ROLE_AGENCY } from "@/constants/role";
import RoleSelect from "~/components/select/RoleSelect";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import deepWrapper from "~/mixins/deepWrapper";
export default {
  name: "UserProfile",
  components: { VTextFieldWithValidation, RoleSelect },
  mixins: [deepWrapper],
  props: {
    value: {
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isBusiness() {
      return (
        this.innerValue.roles?.length > 0 &&
        (this.innerValue.roles[0].name === ROLE_AGENCY ||
          this.innerValue.roles[0].name === ROLE_ADVERTISER)
      );
    }
  },
  mounted() {
    this.innerValue.password = "";
  }
};
</script>
