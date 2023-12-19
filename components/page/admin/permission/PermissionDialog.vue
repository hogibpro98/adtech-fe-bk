<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    max-width="40%"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ isEdit ? "Cập nhật" : "Thêm" }} quyền</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-layout flex wrap>
                <v-flex sm6>
                  <page-select
                    v-model="page"
                    :loading="loading"
                    rules="required"
                    required
                  />
                </v-flex>
                <v-flex sm3 class="pl-4">
                  <v-checkbox v-model="checkbox" label="Menu"></v-checkbox>
                </v-flex>
                <v-flex sm3 class="pl-2">
                  <v-text-field-with-validation
                    v-model="action"
                    :loading="loading"
                    :disabled="checkbox"
                    name="action"
                    type="text"
                    label="Hành động"
                    required
                    rules="required"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.name"
                    :loading="loading"
                    name="name"
                    type="text"
                    label="Mã quyền"
                    disabled
                    hint="Mã quyền sẽ được tự sinh dựa vào trang và hành động"
                    persistent-hint
                    required
                    rules="required"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.display_name"
                    :loading="loading"
                    name="display_name"
                    type="text"
                    label="Tên hiển thị"
                    required
                    rules="required"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-area-with-validation
                    v-model="item.description"
                    :loading="loading"
                    name="description"
                    label="Mô tả"
                    rules="max:255"
                    counter="255"
                  />
                </v-flex>
                <v-layout justify-end>
                  <v-btn color="grey" text @click.native="showing = false"
                    >Hủy</v-btn
                  >
                  <v-btn
                    :loading="loading"
                    color="primary darken-1"
                    class="mr-0"
                    text
                    type="submit"
                  >
                    {{ isEdit ? "Cập nhật" : "Thêm" }}
                  </v-btn>
                </v-layout>
              </v-layout>
            </form>
          </validation-observer>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422, PERMISSION_VIEW } from "~/constants/code";
import PageSelect from "~/components/page/admin/permission/PageSelect.vue";
import { FormInterface } from "~/interface/vee-validate/form";
import { RepositoryInterface } from "~/interface/plugin/repository";

const DEFAULT_ITEM = {
  name: "",
  display_name: "",
  description: ""
};

interface ItemInterface {
  name: string;
  display_name: string;
  description: string;
}

interface ComponentData {
  $refs: {
    form: FormInterface;
  };
  $permissionRepository: RepositoryInterface;
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  checkbox: boolean;
  item: ItemInterface;
  page: string;
  action: string;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  onSubmit(): void;
  addItem(): void;
  editItem(): void;
  resetData(): void;
  generateName(): void;
}

const PermissionDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PermissionDialog",
  components: {
    PageSelect,
    VTextAreaWithValidation,
    VTextFieldWithValidation
  },
  data() {
    return {
      showing: false,
      isEdit: false,
      timeout: null,
      loading: false,
      checkbox: false,
      item: cloneDeep(DEFAULT_ITEM),
      page: "",
      action: ""
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    },
    page() {
      this.generateName();
    },
    action() {
      this.generateName();
    },
    checkbox(val) {
      if (val) {
        this.action = PERMISSION_VIEW;
      } else {
        this.action = "";
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        const tmp = this.item.name.split(".");
        this.action = tmp[1];
        if (this.action === PERMISSION_VIEW) {
          this.checkbox = true;
        }
        this.page = tmp[0];
      }

      this.showing = true;
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
        const res = await this.$permissionRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("quyền");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },

    async editItem() {
      this.loading = true;
      try {
        const res = await this.$permissionRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("quyền");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.isEdit = false;
        this.page = "";
        this.action = "";
        this.checkbox = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    },

    generateName() {
      if (this.page || this.action) {
        this.item.name = `${this.page}.${this.action}`;
      } else {
        this.item.name = "";
      }
    }
  }
});

export default PermissionDialog;
export type PermissionDialogRef = InstanceType<typeof PermissionDialog>;
</script>
