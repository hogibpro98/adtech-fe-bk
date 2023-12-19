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
        <span class="headline">Truy cập dữ liệu</span>
      </v-card-title>
      <v-card-text>
        Chọn các dữ liệu mà người dùng
        <span class="red--text"> {{ item.username }} </span>
        được truy cập và sử dụng
      </v-card-text>
      <v-card-text>
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <v-layout flex wrap>
              <v-flex xs12>
                <business-activity-select
                  v-model="cat_ids"
                  name="cat_ids"
                  label="Lĩnh vực hoạt động"
                  return-object
                  multiple
                  :query-params="catIdParams"
                >
                </business-activity-select>
              </v-flex>
              <v-flex xs12>
                <brandname-select
                  v-model="brandnames"
                  :disabled="!selectedCatIds || selectedCatIds.length < 1"
                  name="brandname_ids"
                  label="Brandname"
                  return-object
                  multiple
                  :query-params="brandnameParams"
                >
                </brandname-select>
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
                  Xác nhận
                </v-btn>
              </v-layout>
            </v-layout>
          </form>
        </validation-observer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import VPasswordWithValidation from "@/components/common/VPasswordWithValidation.vue";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import {
  DialogInterface,
  FormDialogInterface
} from "~/interface/components/dialog";
import BrandnameSelect from "~/components/select/BrandnameSelect.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";

const DEFAULT_ITEM = {
  id: null,
  username: ""
};

const UserBrandnameDialog = (Vue as VueConstructor<
  Vue & DialogInterface & FormDialogInterface
>).extend({
  name: "UserBrandnameDialog",
  components: { BusinessActivitySelect, BrandnameSelect },
  data() {
    return {
      showing: false,
      item: cloneDeep(DEFAULT_ITEM),
      loading: false,
      timeout: null,
      confirmPassword: "",
      brandnames: [],
      cat_ids: []
    };
  },
  computed: {
    selectedCatIds() {
      if (this.cat_ids && this.cat_ids.length > 0) {
        return this.cat_ids.map(e => e.id);
      }
      return null;
    },
    catIdParams() {
      return {
        // custom_get_all: 1
      };
    },
    brandnameParams() {
      return {
        custom_cat_id: this.selectedCatIds ?? null
        // custom_get_all: 1
      };
    }
  },
  watch: {
    // brandnameParams(val) {
    //   this.brandnames = this.item.
    // },
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
    async show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
      await this.$nextTick();
      this.fetchData();
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    },

    async fetchData() {
      this.loading = true;
      this.brandnames = [];
      this.cat_ids = [];
      const param = {
        id: this.item.id
      };
      try {
        const res = await this.$userRepository.post("get-access-data", param);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          // this.$set(this, "cat_ids", res.data.cat_ids);
          this.cat_ids = res.data.cat_ids;
          // wait for select changed because of params
          await this.$nextTick();
          await this.$nextTick();
          await this.$nextTick();
          await this.$nextTick();
          this.brandnames = res.data.brandnames;

          // this.$set(this, "brandnames", res.data.brandnames);
        }
      } catch (e) {
        this.loading = false;
      }
    },

    async onSubmit() {
      this.loading = true;
      const data = {
        id: this.item.id,
        brandname_ids: this.brandnames.map(e => e.id),
        cat_ids: this.cat_ids.map(e => e.name)
      };
      try {
        const res = await this.$userRepository.post("set-access-data", data);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.edit_success("dữ liệu truy cập cho người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    }
  }
});
export default UserBrandnameDialog;
export type UserBrandnameDialogRef = InstanceType<typeof UserBrandnameDialog>;
</script>
