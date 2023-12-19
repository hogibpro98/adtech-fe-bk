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
        <span class="headline px-3 pt-3">{{ isEdit ? "Cập nhật" : "Thêm" }} đơn giá</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-layout flex wrap>
                <v-flex xs12>
                  <agency-advertiser-select
                    :loading="loading"
                    v-model="agency"
                    name="agency_id"
                    label="Tên agency"
                    required
                    rules="required"
                    :excludes="[{id: 94}]"
                  />
<!--                  :excludes="[{id: 94,-->
<!--                  full_name: 'doremon43',-->
<!--                  is_agency: false,-->
<!--                  agency: {-->
<!--                  id: 81,-->
<!--                  full_name: 'agency'-->
<!--                  }-->
<!--                  }]"-->
                </v-flex>
                <v-flex xs12>
                  <business-activity-select
                    :disabled="isEdit"
                    v-model="cat_id_item"
                    :loading="loading"
                    name="cat_id"
                    label="Lĩnh vực hoạt động"
                    required
                    rules="required"
                    :return-object="false"
                    item-value="name"
                    :attach="true"
                    :excludes="[{name: 'MMS_COS_QC'}, {name: 'MMS_BDS_QC'}]"
                  />
                </v-flex>
<!--                <v-flex xs12>-->
<!--                  <v-select-with-validation-->
<!--                    :disabled="isEdit"-->
<!--                    v-model="item.service"-->
<!--                    :loading="loading"-->
<!--                    name="service"-->
<!--                    label="Dịch vụ"-->
<!--                    :items="[{label: 'Tin nhắn SMS', value: 'sms'}, {label: 'Tin nhắn MMS', value: 'mms'}]"-->
<!--                    item-text="label"-->
<!--                    item-value="value"-->
<!--                    required-->
<!--                    rules="required"-->
<!--                  />-->
<!--                </v-flex>-->
                <v-flex xs12>
                  <div class="subtitle-1 mt-2 mb-2">Dịch vụ <span class="red--text"> (*) </span></div>
                  <v-radio-group v-model="item.service"
                                 row
                                 mandatory
                  class="mt-1">
                    <v-radio
                      v-for="(n, index) in [{label: 'Tin nhắn SMS', value: 'sms'}, {label: 'Tin nhắn MMS', value: 'mms'}]"
                      :key="index"
                      :label="n.label"
                      :value="n.value"
                    >
                    </v-radio>
                  </v-radio-group>
                </v-flex>

<!--                <v-flex xs12>-->
<!--                  <v-select-with-validation-->
<!--                    :disabled="isEdit"-->
<!--                    :loading="loading"-->
<!--                    v-model="item.cat_id"-->
<!--                    name="cat_id"-->
<!--                    label="Lĩnh vực hoạt động"-->
<!--                    :items="[item.cat_id]"-->
<!--                    required-->
<!--                    rules="required"-->
<!--                  />-->
<!--                </v-flex>-->
                <v-flex xs12>
                  <v-number-field-with-validation
                    :loading="loading"
                    v-model="item.price"
                    label="Đơn giá"
                    rules="min:0"
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
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import {BusinessActivityInterface} from "~/interface/data/brandname";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import {UserInfoInterface, UserInterface} from "~/interface/data/user";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import {responseErrorToString} from "~/util/array";

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
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
  cat_id_item: BusinessActivityInterface;
  agency: UserInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  onSubmit(): void;
  editItem(): void;
  addItem(): void;
  resetData(): void;
}

const PriceServiceDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
  >).extend({
  name: "PriceServiceDialog",
  components: {
    VSelectWithValidation,
    AgencyAdvertiserSelect,
    VNumberFieldWithValidation,
    BusinessActivitySelect,
  },
  data() {
    return {
      showing: false,
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      cat_id_item: null,
      agency: null,
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    },
    // cat_id_item: {
    //   handler(val) {
    //     this.item.cat_id = val===null?null:val.name;
    //   },
    //   deep: true
    // },
    // agency: {
    //   handler(val) {
    //     this.item.agency_id = val===null?null:val.id;
    //   },
    //   deep: true
    // }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.cat_id_item = item.cat_id;
        this.agency = cloneDeep(item.agency);
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
      const items = [{
        agency_id: this.item.agency_id,
        cat_id: typeof this.cat_id_item.name==="undefined"?this.cat_id_item:this.cat_id_item.name,
        price: this.item.price,
        service: this.item.service
      }]
      // const items = [this.item]
      try {
        const res = await this.$priceServiceRepository.create(items);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("Đơn giá");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
        }
      }
    },

    async editItem() {
      this.loading = true;
      const items = [{
        agency_id: this.item.agency_id,
        cat_id: typeof this.cat_id_item.name==="undefined"?this.cat_id_item:this.cat_id_item.name,
        price: this.item.price,
        service: this.item.service
      }]
      try {
        const res = await this.$priceServiceRepository.update(items);
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
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
        }
      }
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.cat_id_item=null;
        this.agency=null;
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default PriceServiceDialog;
export type PriceServiceDialogRef = InstanceType<typeof PriceServiceDialog>;
</script>
