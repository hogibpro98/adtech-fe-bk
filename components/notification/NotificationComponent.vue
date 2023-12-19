<template>
  <v-menu
    :close-on-content-click="false"
    :nudge-right="140"
    :nudge-bottom="14"
    offset-y
    offset-overflow
    origin="top center"
    class="elelvation-1"
    transition="slide-y-transition"
    @input="onToggle"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        :class="{
          'animate__animated animate__swing animate__repeat-3': new_noti
        }"
        icon
        text
        v-on="on"
        @animationend="new_noti = false"
      >
        <v-badge :value="num_unview" color="red" overlap>
          <span slot="badge">
            {{ num_unread < 10 ? num_unview : "9+" }}
          </span>
          <v-icon medium>notifications</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <notification-list
      :items="items"
      :loading="loading"
      :load-more-able="loadMoreAble"
      @click-item="handleItemClick"
      @load-more="loadMore"
      @read-all="readAll"
    />
  </v-menu>
</template>

<script lang="ts">
import { debounce, unionBy } from "lodash";
import Vue from "vue";
import NotificationList from "~/components/widgets/list/NotificationList.vue";
import { CODE_SUCCESS } from "~/constants/code";

const STATUS_READ = 2;

export default Vue.extend({
  name: "NotificationComponent",
  components: { NotificationList },
  data() {
    return {
      items: [],
      loadMoreAble: true,
      page: 0,
      loading: true,
      num_unview: 0,
      num_unread: 0,
      new_noti: false,
      debounceToast: null
    };
  },
  computed: {},
  created() {
    this.debounceToast = debounce(() => {
      this.$toast.global.new_notification();
    }, 1500);
    this.initEchoListener();
  },
  // beforeDestroy() {
  //   this.$echo.disconnect();
  // },
  mounted() {
    this.countData();
  },
  methods: {
    async countData() {
      this.loading = true;
      try {
        const res = await this.$axios.$post("notification/count");
        if (res.code === CODE_SUCCESS) {
          this.num_unread = res?.num_unread;
          this.num_unview = res?.num_un_view;
        }
      } catch (e) {}
      this.loading = false;
    },
    async fetchData() {
      this.loading = true;
      try {
        const res = await this.$apiAction.getNotifications(this.page);
        if (res.code === CODE_SUCCESS) {
          this.items = unionBy(this.items, res.data, "id");
          this.num_unread = res?.num_unread;
          this.num_unview = res?.num_un_view;
          this.loadMoreAble = res?.load_more_able;
        }
      } catch (e) {}
      this.loading = false;
    },

    handleItemClick(index) {
      this.items[index].status = STATUS_READ;
      this.$apiAction.markAsRead(this.items[index].id);
      this.$router.replace({
        path: this.items[index].redirect,
        query: {
          t: new Date().getTime().toString(10)
        }
      });
    },

    readAll() {
      this.items = this.items.map(e => {
        e.status = STATUS_READ;
        return e;
      });
      this.num_unread = 0;
      this.$apiAction.markAsReadAll();
    },

    loadMore() {
      if (this.loadMoreAble && !this.loading) {
        this.page++;
        this.fetchData();
      }
    },

    onToggle(val) {
      if (val) {
        this.num_unview = 0;
        // this.fetchData();
        this.$apiAction.markAsViewAll();
      }
    },

    handleIncomingNoti(e) {
      this.new_noti = true;
      this.num_unread++;
      this.num_unview++;
      this.debounceToast();
      this.items.unshift(e.data);
    },

    async initEchoListener() {
      if (this.$echo.options.broadcaster !== this.$echo.config.broadcaster) {
        this.$echo.options.broadcaster = this.$echo.config.broadcaster;
        await this.$echo.connect();
      }
      this.$echo
        .private(`notification.${this.$auth.user.id}`)
        .listen("NotificationEvent", e => {
          this.handleIncomingNoti(e);
        });
      this.$echo
        .private(`notification.${this.$auth.user.id}`)
        .listen("ForceLogoutEvent", () => {
          this.$auth.fetchUser();
        });
    }
  }
});
</script>
