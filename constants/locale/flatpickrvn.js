function factoryFunction(exports) {
  const fp =
    typeof window !== "undefined" && window.flatpickr !== undefined
      ? window.flatpickr
      : {
          l10ns: {}
        };
  const Vietnamese = {
    weekdays: {
      shorthand: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
      longhand: [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy"
      ]
    },
    months: {
      shorthand: [
        "Th1",
        "Th2",
        "Th3",
        "Th4",
        "Th5",
        "Th6",
        "Th7",
        "Th8",
        "Th9",
        "Th10",
        "Th11",
        "Th12"
      ],
      longhand: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12"
      ]
    },
    firstDayOfWeek: 1,
    rangeSeparator: " đến "
  };
  fp.l10ns.vn = Vietnamese;
  const vn = fp.l10ns;

  exports.Vietnamese = Vietnamese;
  exports.default = vn;

  Object.defineProperty(exports, "__esModule", { value: true });
}

(function(global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    factory(exports);
  } else {
    global = global || self;
    factory((global.vn = {}));
  }
})(this, factoryFunction);
