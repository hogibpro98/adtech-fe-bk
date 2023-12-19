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
        <span class="headline"
          >{{ isEdit ? "Cập nhật" : "Thêm" }} nhóm người dùng</span
        >
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-layout flex wrap>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.name"
                    :counter="100"
                    :loading="loading"
                    name="name"
                    type="text"
                    label="Mã nhóm người dùng"
                    required
                    rules="required|max:100"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.display_name"
                    :counter="100"
                    :loading="loading"
                    name="display_name"
                    type="text"
                    label="Tên hiển thị"
                    required
                    rules="required|max:100"
                  />
                </v-flex>
                <v-flex xs12>
                  <page-select
                    v-model="item.default_page"
                    :loading="loading"
                    label="Trang mặc định"
                    value-prop="href"
                    hint="Trang chuyển tới sau khi đăng nhập"
                    persistent-hint
                  />
                </v-flex>
                <v-flex xs12>
                  <v-number-field-with-validation
                    v-if="isSuperAdmin"
                    v-model="item.level"
                    name="level"
                    label="Cấp độ"
                    rules="max:10"
                    hint="Nhóm người dùng cấp độ thấp mới có quyền tác động đến cấp độ cao hơn"
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
                    >Hủy
                  </v-btn>
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
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS } from "~/constants/code";
import PageSelect from "~/components/page/admin/permission/PageSelect.vue";
import { validationError } from "~/helpers/ultis";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { FormInterface } from "~/interface/vee-validate/form";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { ROLE_SUPER_ADMIN } from "~/constants/role";

const DEFAULT_ITEM = {
  name: "",
  display_name: "",
  description: "",
  default_page: ""
};

interface ItemInterface {
  name: string;
  display_name: string;
  description: string;
  default_page: string;
}

interface ComponentData {
  $refs: {
    form: FormInterface;
  };
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
  $roleRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  onSubmit(): void;
  addItem(): void;
  editItem(): void;
  resetData(): void;
}

const RoleDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RoleDialog",
  components: {
    VNumberFieldWithValidation,
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
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  computed:{
    isSuperAdmin() {
      return this.$authHasRole(ROLE_SUPER_ADMIN);
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
        const res = await this.$roleRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("nhóm người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (validationError(e)) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },

    async editItem() {
      this.loading = true;
      try {
        const res = await this.$roleRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("nhóm người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (validationError(e)) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default RoleDialog;
export type RoleDialogRef = InstanceType<typeof RoleDialog>;
</script>
