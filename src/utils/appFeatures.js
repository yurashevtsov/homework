"use strict";

const helpers = require("./helpers");

class AppFeatures {
  constructor(databaseQuery, queryParams) {
    this.databaseQuery = databaseQuery;
    this.queryParams = queryParams;

    this.sort();
    this.paginate();
    this.limitFields();
  }

  sort() {
    if (this.queryParams?.order) {
      const orderArr = helpers.convertStringToArray(this.queryParams.order);

      this.databaseQuery.order = orderArr.map((sortStr) => sortStr.split("_"));
    }

    return this;
  }

  paginate() {
    this.databaseQuery.page = this.queryParams.page ?? 1;
    this.databaseQuery.limit = this.queryParams.limit ?? 100;
    this.databaseQuery.offset =
      (this.databaseQuery.page - 1) * this.databaseQuery.limit;

    return this;
  }

  limitFields() {
    if (this.queryParams?.fields) {
      const fieldsArr = helpers.convertStringToArray(this.queryParams.fields);

      this.databaseQuery.attributes = fieldsArr;
    }
    return this;
  }
}

module.exports = AppFeatures;
