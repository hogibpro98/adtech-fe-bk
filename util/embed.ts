declare global {
  interface Window {
    tiktokEmbed: any;
  }
}

const isYoutubeVideoURL = url => {
  if (url) {
    return !!getVideoIdYoutube(url);
  }
  return false;
};

const isTiktokVideoURL = url => {
  if (url) {
    return !!getVideoIdTiktok(url);
  }
  return false;
};

const isFacebookVideoURL = url => {
  if (!url) return false;
  const regExp = /^https?:\/\/www\.facebook\.com.*\/(video(s)?|watch|story|reel)(\.php?|\/|.).+/;
  const regExp2 = /^https?:\/\/fb\.watch/;

  return url.match(regExp) != null || url.match(regExp2) != null;
};

const getVideoIdYoutube = url => {
  if (!url) return false;
  const regExp = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?‌​[\w?‌​=]*)?/;
  const match = url.match(regExp);
  if (match) {
    return match[1];
  }
  return false;
};

const getVideoIdTiktok = url => {
  if (!url) return false;
  const regexTiktok = /tiktok\.com\/([@_\-.a-zA-z0-9]*)\/video\/([_\-a-zA-z0-9]*)/;
  const match = url.match(regexTiktok);
  if (match) {
    return match[2];
  }

  return false;
};

const rescanTiktokEmbed = function() {
  const tiktoksOnPage = Array.from(
    document.querySelectorAll("blockquote.tiktok-embed")
  );
  if (
    typeof window.tiktokEmbed !== "undefined" &&
    window.tiktokEmbed?.lib?.render &&
    tiktoksOnPage.length
  ) {
    window.tiktokEmbed.lib.render(tiktoksOnPage);
  }
};

export {
  isYoutubeVideoURL,
  isTiktokVideoURL,
  isFacebookVideoURL,
  getVideoIdYoutube,
  getVideoIdTiktok,
  rescanTiktokEmbed
};
