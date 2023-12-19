<template>
  <v-dialog v-model="innerValue" width="600">
    <v-card>
      <v-card-title>
        Bạn muốn tạo mới loại tài khoản nào?
      </v-card-title>
      <v-layout align-center justify-space-between wrap>
        <v-flex
          :class="{
            'darken-1': hoverItem === 'admin'
          }"
          xs4
          class="blue white--text d-flex flex-column align-center justify-content-center pointer py-4"
          @mouseover="hoverItem = 'admin'"
          @mouseleave="hoverItem = null"
          @click="$emit('choose-admin')"
        >
          <v-icon size="48" color="white">admin_panel_settings</v-icon>
          <h2>Người dùng</h2>
        </v-flex>

        <v-flex
          :class="{
            'darken-1': hoverItem === 'agency'
          }"
          xs4
          class="red white--text d-flex flex-column align-center justify-content-center pointer py-4"
          @mouseover="hoverItem = 'agency'"
          @mouseleave="hoverItem = null"
          @click="$emit('choose-agency')"
        >
          <v-icon size="48" color="white">support_agent</v-icon>
          <h2>Agency</h2>
        </v-flex>
        <v-flex
          :class="{
            'darken-1': hoverItem === 'advertiser'
          }"
          xs4
          class="purple white--text d-flex flex-column align-center justify-content-center pointer py-4"
          @mouseover="hoverItem = 'advertiser'"
          @mouseleave="hoverItem = null"
          @click="$emit('choose-advertiser')"
        >
          <v-icon size="48" color="white">business_center</v-icon>
          <h2>Advertiser</h2>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  hoverItem: string;
}

interface ComponentMethods {
  show: Function;
  hide: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RoleSelectDialog",
  mixins: [wrapper],
  data() {
    return {
      hoverItem: null
    };
  }
});
</script>
