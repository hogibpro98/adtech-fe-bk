<template>
  <v-container>
    <v-layout justify-center>
      <v-flex xs12 md8 lg8>
        <v-card>
          <v-overlay v-if="loading" absolute color="#fff" class="z-1">
            <v-progress-circular
              :width="4"
              :size="25"
              indeterminate
              color="primary"
            >
            </v-progress-circular>
          </v-overlay>
          <v-card-title>
            Cấu hình đồng bộ tin nhắn
          </v-card-title>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form
              class="form-input background"
              @submit.prevent="handleSubmit(apply)"
            >
              <div v-if="time_config">
                <span v-if="first" class="error--text px-4 pt-2">
                  <i
                    >Giá trị các lần khởi tạo tiếp theo sẽ được áp dụng vào ngày
                    hôm sau (*)</i
                  >
                </span>
                <v-layout align-center justify-space-between class="px-4 pt-2">
                  <v-card width="100%">
                    <v-card-text v-if="!first" style="color: #333333">
                      <i>Đại lý được phép đồng bộ</i>
                      <v-divider></v-divider>
                      <v-chip-group column>
                        <v-chip
                          v-for="(item, index) in time_config.today.agency"
                          :key="index"
                          class="list-item"
                        >
                          {{ item }}
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                    <v-card-text style="color: #333333">
                      <i v-if="!first">Đại lý được phép đồng bộ vào ngày mai</i>
                      <i v-if="first">Đại lý được phép đồng bộ</i>
                      <v-divider class="mb-4"></v-divider>
                      <v-btn
                        color="success"
                        x-small
                        @click.prevent="toggleInput(`showAgency`)"
                      >
                        <v-icon dark size="16px">
                          mdi-plus
                        </v-icon>
                        Thêm mới đại lý
                      </v-btn>
                      <v-text-field
                        v-if="showAgency"
                        v-model="newAgency"
                        label="Đại lý"
                        @keyup.enter="
                          addItem(`newAgency`, `agency`, `showAgency`)
                        "
                      ></v-text-field>
                      <v-btn
                        v-if="showAgency"
                        class="mr-2"
                        color="success"
                        x-small
                        size="13px"
                        @click.prevent="
                          addItem(`newAgency`, `agency`, `showAgency`)
                        "
                      >
                        Thêm
                      </v-btn>
                      <v-btn
                        v-if="showAgency"
                        class="mx-2"
                        color="error"
                        x-small
                        @click.prevent="toggleInput(`showAgency`)"
                      >
                        Hủy
                      </v-btn>
                    </v-card-text>
                    <v-card-text>
                      <v-chip-group column>
                        <v-chip
                          v-for="(item, index) in time_config.nextday.agency"
                          :key="index"
                          class="list-item"
                          @click="removeItem(index, `agency`)"
                        >
                          {{ item }}
                          <v-icon
                            right
                            size="16px"
                            @click.stop="removeItem(index, `agency`)"
                            >mdi-close</v-icon
                          >
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                  </v-card>
                </v-layout>
                <v-layout align-center justify-space-between class="px-4 pt-2">
                  <v-card width="100%">
                    <v-card-text v-if="!first" style="color: #333333">
                      <i>Brandname được phép đồng bộ</i>
                      <v-divider></v-divider>
                      <v-chip-group column>
                        <v-chip
                          v-for="(item, index) in time_config.today.brandname"
                          :key="index"
                          class="list-item"
                        >
                          {{ item }}
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                    <v-card-text style="color: #333333">
                      <i v-if="!first"
                        >Brandname được phép đồng bộ vào ngày mai</i
                      >
                      <i v-if="first">Brandname được phép đồng bộ</i>
                      <v-divider class="mb-4"></v-divider>
                      <v-btn
                        color="success"
                        x-small
                        @click.prevent="toggleInput(`showBrandname`)"
                      >
                        <v-icon dark size="16px">
                          mdi-plus
                        </v-icon>
                        Thêm mới Brandname
                      </v-btn>
                      <v-text-field
                        v-if="showBrandname"
                        v-model="newBrandname"
                        label="Brandname"
                        @keyup.enter="
                          addItem(`newBrandname`, `brandname`, `showBrandname`)
                        "
                      ></v-text-field>
                      <v-btn
                        v-if="showBrandname"
                        class="mr-2"
                        color="success"
                        x-small
                        size="13px"
                        @click.prevent="
                          addItem(`newBrandname`, `brandname`, `showBrandname`)
                        "
                      >
                        Thêm
                      </v-btn>
                      <v-btn
                        v-if="showBrandname"
                        class="mx-2"
                        color="error"
                        x-small
                        @click.prevent="toggleInput(`showBrandname`)"
                      >
                        Hủy
                      </v-btn>
                    </v-card-text>
                    <v-card-text>
                      <v-chip-group column>
                        <v-chip
                          v-for="(item, index) in time_config.nextday.brandname"
                          :key="index"
                          class="list-item"
                          @click="removeItem(index, `brandname`)"
                        >
                          {{ item }}
                          <v-icon
                            right
                            size="16px"
                            @click.stop="removeItem(index, `brandname`)"
                            >mdi-close</v-icon
                          >
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                  </v-card>
                </v-layout>
                <v-layout align-center justify-space-between class="px-4 pt-2">
                  <v-card width="100%">
                    <v-card-text v-if="!first" style="color: #333333">
                      <i>Lĩnh vực hoạt động được phép đồng bộ</i>
                      <v-divider></v-divider>
                      <v-chip-group column>
                        <v-chip
                          v-for="(item, index) in time_config.today.catid"
                          :key="index"
                          class="list-item"
                        >
                          {{ item }}
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                    <v-card-text style="color: #333333">
                      <i v-if="!first"
                        >Lĩnh vực hoạt động được phép đồng bộ vào ngày
                        mai</i
                      >
                      <i v-if="first"
                        >Lĩnh vực hoạt động được phép đồng bộ</i
                      >
                      <v-divider class="mb-4"></v-divider>
                      <v-btn
                        color="success"
                        x-small
                        @click.prevent="toggleInput(`showCatId`)"
                      >
                        <v-icon dark size="16px">
                          mdi-plus
                        </v-icon>
                        Thêm mới lĩnh vực hoạt động
                      </v-btn>
                      <v-text-field
                        v-if="showCatId"
                        v-model="newCatId"
                        label="Lĩnh vực hoạt động"
                        @keyup.enter="addItem(`newCatId`, `catid`, `showCatId`)"
                      ></v-text-field>
                      <v-btn
                        v-if="showCatId"
                        class="mr-2"
                        color="success"
                        x-small
                        size="13px"
                        @click.prevent="
                          addItem(`newCatId`, `catid`, `showCatId`)
                        "
                      >
                        Thêm
                      </v-btn>
                      <v-btn
                        v-if="showCatId"
                        class="mx-2"
                        color="error"
                        x-small
                        @click.prevent="toggleInput(`showCatId`)"
                      >
                        Hủy
                      </v-btn>
                    </v-card-text>
                    <v-card-text>
                      <v-chip-group column>
                        <v-chip
                          v-for="(item, index) in time_config.nextday.catid"
                          :key="index"
                          class="list-item"
                          @click="removeItem(index, `catid`)"
                        >
                          {{ item }}
                          <v-icon
                            right
                            size="16px"
                            @click.stop="removeItem(index, `catid`)"
                            >mdi-close</v-icon
                          >
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                  </v-card>
                </v-layout>
              </div>
              <div v-else>
                <v-layout justify-center>
                  <v-btn color="primary darken-1" text @click="handleLogConfig">
                    Lấy cấu hình thời gian mặc định
                  </v-btn>
                </v-layout>
              </div>

              <v-card-actions>
                <v-layout justify-end>
                  <v-btn
                    color="primary darken-1"
                    text
                    :disabled="loading"
                    @click.prevent="handleSubmit(apply)"
                  >
                    Áp dụng
                  </v-btn>
                </v-layout>
              </v-card-actions>
            </form>
          </validation-observer>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";

