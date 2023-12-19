<template>
  <v-flex offset-md2 md8 class="mt-4">
    <v-row wrap justify="center">
      <v-flex xs6 md8>
        <v-card class="ma-2">
          <v-tabs v-model="tab">
            <v-tab :disabled="isPasswordOnly">Thông tin cá nhân</v-tab>
            <v-tab>Mật khẩu</v-tab>
          </v-tabs>
          <v-card-actions class="pa-4">
            <validation-observer ref="form" class="w-full">
              <v-form @keyup.native.enter="validateAll">
                <template v-if="tab === 0">
                  <user-profile
                    v-model="profile"
                    :loading="loading"
                  ></user-profile>
                  <agency-info
                    v-if="$authHasRole('agency')"
                    key="agency-info"
                    v-model="profile.info"
                    :loading="loading"
                  ></agency-info>
                  <template v-if="$authHasRole('advertiser')">
                    <v-flex xs12>
                      <v-text-field-with-validation
                        :value="profile.agency && profile.agency.full_name"
                        label="Thuộc agency"
                        disabled
                      ></v-text-field-with-validation>
                    </v-flex>
                    <advertiser-info
                      key="advertiser-info"
                      v-model="profile.info"
                      :loading="loading"
                    ></advertiser-info>
                  </template>
                </template>
                <user-password
                  v-else-if="tab === 1"
                  ref="passwordForm"
                  :key="'tab-1'"
                  v-model="profile"
                  :loading="loading"
                >
                </user-password>
              </v-form>
            </validation-observer>
          </v-card-actions>
          <v-layout flex wrap class="px-4 pb-4">
            <v-layout justify-end>
              <v-btn
                :loading="loading"
                color="primary darken-1"
                class="mr-0"
                text
                @click.native="validateAll"
              >
                Cập nhật
              </v-btn>
            </v-layout>
          </v-layout>
        </v-card>
      </v-flex>
    </v-row>
  </v-flex>
</template>

<script lang="ts">
import { cloneDeep, pick } from "lodash";
import AgencyInfo from "@/components/page/profile/AgencyInfo.vue";
import AdvertiserInfo from "@/components/page/profile/AdvertiserInfo.vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation.vue";
import Vue, { VueConstructor } from "vue";
import moment from "moment/src/moment";
import { UserInterface } from "~/interface/data/user";
import { CODE_SUCCESS, HTTP_CODE_422, USER_STATUS } from "~/constants/code";
import UserProfile from "~/components/page/profile/UserProfile.vue";
import UserPassword from "~/components/page/profile/Password.vue";
import { FormInterface } from "~/interface/vee-validate/form";
import { DATE, SQL_TIMESTAMP } from "~/constants/format";

interface ComponentData {
  profile: UserInterface;
  loading: boolean;
  tab: number;
  $refs: {
    form: FormInterface;
    passwordForm: FormInterface;
  };
}

interface ComponentComputed {
  user: UserInterface;
  isActive: boolean;
}

interface ComponentMethods {
  mapUserDetail(): void;

  verifyEmail(): void;

  updateSelfInfo(): void;

  updatePassword(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentComputed & ComponentMethods
>).extend({
  components: {
    VTextFieldWithValidation,
    AdvertiserInfo,
    AgencyInfo,
    UserPassword,
    UserProfile
  },
  layout: "dashboard",
  // @ts-ignore
  permission: false,
  data() {
    return {
      profile: {},
      loading: false,
      tab: 0
    };
  },
  computed: {
    user() {
      return this.$auth.user;
    },

    isActive() {
      return this.$auth.user.status === USER_STATUS.ACTIVE;
    },

    isPasswordOnly() {
      return (
        !this.isActive ||
        this.$isPasswordNearExpired() ||
        this.$isPasswordExpired()
      );
    }
  },
  watch: {
    tab(val) {
      if (this.isPasswordOnly) {
        this.tab = 1;
      }
    }
  },
  created() {
    this.mapUserDetail();
    if (this.isPasswordOnly) {
      this.tab = 1;
    }
  },
  methods: {
    mapUserDetail() {
      const user = cloneDeep(this.user);
      if (user.info) {
        if (user.info.cooperation_proposal_document) {
          user.info.cooperation_proposal_document = JSON.parse(
            user.info.cooperation_proposal_document
          );
        }
        if (user.info.business_registration_document) {
          user.info.business_registration_document = JSON.parse(
            user.info.business_registration_document
          );
        }
        if (user.info.capacity_statement_document) {
          user.info.capacity_statement_document = JSON.parse(
            user.info.capacity_statement_document
          );
        }

        if (user.info.documents) {
          user.info.documents = JSON.parse(user.info.documents);
        }
      }

      this.profile = cloneDeep(user);
    },

    async verifyEmail() {
      try {
        const res = await this.$apiAction.sendVerifyEmail();
        if (res) {
          this.$toast.global.action_success("gửi thư xác thực");
        }
      } catch (e) {
        console.log(e);
      }
    },

    async validateAll() {
      const res = await this.$refs.form.validate();
      if (res !== false) {
        if (this.tab === 0) {
          this.updateSelfInfo();
        } else if (this.tab === 1) {
          this.updatePassword();
        }
      }
    },

    async updateSelfInfo() {
      this.loading = true;
      try {
        this.profile.role_ids = this.profile.roles.map(e => e.id);
        const params = pick(this.profile, [
          "id",
          "username",
          "full_name",
          "email",
          "phone_number"
        ]);
        const res = await this.$apiAction.updateSelfInfo({
          ...params,
          ...this.profile.info,
          role: this.profile.roles[0]?.name
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$emit("update-success");
          this.$toast.global.edit_success("thông tin");
          await this.$auth.fetchUser();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },

    async updatePassword() {
      this.loading = true;
      try {
        let params;
        let res;
        if (!this.isActive) {
          params = pick(this.profile, ["id", "password"]);
          res = await this.$apiAction.createSelfPassword(params);
        } else {
          params = pick(this.profile, ["id", "password", "old_password"]);
          res = await this.$apiAction.updateSelfPassword(params);
        }

        if (res.code === CODE_SUCCESS) {
          this.$emit("update-success");
          this.$auth.strategy.token.set("Bearer " + res.data.token);
          this.$toast.success("Đổi mật khẩu thành công.");
          await this.$nextTick();
          await this.$auth.fetchUser();
          this.$refs.passwordForm.reset();
          this.$refs.form.reset();
          this.loading = false;
          await this.$router.push("/dashboard");
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
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
