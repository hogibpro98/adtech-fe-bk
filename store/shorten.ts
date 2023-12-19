interface ShortenUrlInterface {
  shorten: {
    links: Array<any>;
    content: String;
    contentPreview: String;
    domain: String;
  };
}

export const state = (): ShortenUrlInterface => ({
  shorten: {
    links: [],
    content: "",
    contentPreview: "",
    domain: ""
  }
});

export const mutations = {
  ADD_SHORTEN_URL(newState: ShortenUrlInterface, shorten: object) {
    newState.shorten.links.push(shorten);
  },
  RESET_SHORTEN_URL(newState: ShortenUrlInterface) {
    newState.shorten.links = [];
  },
  DETAIL_SHORTEN_URL(newState: ShortenUrlInterface, shorten: Array<any>) {
    newState.shorten.links = shorten;
  },
  ADD_CONTENT_URL(newState: ShortenUrlInterface, content: string) {
    newState.shorten.content = content;
  },
  RESET_CONTENT_URL(newState: ShortenUrlInterface) {
    newState.shorten.content = "";
  },
  GET_DOMAIN_URL(newState: ShortenUrlInterface, domain: string){
    newState.shorten.domain = domain;
  }
};

// export const actions = {
//   GET_SHORTEN_URL(newState, url) {
//     console.log(newState.state.shortenUrls)
//     newState.state.shortenUrls.forEach(item => {
//       if (item.actualUrl === url) {
//         return item.shorten;
//       }
//     });
//     return "";
//   }
// };
