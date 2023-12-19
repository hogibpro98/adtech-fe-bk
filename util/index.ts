const randomElement = (arr: Array<any> = []) => {
  const index = random({ min: 0, max: arr.length });
  return arr[index];
};

export const random = ({ min = -999999, max = 999999 }) => {
  // @ts-ignore
  const crypto = window.crypto || window.msCrypto;
  const array = new Uint32Array(1);
  return (
    Math.floor((crypto.getRandomValues(array) / 4294967296) * (+max - +min)) +
    +min
  );
};

const kebab = (str: string): string => {
  return (str || "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

const toggleFullScreen = () => {
  const doc = window.document;
  const docEl: HTMLElement = doc.documentElement;

  // @ts-ignore
  const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  // @ts-ignore
  const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  // @ts-ignore
  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
};

export default {
  randomElement,
  toggleFullScreen,
  kebab
};
