<template>
  <v-card
    elevation="1"
    outlined
    class="rounded-t-xl no-b-b px-3 pt-3 pb-0 bg-gray hidden-overflow"
  >
    <v-card class="preview-banner">
      <v-flex xs12 class="pa-2">
        <v-skeleton-loader
          :boilerplate="false"
          height="48px"
          class="loaded"
          type="paragraph"
        />
        <div class="mt-2 hidden-overflow relative">
          <template v-if="mediaType === 'image'">
            <div
              :key="`image-preview-${dataSingle.data || url}`"
              class="preview-wrapper"
            >
              <div class="mb-3">
                <div class="mb-2">Quảng cáo mẫu 1</div>
                <layout-preview
                  :data="dataHorizontal"
                  :data-sample="dataSampleVertical"
                />
              </div>
              <div>
                <div class="mb-2">Quảng cáo mẫu 2</div>
                <layout-preview
                  :data="dataVertical"
                  :data-sample="dataSampleHorizontal"
                />
              </div>
            </div>
          </template>
          <template v-if="mediaType === 'video'">
            <div
              :key="`video-preview-${dataSingle.data || url}`"
              class="preview-wrapper"
            >
              <div class="mb-3">
                <div class="mb-2">Quảng cáo mẫu 1</div>
                <layout-preview
                  :data="dataHorizontal"
                  :data-sample="dataSampleVertical"
                />
              </div>
              <div>
                <div class="mb-2">Quảng cáo mẫu 2</div>
                <layout-preview
                  :data="dataVertical"
                  :data-sample="dataSampleHorizontal"
                />
              </div>
            </div>
          </template>

          <template v-if="mediaType === 'slider'">
            <v-carousel
              v-if="mediaData && mediaData.length > 0"
              cycle
              height="148"
              hide-delimiter-background
              show-arrows-on-hover
              hide-delimiters
            >
              <v-carousel-item
                v-for="(src, i) in mediaData"
                :key="`slider-item-${i}`"
              >
                <v-img
                  :src="src"
                  object-contain
                  max-width="100%"
                  max-height="100%"
                  class="m-auto"
                  height="148px"
                  contain
                />
              </v-carousel-item>
            </v-carousel>
            <image-default-size
              v-else
              :width="width"
              :height="height"
              style="height: 148px"
            />
          </template>
          <template v-if="mediaType === 'embed'">
            <iframe
              v-if="embedSource === 'youtube'"
              width="300"
              height="168"
              :src="
                `https://www.youtube.com/embed/${embedVideoId}?autoplay=1&showinfo=0&mute=1`
              "
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
            <blockquote
              v-if="embedSource === 'tiktok'"
              class="tiktok-embed"
              :cite="embedUrl"
              :data-video-id="embedVideoId"
              style="max-width: 300px;min-width: 300px;"
              data-autoplay="true"
              muted
            >
              <section></section>
            </blockquote>
            <iframe
              v-if="embedSource === 'facebook'"
              :src="
                `https://www.facebook.com/plugins/video.php?height=168&href=${encodeURIComponent(
                  embedUrl
                )}&show_text=false&width=300&t=0&autoplay=true`
              "
              width="300"
              height="168"
              style="border:none;overflow:hidden"
              scrolling="no"
              frameborder="0"
              data-autoplay="true"
              allowfullscreen="true"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            ></iframe>
          </template>
          <template v-if="mediaType === 'text'">
            <div
              :key="`audio-preview-${dataSingle.data || url}`"
              class="preview-wrapper"
            >
              <div class="mb-3">
                <div class="mb-2">Quảng cáo mẫu</div>
                <layout-preview
                  :data="dataText"
                  :data-sample="dataSampleHorizontal"
                />
              </div>
            </div>
          </template>
          <template v-if="mediaType === 'audio'">
            <div
              :key="`audio-preview-${dataSingle.data || url}`"
              class="preview-wrapper"
            >
              <div class="mb-3">
                <div class="mb-2">Quảng cáo mẫu 1</div>
                <layout-preview
                  :data="dataHorizontal"
                  :data-sample="dataSampleHorizontal"
                />
              </div>
              <div>
                <div class="mb-2">Quảng cáo mẫu 2</div>
                <layout-preview
                  :data="dataVertical"
                  :data-sample="dataSampleVertical"
                />
              </div>
            </div>
          </template>
        </div>
      </v-flex>
    </v-card>
  </v-card>
