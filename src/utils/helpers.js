"use strict";

function convertStringToArray(str) {
  return str.split(",").map((el) => el.trim());
}

module.exports = {
  convertStringToArray,
};
