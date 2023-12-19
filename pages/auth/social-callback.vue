<template>
  <div class="container">
    <div class="loader"></div>
    <p>Đang thực hiện đăng nhập, vui lòng chờ trong giây lát</p>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { GlobalDataInterface } from "../../interface/data/global";

interface ComponentData extends GlobalDataInterface {
  token: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  auth: false,
  data() {
    return {
      token: this.$route.query.token ? this.$route.query.token : null
    };
  },
  async created() {
    await this.$cancelAllRequest();

    console.log("clear", this.$auth.strategy.token.get());
    this.$auth.strategy.token.reset();
    localStorage.clear();
    await this.$nextTick();
    this.$auth.strategy.token.set("Bearer " + this.token);
    this.$auth.setStrategy("local");
    await this.$nextTick();
    console.log("new token", this.$auth.strategy.token.get());

    this.$auth
      .fetchUser()
      .then(() => {
        return this.$router.push("/");
      })
      .catch(e => {
        console.log(e);
        // this.$logout();
        const error = this.$route.query.error || "Có lỗi xảy ra";
        return this.$router.push(
          `/${
            this.$route.query.origin ? this.$route.query.origin : "login"
          }?error=${error}`
        );
      });
  }
});
</script>

<style lang="scss" scoped>
.container {
  text-align: center;
}

.loader {
  margin: 20px auto;
  border: 8px solid #f3f3f3;
  border-radius: 50%;
  border-top: 8px solid #3b5998;
  border-bottom: 8px solid #3b5998;
  width: 150px;
  height: 150px;
  -webkit-animation: spin 1.2s linear infinite;
  animation: spin 1.2s linear infinite;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
