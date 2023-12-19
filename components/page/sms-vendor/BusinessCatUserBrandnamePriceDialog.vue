<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :loading="loading"
    :label-button-confirm="labelButtonConfirm"
    content-class="flex xs12 lg7 xl5"
    @on-submit="handleSubmit"
  >
    <template slot="content">
      <v-flex xs12>
        <h2>Tên lĩnh vực hoạt động: {{ item.name }}</h2>
      </v-flex>
      <div class="w-full">
        <v-row class="mt-3 mr-3">
          <v-col
            class="col-11 d-flex justify-content-space-between align-items-center"
          >
            <h4>Thêm mới cấu hình:</h4>
          </v-col>
          <v-col class="col-1 justify-content-center d-flex">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="handleAddConfig">
                  <v-icon color="success">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              <span>Thêm mới cấu hình giá theo brandname và agency</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row
          v-for="(alias, index) in item.business_cat_brandname_user_price"
          :key="index"
          justify="space-between"
          align="center"
          class=" mt-1"
        >
          <v-col class="w-30-percent" xs3 md3>
            <agency-advertiser-select
              v-model="alias.user_id"
              :loading="loading"
              :name="`business_cat_brandname_user_price.${index}.telco_code`"
              :return-object="false"
              rules="required"
              type="text"
              required
              label="Người sở hữu"
              item-value="id"
            ></agency-advertiser-select>
          </v-col>
          <v-col class="w-30-percent" xs3 md3>
            <brandname-select
              v-model="alias.brandname_id"
              :loading="loading"
              :name="`business_cat_brandname_user_price.${index}.brandname_id`"
              :return-object="false"
              rules="required"
              type="text"
              required
              label="Brandname"
              item-value="id"
            ></brandname-select>
          </v-col>
          <v-col class="w-30-percent" xs3 md3>
            <v-number-field-with-validation
              v-model="alias.price"
              :loading="loading"
              name="`business_cat_brandname_user_price.${index}.price`"
              type="text"
              label="Giá tiền"
              suffix="₫"
              required
              rules="required"
            />
          </v-col>
          <v-col class="col-1 mt-4 d-flex justify-content-center">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="handleDelete(index)"
                >
                  <v-icon color="error">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
              <span>Xóa config discounted</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import TelcoSelect from "@/components/select/TelcoSelect.vue";
import FormDialog from "~/components/common/FormDialog.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import BrandnameSelect from "~/components/select/BrandnameSelect.vue";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  business_cat_brandname_user_price: [
    {
      brandname_id: "",
      user_id: "",
      price: ""
    }
  ]
};

const BusinessCatUserBrandnamePriceDialog = Vue.extend({
  name: "BusinessCatUserBrandnamePriceDialog",
  components: {
    FormDialog,
    VNumberFieldWithValidation,
    TelcoSelect,
    AgencyAdvertiserSelect,
    BrandnameSelect
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    title() {
      return "Cập nhật cấu hình giá theo brandname và agency";
    },
    labelButtonConfirm() {
      return "Xác nhận";
    }
  },
  methods: {
    handleSubmit() {
      if (this.isEdit) {
        this.editItem();
      }
    },
    async editItem() {
      this.loading = true;
      const data = {
        id: this.item.id,
        business_cat_brandname_user_price: this.item
          .business_cat_brandname_user_price
      };
      try {
        const result = await this.$axios.$post(
          "business-cat/update-business-cat-brandname-user-prices",
          data
        );
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success(
            "cập nhật cấu hình giá theo brandname và agency"
          );
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          console.log(e.response);
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    handleDelete(index) {
      this.item.business_cat_brandname_user_price.splice(index, 1);
    },
    show(item) {
      if (item) {
        this.item = cloneDeep(item);
        if (!item.business_cat_brandname_user_price) {
          this.$set(this.item, "business_cat_brandname_user_price", [
            {
              brandname_id: "",
              user_id: "",
              price: ""
            }
          ]);
        }
        this.isEdit = true;
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    handleAddConfig() {
      this.item.business_cat_brandname_user_price.push({
        brandname_id: "",
        user_id: "",
        price: ""
      });
    }
  }
});

export default BusinessCatUserBrandnamePriceDialog;
export type BusinessCatUserBrandnamePriceDialogRef = InstanceType<
  typeof BusinessCatUserBrandnamePriceDialog
>;
</script>

<style scoped>
.w-45-percent {
  flex: 0 0 45%;
  max-width: 45%;
}
</style>
