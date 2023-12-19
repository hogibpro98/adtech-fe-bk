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
        <span class="headline"
          >{{ isEdit ? "Cập nhật" : "Thêm" }} IP truy cập API</span
        >
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-flex
                xs12
                class="d-flex justify-content-space-between align-items-center"
              >
                <span class="bold">Tên doanh nghiệp:</span>
                <span>{{ item.full_name }}</span>
              </v-flex>
              <v-flex
                xs12
                class="d-flex justify-content-space-between align-items-center"
              >
                <span class="bold">Tên tài khoản:</span>
                <span>{{ item.username }}</span>
              </v-flex>
              <v-flex
                xs12
                class="d-flex justify-content-space-between align-items-center mt-4"
              >
                <span class="bold">Danh sách IP được truy cập API</span>
                <v-btn color="primary" icon @click="addIp">
                  <v-icon>
                    add
                  </v-icon>
                </v-btn>
              </v-flex>
              <v-flex>
                Cần có subnet mask ở sau địa chỉ IP. VD: 255.255.0.0/1,
                192.12.178.55/32,...
              </v-flex>
              <v-flex
                v-if="item === {} || item.ipv4.length === 0"
                xs12
                class="red--text"
              >
                Chưa thiết lập địa chỉ IP.
              </v-flex>
              <v-flex
                v-for="(ip, index) in item.ipv4"
                :key="'ipv4_' + index"
                xs12
              >
                <v-row no-gutters justify="space-between" align="center">
                  <v-col cols="6">
                    <v-text-field-with-validation
                      v-model="item.ipv4[index].ip"
                      :loading="loading"
                      :name="`ipv4.${index}.ip`"
                      type="text"
                      label="IP"
                      required
                      rules="required"
                    />
                  </v-col>
                  <v-col cols="5" class="pl-2">
                    <v-text-field-with-validation
                      v-model="item.ipv4[index].note"
                      :loading="loading"
                      :counter="100"
                      :name="`ipv4.${index}.note`"
                      type="text"
                      label="Ghi chú"
                      rules="max:100"
                    />
                  </v-col>
                  <v-col cols="1" align="end">
                    <v-btn small icon color="error" @click="ipRemove(index)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
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
import { responseErrorToString } from "~/util/array";

const DEFAULT_ITEM = {
  id: null,
  full_name: "",
  username: "",
  ipv4: []
};

interface ItemInterface {
  ipv4: Array<string>;
  id?: number;
  full_name: string;
  username: string;
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

const ApiIpDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ApiIpDialog",
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
      }
    },

    addIp() {
      this.item.ipv4.push({
        ip: "",
        note: ""
      });
    },
    ipRemove(index) {
      this.item.ipv4.splice(index, 1);
    },
    async editItem() {
      this.loading = true;
      // setTimeout(()=>{
      //   console.log(this.item)
      //   this.showing = false
      //   this.loading = false
      // }, 3000)
      try {
        const res = await this.$userIpRepository.post("sync", {
          user_id: this.item.id,
          ipv4: this.item.ipv4
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Cập nhật địa chỉ IP thành công!");
          this.$emit("success");
        } else {
          this.$toast.global.action_fail();
        }
        this.showing = false;
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

export default ApiIpDialog;
export type ApiIpDialogRef = InstanceType<typeof ApiIpDialog>;
</script>
