<template>
  <div>
    <v-btn icon @click="socialLogin('facebook')">
      <v-icon color="blue">fa fa-facebook-square fa-lg</v-icon>
    </v-btn>
    <v-btn icon @click="socialLogin('google')">
      <v-icon color="red">fa fa-google fa-lg</v-icon>
    </v-btn>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {}

interface ComponentMethods {
  socialLogin(service: string): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SocialLogin",
  methods: {
    socialLogin(service) {
      window.location.href = `${this.$baseUrl}/auth/login/${service}`;
    }
  }
});
</script>
