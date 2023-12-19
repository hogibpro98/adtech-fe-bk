<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    :title="`Xóa ${objectName}`"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa
      <span class="red--text">{{ items.length }}</span> {{ objectName }} không?
      <br />
      Danh sách {{ objectName }} sẽ bị xóa:
      <ul>
        <li
          v-for="(value, index) in sortedItems.slice(0, 5)"
          :key="index"
          class="error--text"
        >
          {{ value[itemText] }}
        </li>
      </ul>
      <span v-if="items.length > 5" class="red--text">...</span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";
import { BrandnameInterface } from "~/interface/data/brandname";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import massActionDialog from "~/mixins/massActionDialog";

interface ComponentData {
  loading: boolean;
  items: Array<number>;
  $brandNameRepository: RepositoryInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  resource: string;
  objectName: string;
  itemText: string;
  $toast: ToastInterface;
}

interface ComponentMethod {
  show(item: BrandnameInterface): void;
  hide(): void;
  deleteItem(): void;
}

const MassDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend(  {
  name: "MassDeleteDialog",
  components: { ConfirmDialog },
  mixins: [massActionDialog],
  props: {
    objectName: {
      type: String,
      required: true
    },
    itemText: {
      type: String,
      default: "name"
    },
    resource: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      items: []
    };
  },
  computed: {
    ids() {
      return this.items.map(e => e.id);
    }
  },
  methods: {
    show(items) {
      this.items = cloneDeep(items);
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },

    async deleteItem() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(
          `${this.resource}/mass-delete`,
          {
            ids: this.ids
          }
        );
        this.loading = false;
        if (data.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success(this.objectName);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default MassDeleteDialog;
export type MassDeleteDialogRef = InstanceType<typeof MassDeleteDialog>;
</script>
