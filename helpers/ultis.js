import { isArray, isObject, isString } from "@/util/typeof";
import { escape } from "lodash";
import FileSaver from "file-saver";
import { HTTP_CODE_422 } from "~/constants/code";

export const splitPermission = permission => {
  const index = permission.lastIndexOf(".");
  if (index > 0) {
    return {
      page: permission.slice(0, index),
      action: permission.slice(index + 1)
    };
  } else {
    return {
      page: permission,
      action: null
    };
  }
};

export const isGlobalStatus = status => {
  const global = [401, 403, 432];
  return global.includes(status);
};

export const validationError = e => {
  return e.response && e.response.status === HTTP_CODE_422;
};

export const isEqualDeep = (val1, val2) => {
  return JSON.stringify(val1) === JSON.stringify(val2);
};

export const downloadFile = res => {
  const url = window.URL.createObjectURL(new Blob([res.data]));

  const link = document.createElement("a");
  link.href = url;

  let filename = "file.xlsx";

  const disposition = res.headers["content-disposition"];

  if (disposition && disposition.includes("attachment")) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "");
    }
  }

  link.setAttribute("download", filename);
  document.body.appendChild(link);

  link.click();
  link.parentNode.removeChild(link);
};

export const downloadUrlFile = (url, filename) => {
  // const link = document.createElement("a");
  // link.href = url;
  //
  // link.setAttribute("download", filename || "export.xlsx");
  // document.body.appendChild(link);
  //
  // link.click();
  // link.parentNode.removeChild(link);
  FileSaver.saveAs(url, filename);
};

const hasUrl = (obj, name) => {
  return obj?.url && name;
};

export const renderFile = file => {
  if (file) {
    let fileObj;
    try {
      fileObj = JSON.parse(file);
    } catch (e) {
      fileObj = file;
    }
    if (isArray(fileObj)) {
      let html = "";
      fileObj.forEach(e => {
        const fileName = escape(e.name);
        if (hasUrl(e, fileName)) {
          html += `<a href="${e.url}" target="_blank">${fileName}</a><br/>`;
        }
      });
      return html;
    } else if (isObject(fileObj)) {
      const fileName = escape(fileObj.name);
      if (hasUrl(fileObj, fileName)) {
        return `<a href="${fileObj.url}" target="_blank">${fileName}</a>`;
      }
    } else if (isString(fileObj)) {
      return `<a href="${fileObj}" target="_blank">${escape(fileObj)}</a>`;
    }
  }
  return "";
};

export const getErrorMsg = (xhrData, props) => {
  if (xhrData?.responseText) {
    const data = JSON.parse(xhrData.responseText);
    if (data.errors && data.errors[props] && data.errors[props].length > 0) {
      return data.errors[props][0];
    }
    if (data.message) {
      return data.message;
    }
  }
  return null;
};

export const hasValue = val => {
  return val !== null && val !== undefined;
};

export const objectIsEmpty = obj => {
  for (const i in obj) return false;
  return true;
};

export const unsecuredCopyToClipboard = text => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Unable to copy to clipboard", err);
  }
  document.body.removeChild(textArea);
};
