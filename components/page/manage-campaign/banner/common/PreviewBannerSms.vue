<template>
  <div class="mx-4 preview-banner-mms-wrapper">
    <v-card
      outlined
      class="no-border pa-3 hidden-overflow preview-banner-mms"
      style="background-color: transparent"
    >
      <div class="preview-banner-content-wrapper">
        <v-card outlined class="preview-banner-content no-border">
          <p class="sender-name">{{ bannerName }}</p>
          <div class="preview-sms-wrap">
            <div v-if="header" class="preview-sms-content-wrap">
              <div class="preview-sms-item preview-sms-item-text">
                <div>
                  <span v-for="item in generateTitleForLink(header)">
                    <span v-if="item.text">{{ item.text }}</span>
                    <a
                      v-if="item.link"
                      :href="getActualUrl(item.link)"
                      :title="getActualUrl(item.link)"
                      target="_blank"
                      >{{ baseShortenUrl(item.link)
                      }}{{ getShortenUrl(item.link) }}</a
                    >
                  </span>
                </div>
              </div>
            </div>
            <template v-for="({ type, data }, index) in mediaData">
              <div
                v-if="type === 'image' && data"
                :key="`media-mms-${type}-${index}-${data}`"
                class="preview-sms-item item-img"
              >
                <v-img :src="data" class="preview-sms-item-img" contain />
              </div>
              <div
                v-if="type === 'text' && data"
                :key="`media-mms-${type}-${index}-${data}`"
                class="preview-sms-item preview-sms-item-text"
              >
                <div class="input-type-textarea">
                  <span v-for="item in generateTitleForLink(data)">
                    <span v-if="item.text">{{ item.text }}</span>
                    <a
                      v-if="item.link"
                      target="_blank"
                      :href="getActualUrl(item.link)"
                      :title="getActualUrl(item.link)"
                    >
                      {{ baseShortenUrl(item.link)
                      }}{{ getShortenUrl(item.link) }}</a
                    >
                  </span>
                </div>
              </div>
            </template>
          </div>
        </v-card>
      </div>
    </v-card>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import {
  CHARACTER_CLOSE_BRACKETS,
  CHARACTER_OPEN_BRACKETS,
  HTTPS,
  NUM_SHORT_LINK
} from "~/constants/characterSpecial";
import { URL_REGEX } from "~/constants/regex";

