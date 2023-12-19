<template>
  <loading-dialog
    v-model="loading"
    text="Đang chuẩn bị file tải xuống"
    circular
  ></loading-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import LoadingDialog from "~/components/common/LoadingDialog.vue";
import { downloadFile, downloadUrlFile } from "~/helpers/ultis";

export default (Vue as VueConstructor).extend({
  name: "ExportComponent",
  components: { LoadingDialog },
  mixins: [wrapper],
  props: {},
  data() {
    return {
      loading: false,
      interval: null,
      key: null,
      retryCount: 0
    };
  },
  methods: {
    start(url, params) {
      this.key = null;
      this.exportFile(url, params);
      this.interval = setInterval(() => this.exportFile(url, params), 5 * 1000);
    },
    async exportFile(url, params) {
      this.loading = true;
      try {
        const res = await this.$axios.post(
          url,
          {
            key: this.key,
            ...params
          },
          {
            responseType: "blob"
          }
        );
        if (res.headers["content-type"] === "application/json") {
          const dataJson = await res.data.text();
          const data = JSON.parse(dataJson);
          if (data.code === 1) {
            this.key = data.key;
          } else if (data.code === -1) {
            this.loading = false;
            this.$toast.error(data.description);
            this.$emit("failed");
            this.clearInterval();
          }
        } else {
          this.clearInterval();
          this.loading = false;
          this.$emit("success");
          console.log("export success");

          downloadFile(res);
        }
      } catch (e) {
        console.log(e);
        this.retryCount++;
        if (this.retryCount === 3) {
          this.loading = false;
          this.$toast.error("Tải xuống thất bại, vui lòng thử lại sau");
          this.$emit("failed");
          this.clearInterval();
        }
      }
    },

    // async exportFile(url, params) {
    //   this.loading = true;
    //   try {
    //     const { data } = await this.$axios.post(url, {
    //       key: this.key,
    //       ...params
    //     });
    //     if (data) {
    //       if (data.code === 0) {
    //         this.clearInterval();
    //         this.loading = false;
    //         this.$emit("success");
    //         console.log("filename", data.filename)
    //         downloadUrlFile(data.url, data.filename);
    //       }
    //       if (data.code === 1) {
    //         this.key = data.key;
    //       }
    //       if (data.code === -1) {
    //         this.loading = false;
    //         this.$toast.error(data.description);
    //         this.$emit("failed");
    //         this.clearInterval();
    //       }
    //     }
    //   } catch (e) {
    //     this.retryCount++;
    //     if (this.retryCount === 3) {
    //       this.loading = false;
    //       this.$toast.error("Tải xuống thất bại, vui lòng thử lại sau");
    //       this.$emit("failed");
    //       this.clearInterval();
    //     }
    //   }
    // },

    clearInterval() {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
});
</script>
