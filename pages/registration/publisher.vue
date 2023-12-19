<template>
  <v-app id="publisher" class="primary">
    <v-main class="login-background">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm10 md8 lg5 xl4>
            <v-card class="elevation-1 pa-3" light>
              <v-card-text>
                <div class="layout column align-center my-4">
                  <img src="/logo.png" alt="VDA" height="120px" />
                </div>
                <h2 class="flex my-6 blue--text text-center">
                  Đăng ký publisher
                </h2>
                <validation-observer ref="form">
                  <v-form @keyup.native.enter="validateAll">
                    <v-layout flex wrap>
                      <v-flex xs12 class="px-2">
                        <v-text-field-with-validation
                          v-model="item.username"
                          :loading="loading"
                          name="username"
                          type="text"
                          label="Tên tài khoản"
                          required
                          rules="required|min:4|max:128|isUsername"
                        />
                      </v-flex>
                      <v-flex xs12 class="px-2">
                        <v-text-field-with-validation
                          v-model="item.full_name"
                          :loading="loading"
                          name="full_name"
                          type="text"
                          label="Tên doanh nghiệp"
                          required
                          rules="required|max:255"
                        />
                      </v-flex>
                      <v-flex xs12 class="px-2">
                        <v-text-field-with-validation
                          v-model="item.email"
                          :loading="loading"
                          name="email"
                          type="text"
                          label="Email"
                          required
                          rules="required|email|max:255"
                        />
                      </v-flex>
                      <v-flex xs12 class="px-2">
                        <v-text-field-with-validation
                          v-model="item.phone_number"
                          :loading="loading"
                          name="phone_number"
                          type="text"
                          required
                          label="Số điện thoại"
                          rules="min:9|max:12|required"
                        />
                      </v-flex>
                    </v-layout>
                  </v-form>
                </validation-observer>
              </v-card-text>
              <v-card-actions class="layout flex wrap justify-content-center">
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="goToLogin">
                  <v-icon>
                    keyboard_backspace
                  </v-icon>
                  Trở lại đăng nhập
                </v-btn>
                <v-btn
                  :loading="loading"
                  color="blue"
                  class="white--text"
                  @click="validateAll"
                  >Đăng ký
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { DOCUMENT } from "~/constants/fileType";
import GlobalDataInterface from "~/interface/data/global";
import { UserInterface } from "~/interface/data/user";
import { FormInterface } from "~/interface/vee-validate/form";
import { ROLE_PUBLISHER } from "~/constants/role";

const DEFAULT_ITEM = {
  username: "",
  full_name: "",
  email: "",
  phone_number: "",
};

interface ComponentData extends GlobalDataInterface {
  showing: boolean;
  loading: boolean;
  item: UserInterface;
  confirmPassword: string;
  acceptFileTypes: Array<string>;
  $refs: {
    form: FormInterface;
  };
}

interface ComponentMethods {
  goToLogin(): void;

  validateAll(): void;

  register(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    VTextFieldWithValidation
  },
  layout: "default",
  data() {
    return {
      showing: false,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      confirmPassword: "",
      acceptFileTypes: DOCUMENT
    };
  },
  computed: {
    taxNumberRule() {
      return {
        required: true,
        max: 100,
        isTaxNumber: true
      };
    }
  },
  methods: {
    goToLogin() {
      this.$router.push("/login");
    },

    async validateAll() {
      const res = await this.$refs.form.validate();
      if (res) {
        this.register();
      }
    },

    mapData() {
      this.item.role = ROLE_PUBLISHER;
      this.item.services = ["redirect"];
    },

    async register() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$axios.$post(
          "auth/user/register/publisher",
          this.item
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Đăng ký thành công");
          this.$router.push("/login");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    }
  }
});
</script>

<style lang="scss">
.login-background {
  background: linear-gradient(
    184.34deg,
    #2fa9ed -13.04%,
    #024eb9 101.67%,
    rgba(32, 116, 230, 0) 101.69%
  );
}

.registration-upload {
  .v-transmit__upload-area {
    min-height: unset;
    height: 144px;
  }

  &.theme--light {
    background-color: #fff !important;
  }
}
</style>