interface ComponentData extends GlobalDataInterface {
  configs: object;
  loading: boolean;
  $systemConfigRepository: RepositoryInterface;
}

interface ComponentMethods {
  fetchConfig(): void;

  apply(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {},
  layout: "dashboard",
  data() {
    return {
      first: true,
      configs: {},
      loading: false,
      time_config: {
        today: {
          agency: [],
          brandname: [],
          catid: []
        },
        nextday: {
          agency: [],
          brandname: [],
          catid: []
        }
      },
      nextNum: 10,
      showAgency: false,
      showCatId: false,
      showBrandname: false,
      newAgency: "",
      newBrandname: "",
      newCatId: ""
    };
  },
  computed: {
    canEdit() {
      return this.$pageCan("edit");
    }
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      this.loading = true;
      const { data } = await this.$axios.$post("syn-ads-config/listing");
      this.configs = data[0];
      if (data.length > 0) {
        this.first = false;
        this.time_config = data[0].value;
      }
      this.loading = false;
    },
    async apply() {
      this.loading = true;
      const dataApply = {
        id: this.first ? null : this.configs.id,
        value: this.first
          ? {
              today: this.time_config.nextday,
              nextday: this.time_config.nextday
            }
          : this.time_config
      };
      const data = dataApply;
      try {
        const res = await this.$axios.$post("syn-ads-config/update", data);
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Lưu thành công.");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
      this.loading = false;
      if (this.first) {
        window.location.reload();
      }
    },
    toggleInput(show) {
      this[show] = !this[show];
    },
    addItem(newItem, key, showKey) {
      if (this[newItem].trim() !== "") {
        this.time_config.nextday[key].push(this[newItem]);
        this[newItem] = "";
        this.toggleInput(showKey);
      }
    },
    removeItem(index, key) {
      this.time_config.nextday[key].splice(index, 1);
    }
  }
});
</script>
<style scoped>
.text-display-name {
  font-size: 1.1rem;
  font-weight: 500;
}
.time-item {
  background-color: #f9f9f9;
  margin-top: 10px;
}
</style>
