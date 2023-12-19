import GlobalDataInterface from "~/interface/data/global";
import { downloadUrlFile } from "~/helpers/ultis";

export default function(
  { app, $cancelAllRequest, $axios, $toast }: GlobalDataInterface,
  inject
) {
  inject("export", (url, filters) => {
    let key = null;
    const interval = setInterval(async () => {
      try {
        const { data } = await $axios.post(url, {
          key,
          ...filters
        });
        if (data) {
          if (data.code === 0) {
            clearInterval(interval);
            downloadUrlFile(data.url, data.filename);
          }
          if (data.code === 1) {
            key = data.key;
          }
          if (data.code === -1) {
            $toast.error("Tải xuống thất bại, vui lòng thử lại sau");
            clearInterval(interval);
          }
        }
      } catch (e) {
        $toast.error("Tải xuống thất bại, vui lòng thử lại sau");
        clearInterval(interval);
      }
    }, 30 * 1000);
  });
}
