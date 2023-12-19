<template>
  <v-layout class="v-transmit__preview" align-end justify-center wrap>
    <light-box
      :items="filesShow"
      :cells="
        filesShow.length > cellsLightBox ? cellsLightBox : filesShow.length
      "
      css="v-transmit__upload-area"
    >
      <template slot="overlay" slot-scope="{ item }">
        <v-overlay
          :color="!item.file.url ? '#ededed' : 'transparent'"
          absolute
          class="z-10"
        >
          <v-progress-circular
            v-if="!item.file.url"
            :value="item.file.upload.progress"
            :width="5"
            :size="50"
            :indeterminate="item.file.upload.progress > 98"
            color="primary"
          >
            {{
              item.file.upload.progress < 99
                ? Math.ceil(item.file.upload.progress)
                : ""
            }}
          </v-progress-circular>
          <div
            v-else
            class="name-tooltip truncate max-width-35"
            @click.stop="openLink(item)"
          >
            {{ item.file.name || getFileNameByUrl(item.file.url) }}
          </div>
        </v-overlay>
      </template>
      <template slot="image" slot-scope="{ item }">
        <v-img
          v-show="item.url"
          :src="item.url"
          :lazy-src="item.url"
          cover
          style="width: 100%; height: 100%"
        >
        </v-img>
      </template>
      <template slot="video" slot-scope="{ item }">
        <template>
          <video :controls="false" :title="item.url" width="100%" height="100%">
            <source :src="item.url" />
            Your browser does not support the video tag.
          </video>
          <v-row class="fill-height" align="center" justify="center">
            <v-overlay
              v-if="!item.file.url"
              :value="!item.file.url"
              absolute
              color="#ededed"
            >
              <v-progress-circular
                :value="item.file.upload.progress"
                :width="5"
                :size="50"
                :indeterminate="item.file.upload.progress > 98"
                color="primary"
              >
                {{
                  item.file.upload.progress < 99
                    ? Math.ceil(item.file.upload.progress)
                    : ""
                }}
              </v-progress-circular>
            </v-overlay>
          </v-row>
        </template>
      </template>
    </light-box>
  </v-layout>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import LightBox from "@/components/common/LightBox/index.vue";

interface ComponentData {
  filesShow: Array<object>;
}

interface ComponentMethods {
  convertUploadToFileShow(files: Array<object>): void;
  getFileNameByUrl(url: string): string;
  openLink(item: object): void;
}

const PreviewFile = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PreviewFile",
  components: { LightBox },
  props: {
    files: {
      type: Array,
      required: true
    },
    cellsLightBox: {
      type: Number,
      default: 3
    },
    maximum: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      filesShow: []
    };
  },
  watch: {
    files(val) {
      this.convertUploadToFileShow(val);
    }
  },
  created() {
    this.convertUploadToFileShow(this.files);
  },
  methods: {
    convertUploadToFileShow(files) {
      this.filesShow = files.map(f => {
        let type = "other";
        if (f.type) {
          if (f.type.includes("image")) {
            type = "image";
          } else if (f.type.includes("video")) {
            type = "video";
          } else if (f.type.includes("audio")) {
            type = "audio";
          }
        }

        return {
          file: f,
          type,
          url: f.file_url || f.url
        };
      });
    },
    getFileNameByUrl(url) {
      if (url) {
        const m = url.toString().match(/.*\/(.+?)\./);
        if (m && m.length > 1) {
          return m[1];
        }
      }
      return "";
    },
    openLink(item) {
      window.open(item.url);
    }
  }
});

export default PreviewFile;
export type PreviewFileRef = InstanceType<typeof PreviewFile>;
</script>

<style>
.name-tooltip {
  width: 100%;
  margin: auto;
  padding: 4px;
  border-radius: 4px;
  background-color: rgba(30, 30, 30, 0.7);
  color: #fff;
}
</style>
