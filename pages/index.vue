<template></template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  middleware: "auth",
  mounted() {
    if (this.$auth.user.roles[0]?.default_page) {
      this.$router.push(this.$auth.user.roles[0]?.default_page);
    } else {
      this.$router.push("/dashboard");
    }
  }
});
</script>
