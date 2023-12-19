<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    min-width="600"
    max-width="800"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline px-3 pt-3">Cập nhật đơn giá</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(editItem)">
              <v-layout flex wrap>
                <v-flex xs12>
                  <v-select-with-validation
                    v-model="item.agency_id"
                    :disabled="true"
                    name="0.agency_id"
                    label="Tên agency"
                    :items="[
                      {
                        label:
                          typeof item.agency === 'undefined'
                            ? ''
                            : item.agency.full_name,
                        value: item.agency_id
                      }
                    ]"
                    item-text="label"
                    item-value="value"
                    required
                    rules="required"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-select-with-validation
                    v-model="item.cat_id"
                    :disabled="true"
                    name="0.cat_id"
                    label="Lĩnh vực hoạt động"
                    :items="[item.cat_id]"
                    required
                    rules="required"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-select-with-validation
                    v-model="item.service"
                    :disabled="true"
                    :loading="loading"
                    name="0.service"
                    label="Dịch vụ"
                    :items="[
                      { label: 'Tin nhắn SMS', value: 'sms' },
                      { label: 'Tin nhắn MMS', value: 'mms' }
                    ]"
                    item-text="label"
                    item-value="value"
                    required
                    rules="required"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-number-field-with-validation
                    v-model="item.price"
                    :loading="loading"
                    label="Đơn giá"
                    name="0.price"
                    required
                    rules="min:0|required"
                    min-value-fixed
                    min-value="0"
                    suffix="₫"
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
                    Cập nhật
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
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import { responseErrorToString } from "~/util/array";

const DEFAULT_ITEM = {
  agency_id: null,
  cat_id: "",
  service: "",
  price: null
};

interface ItemInterface {
  agency_id: number;
  cat_id: string;
  service: string;
  price: number;
}

interface ComponentData {
  $priceServiceRepository: RepositoryInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  loading: boolean;
  timeout: number;
  item: ItemInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  editItem(): void;
  resetData(): void;
}

const PriceServiceEditDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PriceServiceEditDialog",
  components: {
    VSelectWithValidation,
    VNumberFieldWithValidation
  },
  data() {
    return {
      showing: false,
      loading: false,
      timeout: null,
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
    show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
    },

    async editItem() {
      this.loading = true;
      const editItem = [
        {
          agency_id: this.item.agency_id,
          cat_id: this.item.cat_id,
          price: this.item.price,
          service: this.item.service
        }
      ];
      try {
        const res = await this.$priceServiceRepository.update(editItem);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("Đơn giá");
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

    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default PriceServiceEditDialog;
export type PriceServiceEditDialogRef = InstanceType<
  typeof PriceServiceEditDialog
>;
</script>