</template>
<script lang="ts">
import ImageDefaultSize from "@/components/common/ImageDefaultSize";
import Vue, { VueConstructor } from "vue";
import LayoutPreview from "~/components/page/manage-layout/layout-preview/index.vue";
import {
  getVideoIdTiktok,
  getVideoIdYoutube,
  isFacebookVideoURL,
  isTiktokVideoURL,
  isYoutubeVideoURL,
  rescanTiktokEmbed
} from "~/util/embed";

const PreviewBanner = (Vue as VueConstructor).extend({
  name: "PreviewBanner",
  components: {
    LayoutPreview,
    ImageDefaultSize
  },
  props: {
    displaySize: {
      type: Object,
      default: () => ({
        width: 300,
        height: 200,
        image_src: null
      })
    },
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    mediaData: {
      type: Array,
      default: null
    },
    mediaType: {
      type: String,
      default: ""
    }
  },
  computed: {
    embedUrl() {
      const media = this.mediaData.find(media => media?.type === "landscape");
      return media?.data || "";
    },
    embedSource() {
      if (this.mediaType === "embed" && this.embedUrl) {
        if (isYoutubeVideoURL(this.embedUrl)) {
          return "youtube";
        } else if (isTiktokVideoURL(this.embedUrl)) {
          return "tiktok";
        } else if (isFacebookVideoURL(this.embedUrl)) {
          return "facebook";
        }
      }
      return "";
    },
    embedVideoId() {
      if (this.embedSource === "youtube") {
        return getVideoIdYoutube(this.embedUrl);
      } else if (this.embedSource === "tiktok") {
        // eslint-disable-next-line vue/no-async-in-computed-properties
        setTimeout(() => {
          rescanTiktokEmbed();
        }, 100);
        return getVideoIdTiktok(this.embedUrl);
      } else if (this.embedSource === "facebook") {
        return this.embedUrl;
      }
      return "";
    },
    width() {
      return this.displaySize.width || 300;
    },
    height() {
      return this.displaySize.height || 200;
    },
    scale() {
      return Math.floor((this.height * 100) / this.width);
    },
    url() {
      return this.displaySize.image_src;
    },
    mediaIsExists() {
      return (
        this.mediaData && this.mediaData.length > 0 && this.mediaData[0].data
      );
    },
    dataSingle() {
      return (this.mediaData && this.mediaData[0]) || {};
    },
    dataSampleVertical() {
      const square = (this.mediaData || []).find(
        data => data.type === "square"
      );
      return {
        title: this.data?.title || "Tiêu đề quảng cáo",
        description: this.data?.description || "Mô tả quảng cáo",
        media: square?.data,
        thumbnail: square?.thumbnail
      };
    },
    dataSampleHorizontal() {
      const landscape = (this.mediaData || []).find(
        data => data?.type === "landscape"
      );
      return {
        title: this.data?.title || "Tiêu đề quảng cáo",
        description: this.data?.description || "Mô tả quảng cáo",
        media: landscape?.data,
        thumbnail: landscape?.thumbnail
      };
    },
    dataText() {
      return {
        name: "",
        layout_type: "layout_text_only",
        style_component: {
          "background-color": "#FFFFFFFF",
          "border-color": "#00000000"
        },
        style_image: {
          float: "left",
          aspect_ratio: "1.91:1"
        },
        style_title: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        },
        style_description: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        }
      };
    },
    dataVertical() {
      return {
        name: "",
        layout_type: "layout_img_above",
        style_component: {
          "background-color": "#FFFFFFFF",
          "border-color": "#00000000"
        },
        style_image: {
          float: "left",
          aspect_ratio: "1.91:1"
        },
        style_title: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        },
        style_description: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        }
      };
    },
    dataHorizontal() {
      return {
        name: "",
        layout_type: "layout_img_side",
        style_component: {
          "background-color": "#FFFFFFFF",
          "border-color": "#00000000"
        },
        style_image: {
          float: "left",
          aspect_ratio: "1:1"
        },
        style_title: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        },
        style_description: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        }
      };
    }
  }
});

export default PreviewBanner;
export type PreviewBannerRef = InstanceType<typeof PreviewBanner>;
</script>
