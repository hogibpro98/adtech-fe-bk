<template>
  <div>
    <v-row v-for="(value, key) in showStats" :key="key" justify="space-between">
      <v-flex xs8>
        {{ key }}
      </v-flex>
      <v-flex xs4 class="text-end">
        {{ value | numberSpace }}
      </v-flex>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  cdrStats: any;
  attributeMap: any;
}

interface ComponentMethod {}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "RedirectDataStateTable",
  data() {
    return {
      loading: false,
      cdrStats: {
        num_data_success: 50,
        num_data_fail: 200,
        num_data_lul: 299,
        num_data_sent: 250
      }
    };
  },
  computed: {
    showStats() {
      const filtered = Object.keys(this.cdrStats).filter(e => {
        return this.attributeMap[e];
      });
      if (filtered.length > 0) {
        return filtered.reduce((obj, key) => {
          console.log(key, obj);
          const text = this.attributeMap[key].text;
          obj[text] = this.cdrStats[key] || "";
          return obj;
        });
      }
      return {};
    },
    attributeMap() {
      return {
        num_data_success: {
          text: "Số lượng tài trợ thành công"
        },
        num_data_fail: {
          text: "Số lượng tài trợ thất bại"
        },
        num_data_sent: {
          text: "Số lượng tài trợ data"
        },
        num_sms_confirm_success: {
          text: "Số lượng tin nhắn xác nhận tài trợ qua gateway thành công"
        },
        num_sms_confirm_fail: {
          text: "Số lượng tin nhắn xác nhận tài trợ qua gateway thất bại công"
        },
        cdr_num_sms_confirm_success: {
          text: "Số lượng tin nhắn xác nhận tài trợ đến thiết bị thành công"
        },
        cdr_num_sms_confirm_fail: {
          text: "Số lượng tin nhắn xác nhận tài trợ đến thiết bị thất bại công"
        }
      };
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {}
  }
});
</script>

<style scoped></style>
