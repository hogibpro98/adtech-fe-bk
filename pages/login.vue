<template>
  <v-app id="login" class="primary">
    <v-main class="login-background">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm10 md8 lg5 xl4>
            <v-card class="elevation-1 pa-3" light>
              <v-card-text>
                <a
                  ref="image"
                  class="layout column align-center my-4"
                  href="javascript:;"
                >
                  <img src="/logo.png" alt="VDA" height="120px" />
                </a>
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
                  <v-form ref="form" @keyup.native.enter="validateAll">
                    <v-text-field-with-validation
                      ref="loginInput"
                      v-model="model.username"
                      :loading="loading"
                      append-icon="person"
                      name="login"
                      type="text"
                      label="Tên tài khoản"
                      rules="required"
                    >
                    </v-text-field-with-validation>
                    <v-text-field-with-validation
                      id="password"
                      ref="passwordInput"
                      v-model="model.password"
                      :loading="loading"
                      append-icon="lock"
                      name="password"
                      label="Mật khẩu"
                      type="password"
                      rules="required"
                    ></v-text-field-with-validation>
                  </v-form>
                </validation-observer>
              </v-card-text>
              <v-card-actions class="layout flex wrap justify-content-center">
                <nuxt-link to="/password-reset" class="mx-2">
                  <v-btn color="blue darken-1" text>
                    Quên mật khẩu
                  </v-btn>
                </nuxt-link>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="goToRegistration">
                  Đăng ký
                </v-btn>
                <v-btn
                  id="login-btn"
                  :loading="loading"
                  color="blue white--text"
                  @click="validateAll"
                  >Đăng nhập
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
import { TIME_GET_PERMISSIONS } from "@/constants/keyStoreAuth";
import Vue, { VueConstructor } from "vue";
import { rules } from "~/util/validation";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import GlobalDataInterface from "~/interface/data/global";
// import {internalIpV4Sync} from 'internal-ip';

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
  model: {
    username: string;
    password: string;
  };
  rules: Array<string>;
}

interface ComponentMethods {
  goToRegistration(): void;
  checkIsLoggedIn(): void;
  goToQuery(): void;
  validateAll(): void;
  errorMsg(): void;
  login(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "Login",
  components: { VTextFieldWithValidation },
  layout: "default",
  data: () => ({
    loading: false,
    model: {
      username: "",
      password: ""
    },
    rules,
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
  created() {
    this.checkIsLoggedIn();
    // console.log(internalIpV4Sync());
  },

  async mounted() {
    // Case social login error
    if (this.$route.query.error) {
      this.error = this.$route.query.error;
    }
    await this.$nextTick();
    const labels = document.getElementsByTagName("label");
    for (const label of labels) {
      label.classList.add("v-label--active");
    }
  },

  methods: {
    goToRegistration() {
      this.$router.push("/registration");
    },

    checkIsLoggedIn() {
      if (this.$auth.loggedIn) {
        this.goToQuery();
      }
    },

    async goToQuery() {
      const next = this.$route.query.redirect || "/";
      await this.$router.push(next);
    },

    async validateAll() {
      const res = await this.$refs.obs.validate();
      if (res) {
        this.login();
      }
    },

    errorMsg(code) {
      switch (parseInt(code, 10)) {
        case 432:
          return "Tài khoản của bạn chưa được xét duyệt. Kết quả xét duyệt sẽ được gửi qua email sủ dụng đăng ký";
        case 429:
          return "Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 5 phút";
        case 401:
          return "Thông tin đăng nhập không đúng.";
        default:
          return "Có lỗi xảy ra.";
      }
    },

    async login() {
      try {
        this.loading = true;
        this.$auth.$storage.removeState("permissions");
        this.$auth.$storage.removeState(TIME_GET_PERMISSIONS);
        await this.$auth.login({
          data: {
            username: this.model.username,
            password: this.model.password
          }
        });

        this.loading = false;

        this.goToQuery();
      } catch (e) {
        this.loading = false;
        this.error = this.errorMsg(e.response.status);
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
