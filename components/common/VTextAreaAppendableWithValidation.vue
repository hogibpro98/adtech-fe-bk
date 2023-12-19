<template>
  <validation-provider
    v-slot="{ errors, valid, validate }"
    :name="$attrs.name || $attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <div class="d-flex align-items-center mt-2">
      <label
        :class="errors.length > 0 ? 'error--text' : ''"
        class="v-label py-2 block"
      >
        {{ label }}
        <span v-if="required" class="error--text"> (*) </span>
      </label>
      <slot v-if="$scopedSlots.appendTitle" name="appendTitle"></slot>
    </div>
    <v-textarea
      v-bind="$attrs"
      ref="textarea"
      v-model="formatValue"
      dense
      auto-grow
      class="text-area"
      :error-messages="errors"
      :disabled="disabled"
      v-on="$listeners"
    >
      <!-- Pass on all slots & slot scope-->
      <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      <template
        v-for="(_, name) in $scopedSlots"
        :slot="name"
        slot-scope="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>
      <!--      BEGIN DIALOG PART-->
      <template #append>
        <v-row justify="center" align="center" class="mx-1 pt-1">
          <v-dialog v-model="dialog" persistent max-width="600px" class="mb-6">
            <template #activator="{ on: dialog, attrs }">
              <v-tooltip bottom>
                <template #activator="{ on: tooltip }">
                  <v-btn
                    v-show="dynamic"
                    color="primary"
                    dark
                    v-bind="attrs"
                    icon
                    v-on="{ ...tooltip, ...dialog }"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>{{ tooltipMess }}</span>
              </v-tooltip>
            </template>
            <!--            BEGIN POPUP PART-->
            <validation-observer ref="observer">
              <v-card>
                <v-card-title class="flex justify-center pt-6">
                  <span class="text-h5">{{ dialogTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" class="py-0 mb-3">
                        <v-text-field-with-validation
                          v-if="dialog"
                          v-model="paramName"
                          name="text_content"
                          label="Tên trường động"
                          :rules="paramNameRule"
                          required
                        ></v-text-field-with-validation>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="grey" text @click.native="dialog = false">
                    Hủy
                  </v-btn>

                  <v-btn
                    color="blue darken-1"
                    class="mr-2"
                    text
                    @click="appendText"
                  >
                    Xác nhận
                  </v-btn>
                </v-card-actions>
              </v-card>
            </validation-observer>
            <!--            END POPUP PART-->
          </v-dialog>
          <v-dialog
            v-model="linkDialog"
            persistent
            max-width="600px"
            class="mb-6"
          >
            <template #activator="{on: dialog, attrs}">
              <v-tooltip bottom>
                <template #activator="{on: tooltip}">
                  <v-btn
                    v-show="canInsertLink"
                    color="orange darken-1"
                    v-bind="attrs"
                    icon
                    dark
                    v-on="{ ...dialog, ...tooltip }"
                  >
                    <v-icon>mdi-link-variant-plus</v-icon>
                  </v-btn>
                </template>
                <span>Thêm mới link</span>
              </v-tooltip>
            </template>
            <validation-observer ref="obs">
              <v-card>
                <v-card-title class="flex justify-center pt6">
                  <span class="text-h5">{{ linkDialogTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" class="py-0 mb-3">
                        <v-text-field-with-validation
                          v-if="linkDialog"
                          v-model="link"
                          name="url"
                          label="Link muốn thêm"
                          required
                          rules="required|max:500"
                        ></v-text-field-with-validation>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="grey" text @click.native="linkDialog = false">
                    Hủy
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    class="mr-2"
                    text
                    :loading="isLoadingAppend"
                    @click.native="appendLink"
                  >
                    Xác nhận
                  </v-btn>
                </v-card-actions>
              </v-card>
            </validation-observer>
          </v-dialog>
        </v-row>
      </template>
    </v-textarea>
    <!--    END DIALOG PART-->
  </validation-provider>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { HTTP_CODE_422 } from "~/constants/code";
import { HTTPS } from "~/constants/characterSpecial";

export default (Vue as VueConstructor).extend({
  name: "VTextAreaAppendableWithValidation",
  components: { VNumberFieldWithValidation, VTextFieldWithValidation },
  mixins: [wrapper],
  props: {
    dynamic: {
      type: Boolean,
      default: false
    },
    canInsertLink: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: String,
      default: ""
    },
    required: {
      type: Boolean,
      default: false
    },
    tooltipMess: {
      type: String,
      default: ""
    },
    dialogTitle: {
      type: String,
      default: ""
    },
    paramNameRule: {
      type: [String, Object],
      default: "required|max:100|parameterNameCheck"
    },
    paramLengthRule: {
      type: [String, Object],
      default: "required|numeric|max_value:999"
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: () => {
    return {
      dialog: false,
      linkDialog: false,
      isLoadingAppend: false,
      linkDialogTitle: "Thêm mới link",
      paramName: "",
      link: "",
      maxParamLength: 0,
      domain: ""
    };
  },
  computed: {
    formatValue: {
      get() {
        let formatContent = "";
        const shortLink = this.$store.state.shorten.shorten;
        const content = this.value?.split(/(\s+)/);
        for (let i = 0; i < content?.length; i++) {
          const contentHttps = content[i].slice(0, 5);
          if (contentHttps === HTTPS) {
            formatContent += content[i];
          } else {
            formatContent += content[i];
          }
        }
        this.$store.commit("shorten/ADD_CONTENT_URL", formatContent);
        return formatContent;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },

  methods: {
    async appendLink() {
      const isValid = await this.$refs.obs.validate();

      if (isValid) {
        this.isLoadingAppend = true;
        try {
          const { code, domain } = await this.$axios
            .post("/short-url/store", {
              url: this.link
            })
            .then(res => res.data);
          this.$store.commit("shorten/ADD_SHORTEN_URL", {
            url: this.link.trim(),
            code: `${code}`
          });
          if (domain) {
            this.domain = domain;
            this.$store.commit("shorten/GET_DOMAIN_URL", domain);
          }

          this.formatValue += ` ${domain}/${code} `;
          this.link = "";
          this.linkDialog = false;
        } catch (e) {
          if (e.response && e.response.status === HTTP_CODE_422) {
            this.$refs.obs.setErrors(e.response.data.errors);
          } else {
            this.$toast.global.action_fail();
            console.log(e);
          }
        } finally {
          this.isLoadingAppend = false;
        }
      }
    },
    async appendText() {
      const isValid = await this.$refs.observer.validate();
      if (!isValid) {
        this.dialog = true;
        return;
      }
      this.dialog = false;
      const appendText =
        "{" +
        this.paramName.trim() +
        // "," +
        // (this.maxParamLength === null ? 0 : this.maxParamLength).toString() +
        "}";
      const textarea = this.$refs.textarea.$refs.input;
      const sentence = textarea.value;
      const len = sentence.length;
      let pos = textarea.selectionStart;
      if (pos === undefined) {
        pos = 0;
      }
      const before = sentence.substr(0, pos);
      const after = sentence.substr(pos, len);
      this.$emit("input", before + appendText + after);
      // this.$refs.textarea.focus()
    }
  }
});
</script>
