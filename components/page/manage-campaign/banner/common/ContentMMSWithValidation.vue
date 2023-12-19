<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <input v-model="media.length > 0 ? media : null" hidden />
    <label
      :disabled="!!disabled"
      :class="
        `v-label pt-3 pt-4 mt-2 v-label-bold ${
          errors.length > 0 ? 'error--text' : ''
        }`
      "
    >
      {{ $attrs.label }}
      <span v-if="required" class="error--text"> (*) </span>
    </label>
    <div class="d-flex menu-content mb-1 mt-2">
      <custom-icon
        icon="title"
        desc="Thêm text"
        color="primary"
        tooltip="Thêm nội dung chữ"
        class="ml-2"
        :disabled="disabled"
        @click="addText"
      ></custom-icon>
      <custom-icon
        icon="image"
        desc="Thêm ảnh"
        color="primary"
        tooltip="Thêm ảnh hiển thị"
        class="ml-2"
        :disabled="disabled"
        @click="addImage"
      ></custom-icon>
      <custom-icon
        icon="movie"
        desc="Thêm video"
        color="primary"
        tooltip="Thêm video hiển thị"
        class="ml-2"
        :disabled="disabled"
        @click="addVideo"
      ></custom-icon>
    </div>
    <v-card-subtitle class="no-padding caption max-w-2xl">
      Bạn có thể kéo thả nội dung quảng cáo để thay đổi thứ tự nội dung. Tổng
      dung lượng nội dung quảng cáo phải nhỏ hơn 300Kb
    </v-card-subtitle>
    <div class="v-text-field__details mt-2">
      <div class="v-messages theme--light error--text" role="alert">
        <div class="v-messages__wrapper">
          <div class="v-messages__message">
            {{ errors && errors[0] }}
          </div>
        </div>
      </div>
    </div>
    <!--    <v-container class="pa-0" v-if="!disabled">-->
    <!--    <v-checkbox-->
    <!--      v-model="dynamic"-->
    <!--      :label="'Tin nhắn động'"-->
    <!--     class="my-0 pa-0">-->
    <!--    </v-checkbox></v-container>-->
    <draggable
      v-model="content"
      group="people"
      class="list-group"
      ghost-class="ghost"
      handle=".item-draggable"
      @start="dragging = true"
      @end="dragging = false"
    >
      <template v-for="(media, index) in content">
        <div
          :id="media.id"
          :key="`content-media-${media.id}-${index}`"
          class="item-draggable"
        >
          <div v-if="dynamic && !disabled">
            <v-text-area-appendable-with-validation
              v-if="media.type === 'text'"
              v-model="media.data"
              :loading="loading"
              :disabled="disabled"
              :name="`content.${index}`"
              placeholder="Nhập nội dung"
              can-insert-link
              filled
              label="Nội dung chữ"
              rows="3"
              dynamic
              :tooltip-mess="'Thêm trường động'"
              :dialog-title="'Thêm trường động'"
            >
              <template slot="appendTitle">
                <v-tooltip offset-overflow bottom>
                  <template #activator="{ on, attrs }">
                    <v-hover v-slot="{ hover }">
                      <span class="ml-auto" v-on="on">
                        <v-btn
                          v-bind="attrs"
                          :color="hover ? 'error' : 'default'"
                          depressed
                          :retain-focus-on-click="false"
                          text
                          dense
                          icon
                          height="32"
                          width="32"
                          x-small
                          :disabled="disabled"
                          class="ma-0 px-1"
                          @click.native="removeMedia(media.id)"
                        >
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </span>
                    </v-hover>
                  </template>
                  <span>Xóa</span>
                </v-tooltip>
              </template>
            </v-text-area-appendable-with-validation>
          </div>
          <div v-else>
            <v-text-area-appendable-with-validation
              v-if="media.type === 'text'"
              v-model="media.data"
              :loading="loading"
              :disabled="disabled"
              :name="`content.${index}`"
              placeholder="Nhập nội dung"
              filled
              label="Nội dung chữ"
              rows="3"
              can-insert-link
            >
              <template slot="appendTitle">
                <v-tooltip offset-overflow bottom>
                  <template #activator="{ on, attrs }">
                    <v-hover v-slot="{ hover }">
                      <span class="ml-auto" v-on="on">
                        <v-btn
                          v-bind="attrs"
                          :color="hover ? 'error' : 'default'"
                          depressed
                          :retain-focus-on-click="false"
                          text
                          dense
                          icon
                          height="32"
                          width="32"
                          x-small
                          :disabled="disabled"
                          class="ma-0 px-1"
                          @click.native="removeMedia(media.id)"
                        >
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </span>
                    </v-hover>
                  </template>
                  <span>Xóa</span>
                </v-tooltip>
              </template>
            </v-text-area-appendable-with-validation>
          </div>
          <file-upload
            v-if="media.type === 'image'"
            v-model="media.data"
            :disabled="disabled"
            :accept="IMAGE_SEND_MMS"
            :max-file-size="0.3"
            height="7rem"
            :name="`content.${index}`"
            class="form-upload"
            display-label="Ảnh hiển thị (< 300KB)"
            label="Ảnh hiển thị"
          >
            <template slot="appendTitle">
              <v-tooltip offset-overflow bottom>
                <template #activator="{ on, attrs }">
                  <v-hover v-slot="{ hover }">
                    <span class="ml-auto" v-on="on">
                      <v-btn
                        v-bind="attrs"
                        :color="hover ? 'error' : 'default'"
                        depressed
                        :retain-focus-on-click="false"
                        text
                        dense
                        icon
                        height="32"
                        width="32"
                        x-small
                        :disabled="disabled"
                        class="ma-0 px-1"
                        @click.native="removeMedia(media.id)"
                      >
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </span>
                  </v-hover>
                </template>
                <span>Xóa</span>
              </v-tooltip>
            </template>
          </file-upload>
          <file-upload
            v-if="media.type === 'video'"
            v-model="media.data"
            :accept="VIDEO_SEND_MMS"
            :max-file-size="0.3"
            :disabled="disabled"
            height="7rem"
            :name="`content.${index}`"
            class="form-upload"
            display-label="Video hiển thị (<300KB)"
            label="Video hiển thị"
          >
            <template slot="appendTitle">
              <v-tooltip offset-overflow bottom>
                <template #activator="{ on, attrs }">
                  <v-hover v-slot="{ hover }">
                    <span class="ml-auto" v-on="on">
                      <v-btn
                        v-bind="attrs"
                        :color="hover ? 'error' : 'default'"
                        depressed
                        :retain-focus-on-click="false"
                        text
                        dense
                        icon
                        height="32"
                        width="32"
                        x-small
                        :disabled="disabled"
                        class="ma-0 px-1"
                        @click.native="removeMedia(media.id)"
                      >
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </span>
                  </v-hover>
                </template>
                <span>Xóa</span>
              </v-tooltip>
            </template>
          </file-upload>
        </div>
      </template>
    </draggable>
  </validation-provider>
