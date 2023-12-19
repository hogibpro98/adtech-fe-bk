<template>
  <v-app id="404">
    <template v-if="error.statusCode === 404">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <div class="text-md-center text--icon">
            <h1 class="icon--text">404</h1>
            <h2 class="my-3 headline ">Trang không tồn tại</h2>
            <div>
              <v-btn @click="goHome" color="primary">Về trang chủ</v-btn>
            </div>
          </div>
        </v-layout>
      </v-container>
    </template>
    <template v-if="error.statusCode === 403">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <div class="mr-3 hidden-sm-and-down">
            <img src="@/static/error/403.svg" alt="403" />
          </div>
          <div class="text-md-center text--icon">
            <h1 class="icon--text">403</h1>
            <h2 class="my-3 headline ">Không đủ quyền.</h2>
            <div>
              <v-btn @click="goHome" color="primary">Về trang chủ</v-btn>
            </div>
          </div>
        </v-layout>
      </v-container>
    </template>
    <template v-if="error.statusCode === 500">
      <v-container fluid fill-height>
        <v-layout align-center justify-center row>
          <div class="mr-3 hidden-sm-and-down">
            <img src="@/static/error/500.svg" alt="500" />
          </div>
          <div class="text-md-center icon--text">
            <h1 class="icon--text">500</h1>
            <h2 class="my-3 headline ">Lỗi hệ thống.</h2>
            <div>
              <v-btn @click="goHome" color="primary">Về trang chủ</v-btn>
            </div>
          </div>
        </v-layout>
      </v-container>
    </template>
  </v-app>
</template>

<script>
export default {
  props: ["error"],
  methods: {
    goHome() {
      this.$router.push({ path: "/" });
    }
  },
  layout: "default" // you can set a custom layout for the error page
};
</script>

<style lang="css" scoped>
h1 {
  font-size: 150px;
  line-height: 150px;
  font-weight: 700;
  color: #252932;
  text-shadow: rgba(61, 61, 61, 0.3) 1px 1px, rgba(61, 61, 61, 0.2) 2px 2px,
    rgba(61, 61, 61, 0.3) 3px 3px;
}
</style>
