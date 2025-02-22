"use strict";
/**
 * if allowed field key is not present on unfiltered object, it wont add it
 * @param {object} unfilteredObj
 * @param {array} allowedFields
 * @returns {object}
 */

// eslint-disable-next-line no-unused-vars
function convertStringToArrayForJoi(str, joiHelper) {
  if (str.includes(",")) {
    return str.split(",").map((el) => el.trim());
  }

  return [str];
}

module.exports = {
  convertStringToArrayForJoi,
};
