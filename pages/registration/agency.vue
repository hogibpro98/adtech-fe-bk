<template>
  <v-app id="registration" class="primary">
    <v-main class="login-background">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 lg8>
            <v-card class="elevation-1 pa-3" light>
              <v-card-text>
                <div class="layout column align-center my-4">
                  <img src="/logo.png" alt="VDA" height="120px" />
                </div>
                <h2 class="flex my-6 blue--text text-center">Đăng ký agency</h2>
                <validation-observer ref="form">
                  <v-form @keyup.native.enter="validateAll">
                    <v-layout flex wrap>
                      <v-flex lg5>
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
                            v-model="item.representative"
                            :loading="loading"
                            name="representative"
                            type="text"
                            label="Người đại diện"
                            required
                            rules="required|max:100"
                          />
                        </v-flex>
                        <v-flex xs12 class="px-2">
                          <v-text-field-with-validation
                            v-model="item.tax_no"
                            :loading="loading"
                            name="tax_no"
                            type="text"
                            label="Mã số thuế"
                            required
                            :rules="taxNumberRule"
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
                            rules="max:15|numeric|required"
                          />
                        </v-flex>
                        <v-flex xs12 class="px-2">
                          <v-text-area-with-validation
                            v-model="item.address"
                            :loading="loading"
                            :counter="500"
                            name="address"
                            label="Địa chỉ"
                            rows="3"
                            required
                            rules="required|max:500"
                          />
                        </v-flex>
                        <v-flex xs12 class="px-2">
                          <service-checkbox
                            v-model="item.services"
                            name="services"
                            required
                            rules="required"
                            has-plan
                          />
                        </v-flex>
                      </v-flex>
                      <v-flex lg7>
                        <v-flex xs12 class="px-2 py-2">
                          <file-upload
                            v-model="item.cooperation_proposal_document"
                            :accept="acceptFileTypes"
                            label="Công văn đề xuất hợp tác"
                            required
                            class="registration-upload theme--light"
                            name="cooperation_proposal_document"
                            height="150px"
                            return-object
                            rules="required"
                          ></file-upload>
                        </v-flex>
                        <v-flex xs12 class="px-2 py-2">
                          <file-upload
                            v-model="item.business_registration_document"
                            :accept="acceptFileTypes"
                            label="Đăng ký kinh doanh"
                            required
                            class="registration-upload theme--light"
                            name="business_registration_document"
                            height="150px"
                            return-object
                            rules="required"
                          ></file-upload>
                        </v-flex>
                        <v-flex xs12 class="px-2 py-2">
                          <file-upload
                            v-model="item.capacity_statement_document"
                            :accept="acceptFileTypes"
                            label="Hồ sơ năng lực"
                            required
                            name="capacity_statement_document"
                            class="registration-upload theme--light"
                            height="150px"
                            return-object
                            rules="required"
                          ></file-upload>
                        </v-flex>
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
import FileUpload from "~/components/common/FileUpload/index.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { DOCUMENT } from "~/constants/fileType";
import GlobalDataInterface from "~/interface/data/global";
import { UserInterface } from "~/interface/data/user";
import { FormInterface } from "~/interface/vee-validate/form";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";

const DEFAULT_ITEM = {
  username: "",
  full_name: "",
  email: "",
  tax_no: "",
  phone_number: "",
  password: "",
  address: "",
  representative: "",
  business_registration_document: null,
  cooperation_proposal_document: null,
  capacity_statement_document: null,
  services: {}
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
    ServiceCheckbox,
    VTextAreaWithValidation,
    FileUpload,
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

    async register() {
      this.loading = true;
      try {
        const res = await this.$apiAction.register(this.item);
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
