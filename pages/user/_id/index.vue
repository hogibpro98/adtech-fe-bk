<template>
  <v-row justify="center">
    <v-flex md8 lg6>
      <v-row wrap>
        <v-flex xs12>
          <v-card class="ma-2 pa-4">
            <v-overlay v-if="loading" color="#fff" absolute> </v-overlay>
            <user-profile
              v-model="profile"
              :loading="loading"
              readonly
            ></user-profile>
            <agency-info
              v-if="isAgency"
              key="agency-info"
              v-model="profile.user_info"
              readonly
              :loading="loading"
            ></agency-info>
            <advertiser-info
              v-if="isAdvertiser"
              key="advertiser-info"
              v-model="profile.user_info"
              :loading="loading"
              readonly
            ></advertiser-info>
          </v-card>
        </v-flex>
      </v-row>
    </v-flex>
  </v-row>
</template>

<script lang="ts">
import AdvertiserInfo from "@/components/page/profile/AdvertiserInfo.vue";
import AgencyInfo from "@/components/page/profile/AgencyInfo.vue";
import { USER } from "@/constants/resource";
import { responseErrorToString } from "@/util/array";
import { ROLE_ADVERTISER, ROLE_AGENCY } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import UserProfile from "~/components/page/profile/UserProfile.vue";
import { UserInterface } from "~/interface/data/user";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  profile: UserInterface;
  tab: number;
  loading: boolean;
  userId: string | number;
}

interface ComponentMethods {
  getProfileUser(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    AdvertiserInfo,
    AgencyInfo,
    UserProfile
  },
  layout: "dashboard",
  permission: false,
  data() {
    return {
      profile: {},
      tab: 0,
      loading: false
    };
  },
  computed: {
    userId() {
      return this.$route.params.id;
    },
    isAgency() {
      return (
        this.profile.roles?.length > 0 &&
        this.profile.roles[0].name === ROLE_AGENCY
      );
    },
    isAdvertiser() {
      return (
        this.profile.roles?.length > 0 &&
        this.profile.roles[0].name === ROLE_ADVERTISER
      );
    }
  },
  watch: {
    userId() {
      this.getProfileUser();
    }
  },
  mounted() {
    this.getProfileUser();
  },
  methods: {
    async getProfileUser() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(`${USER}/${this.userId}/detail`);

        this.profile = data?.data;
        this.loading = false;
      } catch (e) {
        this.$toast.global.server_error_msg(
          responseErrorToString(e.response.data.errors)
        );
        this.loading = false;
      }
    }
  }
});
</script>