</template>
<script lang="ts">
import Draggable from "vuedraggable";
import { isEqual } from "lodash";
import { v4 as uuidv4 } from "uuid";
import FileUpload from "@/components/common/FileUpload/index";
import VTextAreaWithValidation from "@/components/common/VTextAreaStyleFillWithValidation";
import { IMAGE_SEND_MMS, VIDEO_SEND_MMS } from "@/constants/fileType";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import VTextAreaAppendableWithValidation from "~/components/common/VTextAreaAppendableWithValidation.vue";
import CustomIcon from "~/components/common/CustomIcon.vue";
import { isArray, isEmpty } from "~/util/typeof";
import { ToastInterface } from "~/interface/plugin/toast";

interface ContentInterface {
  id: string;
  type: string;
  data: any;
}

interface ComponentData {
  IMAGE_SEND_MMS: Array<string>;
  VIDEO_SEND_MMS: Array<string>;
  content: Array<ContentInterface>;
  dragging: boolean;
  $toast: ToastInterface;
  dynamic: Boolean;
}

interface ComponentMethod {
  checkMove(): boolean;

  addVideo(): void;

  addImage(): void;

  addText(): void;

  addMedia(type: string): void;

  removeMedia(id: string): void;
}

const ContentMMSWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "ContentMMSWithValidation",
  components: {
    VTextAreaAppendableWithValidation,
    CustomIcon,
    FileUpload,
    VTextAreaWithValidation,
    Draggable
  },
  mixins: [wrapper],
  props: {
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: null,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    dynamic: {
      type: [Boolean, Number],
      default: false
    }
  },
  data: () => ({
    innerValue: "",
    IMAGE_SEND_MMS,
    VIDEO_SEND_MMS,
    content: [
      {
        id: uuidv4(),
        type: "text",
        data: null
      },
      {
        id: uuidv4(),
        type: "image",
        data: null
      },
      {
        id: uuidv4(),
        type: "video",
        data: null
      }
    ],
    dragging: false
  }),
  computed: {
    media() {
      return this.content
        .filter(({ data }) => !isEmpty(data))
        .map(({ id, type, data }) => ({
          id: id || uuidv4(),
          type,
          data
        }));
    }
  },
  watch: {
    media(val) {
      if (!isEqual(val, this.innerValue)) {
        this.innerValue = val;
      }
    },
    innerValue(val) {
      if (!isEqual(val, this.media)) {
        if (!val) {
          this.content = [
            {
              id: uuidv4(),
              type: "text",
              data: null
            },
            {
              id: uuidv4(),
              type: "image",
              data: null
            },
            {
              id: uuidv4(),
              type: "video",
              data: null
            }
          ];
        } else {
          const mediaProps = val;
          const existText = !!val.find(v => v.type === "text");
          const existImage = !!val.find(v => v.type === "image");
          const existVideo = !!val.find(v => v.type === "video");

          if (!existText && !existImage && !existVideo) {
            this.content = [
              {
                id: uuidv4(),
                type: "text",
                data: null
              },
              {
                id: uuidv4(),
                type: "image",
                data: null
              },
              {
                id: uuidv4(),
                type: "video",
                data: null
              }
            ];
          } else {
            this.content = mediaProps;
          }
        }
      }
    }
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },
  methods: {
    checkMove: () => {
      return true;
    },
    addVideo() {
      this.addMedia("video");
    },
    addImage() {
      this.addMedia("image");
    },
    addText() {
      this.addMedia("text");
    },
    addMedia(type) {
      let newMedia = null;
      switch (type) {
        case "image":
          newMedia = {
            id: uuidv4(),
            type: "image",
            data: null
          };
          break;
        case "video":
          newMedia = {
            id: uuidv4(),
            type: "video",
            data: null
          };
          break;
        case "text":
        default:
          newMedia = {
            id: uuidv4(),
            type: "text",
            data: null
          };
      }
      if (isArray(this.content)) {
        this.content = [...this.content, newMedia];
      } else {
        this.content = [newMedia];
      }
    },
    removeMedia(id) {
      if (id) {
        const indexContent = this.content.findIndex(item => item.id === id);
        if (indexContent !== -1 && isArray(this.content)) {
          this.content = [
            ...this.content.slice(0, indexContent),
            ...this.content.slice(indexContent + 1)
          ];
        }
      }
    }
  }
});

export default ContentMMSWithValidation;
export type ContentMMSWithValidationRef = InstanceType<
  typeof ContentMMSWithValidation
>;
</script>

<style lang="scss" scoped>
.v-label-bold {
  display: block;

  line-height: 1.25rem;
  font-size: 16px;
  font-weight: 400 !important;
  color: #000 !important;
}

.buttons {
  margin-top: 35px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.menu-content {
  border: solid 1px #9e9e9e;
  border-radius: 4px;
  padding: 4px 0;

  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 11;
  background-color: #fff;

  &::v-deep .custom-icon {
    opacity: 1 !important;
  }
}
</style>
