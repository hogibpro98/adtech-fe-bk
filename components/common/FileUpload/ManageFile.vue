<template>
  <div class="v-transmit__upload-area tab-edit-file">
    <v-card flat height="48px" width="100%" tile>
      <v-toolbar
        :extension-height="0"
        width="100%"
        dense
        flat
        color="grey darken-1"
      >
        <v-tooltip offset-overflow bottom>
          <template #activator="{ on, attrs }">
            <v-icon dark left color="white" @click.native="$emit('back')">
              arrow_back
            </v-icon>
          </template>
          <span>Quay lại</span>
        </v-tooltip>

        <v-toolbar-title class="tab-edit-file-title">
          Quản lý tệp
        </v-toolbar-title>
      </v-toolbar>
    </v-card>
    <template v-for="(file, index) in files">
      <v-card
        :key="`manage-file-index-${index}-${file.id}`"
        class="mx-auto edit-image-wrapper"
        width="100%"
        flat
      >
        <v-img
          v-if="file.type === 'image'"
          :src="file.file_url"
          class="white--text align-end image-default-background"
          min-height="70px"
          max-height="170px"
          contain
        >
          <v-card-title>
            <a :href="file.file_url" class="white--text" target="_blank">
              {{ file.name }}
            </a>
          </v-card-title>
        </v-img>
        <video
          v-else-if="file.type === 'video'"
          :controls="false"
          :title="file.url"
          class="white--text align-end image-default-background"
          width="100%"
          height="100%"
        >
          <source :src="file.url" />
          <a :href="file.file_url" class="white--text" target="_blank">
            {{ file.name }}
          </a>
          Your browser does not support the video tag.
        </video>
        <v-img
          v-else
          src="/icon/file_type_empty.png"
          class="white--text align-end image-default-background"
          min-height="100px"
          max-height="200px"
          contain
        >
          <v-card-title>
            <a :href="file.file_url" class="white--text" target="_blank">
              {{ file.name }}
            </a>
          </v-card-title>
        </v-img>
        <div class="v-transmit-close-all">
          <v-tooltip offset-overflow bottom>
            <template #activator="{ on, attrs }">
              <v-btn class="mr-2 mt-2" fab dark x-small color="white">
                <v-icon
                  dark
                  color="grey darken-3"
                  @click="$emit('remove-file', file.id)"
                >
                  close
                </v-icon>
              </v-btn>
            </template>
            <span>Xóa tệp</span>
          </v-tooltip>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

const ManageFile = (Vue as VueConstructor).extend({
  name: "ManageFile",
  props: {
    files: {
      type: Array,
      required: true
    }
  }
});

export default ManageFile;
export type ManageFileRef = InstanceType<typeof ManageFile>;
</script>
