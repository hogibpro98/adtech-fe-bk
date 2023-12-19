<template>
  <div class="my-2">
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label || name"
      :rules="rules"
      :vid="name"
    >
      <v-layout row justify-space-between class="no-margin">
        <h3 :class="valid ? '' : 'error-text'" class="v-label theme--light">
          {{ label }}
          <span v-if="required" class="red--text"> (*) </span>
        </h3>
        <v-btn color="primary" dark class="mb-2 mr-0" @click="addItem()">
          <v-icon>add</v-icon> Thêm
        </v-btn>
      </v-layout>
      <div v-model="data" />
      <v-data-table
        :headers="headers"
        :items="data"
        :items-per-page="3"
        :footer-props="footerProps"
        class="elevation-1"
        no-data-text="Không có dữ liệu"
      >
        <template slot="item.image_src" slot-scope="props">
          <div class="data-table-cell">
            <v-img
              v-if="props.value"
              v-img="{ src: props.value }"
              :lazy-src="props.value"
              :src="props.value"
              contain
              height="50"
              max-width="100"
            />
          </div>
        </template>
        <template slot="item.action" slot-scope="props">
          <v-tooltip offset-overflow bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                depressed
                outlined
                icon
                fab
                dark
                color="error"
                small
                class="mr-2"
                v-on="on"
                @click="showDialogDelete(props.item)"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </template>
            <span>Xóa</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <size-template-type-display-ads-delete-dialog
        ref="deleteDialog"
        v-on="$listeners"
      />
      <size-template-display-ads-form-dialog
        ref="formDialog"
        @check-and-add-size-template="checkAndAddSizeTemplate"
        v-on="$listeners"
      />
      <div class="v-text-field__details mt-2">
        <div class="v-messages theme--light error--text" role="alert">
          <div class="v-messages__wrapper">
            <div class="v-messages__message">
              {{ resError || (errors && errors[0]) }}
            </div>
          </div>
        </div>
      </div>
    </validation-provider>
  </div>
</template>

<script lang="ts">
import SizeTemplateDisplayAdsFormDialog, {
  SizeTemplateDisplayAdsFormDialogRef
} from "@/components/page/setting-display-ads/type-display/SizeTemplateDisplayAdsFormDialog.vue";
import SizeTemplateTypeDisplayAdsDeleteDialog, {
  SizeTemplateTypeDisplayAdsDeleteDialogRef
} from "@/components/page/setting-display-ads/type-display/SizeTemplateTypeDisplayAdsDeleteDialog.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { ApiDataTableRef } from "~/components/table/ApiDataTable.vue";
import { DisplayAdsTypeInterface } from "~/interface/data/displayAdsType";

interface ComponentData {
  $refs: {
    table: ApiDataTableRef;
    formDialog: SizeTemplateDisplayAdsFormDialogRef;
    deleteDialog: SizeTemplateTypeDisplayAdsDeleteDialogRef;
  };
  headers: DataTableHeader;
  data: Array<object>;
  footerProps: object;
  startIndex: number;
  resError: string;
}

interface ComponentMethods {
  showDialogDelete(item: DisplayAdsTypeInterface): void;

  addItem(): void;

  checkAndAddSizeTemplate(item: DisplayAdsTypeInterface): void;
}

const SizeTemplateTypeDisplayAdsTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SizeTemplateTypeDisplayAdsTable",
  components: {
    SizeTemplateTypeDisplayAdsDeleteDialog,
    SizeTemplateDisplayAdsFormDialog
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    required: {
      default: false,
      type: Boolean
    },
    rules: {
      type: [Object, String],
      default: ""
    }
  },
  data() {
    return {
      headers: [
        { text: "Tên", value: "name" },
        { text: "ảnh", value: "image_src" },
        { text: "width", value: "width" },
        { text: "height", value: "height" },
        { text: "Hành động", value: "action", width: "100px" }
      ],
      data: [],
      footerProps: {
        "items-per-page-options": [3, 10, 50]
      },
      resError: ""
    };
  },
  watch: {
    items(val) {
      this.data = (val || []).map((item, index) => ({
        index,
        ...item
      }));
    }
  },
  mounted() {
    this.data = (this.items || []).map((item, index) => ({
      index,
      ...item
    }));
  },
  methods: {
    showDialogDelete(item) {
      this.$refs.deleteDialog.show(item);
    },
    addItem() {
      this.$refs.formDialog.show();
    },
    checkAndAddSizeTemplate(item) {
      const isExistSize = this.data.find(
        size => size.width === item.width && size.height === item.height
      );
      if (isExistSize) {
        this.resError = "Kích thước đã tồn tại";
      } else {
        this.resError = "";
        this.$emit("add-size-template", item);
        this.$refs.formDialog.hidden();
      }
    }
  }
});

export default SizeTemplateTypeDisplayAdsTable;
export type SizeTemplateTypeDisplayAdsTableRef = InstanceType<
  typeof SizeTemplateTypeDisplayAdsTable
>;
</script>
