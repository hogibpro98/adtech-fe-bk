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
        <h2>Tên brandname: {{ item.name }}</h2>
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
              <span>Thêm mới Brandname Alias</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row
          v-for="(alias, index) in item.aliases"
          :key="index"
          justify="space-between"
          align="center"
          class=" mt-1"
        >
          <v-col class="w-45-percent" xs6 md6>
            <telco-select
              v-model="alias.telco_code"
              :loading="loading"
              :name="`aliases.${index}.telco_code`"
              :return-object="false"
              label="Nhà mạng"
              item-value="code"
              required
              rules="required"
            />
          </v-col>
          <v-col class="w-45-percent" xs6 md6>
            <v-text-field-with-validation
              v-model="alias.alias"
              :loading="loading"
              :name="`aliases.${index}.alias`"
              type="text"
              label="Alias"
              required
              rules="required|existCharacter|stringBrandName|max:11"
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
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  aliases: [
    {
      telco_code: "",
      alias: ""
    }
  ]
};

const BrandNameCreateDialog = Vue.extend({
  name: "BrandNameCreateDialog",
  components: {
    FormDialog,
    VTextFieldWithValidation,
    VNumberFieldWithValidation,
    VTextAreaWithValidation,
    TelcoSelect
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
      return "Cập nhật Brandname Alias";
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
        aliases: this.item.aliases
      };
      try {
        const result = await this.$axios.$post(
          "brandname/update-aliases",
          data
        );
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cập nhật Brandname Alias");
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
      this.item.aliases.splice(index, 1);
    },
    show(item) {
      if (item) {
        this.item = cloneDeep(item);
        if (!item.aliases) {
          this.$set(this.item, "aliases", [
            {
              telco_code: "",
              alias: ""
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
      this.item.aliases.push({
        telco_code: "",
        alias: ""
      });
    }
  }
});

export default BrandNameCreateDialog;
export type ProfileDiscountedRateDialogRef = InstanceType<
  typeof BrandNameCreateDialog
>;
</script>

<style scoped>
.w-45-percent {
  flex: 0 0 45%;
  max-width: 45%;
}
</style>
