<template>
  <v-flex xs12 class="noti__sticky">
    <v-alert
      v-if="isPasswordNearExpired"
      type="warning"
      color="warning lighten-1"
      class="ma-0"
      tile
      dismissible
    >
      Mật khẩu của bạn sẽ hết hạn vào ngày {{ passwordExpiredDate }}. Để tránh
      bị khóa tài khoản, vui lòng click vào đây để đổi mật khẩu.
      <nuxt-link to="/profile">Đổi mật khẩu</nuxt-link>
    </v-alert>
    <v-alert
      v-if="isPasswordExpired"
      type="error"
      color="error lighten-1"
      class="ma-0"
      tile
      dismissible
    >
      Mật khẩu của bạn đã hết hạn vào ngày {{ passwordExpiredDate }}. Vui lòng
      đổi mật khẩu để tiếp tục sử dụng chương trình.
    </v-alert>
  </v-flex>
</template>

<script lang="ts">
import menu from "@/api/menu";
import Vue, { VueConstructor } from "vue";
import moment from "moment/src/moment";
import { DATE, SQL_TIMESTAMP } from "~/constants/format";

interface ComponentData {
  title: string;
  rightDrawer: boolean;
  menu: Array<object>;
}

interface ComponentMethods {}

const AppNotification = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  data() {
    return {
      title: "",
      rightDrawer: false,
      menu
    };
  },
  computed: {
    passwordExpiredAt() {
      const passwordUpdatedAt = this.$store.state.auth.user
        ?.password_updated_at;
      if (passwordUpdatedAt) {
        return moment(passwordUpdatedAt, SQL_TIMESTAMP)
          .add(90, "days")
          .startOf("day");
      } else {
        return moment()
          .sub(1, "days")
          .startOfDay();
      }
    },
    passwordExpiredDate() {
      return this.passwordExpiredAt.format(DATE);
    },
    isPasswordNearExpired() {
      return this.$isPasswordNearExpired();
    },
    isPasswordExpired() {
      return this.$isPasswordExpired();
    }
  },
  methods: {}
});

export default AppNotification;
export type AppNotificationRef = InstanceType<typeof AppNotification>;
</script>
<style>
.noti__sticky {
  z-index: 21;
  position: sticky;
  top: 64px;
}
</style>
