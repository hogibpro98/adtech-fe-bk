<template>
  <fullscreen-dialog
    ref="refFormDialog"
    class="layout-form-dialog"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="title">
      {{ title }}
    </template>
    <template>
      <validation-observer ref="form" v-slot="{ handleSubmit }">
        <form
          class="form-input background"
          @submit.prevent="handleSubmit(onSubmit)"
        >
          <v-container
            grid-list-xl
            fluid
            class="no-padding no-margin form-body-content mb-3"
          >
            <v-layout row justify-center>
              <v-text-field-with-validation
                v-model="item.name"
                label="Tên layout"
                name="name"
                required
                rules="required|max:200"
                style="width: 300px"
              />
            </v-layout>
          </v-container>
          <v-container
            grid-list-xl
            fluid
            class="no-padding no-margin form-body-content"
          >
            <layout-type-select v-model="item.layout_type" class="left" />

            <div class="right">
              <v-row no-gutters>
                <v-col cols="12" sm="7" xs="12" class="preview-dialog-wrapper">
                  <div class="title title-block">
                    Xem trước kiểu quảng cáo
                  </div>
                  <div class="preview-dialog">
                    <layout-preview :data="item" />
                  </div>
                </v-col>
                <v-col cols="12" sm="5" xs="12">
                  <div class="title title-block">
                    Cấu hình kiểu quảng cáo
                  </div>
                  <layout-setting v-model="item" />
                </v-col>
              </v-row>
            </div>
          </v-container>
        </form>
      </validation-observer>
    </template>
  </fullscreen-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { TagInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import FullscreenDialog from "~/components/common/FullscreenDialog.vue";
import LayoutImageSample from "~/components/page/manage-layout/LayoutImageSample.vue";
import LayoutSetting from "~/components/page/manage-layout/LayoutSetting.vue";
import {
  STYLE_COMPONENT_DEFAULT,
  STYLE_IMAGE_DEFAULT,
  STYLE_TEXT_DEFAULT
} from "~/constants/default";
import LayoutPreview from "~/components/page/manage-layout/layout-preview/index.vue";
import LayoutTypeSelect from "~/components/page/manage-layout/field/LayoutTypeSelect.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: TagInterface;
  $refs: { refFormDialog: FormDialogRef };
  $manageLayoutRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  editItem: Function;
  addItem: Function;
  onSubmit: Function;
}

const DEFAULT_ITEM = {
  name: "",
  layout_type: "layout_title_top",
  style_component: cloneDeep(STYLE_COMPONENT_DEFAULT),
  style_image: cloneDeep(STYLE_IMAGE_DEFAULT),
  style_title: cloneDeep(STYLE_TEXT_DEFAULT),
  style_description: cloneDeep(STYLE_TEXT_DEFAULT)
};

const LayoutFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "LayoutFormDialog",
  components: {
    VTextFieldWithValidation,
    LayoutTypeSelect,
    LayoutPreview,
    LayoutSetting,
    LayoutImageSample,
    FullscreenDialog
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} layout`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    selectLayoutTemplate() {},
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },

    async addItem() {
      this.loading = true;
      try {
        const res = await this.$manageLayoutRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("layout");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },

    async editItem() {
      this.loading = true;

      try {
        const res = await this.$manageLayoutRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("layout");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default LayoutFormDialog;
export type LayoutFormDialogRef = InstanceType<typeof LayoutFormDialog>;
</script>

<style lang="scss" scoped>
.form-body-content {
  display: flex;

  .title-block {
    margin-bottom: 0.8rem;
  }

  .left {
    width: 300px;
  }

  .right {
    width: calc(100% - 300px);
    padding-left: 1.2rem;
  }

  .preview-dialog-wrapper {
    padding-right: 1.2rem;
  }

  .preview-dialog {
    border: 2px dashed #dadce0;
    border-radius: 4px;
  }
}
</style>
