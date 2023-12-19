<template>
  <v-navigation-drawer
    id="reportDrawer"
    v-model="drawer"
    fixed
    right
    temporary
    width="420"
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>Gửi phản hồi đến VDA</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <div>
      <validation-observer ref="form" v-slot="{ handleSubmit, errors }">
        <form
          class="form-input background"
          @submit.prevent="handleSubmit(onSubmit)"
        >
          <div class="px-4 py-4 report-form-content">
            <v-flex xs12 class="form-group">
              <v-text-area-with-validation
                v-model="content"
                :loading="loading"
                :counter="500"
                name="content"
                label="Mô tả phản hồi"
                rows="5"
                required
                rules="required|max:500"
              />
            </v-flex>
            <v-flex xs12 class="form-group">
              <file-upload
                v-model="file"
                :accept="acceptImage"
                return-object
                height="170px"
                name="file"
                label="Ảnh chụp màn hình"
              />
            </v-flex>
            <v-flex xs12 class="form-group">
              <v-checkbox
                v-model="isSendEmail"
                label="Chúng tôi có thể gửi email cho bạn để biết thêm thông tin hoặc cập nhật"
              >
              </v-checkbox>
            </v-flex>
            <div class="text-caption mt-auto">
              Một số thông tin tài khoản và hệ thống có thể được gửi tới Google.
              Chúng tôi sẽ sử dụng nó để khắc phục sự cố và cải thiện dịch vụ
              của mình, tuân theo Chính sách quyền riêng tư và Điều khoản dịch
              vụ của chúng tôi. Chúng tôi có thể gửi email cho bạn để biết thêm
              thông tin hoặc cập nhật.
            </div>
          </div>
          <v-layout
            class="sticky bottom--1 z-10 background px-8 py-2 border-top"
          >
            <v-btn
              :loading="loading"
              color="primary darken-1"
              class="mr-0"
              text
              type="submit"
            >
              Gửi
            </v-btn>
            <v-btn color="grey" text @click.native="drawer = false">
              Hủy
            </v-btn>
          </v-layout>
        </form>
      </validation-observer>
    </div>
  </v-navigation-drawer>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { GlobalDataInterface } from "~/interface/data/global";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { IMAGE } from "~/constants/fileType";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { FormInterface } from "~/interface/vee-validate/form";

interface ComponentMethods {}

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
  acceptImage: string[];
  content: string;
  file: object;
  isSendEmail: boolean;
  $feedbackRepository: RepositoryInterface;
  $refs: { form: FormInterface };
}

interface computedInterface {}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & computedInterface
>).extend({
  name: "ReportDrawer",
  components: { FileUpload, VTextAreaWithValidation },
  props: {},
  data: () => ({
    loading: false,
    acceptImage: IMAGE,
    content: "",
    file: null,
    isSendEmail: true
  }),
  computed: {
    drawer: {
      get() {
        return this.$store.state?.report?.showReportDrawer;
      },
      set(val) {
        this.$store.commit("report/CHANGE_STATUS_REPORT_DRAWER", val);
      }
    }
  },
  methods: {
    async onSubmit() {
      this.loading = true;

      try {
        const res = await this.$feedbackRepository.create({
          content: this.content,
          url: window.location.href,
          file: this.file,
          is_email: this.isSendEmail
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.content = "";
          this.file = null;
          this.$store.commit("report/CHANGE_STATUS_REPORT_DRAWER", false);
          this.$emit("update-success");
          this.$toast.global.action_success("phản hồi");
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
</script>

<style lang="scss" scoped>
#reportDrawer {
  z-index: 50;
}

.report-form-content {
  height: calc(100vh - 49px - 52px);

  display: flex;
  flex-direction: column;
}
</style>
