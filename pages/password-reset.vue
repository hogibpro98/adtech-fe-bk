<template>
  <v-app id="login" class="primary">
    <v-main class="login-background">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 lg4>
            <v-card class="elevation-1 pa-3" light>
              <v-card-text>
                <div class="layout column align-center my-4">
                  <img src="/logo.png" alt="VDA" height="120px" />
                </div>
                <h3 class="text-center">Đặt lại mật khẩu</h3>

                <div v-if="error" class="layout column align-center">
                  <v-alert
                    :value="true"
                    outlined
                    class="w-full mb-2"
                    color="error"
                    icon="warning"
                  >
                    {{ error }}
                  </v-alert>
                </div>
                <validation-observer ref="obs">
                  <v-form
                    ref="form"
                    onsubmit="return false"
                    @keyup.native.enter="validateAll"
                  >
                    <v-text-field-with-validation
                      v-model="item.email"
                      :loading="loading"
                      name="email"
                      type="text"
                      label="Email"
                      hint="Nhập email tài khoản cần đặt lại mật khẩu"
                      persistent-hint
                      required
                      rules="required|email"
                    />
                  </v-form>
                </validation-observer>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="goToLogin"
                >
                  <v-icon>
                    keyboard_backspace
                  </v-icon>
                  Trở lại
                </v-btn>
                <v-btn
                  id="login-btn"
                  :loading="loading"
                  color="primary"
                  @click="validateAll"
                  >Xác nhận</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import GlobalDataInterface from "~/interface/data/global";
import { UserInterface } from "~/interface/data/user";
import { FormInterface } from "~/interface/vee-validate/form";

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
  item: UserInterface;
  $refs: {
    obs: FormInterface;
  };
}

interface ComponentMethods {
  goToLogin(): void;
  validateAll(): void;
  resetPassword(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "Login",
  components: { VTextFieldWithValidation },
  layout: "default",
  data: () => ({
    loading: false,
    item: {
      email: ""
    },
    error: null
  }),

  watch: {
    model: {
      handler() {
        this.error = null;
      },
      deep: true
    }
  },

  mounted() {
    // Case social login error
  },

  methods: {
    goToLogin() {
      this.$router.push("/login");
    },

    async validateAll() {
      const res = await this.$refs.obs.validate();
      if (res) {
        this.resetPassword();
      }
    },

    async resetPassword() {
      this.loading = true;
      try {
        const res = await this.$apiAction.resetPassword(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Đã gửi email thành công");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.obs.setErrors(e.response.data.errors);
        }
      }
    }
  }
});
</script>
<style lang="css">
#login {
  height: 50%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  z-index: 0;
}

#login-btn {
  width: 40%;
}

.login-background {
  background: linear-gradient(
    184.34deg,
    #2fa9ed -13.04%,
    #024eb9 101.67%,
    rgba(32, 116, 230, 0) 101.69%
  );
}
</style>
