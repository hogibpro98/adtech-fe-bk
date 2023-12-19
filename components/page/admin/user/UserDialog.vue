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
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-layout flex wrap>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.username"
                    :loading="loading"
                    :disabled="item.status === userStatus.ACTIVE"
                    name="username"
                    type="text"
                    label="Tên tài khoản"
                    required
                    rules="required|min:4|max:128|isUsername"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.full_name"
                    :loading="loading"
                    name="full_name"
                    type="text"
                    label="Họ tên"
                    required
                    rules="required|max:255"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.email"
                    :loading="loading"
                    :disabled="item.status === userStatus.ACTIVE"
                    name="email"
                    type="text"
                    label="Email"
                    required
                    rules="required|email|max:255"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.phone_number"
                    :loading="loading"
                    name="phone_number"
                    type="text"
                    label="Số điện thoại"
                    required
                    rules="required|max:15|numeric"
                  />
                </v-flex>
                <v-flex xs12>
                  <role-select
                    v-model="role"
                    name="role"
                    required
                    is-system-mode="1"
                    item-value="name"
                    :return-object="false"
                    :disabled="isEdit"
                  />
                </v-flex>
                <v-flex xs12>
                  <service-checkbox
                    v-model="item.services"
                    name="services"
                    required
                    rules="required"
                    :query-prams="queryParamServices"
                  />
                </v-flex>

                <!--                <v-flex xs12 class="py-2">-->
                <!--                  <file-upload-->
                <!--                    v-model="item.file_documents"-->
                <!--                    :accept="acceptFileTypes"-->
                <!--                    maximum="5"-->
                <!--                    label="Tài liệu đính kèm"-->
                <!--                    class="registration-upload"-->
                <!--                    name="file_documents"-->
                <!--                    height="150px"-->
                <!--                    multiple-->
                <!--                    return-object-->
                <!--                  ></file-upload>-->
                <!--                </v-flex>-->

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
import cloneDeep from "lodash/cloneDeep";
import { ROLE_ADMIN } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422, USER_STATUS } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { RolesInterface } from "~/interface/data/permission";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";
import RoleSelect from "~/components/select/RoleSelect.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { DOCUMENT } from "~/constants/fileType";

const DEFAULT_ITEM = {
  username: "",
  full_name: "",
  email: "",
  phone_number: "",
  password: "",
  roles: [],
  role_ids: []
};

interface ItemInterface {
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  roles: Array<RolesInterface>;
  role_ids: Array<number>;
}

interface ComponentData {
  $userRepository: RepositoryInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
  userStatus: object;
  confirmPassword: string;
  role: string;
  isAdmin: boolean;
}

interface ComponentMethods {
  show(item: ItemInterface, role: string): void;
  onSubmit(): void;
  editItem(): void;
  addItem(): void;
  resetData(): void;
}

const UserDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "UserDialog",
  components: {
    FileUpload,
    RoleSelect,
    ServiceCheckbox,
    VTextFieldWithValidation
  },
  data() {
    return {
      showing: false,
      isEdit: false,
      timeout: 0,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      userStatus: USER_STATUS,
      confirmPassword: "",
      acceptFileTypes: DOCUMENT,
      role: null,
    };
  },
  computed: {
    queryParamServices() {
      return {
        user_id: this.$auth?.$state?.user?.id
      }
    },
    isAdmin() {
      return (
        this.item.roles[0]?.name === ROLE_ADMIN || this.role === ROLE_ADMIN
      );
    },
    title() {
      const action = this.isEdit ? "Cập nhật" : "Thêm";
      const object = "tài khoản";
      return `${action} ${object}`;
    }
  },
  watch: {
    role(val) {
      console.log(val);
    },
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null, role = ROLE_ADMIN) {
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      }
      this.role = role;
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
        const res = await this.$userRepository.create({
          ...this.item,
          role: this.role
        });

        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("người dùng");
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
        const res = await this.$userRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("người dùng");
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

    mapData() {
      this.item.role_ids = this.item.roles.map(e => e.id);
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.isEdit = false;
        this.role = null;
        this.confirmPassword = "";
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default UserDialog;
export type UserDialogRef = InstanceType<typeof UserDialog>;
</script>
