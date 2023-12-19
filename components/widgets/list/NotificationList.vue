<template>
  <v-card class="elevation-0 notification-card">
    <v-toolbar flat dense color="transparent">
      <div class=" d-flex justify-space-between align-center w-full">
        <v-toolbar-title><h4>Thông báo</h4></v-toolbar-title>
        <a class="uppercase" @click="$emit('read-all')">Đánh dấu đã đọc</a>
      </div>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <v-list class="pa-0" dense width="360">
        <vue-perfect-scrollbar class="notification-scroll-container">
          <v-list-item
            v-for="(item, index) in items"
            :key="item.id"
            ripple="ripple"
            @click="handleClick(index)"
          >
            <v-list-item-content class="flex-column align-start">
              <span v-html="parseMessage(item.messages)"></span>
              <em>{{ item.created_at | readableTime }}</em>
            </v-list-item-content>

            <v-icon v-if="item.status !== status.READ" color="primary" small
              >fiber_manual_record
            </v-icon>
          </v-list-item>
          <v-skeleton-loader
            v-if="loadMoreAble"
            v-intersect="{
              handler: fetchMoreData,
              options: {
                threshold: [0.3]
              }
            }"
            type="list-item-two-line"
          ></v-skeleton-loader>
        </vue-perfect-scrollbar>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { escape } from "lodash";
import Vue, { VueConstructor } from "vue";

const STATUS_READ = 2;

interface ComponentData {
  loading: boolean;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  props: {
    items: {
      type: Array,
      default: () => {
        return [];
      }
    },
    loadMoreAble: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      status: {
        READ: STATUS_READ
      }
    };
  },
  methods: {
    fetchMoreData(entries) {
      if (entries[0].isIntersecting && !this.loading) {
        this.$emit("load-more");
      }
    },
    handleClick(index) {
      this.$emit("click-item", index);
    },
    parseMessage(messages) {
      let html = "";
      messages.forEach(e => {
        let text = escape(e.text);
        e.tags.forEach(tag => {
          text = text.replace(text, `<${tag}>${text}</${tag}>`);
        });
        html += text + " ";
      });
      return html;
    }
  }
});
</script>
<style lang="scss">
.notification-card {
  max-height: 360px;
  width: 480px;
}

.notification-scroll-container {
  width: 480px;
  max-height: 280px;
  min-height: 56px;
}
</style>
