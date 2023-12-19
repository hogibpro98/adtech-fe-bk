<template>
  <div v-if="items.length > 0" class="lb">
    <div
      :class="[
        css,
        items.length > cells ? 'lb-grid-' + cells : 'lb-grid-' + items.length
      ]"
      class="lb-grid"
    >
      <template v-for="(item, index) in items">
        <template v-if="item.type === 'image'">
          <template v-if="$scopedSlots.image">
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              class="lb-item"
            >
              <slot v-bind="{ item, items, index, cells, show }" name="image">
              </slot>
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
                >{{ items.length - cells }}+</span
              >
            </div>
          </template>
          <template v-else>
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              :style="bgImage(item.url)"
              class="lb-item"
              @click="show(index)"
            >
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
                >{{ items.length - cells }}+</span
              >
            </div>
          </template>
        </template>
        <template v-if="item.type === 'video'">
          <template v-if="$scopedSlots.video">
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              class="lb-item"
            >
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <slot v-bind="{ item, items, index, cells, show }" name="video">
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
              >
                {{ items.length - cells }}+
              </span>
            </div>
          </template>
          <template v-else>
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              class="lb-item"
            >
              <video :controls="false" :title="item.url">
                <source :src="item.url" />
              </video>
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
              >
                {{ items.length - cells }}+
              </span>
            </div>
          </template>
        </template>
        <template v-if="item.type === 'audio'">
          <template v-if="$scopedSlots.audio">
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              class="lb-item"
            >
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <slot v-bind="{ item, items, index, cells, show }" name="video">
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
              >
                {{ items.length - cells }}+
              </span>
            </div>
          </template>
          <template v-else>
            <div
              :key="`file-index-${index}-${item.url}`"
              v-if="index < cells"
              class="lb-item"
            >
              <div
                class="w-full h-full d-flex align-items-center justify-content-center"
              >
                <audio :controls="true" :title="item.url">
                  <source :src="item.url" />
                </audio>
              </div>

              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
              >
                {{ items.length - cells }}+
              </span>
            </div>
          </template>
        </template>
        <template v-if="item.type === 'other'">
          <template v-if="$scopedSlots.other">
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              class="lb-item"
            >
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <slot v-bind="{ item, items, index, cells, show }" name="other">
              </slot>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more"
              >
                {{ items.length - cells }}+
              </span>
            </div>
          </template>
          <template v-else>
            <div
              v-if="index < cells"
              :key="`file-index-${index}-${item.url}`"
              class="lb-item"
            >
              <slot
                v-if="$scopedSlots.overlay"
                v-bind="{ item, items, index, cells, show }"
                name="overlay"
              >
              </slot>
              <v-img
                src="/icon/file_type_empty.png"
                contain
                style="width: 60%; height: 100%; max-width: 9rem; margin: auto"
              >
              </v-img>
              <span
                v-if="index === cells - 1 && items.length - cells > 0"
                class="lb-more z-10"
              >
                +{{ items.length - cells }}
              </span>
            </div>
          </template>
        </template>
      </template>
    </div>

    <transition
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="index >= 0" class="lb-modal">
        <button
          class="btn btn-outline-danger btn-sm lb-modal-close"
          @click="close"
        >
          <v-icon color="white">close</v-icon>
        </button>
        <button class="btn btn-outline-primary lb-modal-prev" @click="prev">
          <v-icon color="white">chevron_left</v-icon>
        </button>
        <button class="btn btn-outline-primary lb-modal-next" @click="next">
          <v-icon color="white">chevron_right</v-icon>
        </button>

        <div class="lb-modal-img" @click="close">
          <img :src="src" alt="lb-modal-img" />
          <div v-if="loading" class="spinner spinner-dots-wave">
            <span class="badge badge-primary rounded-circle w-10 h-10">
              <i class="sr-only">&nbsp;</i>
            </span>
            <span class="badge badge-primary rounded-circle w-10 h-10">
              <i class="sr-only">&nbsp;</i>
            </span>
            <span class="badge badge-primary rounded-circle w-10 h-10">
              <i class="sr-only">&nbsp;</i>
            </span>
            <span class="badge badge-primary rounded-circle w-10 h-10">
              <i class="sr-only">&nbsp;</i>
            </span>
            <span class="badge badge-primary rounded-circle w-10 h-10">
              <i class="sr-only">&nbsp;</i>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  src: string;
  index: number;
  loading: boolean;
  events: Array<string>;
}

interface ComponentMethods {
  bind(): void;
  show(i: number): void;
  next(): void;
  prev(): void;
  close(): void;
  bg(i: number): void;
  bgImage(i: number): void;
}

const LightBox = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  props: {
    items: {
      type: Array,
      default: () => {
        return [];
      }
    },
    css: {
      type: String,
      default: () => "h-250 h-md-400 h-lg-600"
    },
    cells: {
      type: Number,
      default: () => 5
    }
  },
  data() {
    return {
      src: "",
      index: -1,
      loading: false,
      events: []
    };
  },
  methods: {
    bind() {
      if (this.events.length > 0) return;
      this.events.push([
        "keydown",
        e => {
          if (this.index < 0) return;
          if (e.keyCode === 37) {
            this.prev();
          } else if (e.keyCode === 39) {
            this.next();
          } else if (e.keyCode === 27) {
            this.close();
          }
        }
      ]);
      this.events.forEach(e => {
        window.addEventListener(e[0], e[1]);
      });
    },
    show(i) {
      if (i >= this.items.length) {
        i = 0;
      }
      if (i < 0) {
        i = this.items.length - 1;
      }
      this.loading = true;
      this.bind();
      this.index = i;
      const src = this.items[i];
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.loading = false;
        this.src = src;
      };
    },
    next() {
      this.show(this.index - 1);
    },
    prev() {
      this.show(this.index + 1);
    },
    close() {
      this.index = -1;
      this.events.forEach(e => {
        window.removeEventListener(e[0], e[1]);
      });
      this.events = [];
    },
    bg(i) {
      return i && i.length > 0 ? `background-image: url('${i}')` : "";
    },
    bgImage(i) {
      return i && i.length > 0 ? `background-image: url('${i}')` : "";
    }
  }
});

export default LightBox;
export type LightBoxRef = InstanceType<typeof LightBox>;
</script>
