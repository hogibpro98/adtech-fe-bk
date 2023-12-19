export const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const USER_NAME_REGEX = /^[A-Za-z][A-Za-z0-9_.@]{0,}[A-Za-z0-9]$/;
export const TAX_NUMBER_REGEX = /^[-0-9]+$/;
export const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
export const URL_IMAGE_REGEX = /(http(s?):)(.)*\.(?:jpg|jpeg|png|gif|webp|psd|raw)/i;
export const URL_VIDEO_REGEX = /(http(s?):)(.)*\.(?:mp4|m4p|m4v|3gp|avi|webm|mov)/i;
export const URL_AUDIO_REGEX = /(http(s?):)(.)*\.(?:mp3|wma|wav|flac|aac|ogg|aif)/i;
export const PASSWORD_REGEX = /(?=.*[a-z])+(?=.*[A-Z])+(?=.*\d)+(?=.*[$~!#^()@$!%*?&])[A-Za-z\d$~!#^()@$!%*?&]{8,}/;
export const IP_REGEX = /^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|\*)\.){3}(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|\*)$/;
export const PERMISSION_REGEX = /^[^&|]*$/;
export const PHONE_REGEX = /^(\+84|84|0|)(\d){9}$/;
export const BRAND_NAME_EXIST_CHARACTER_REGEX = /[a-zA-Z]/;
export const BRAND_NAME_CHARACTER_APPROVE_REGEX = /[a-zA-Z0-9\-\s._]*/;
export const DECIMAL_TYPING = /^-?[\d]*\.?\d{0,2}$/;
export const EMAIL_REGEX = /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.{0,1})+[a-z]{2,6}$/i;
export const IP_WITH_SUBNET_REGEX = /^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\.){3}(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\/(([1-9]|[1-2][0-9]|3[0-2]))$/;
export const ALL_WHITE_SPACE = /^\s*$/;
export const PARAMETER_NAME_REGEX = /^[a-zA-Z0-9_]*$/;
export const PARAMETER_NAME_CHECK_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
export const VIETNAMESE_CHECK_REGEX = /^[^\u00C0-\u1EF9]+$/i;
export const SPACE_REGEX = /^\S*$/;
export const CODE_REDIRECT_REGEX = /^[a-zA-Z][a-zA-Z0-9_.-]*$/;

// required global
export const MACRO_REGEX = /\[([a-zA-Z_0-9\s]*)\]/g;
