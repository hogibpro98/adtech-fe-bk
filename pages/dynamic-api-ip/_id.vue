<template>
  <v-container grid-list-xl fluid>
    <v-layout row wrap justify-center>
      <v-flex xs12 lg8>
        <v-overlay v-if="loading" absolute color="#fff" class="z-1"></v-overlay>
        <!--        <wallet-detail-multiple-slider v-model="walletData">-->
        <!--          <template slot="save-dialog">-->
        <!--            <wallet-detail-save-dialog-->
        <!--              :wallet-data="walletData"-->
        <!--              :user-id="userId"-->
        <!--            />-->
        <!--          </template>-->
        <!--        </wallet-detail-multiple-slider>-->
        <v-row no-gutters>
          <v-col cols="12" class="headline mt-3">
            Key API
          </v-col>
          <v-col
            v-if="ipData.key === '' && $auth.user.id !== parseInt(userId, 10)"
            cols="12"
            class="mt-6 mb-3 red--text"
          >
            Không có key API nào được cấp cho user
            {{ ipData.user.full_name || "này" }}!
          </v-col>
          <v-col v-else cols="12">
            <v-row no-gutters>
              <v-col cols="11">
                <v-text-field-with-validation
                  v-model="ipData.key.key"
                  :loading="resetKey"
                  :messages="userKeyDesc"
                  readonly
                >
                  <template slot="append">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          :disabled="resetKey"
                          icon
                          v-on="on"
                          @click="copyToClipboard"
                        >
                          <v-icon>
                            mdi-clipboard-check-multiple-outline
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>Copy vào clipboard</span>
                    </v-tooltip>
                  </template>
                </v-text-field-with-validation>
              </v-col>
              <v-col
                cols="1"
                class="d-flex align-items-center pl-2 justify-content-end"
              >
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn class="my-3" color="primary" icon v-on="on">
                      <v-icon
                        :disabled="
                          resetKey || $auth.user.id !== parseInt(userId, 10)
                        "
                        @click="keyReset"
                      >
                        mdi-reload
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Cấp lại Key</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>

          <v-col
            cols="12"
            class="headline mt-6 d-flex justify-content-space-between align-items-center"
          >
            Danh sách IP được truy cập API
          </v-col>
          <v-col
            v-if="ipData === {} || (ipData.ipv4 && ipData.ipv4.length === 0)"
            cols="12"
            class="mt-6 red--text"
          >
            Hiện tại không có địa chỉ IP nào!
          </v-col>
          <v-col
            v-for="(ip, index) in ipData.ipv4"
            :key="'ipv4_' + index.toString()"
            cols="12"
            class="mt-3"
          >
            <v-row no-gutters>
              <v-col cols="6" class="pr-2">
                <v-text-field-with-validation
                  v-model="ipData.ipv4[index].ip"
                  :loading="loading"
                  :name="'ip' + index.toString()"
                  type="text"
                  label="IP"
                  readonly
                />
              </v-col>
              <v-col cols="6" class="pl-2">
                <v-text-field-with-validation
                  v-model="ipData.ipv4[index].note"
                  :loading="loading"
                  :name="'note' + index.toString()"
                  type="text"
                  label="Ghi chú"
                  readonly
                />
              </v-col>
            </v-row>
          </v-col>

          <!--          <v-col cols="12" align="end">-->
          <!--            <ip-confirm-dialog :ip-data="ipData" />-->
          <!--          </v-col>-->
        </v-row>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import moment from 'moment/src/moment';
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { HTTP_CODE_422 } from "~/constants/code";
import { responseErrorToString } from "~/util/array";
import IpConfirmDialog from "~/components/page/admin/dynamic-api-ip/IpConfirmDialog.vue";
import {unsecuredCopyToClipboard} from "~/helpers/ultis";

interface ComponentData {
  ipData: any;
  $apiAction: RepositoryInterface;
  $userIpRepository: RepositoryInterface;
}

interface ComponentMethods {
  processWallet: void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: { IpConfirmDialog, VTextFieldWithValidation },
  layout: "dashboard",
  middleware: ["self-or-admin"],
  permission: false,
  data() {
    return {
      ipData: {},
      loading: false,
      resetKey: false
    };
  },
  computed: {
    userId() {
      return this.$route.params.id || this.$auth.user.id;
    },
    isValidKey() {
      if (this.ipData.key.expires_date) {
        return moment().isBefore(moment(this.ipData.key.expires_date));
      }
      return false;
    },
    userKeyDesc() {
      if (this.isValidKey) {
        const formattedExpiresDate = this.$filters.date(
          this.ipData.key.expires_date
        );
        return `Thời gian hết hạn: ${formattedExpiresDate}`;
      } else {
        return "Key của đã hết hạn, vui lòng tạo lại lại key mới";
      }
    }
  },
  created() {
    this.ipData = {
      user_id: parseInt(this.$route.params.id || this.$auth.user.id, 10),
      ipv4: [],
      key: "",
      user: {}
    };
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        const { data } = await this.$userIpRepository.post("detail", {
          id: this.userId
        });
        this.ipData = {
          ...this.ipData,
          user: data?.user || {},
          key: data?.key || "",
          ipv4: data?.ipv4
        };
      } catch (e) {}
      this.loading = false;
    },
    copyToClipboard() {
      unsecuredCopyToClipboard(this.ipData.key.key)
    },
    async keyReset() {
      try {
        this.resetKey = true;
        const { data } = await this.$axios.post("/user-key/gen");
        this.ipData.key = data.data;
        this.$toast.success("Tạo mới API key thành công!");
      } catch (e) {
        this.resetKey = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
        }
      }
      this.resetKey = false;
    },
    ipRemove(index) {
      this.ipData.ipv4.splice(index, 1);
    },
    addIp() {
      this.ipData.ipv4.push("0.0.0.0/32");
    },
    ipRangeRemove(index) {
      this.ipData.ipv4_range.splice(index, 1);
    },
    addIpRange() {
      this.ipData.ipv4_range.push({
        ip_start: "0.0.0.0",
        ip_end: "255.255.255.255"
      });
    },
    saveSetting() {
      this.loading = true;
    }
  }
});
</script>
