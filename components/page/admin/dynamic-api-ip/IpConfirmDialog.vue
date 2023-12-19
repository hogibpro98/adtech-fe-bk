<template>
  <v-dialog
    v-model="showing"
    no-click-animation
    persistent
    min-width="400"
    max-width="600"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        light
        v-bind="attrs"
        class="mt-6 mr-8 px-9"
        large
        :disabled="item.ipv4.length === 0"
        v-on="on"
      >
        Lưu
      </v-btn>
    </template>

    <v-card class="pa-3">
      <v-card-title>
        <span class="headline">Lưu địa chỉ IP</span>
      </v-card-title>

      <v-card-text>
        Bạn có chắc chắn muốn lưu địa chỉ IP?
      </v-card-text>

      <v-card-actions>
        <v-layout justify-end>
          <v-btn
            color="grey"
            text
            :disabled="loading"
            @click.native="showing = false"
          >
            Hủy
          </v-btn>
          <v-btn
            :loading="loading"
            color="primary darken-1"
            text
            @click.native="addItem"
          >
            Xác nhận
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";

interface ComponentData {
  $userIpRepository: RepositoryInterface;
  showing: boolean;
  loading: boolean;
  item: Array<any>;
}

//
interface ComponentMethods {
  editItem(): void;
}

const IpConfirmDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "IpConfirmDialog",
  props: {
    ipData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showing: false,
      loading: false,
      item: {}
    };
  },
  watch: {
    ipData: {
      handler(val) {
        this.item = val;
      },
      deep: true
    }
  },
  created() {
    this.item = this.ipData;
  },
  methods: {
    show() {
      this.showing = true;
    },
    async addItem() {
      this.loading = true;
      // setTimeout(()=>{
      //   console.log(this.item)
      //   this.showing = false
      //   this.loading = false
      // }, 3000)
      try {
        const res = await this.$userIpRepository.post("sync", {
          user_id: this.item.user_id,
          ipv4: this.item.ipv4
        });
        console.log(res);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Lưu địa chỉ IP thành công!");
        } else {
          this.$toast.global.action_fail();
        }
        this.showing = false;
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          // this.$refs.form.setErrors(e.response.data.errors);
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
        }
      }
    }
  }
});

export default IpConfirmDialog;
</script>
