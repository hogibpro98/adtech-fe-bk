<template>
  <v-dialog
    v-model="showing"
    no-click-animation
    persistent
    min-width="400"
    max-width="600"
  >
    <template #activator="{ on, attrs }">
      <v-btn color="primary" light v-bind="attrs" class="mt-3" large v-on="on">
        Lưu ví
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="headline">Lưu số tiền trong ví</span>
      </v-card-title>

      <v-card-text>
        Bạn có chắc chắn muốn lưu trạng thái ví
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
  $agencyWalletRepository: RepositoryInterface;
  showing: boolean;
  loading: boolean;
  item: Array<any>;
}

//
interface ComponentMethods {
  editItem(): void;
}

const WalletDetailSaveDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "WalletDetailSaveDialog",
  props: {
    walletData: {
      type: Array,
      default: null
    },
    userId: {
      default: null
    }
  },
  data() {
    return {
      showing: false,
      loading: false,
      item: []
    };
  },
  watch: {
    walletData: {
      handler(val) {
        this.item = val;
      },
      deep: true
    }
  },
  created() {
    this.item = this.walletData;
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
        const res = await this.$agencyWalletRepository.post("change-balance", {
          wallet_balance: this.item,
          user_id: this.userId
        });
        console.log(res);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$toast.global.edit_success("giá trị ví");
          this.$emit("save-wallet-success");
        } else {
          this.$toast.global.action_fail();
        }
        this.showing = false;
      } catch (e) {
        console.log(e);
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          // this.$refs.form.setErrors(e.response.data.errors);
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
        }
        this.showing = false;
      }
    }
  }
});

export default WalletDetailSaveDialog;
</script>

<style scoped></style>