const PreviewBannerSms = (Vue as VueConstructor).extend({
  name: "PreviewBannerSms",
  props: {
    displaySize: {
      type: Object,
      default: () => ({
        width: 300,
        height: 200,
        image_src: null
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    bannerName: {
      type: String,
      default: "VDA"
    },
    mediaData: {
      type: Array,
      default: () => []
    },
    mediaType: {
      type: String,
      default: ""
    },
    header: {
      type: String,
      default: ""
    },
    links: {
      type: Array,
      default: () => []
    },
    isShow: {
      type: Boolean,
      default: () => false
    },
    domain: {
      type: String,
      default: ""
    }
  },
  computed: {
    shortenUrls() {
      return this.$store.state.shorten.shorten.links;
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
      return !!this.mediaData;
    }
  },
  methods: {
    baseShortenUrl(val) {
      if (URL_REGEX.test(val)) return "";
      const domainStore = this.$store.state.shorten.shorten.domain;
      if (domainStore) return domainStore;
      return this.domain;
    },
    getShortenUrl(val) {
      if (URL_REGEX.test(val)) return val;
      for (let i = 0; i < this.shortenUrls?.length; i++) {
        if (this.shortenUrls[i]?.code === `${val}`) {
          return `/${this.shortenUrls[i].code}`;
        }
      }
      return "";
    },
    getActualUrl(val) {
      const shortLink = val.slice(NUM_SHORT_LINK);
      for (let i = 0; i < this.shortenUrls?.length; i++) {
        if (`${shortLink}` === this.shortenUrls[i]?.code) {
          return this.shortenUrls[i].url;
        }
      }
      return "";
    },
    isUrlExit(link) {
      const domain = this.domain || this.$store.state.shorten.shorten.domain;
      const codes = this.$store.state.shorten.shorten.links.map(
        link => link.code
      );
      for (let i = 0; i < codes.length; i++) {
        const url = `${domain}/${codes[i]}`;
        if (link === url) return true;
      }
      return false;
    },
    // getLinkAndText(string) {
    //   const resultData = [];
    //   let textIndexStart = 0;
    //   let text = "";
    //   for (let i = 0; i < string.length; i++) {
    //     if (string.charAt(i) === CHARACTER_OPEN_BRACKETS) {
    //       text = "";
    //       resultData.push({
    //         text: string.slice(textIndexStart, i)
    //       });
    //       textIndexStart = i;
    //       for (let j = i + 1; j < string.length; j++) {
    //         if (string.charAt(j) === CHARACTER_CLOSE_BRACKETS) {
    //           const link = string.slice(i + 1, j);
    //           if (this.isUrlExit(link)) {
    //             resultData.push({
    //               link
    //             });
    //           } else {
    //             resultData.push({
    //               text: string.slice(i, j + 1)
    //             });
    //           }
    //           i = j;
    //           textIndexStart = j + 1;
    //           break;
    //         }
    //       }
    //     } else {
    //       text += string.charAt(i);
    //       if (i === string.length - 1) {
    //         resultData.push({
    //           text
    //         });
    //       }
    //     }
    //   }
    //   return resultData;
    // },
    isHaveOpenAndCloseSpecial(c_open, c_close, content) {
      for (let i = 0; i < content.length; i++) {
        if (content[i].includes(c_open) && content[i].includes(c_close)) {
          return true;
        }
      }
      return false;
    },
    generateTitleForLink(string) {
      const resultData = [];
      const contents = this.header.split(/(\s+)/);
      for (let i = 0; i < contents.length; i++) {
        if (URL_REGEX.test(contents[i])) {
          resultData.push({ link: contents[i] });
        } else {
          resultData.push({ text: contents[i] });
        }
      }
      return resultData;
    }
  }
});

export default PreviewBannerSms;
export type PreviewBannerSmsRef = InstanceType<typeof PreviewBannerSms>;
</script>
<style scoped lang="scss">
.preview-banner-mms-wrapper {
  display: block;
  position: sticky;
  position: -webkit-sticky;
  top: 22px;

  .preview-banner-content-wrapper {
    height: 0;
    width: 100%;

    padding-top: 172%;

    position: relative;
  }

  .preview-banner-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;

    padding-top: 44px;
    background: url(static/banner/preview-phone-bg.png) no-repeat top;
    background-size: 100% 100%;
    max-height: 505px;
    max-width: 300px;

    .sender-name {
      margin: 0 auto 12px;
      padding: 0 16px;
      width: 100%;
      text-align: center;
    }

    .preview-sms-wrap {
      width: calc(100% - 32px);
      height: calc(100% - 34px - 28px);
      padding: 0 12px 8px;
      margin: auto 16px 16px;
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 0.4em;
        height: 0.5em;
      }

      &::-webkit-scrollbar-thumb {
        background: #aaa;
        border-radius: 0.5em;
        //box-shadow: inset 2px 2px 2px hsl(0deg 0% 100% / 25%),
        //  inset -2px -2px 2px rgb(0 0 0 / 25%);
      }

      &::-webkit-scrollbar-track {
        background-color: #eee;
      }
    }

    .preview-sms-content-wrap {
      margin: 0 auto;
      width: 100%;
    }

    .preview-sms-item {
      min-width: 100%;
      width: 100%;
      margin: auto auto 4px;
      border-radius: 4px;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;

      &.preview-sms-item-text {
        background: #eaebeb;
        padding: 12px 15px;
        font-size: 12px;
        color: #1c2438;

        white-space: pre-line;
      }

      &.item-img {
        width: 100%;
        background: #eaebeb;
      }

      .preview-sms-item-img {
        vertical-align: middle;
      }

      .preview-sms-item-img,
      .preview-sms-item-video {
        background: #eaebeb;
        min-width: 100%;
        width: 100%;
        border-radius: 4px;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
      }
    }
  }
}
</style>
