import numeral from "numeral";
numeral.register("locale", "vi", {
  delimiters: {
    thousands: ",",
    decimal: "."
  },
  abbreviations: {
    thousand: "k",
    million: "m",
    billion: "b",
    trillion: "t"
  },
  ordinal() {
    return "vi";
  },
  currency: {
    symbol: "₫"
  }
});

// switch between locales
numeral.locale("vi");
