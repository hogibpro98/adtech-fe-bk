<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :loading="loading"
    :retain-focus="false"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template slot="actions">
      <v-layout v-if="!$scopedSlots.actions" justify-end>
        <v-btn
          color="blue darken-1"
          class="mr-0"
          text
          type="submit"
          @click="hidden"
        >
          Đóng
        </v-btn>
      </v-layout>
    </template>
    <template slot="content">
      <v-flex xs12 class="form-group">
        <label class="v-label  block mb-4">
          Thêm vào header
        </label>
        <code-block :script="headerScript" />
      </v-flex>
      <v-flex xs12 class="mt-10 mb-5">
        <v-tabs v-model="setting.tab">
          <v-tab>Mặc định</v-tab>
          <v-tab>Chờ sự kiện</v-tab>
          <v-tab>Chủ động</v-tab>
        </v-tabs>
        <div v-if="setting.tab === 1">
          <v-flex xs12>
            <v-radio-group v-model="setting.type" row>
              <v-radio label="Event Scroll" value="content_locker"></v-radio>
              <v-radio
                label="Khi chuyển trang"
                value="before_leave_page"
              ></v-radio>
            </v-radio-group>
          </v-flex>
          <v-layout v-if="setting.type === 'content_locker'" flex wrap>
            <v-flex xs6 class="form-group pr-2">
              <v-text-field-with-validation
                v-model="setting.parent"
                type="text"
                label="Selector thêm quảng cáo"
                rules="max:255"
                :counter="255"
              />
            </v-flex>
            <v-flex xs6 class="form-group pl-2">
              <v-text-field-with-validation
                v-model="setting.targetElement"
                type="text"
                label="Selector lắng nghe"
                rules="max:255"
                :counter="255"
              />
            </v-flex>
            <v-flex xs6 class="form-group pr-2">
              <v-number-field-with-validation
                v-model="setting.intersectionRatio"
                type="text"
                label="Tỉ lệ xem nội dung"
                suffix="%"
                min-value-fixed
                min-value="0"
                max-value="100"
                rules="min_value:0|max_value:100"
              />
            </v-flex>
          </v-layout>
          <v-layout v-else-if="setting.type === 'before_leave_page'" flex wrap>
            <v-flex xs6 class="form-group pr-2">
              <v-number-field-with-validation
                v-model="setting.frequency"
                type="text"
                label="Tần suất hiển thị"
                suffix="%"
                min-value-fixed
                min-value="0"
                max-value="100"
                rules="min_value:0|max_value:100"
              />
            </v-flex>
          </v-layout>
        </div>
        <div v-if="setting.tab === 2">
          <v-flex xs6>
            <v-text-field-with-validation
              v-model="setting.parent"
              type="text"
              label="Selector thêm quảng cáo"
              rules="max:255"
              :counter="255"
            />
          </v-flex>
        </div>
        <label class="v-label  block mb-1 mt-8">
          {{ labelAddScript }}
        </label>
        <code-block :script="generateScript" />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import CodeBlock from "@/components/common/CodeBlock.vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import shortid from "shortid";
import Vue, { VueConstructor } from "vue";
import { SDK_URL } from "~/constants/resource";
import { ToastInterface } from "~/interface/plugin/toast";
import { ZoneInterface } from "~/interface/data/zone";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

const DEFAULT_ITEM = {
  ads_type_id: null,
  channel_id: null,
  description: "",
  id: null,
  slot: 1,
  name: "",
  script: ""
};

const DEFAULT_SETTING = {
  tab: 0,
  parent: "body",
  type: "content_locker",
  targetElement: "body",
  intersectionRatio: 30,
  frequency: 30
};

interface ComponentData {
  title: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ZoneInterface;
  key: string;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: ZoneInterface): void;

  hidden(): void;
}

const CodeZoneFormShowDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CodeZoneFormShowDialog",
  components: {
    VNumberFieldWithValidation,
    VTextFieldWithValidation,
    CodeBlock,
    FormDialog
  },
  data() {
    return {
      title: "",
      isEdit: false,
      timeout: null,
      loading: false,
      setting: cloneDeep(DEFAULT_SETTING),
      key: shortid.generate(),
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    labelAddScript() {
      switch (this.setting.tab) {
        case 2:
          return "Run script khi nào cần hiển thị";
        case 1:
          return "Thêm script vào đề chạy";
        case 0:
        default:
          return "Thêm vào vị trí đặt quảng cáo";
      }
    },
    generateScript() {
      const zoneId = this.item.id;

      switch (this.setting.tab) {
        case 2:
          return `
<script>
(adsbyvda = window.adsbyvda || []).push({
  className: '',
  parent: '${this.setting.parent}', //DOM để quảng cáo thêm vào
  dataAdLayoutKey: 'default',
  dataAdClient: ${this.item?.channel?.inventory_id},
  dataAdSlot: ${zoneId}
});
<\/script>
          `;
        case 1:
          return `
<script>
(adsbyvda = window.adsbyvda || []).push({
  className: '',
  parent: '${this.setting.parent}', //DOM để quảng cáo thêm vào
  dataAdFormat: '${this.setting.type}',
  ${
    this.setting.type === "content_locker"
      ? `dataAdOption: { targetElement: '${
          this.setting.targetElement
        }', intersectionRatio: ${this.setting.intersectionRatio / 100} },`
      : ""
  }
  ${
    this.setting.type === "before_leave_page"
      ? `dataAdOption: { frequency: ${this.setting.frequency / 100} },`
      : ""
  }
  dataAdLayoutKey: 'default',
  dataAdClient: ${this.item?.channel?.inventory_id},
  dataAdSlot: ${zoneId}
});
<\/script>
          `;
        case 0:
        default:
          return `
<ins
  class="adsbyvda"
  style="display: block"
  data-ad-format="auto"
  data-ad-layout-key="default"
  data-ad-client="${this.item?.channel?.inventory_id}"
  data-ad-slot="${zoneId}"
><\/ins>
<script>
  (adsbyvda = window.adsbyvda || []).push({});
<\/script>
          `;
      }
    },
    headerScript() {
      return `<script data-ad-client="${this.item?.channel?.inventory_id}" async src="${SDK_URL}"><\/script>`;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.setting = cloneDeep(DEFAULT_SETTING);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.setting = cloneDeep(DEFAULT_SETTING);
      }
      this.key = shortid.generate();
      this.title = "Cấu hình hiển thị quảng cáo";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    }
  }
});

export default CodeZoneFormShowDialog;
export type CodeZoneFormShowDialogRef = InstanceType<
  typeof CodeZoneFormShowDialog
>;
</script>
