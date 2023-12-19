<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    min-width="400"
    max-width="600"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ isEdit ? "Cập nhật" : "Thêm" }} ip whitelist</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-layout flex wrap>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.ip"
                    :loading="loading"
                    name="ip"
                    type="text"
                    hint="Có thể sử dụng địa chỉ IP có wildcard *. VD: 255.255.*.*, *.12.*.55,..."
                    persistent-hint
                    label="IP"
                    required
                    rules="required|ip"
                  />
                </v-flex>
                <v-flex xs12>
                  <role-select
                    v-model="item.role"
                    :loading="loading"
                    name="role_id"
                    is-system-mode="1"
                    label="Nhóm người dùng"
                    required
                    return-object
                    rules="required"
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
import cloneDeep from "lodash/cloneDeep";
import RoleSelect from "@/components/select/RoleSelect.vue";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { RolesInterface } from "~/interface/data/permission";

const DEFAULT_ITEM = {
  ip: "",
  role: null,
  role_id: null
};

interface ItemInterface {
  ip: string;
  role: RolesInterface;
  role_id: string;
}

interface ComponentData {
  $whitelistIpRepository: RepositoryInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  onSubmit(): void;
  editItem(): void;
  addItem(): void;
  resetData(): void;
}

const WhitelistIpDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "WhitelistIpDialog",
  components: {
    VTextFieldWithValidation,
    RoleSelect
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

    mapData() {
      if (this.item.role) {
        this.item.role_id = this.item.role.id;
      } else {
        this.item.role_id = null;
      }
    },

    async addItem() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$whitelistIpRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("ip whitelist");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
        }
      }
    },

    async editItem() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$whitelistIpRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("ip whitelist");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
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

export default WhitelistIpDialog;
export type WhitelistIpDialogRef = InstanceType<typeof WhitelistIpDialog>;
</script>
