export const REDIRECT_LAYOUT_TYPES = [
  {
    title: "Hình ảnh ở trên",
    code: "layout_img_above",
    image: "/layout/layout_img_above.svg"
  },
  {
    title: "Hình ảnh bên cạnh",
    code: "layout_img_side",
    image: "/layout/layout_img_side.svg"
  },
  {
    title: "Tiêu đề ở trên",
    code: "layout_title_top",
    image: "/layout/layout_title_top.svg"
  },
  {
    title: "Chỉ hình ảnh",
    code: "layout_img_only",
    image: "/layout/layout_img_only.svg"
  },
  {
    title: "Chỉ văn bản",
    code: "layout_text_only",
    image: "/layout/layout_text_only.svg"
  }
];

export const REDIRECT_LAYOUT_TYPE_MAP = {
  layout_text_only: {
    title: "Chỉ văn bản",
    color: "purple"
  },
  layout_title_top: {
    title: "Tiêu đề ở trên",
    color: "danger"
  },
  layout_img_side: {
    title: "Hình ảnh bên cạnh",
    color: "success"
  },
  layout_img_above: {
    title: "Hình ảnh ở trên",
    color: "primary"
  },
  layout_img_only: {
    title: "Chỉ hình ảnh",
    color: "warning"
  }
};
