<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    min-width="400"
    max-width="600"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">Đổi mật khẩu</span>
      </v-card-title>
      <v-card-text>
        Đổi mật khẩu người dùng
        <span class="red--text"> {{ item.username }} </span>
      </v-card-text>
      <v-card-text>
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <v-layout flex wrap>
              <v-flex xs12>
                <v-password-with-validation
                  v-model="item.password"
                  :loading="loading"
                  name="password"
                  type="password"
                  label="Mật khẩu"
                  required
                  rules="required|isPassword|max:200"
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
                  rules="required|confirmed:password|max:200"
                />
              </v-flex>
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
            </v-layout>
          </form>
        </validation-observer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import VPasswordWithValidation from "@/components/common/VPasswordWithValidation.vue";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import {
  DialogInterface,
  FormDialogInterface
} from "~/interface/components/dialog";

const DEFAULT_ITEM = {
  id: null,
  username: "",
  password: ""
};

const UserPasswordDialog = (Vue as VueConstructor<
  Vue & DialogInterface & FormDialogInterface
>).extend({
  name: "UserPasswordDialog",
  components: { VPasswordWithValidation },
  data() {
    return {
      showing: false,
      item: cloneDeep(DEFAULT_ITEM),
      loading: false,
      timeout: null,
      confirmPassword: ""
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.confirmPassword = "";
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    },

    async onSubmit() {
      this.loading = true;
      try {
        const res = await this.$apiAction.updateUserPassword(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.edit_success("mật khẩu người dùng");
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
export default UserPasswordDialog;
export type UserPasswordDialogRef = InstanceType<typeof UserPasswordDialog>;
</script>
