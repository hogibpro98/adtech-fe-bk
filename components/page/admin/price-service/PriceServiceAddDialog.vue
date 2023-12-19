<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    content-class="flex xs12 lg10 xl8"
    v-on="$listeners"
  >
    <validation-observer ref="form" v-slot="{ handleSubmit }">
      <form @submit.prevent="handleSubmit(addItem)">
        <v-card min-height="450">
          <v-card-title>
            <span class="headline px-3 pt-3">Thêm đơn giá</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" class="px-1">
                  <agency-advertiser-select
                    v-model="agency"
                    :loading="loading"
                    name="agency_id"
                    label="Tên agency"
                    required
                    rules="required"
                  />
                </v-col>
                <v-col cols="12">
                  <v-layout justify-start>
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn
                          color="primary darken-1"
                          text
                          v-bind="attrs"
                          @click.native="addMoreItem"
                          v-on="on"
                        >
                          <v-icon>
                            mdi-plus-thick
                          </v-icon>
                          THÊM ĐƠN GIÁ
                        </v-btn>
                      </template>
                      <span>Thêm bản ghi đơn giá khác</span>
                    </v-tooltip>
                  </v-layout>
                </v-col>
                <v-layout column reverse>
                  <v-row
                    v-for="(itemData, index) in item"
                    :key="index"
                    no-gutters
                    class="my-3 mx-1 elevation-1"
                  >
                    <v-col cols="12" class="my-2">
                      <!--                      <v-card elevation="1" class="pa-2">-->
                      <v-col cols="12" class="pa-0 ma-0">
                        <v-card-title
                          v-if="item.length > 1"
                          class="pb-0 mb-0 pt-2"
                        >
                          <v-layout justify-end>
                            <v-tooltip v-if="item.length > 1" bottom>
                              <template #activator="{ on, attrs }">
                                <v-btn
                                  text
                                  color="primary darken-1"
                                  v-bind="attrs"
                                  @click.native="removeItem(index)"
                                  v-on="on"
                                >
                                  Xóa
                                </v-btn>
                              </template>
                              <span>Xóa bản ghi đơn giá này</span>
                            </v-tooltip>
                          </v-layout>
                        </v-card-title>
                      </v-col>
                      <v-col cols="12" class="py-0 px-4 ma-0">
                        <v-row no-gutters>
                          <v-col class="pr-2" cols="5">
                            <div class="caption font-weight-regular">
                              Dịch vụ <span class="red--text"> (*) </span>
                            </div>
                            <v-radio-group
                              v-model="itemData.service"
                              row
                              mandatory
                              :disabled="!!itemData.cat_id"
                              class="mt-0"
                            >
                              <v-radio
                                v-for="(n, jndex) in [
                                  { label: 'Tin nhắn SMS', value: 'sms' },
                                  { label: 'Tin nhắn MMS', value: 'mms' }
                                ]"
                                :key="jndex"
                                :label="n.label"
                                :value="n.value"
                              >
                              </v-radio>
                            </v-radio-group>
                          </v-col>
                          <v-col class="pr-4" cols="5">
                            <business-activity-select
                              v-model="itemData.cat_id"
                              :attach="true"
                              :name="`${index}.cat_id`"
                              label="Lĩnh vực hoạt động"
                              required
                              :type="itemData.service"
                              rules="required"
                              :return-object="false"
                              item-value="name"
                              :excludes="exclude(itemData)"
                              :menu-props="{ maxHeight: 175 }"
                            />
<!--                            <business-activity-select-->
<!--                              v-model="itemData.cat_id"-->
<!--                              :loading="loading"-->
<!--                              :name="`${index}.cat_id`"-->
<!--                              label="Lĩnh vực hoạt động"-->
<!--                              required-->
<!--                              :type="itemData.service"-->
<!--                              rules="required"-->
<!--                              :return-object="false"-->
<!--                              :value-type.sync="itemData.service"-->
<!--                              item-value="name"-->
<!--                              :attach="true"-->
<!--                              :excludes="exclude(itemData)"-->
<!--                              :menu-props="{ maxHeight: 175 }"-->
<!--                              auto-->
<!--                            />-->
                          </v-col>
                          <v-col class="" cols="2">
                            <v-number-field-with-validation
                              v-model="itemData.price"
                              :loading="loading"
                              label="Đơn giá"
                              min-value-fixed
                              required
                              rules="min:0|required"
                              :name="`${index}.price`"
                              min-value="0"
                              suffix="₫"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                      <!--                      </v-card>-->
                    </v-col>
                  </v-row>
                </v-layout>
              </v-row>
            </v-container>
          </v-card-text>
          <v-layout justify-end class="mt-6 pa-6">
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
              Thêm
            </v-btn>
          </v-layout>
        </v-card>
      </form>
    </validation-observer>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { UserInterface } from "~/interface/data/user";
import { responseErrorToString } from "~/util/array";

interface ItemInterface {
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
  item: Array<any>;
  agency: UserInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;

  addItem(): void;

  resetData(): void;
}

const PriceServiceAddDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PriceServiceAddDialog",
  components: {
    BusinessActivitySelect,
    AgencyAdvertiserSelect,
    VNumberFieldWithValidation
  },
  data() {
    return {
      showing: false,
      loading: false,
      timeout: null,
      item: [
        {
          cat_id: "",
          service: "sms",
          price: null
        }
      ],
      agency: null
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
    show() {
      this.showing = true;
    },

    async addItem() {
      this.loading = true;
      const items = this.item.map(itemData => ({
        agency_id: this.agency.id,
        ...itemData
      }));
      try {
        const res = await this.$priceServiceRepository.post("upsert", items);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("đơn giá");
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
        this.item = [
          {
            cat_id: "",
            service: "sms",
            price: null
          }
        ];
        this.agency = null;
        this.$refs.form.reset();
      }, 300);
    },

    addMoreItem() {
      this.item.push({
        cat_id: "",
        service: "sms",
        price: null
      });
    },

    removeItem(index) {
      this.item.splice(index, 1);
    },

    exclude(chooseItem) {
      return this.item
        .filter(
          itemData =>
            itemData.service === chooseItem.service &&
            (chooseItem.cat_id === ""
              ? true
              : itemData.cat_id !== chooseItem.cat_id)
        )
        .map(itemData => ({
          name: itemData.cat_id
        }));
    }
  }
});

export default PriceServiceAddDialog;
export type PriceServiceAddDialogRef = InstanceType<
  typeof PriceServiceAddDialog
>;
</script>

<style scoped>
.custom-number-field {
  margin-top: -12px !important;
}

.custom-radio {
  margin-top: -15px !important;
}
</style>
