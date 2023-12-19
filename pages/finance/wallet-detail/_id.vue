<template>
  <v-container grid-list-xl fluid>
    <v-layout row wrap justify-center>
      <v-flex xs12 lg8>
        <v-overlay v-if="loading" absolute color="#fff" class="z-1"></v-overlay>
        <wallet-detail-echart v-model="walletData">
          <template slot="save-dialog">
            <wallet-detail-save-dialog
              :wallet-data="walletData"
              :user-id="userId"
            />
          </template>
        </wallet-detail-echart>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import WalletDetailMultipleSlider from "~/components/page/admin/cms-wallet/WalletDetailMultipleSlider.vue";
import WalletDetailEchart from "~/components/page/admin/cms-wallet/WalletDetailEchart";
import WalletDetailSaveDialog from "~/components/page/admin/cms-wallet/WalletDetailSaveDialog.vue";

interface ComponentData {
  walletData: Array<any>;
}

interface ComponentMethods {
  processWallet: void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    WalletDetailMultipleSlider,
    WalletDetailSaveDialog,
    WalletDetailEchart
  },
  layout: "dashboard",
  middleware: ["self-or-admin"],
  data() {
    return {
      walletData: [
        {
          service: "total",
          balance: 0
        }
      ],
      loading: false
    };
  },
  computed: {
    userId() {
      return this.$route.params.id || this.$auth.user.id;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        const { data } = await this.$agencyWalletRepository.post(
          "get-wallets",
          {
            id: this.userId
          }
        );
        this.walletData = data;
      } catch (e) {}
      this.loading = false;
    }
  }
});
</script>
