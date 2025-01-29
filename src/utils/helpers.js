"use strict";
/**
 * if allowed field key is not present on unfiltered object, it wont add it
 * @param {object} unfilteredObj
 * @param {array} allowedFields
 * @returns {object}
 */
function keepAllowedFields(unfilteredObj, allowedFields) {
  const filteredObj = {};

  Object.keys(unfilteredObj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = unfilteredObj[key];
    }
  });

  return filteredObj;
}
/**
 * @param {Object} unfilteredObj object to delete fields from
 * @param {Array} fields array of fields to be removed
 * @returns {Object}
 */
function removeFieldsFromObj(unfilteredObj, fields) {
  let filtered = { ...unfilteredObj };

  fields.forEach((field) => {
    Reflect.deleteProperty(filtered, field);
  });

  return filtered;
}


// eslint-disable-next-line no-unused-vars
function convertStringToArrayForJoi(str, joiHelper) {
  if (str.includes(",")) {
    return str.split(",").map((el) => el.trim());
  }

  return [str];
}

module.exports = {
  convertStringToArrayForJoi,
  keepAllowedFields,
  removeFieldsFromObj,
};
